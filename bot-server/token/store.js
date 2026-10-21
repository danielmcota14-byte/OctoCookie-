// Persistência em arquivo JSON (DATA_DIR, o mesmo disco do cofre do bot). Gravação atômica (tmp + rename).
// Node é single-thread: operações SÍNCRONAS aqui são atômicas entre si — é isso que impede o processamento duplicado de uma tx.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DEFAULT_CATALOG } from './catalog.js';

const EMPTY = () => ({ v: 1, catalog: null, wallets: {}, walletOwners: {}, nonces: {}, orders: {}, purchases: {}, entitlements: {}, rewards: {}, audit: [] });
export const newId = (p) => p + '_' + crypto.randomBytes(8).toString('hex');

export class TokenStore {
  constructor(dir, { now = () => Date.now() } = {}) {
    this.now = now; this.file = path.join(dir, 'token.json');
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    try { this.d = { ...EMPTY(), ...JSON.parse(fs.readFileSync(this.file, 'utf8')) }; } catch { this.d = EMPTY(); }
  }
  save() { const tmp = this.file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(this.d), { mode: 0o600 }); fs.renameSync(tmp, this.file); }
  audit(evento, dados = {}) { this.d.audit.unshift({ t: new Date(this.now()).toISOString(), evento, ...dados }); if (this.d.audit.length > 500) this.d.audit.length = 500; }

  // ---- catálogo (padrão + edições do admin) ----
  catalog() { return this.d.catalog || Object.fromEntries(DEFAULT_CATALOG.map((f) => [f.id, f])); }
  feature(id) { return this.catalog()[id] || null; }
  setFeature(f, by) { const c = { ...this.catalog() }; c[f.id] = f; this.d.catalog = c; this.audit('catalogo', { id: f.id, preco: f.priceTokens, ativo: f.active, por: by }); this.save(); }

  // ---- carteiras ----
  wallet(uid) { return this.d.wallets[uid] || null; }
  setNonce(uid, rec) { this.d.nonces[uid] = rec; this.save(); }
  takeNonce(uid) { const n = this.d.nonces[uid] || null; delete this.d.nonces[uid]; return n; } // uso único
  linkWallet(uid, address, email = null) {
    const key = address.toLowerCase(), dono = this.d.walletOwners[key];
    if (dono && dono !== uid) throw new Error('Esta carteira já está vinculada a outra conta.');
    const antiga = this.d.wallets[uid]; if (antiga) delete this.d.walletOwners[antiga.address.toLowerCase()];
    this.d.wallets[uid] = { address, email: email || null, linkedAt: new Date(this.now()).toISOString() }; this.d.walletOwners[key] = uid;
    this.audit('carteira', { uid, address }); this.save();
  }

  // ---- pedidos / compras ----
  addOrder(o) { this.d.orders[o.id] = o; this.save(); return o; }
  order(id) { return this.d.orders[id] || null; }
  ordersOf(uid) { return Object.values(this.d.orders).filter((o) => o.uid === uid).sort((a, b) => b.createdAt - a.createdAt).slice(0, 50); }
  openOrder(uid, featureId, wallet) { return Object.values(this.d.orders).find((o) => o.uid === uid && o.featureId === featureId && o.wallet === wallet && o.status === 'awaiting_payment' && o.expiresAt > this.now()) || null; }
  /** Reserva o hash para um pedido ANTES de qualquer await. Retorna false se o hash já pertence a outro pedido. */
  reserveTx(hash, orderId) {
    const k = hash.toLowerCase();
    if (this.d.purchases[k]) return false;
    this.d.purchases[k] = { txHash: k, orderId, status: 'verifying', at: this.now() }; this.save(); return true;
  }
  purchase(hash) { return this.d.purchases[hash.toLowerCase()] || null; }
  releaseTx(hash) { const p = this.d.purchases[hash.toLowerCase()]; if (p && p.status === 'verifying') { delete this.d.purchases[hash.toLowerCase()]; this.save(); } }
  confirmPurchase(order, feature, txHash, blockTimeMs) {
    const k = txHash.toLowerCase(); order.status = 'paid'; order.txHash = k; order.paidAt = this.now();
    this.d.purchases[k] = { txHash: k, orderId: order.id, uid: order.uid, featureId: order.featureId, wallet: order.wallet, amountUnits: order.amountUnits, amountTokens: order.amountTokens, status: 'confirmed', at: this.now() };
    const prev = (this.d.entitlements[order.uid] ||= {})[order.featureId];
    const base = prev?.expiresAt && prev.expiresAt > blockTimeMs ? prev.expiresAt : blockTimeMs; // renovação soma ao tempo restante
    this.d.entitlements[order.uid][order.featureId] = { featureId: order.featureId, unlockedAt: prev?.unlockedAt || this.now(), txHash: k, orderId: order.id, expiresAt: feature.durationDays ? base + feature.durationDays * 86_400_000 : null };
    this.audit('compra', { uid: order.uid, feature: order.featureId, tx: k, valor: order.amountTokens }); this.save();
  }
  entitlements(uid) { const t = this.now(); return Object.values(this.d.entitlements[uid] || {}).map((e) => ({ ...e, active: !e.expiresAt || e.expiresAt > t })); }
  allPurchases() { return Object.values(this.d.purchases).sort((a, b) => b.at - a.at).slice(0, 200); }

  // ---- recompensas ----
  addReward(r) { if (Object.values(this.d.rewards).some((x) => x.ref === r.ref)) throw new Error('Já existe uma recompensa com esta referência (ref).'); this.d.rewards[r.id] = r; this.audit('recompensa_criada', { id: r.id, ref: r.ref, valor: r.amountTokens }); this.save(); return r; }
  reward(id) { return this.d.rewards[id] || null; }
  /** Contas com carteira vinculada (para o admin escolher o destinatário sem digitar endereço). */
  linkedUsers() { return Object.entries(this.d.wallets).map(([uid, w]) => ({ uid, email: w.email || null, address: w.address, linkedAt: w.linkedAt })).sort((a, b) => String(a.email || a.uid).localeCompare(String(b.email || b.uid))); }
  /** Outra recompensa que já usa este hash de emissão (evita contar a mesma tx duas vezes). */
  rewardByTx(hash, exceptId) { const k = String(hash).toLowerCase(); return Object.values(this.d.rewards).find((x) => x.id !== exceptId && x.txHash && x.txHash.toLowerCase() === k && ['minted', 'minting'].includes(x.status)) || null; }
  rewards(filter = () => true) { return Object.values(this.d.rewards).filter(filter).sort((a, b) => b.createdAt - a.createdAt).slice(0, 200); }
  saveReward(r, evento, by) { this.d.rewards[r.id] = r; this.audit(evento, { id: r.id, por: by }); this.save(); }
}
