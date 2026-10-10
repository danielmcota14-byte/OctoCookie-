// Criptografia do Bot 24/7.
//  Transporte: ECDH P-256 (Diffie-Hellman) → HKDF-SHA256 → AES-256-GCM (uma chave por sentido: c2s / s2c).
//  Cofre: a chave da carteira é cifrada com uma chave AES-256 ALEATÓRIA (K) que é devolvida ao usuário e NÃO fica no disco.
//  Reinício sozinho (opcional): K também é guardada cifrada com SERVER_MASTER_KEY (env).
import { webcrypto as crypto, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ethers } from 'ethers';

const S = crypto.subtle;
const EC = { name: 'ECDH', namedCurve: 'P-256' };
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = (u) => Buffer.from(u).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(String(s), 'base64'));

// ---------- hello: par ECDH de uso único ----------
const hellos = new Map(); // id -> { priv, pub, exp }
export async function newHello() {
  for (const [id, h] of hellos) if (h.exp < Date.now()) hellos.delete(id);
  if (hellos.size >= 20) throw new Error('Muitos pareamentos em andamento. Tente em alguns minutos.');
  const kp = await S.generateKey(EC, false, ['deriveBits']);
  const pub = b64(await S.exportKey('raw', kp.publicKey));
  const id = randomUUID();
  hellos.set(id, { priv: kp.privateKey, pub, exp: Date.now() + 5 * 60_000 });
  return { id, pub };
}

// Abre um pedido cifrado. Consome o hello (uso único). Devolve o conteúdo e uma função para cifrar a resposta.
export async function openRequest(body) {
  const { id, e, i, c } = body || {};
  const h = hellos.get(id);
  if (!h || h.exp < Date.now()) throw new Error('hello inválido ou expirado');
  hellos.delete(id);
  const peer = await S.importKey('raw', unb64(e), EC, false, []);
  const bits = await S.deriveBits({ name: 'ECDH', public: peer }, h.priv, 256);
  const hk = await S.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  const mk = (info, usage) => S.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: unb64(h.pub), info: enc.encode(info) }, hk, { name: 'AES-GCM', length: 256 }, false, [usage]);
  const [c2s, s2c] = [await mk('octocookie-247-v2|c2s', 'decrypt'), await mk('octocookie-247-v2|s2c', 'encrypt')];
  const pt = await S.decrypt({ name: 'AES-GCM', iv: unb64(i), additionalData: unb64(h.pub) }, c2s, unb64(c));
  const payload = JSON.parse(dec.decode(pt));
  return {
    payload,
    async reply(obj) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await S.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode('reply:' + id) }, s2c, enc.encode(JSON.stringify(obj)));
      return { i: b64(iv), c: b64(ct) };
    },
  };
}

// ---------- cofre da carteira ----------
export function normalizePk(pk) {
  if (typeof pk !== 'string' || !/^(0x)?[0-9a-fA-F]{64}$/.test(pk.trim())) throw new Error('Chave privada inválida.');
  const k = pk.trim().startsWith('0x') ? pk.trim() : '0x' + pk.trim();
  return { pk: k, addr: new ethers.Wallet(k).address };
}
const aes = (raw, usage) => S.importKey('raw', raw, 'AES-GCM', false, [usage]);

export class Vault {
  constructor(dir) { this.dir = dir; this.vaultFile = path.join(dir, 'vault.json'); this.rearmFile = path.join(dir, 'rearm.json'); this.cfgFile = path.join(dir, 'config.json'); this.feeFile = path.join(dir, 'fee.json'); fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); }
  write(file, obj) { fs.writeFileSync(file, JSON.stringify(obj), { mode: 0o600 }); }
  read(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
  address() { return this.read(this.vaultFile)?.addr || null; }
  paired() { return !!this.address(); }
  /** Cifra pk com uma K nova e aleatória. Devolve K (base64) — o chamador entrega a K ao usuário e não a guarda. */
  async create(pk, addr) {
    const K = crypto.getRandomValues(new Uint8Array(32)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await S.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(addr) }, await aes(K, 'encrypt'), enc.encode(pk));
    this.write(this.vaultFile, { v: 1, addr, i: b64(iv), c: b64(ct) });
    this.clearRearm();
    return b64(K);
  }
  /** Abre a carteira com K. Lança erro se K estiver errada (GCM autentica). */
  async open(kB64) {
    const v = this.read(this.vaultFile); if (!v) throw new Error('Nenhuma carteira pareada.');
    const K = unb64(kB64); if (K.length !== 32) throw new Error('Chave K inválida.');
    try {
      const pt = await S.decrypt({ name: 'AES-GCM', iv: unb64(v.i), additionalData: enc.encode(v.addr) }, await aes(K, 'decrypt'), unb64(v.c));
      return { pk: dec.decode(pt), addr: v.addr };
    } catch { throw new Error('Chave K não abre esta carteira.'); }
  }
  wipe() { for (const f of [this.vaultFile, this.rearmFile, this.cfgFile]) try { fs.unlinkSync(f); } catch {} }
  // ---- reinício sozinho (opt-in): K cifrada com SERVER_MASTER_KEY ----
  async saveRearm(kB64, masterB64) {
    const m = unb64(masterB64); if (m.length !== 32) throw new Error('SERVER_MASTER_KEY deve ter 32 bytes em base64.');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await S.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode('rearm') }, await aes(m, 'encrypt'), unb64(kB64));
    this.write(this.rearmFile, { v: 1, i: b64(iv), c: b64(ct) });
  }
  async loadRearm(masterB64) {
    const r = this.read(this.rearmFile); if (!r || !masterB64) return null;
    try { return b64(await S.decrypt({ name: 'AES-GCM', iv: unb64(r.i), additionalData: enc.encode('rearm') }, await aes(unb64(masterB64), 'decrypt'), unb64(r.c))); } catch { return null; }
  }
  clearRearm() { try { fs.unlinkSync(this.rearmFile); } catch {} }
  saveConfig(cfg) { this.write(this.cfgFile, cfg); }
  feeRecipient() { return this.read(this.feeFile); }
  setFeeRecipient(obj) { this.write(this.feeFile, obj); }
  loadConfig() { return this.read(this.cfgFile); }
}
