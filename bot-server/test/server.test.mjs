// Testa a API 24/7 de ponta a ponta usando o MESMO código de criptografia do navegador (public/octocookie-app/modo247.js).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { ethers } from 'ethers';
import { createApp, FEE_MSG_HEAD, DEFAULT_ADMIN_EMAIL } from '../server.js';
import { Vault } from '../vault.js';
import crypto from 'node:crypto';
import { createFirebaseVerifier } from '../firebase-auth.js';

// ---- carrega o modo247.js do navegador (sem DOM) e pega as funções de criptografia ----
const src = fs.readFileSync(new URL('../../public/octocookie-app/modo247.js', import.meta.url), 'utf8');
const g = { crypto: globalThis.crypto, TextEncoder, TextDecoder, atob, btoa, ethers, console };
g.globalThis = g; vm.createContext(g); vm.runInContext(src, g);
const C = g.OCTO247._crypto;

let ok = 0;
const t = async (nome, fn) => { await fn(); ok++; console.log('✓', nome); };
const TOKEN = 'token-do-dono-de-teste-123456';
const MASTER = Buffer.alloc(32, 7).toString('base64');

class FakeRunner {
  constructor() { this.pk = null; this.cfg = null; this.snap = null; this.lastError = null; }
  async start(pk, cfg) { this.pk = pk; this.cfg = cfg; this.snap = { running: true, price: 3000, balance: 1.5, trades: 2, pnlDia: 0.4 }; }
  async stop() { this.pk = null; this.snap = null; }
  armed() { return !!this.pk; }
}
const ADMIN = 'admin-token-de-teste-123456789';
async function boot({ token = TOKEN, master = MASTER, admin = ADMIN, adsterra = 'tok-adsterra', fetchFn, fb = null } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'octo247-'));
  const vault = new Vault(dir), runner = new FakeRunner(), logs = [];
  const app = createApp({ vault, runner, ownerToken: token, masterKey: master, adminToken: admin, adminUids: fb?.uids || [], adminEmails: fb?.emails || [], verifyIdToken: fb ? verifier : null, adsterraToken: adsterra, fetchFn, logs });
  const srv = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const url = 'http://127.0.0.1:' + srv.address().port;
  const call = async (p, method = 'POST', body, tk) => {
    if (tk === undefined) tk = p.startsWith('/adm') ? admin : token; // padrão: o token certo da rota
    const r = await fetch(url + p, { method, headers: { 'Content-Type': 'application/json', ...(tk ? { Authorization: 'Bearer ' + tk } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, json: await r.json().catch(() => ({})) };
  };
  // pedido protegido, igual ao do navegador: hello → Diffie-Hellman → AES-256-GCM
  const secure = async (p, payload) => {
    const hello = (await call('/247/hello')).json;
    const sealed = await C.seal(hello, payload);
    const r = await call(p, 'POST', sealed.body);
    return { status: r.status, json: r.json, open: () => C.openReply(sealed, r.json) };
  };
  return { dir, vault, runner, srv, call, secure, close: () => srv.close() };
}
const wallet = ethers.Wallet.createRandom();

// ---- login do Firebase: tokens assinados por uma chave RSA de teste, "chaves do Google" simuladas ----
const PROJ = 'octo-teste', rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...rsa.publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
const jwksFetch = async () => ({ ok: true, status: 200, headers: { get: () => 'max-age=3600' }, json: async () => ({ keys: [jwk] }) });
const verifier = createFirebaseVerifier({ projectId: PROJ, fetchFn: jwksFetch });
const u64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function idToken(over = {}, { kid = 'k1', alg = 'RS256', key = rsa.privateKey } = {}) {
  const t = Math.floor(Date.now() / 1000);
  const body = { aud: PROJ, iss: 'https://securetoken.google.com/' + PROJ, sub: 'uid-admin-1', iat: t - 5, exp: t + 3600, auth_time: t - 5, email: 'dono@exemplo.com', email_verified: true, ...over };
  const data = u64({ alg, kid, typ: 'JWT' }) + '.' + u64(body);
  return data + '.' + crypto.sign('RSA-SHA256', Buffer.from(data), key).toString('base64url');
}

await t('sem token ou com token errado: 401; sem OWNER_TOKEN no servidor: 503', async () => {
  const s = await boot();
  assert.equal((await s.call('/247/status', 'GET', null, null)).status, 401);
  assert.equal((await s.call('/247/status', 'GET', null, 'errado-errado-errado-errado-1')).status, 401);
  s.close();
  const s2 = await boot({ token: '' });
  assert.equal((await s2.call('/247/status', 'GET', null, 'qualquer')).status, 503);
  s2.close();
});

await t('pair: chave viaja cifrada, servidor devolve K e NÃO guarda K nem a chave em claro', async () => {
  const s = await boot();
  const r = await s.secure('/247/pair', { pk: wallet.privateKey });
  assert.equal(r.status, 200);
  assert.equal(r.json.k, undefined, 'a resposta na rede não pode ter K em claro');
  const { addr, k } = await r.open();
  assert.equal(addr, wallet.address);
  assert.equal(Buffer.from(k, 'base64').length, 32, 'K = 32 bytes (AES-256)');
  for (const f of fs.readdirSync(s.dir)) {
    const txt = fs.readFileSync(path.join(s.dir, f), 'utf8');
    assert.ok(!txt.includes(k), 'K não pode estar em disco (' + f + ')');
    assert.ok(!txt.includes(wallet.privateKey.slice(2)), 'chave em claro não pode estar em disco (' + f + ')');
  }
  assert.equal(s.vault.address(), wallet.address);
  s.close();
});

await t('arm com K certa liga o bot (campos desconhecidos são descartados); K errada é recusada', async () => {
  const s = await boot();
  const { k } = await (await s.secure('/247/pair', { pk: wallet.privateKey })).open();
  const ruim = await s.secure('/247/arm', { k: Buffer.alloc(32, 1).toString('base64'), fields: {} });
  assert.equal(ruim.status, 400); assert.match(ruim.json.erro, /não abre/); assert.equal(s.runner.armed(), false);
  const a = await s.secure('/247/arm', { k, fields: { stakePct: '5', networkSelect: 'ethereum', evil: '<script>' }, hg: { barra: 55, filtro: 'votacao', hack: 1 }, fee: true });
  assert.equal(a.status, 200); assert.equal((await a.open()).addr, wallet.address);
  assert.equal(s.runner.pk, wallet.privateKey);
  assert.deepEqual(s.runner.cfg.fields, { stakePct: '5', networkSelect: 'ethereum' });
  assert.deepEqual(s.runner.cfg.hg, { barra: 55, filtro: 'votacao' });
  assert.equal(s.runner.cfg.fee, true);
  const st = (await s.call('/247/status', 'GET')).json;
  assert.equal(st.armado, true); assert.equal(st.rodando, true); assert.equal(st.endereco, wallet.address);
  s.close();
});

await t('hello é de uso único (replay recusado) e pacote adulterado é recusado', async () => {
  const s = await boot();
  const hello = (await s.call('/247/hello')).json;
  const sealed = await C.seal(hello, { pk: wallet.privateKey });
  assert.equal((await s.call('/247/pair', 'POST', sealed.body)).status, 200);
  assert.equal((await s.call('/247/pair', 'POST', sealed.body)).status, 400, 'replay');
  const h2 = (await s.call('/247/hello')).json, s2 = await C.seal(h2, { pk: wallet.privateKey });
  s2.body.c = s2.body.c.slice(0, -4) + 'AAAA';
  assert.equal((await s.call('/247/pair', 'POST', s2.body)).status, 400, 'adulterado');
  s.close();
});

await t('disarm apaga a chave da memória; pair é recusado com bot ligado; wipe apaga o cofre', async () => {
  const s = await boot();
  const { k } = await (await s.secure('/247/pair', { pk: wallet.privateKey })).open();
  await s.secure('/247/arm', { k, fields: {} });
  assert.equal((await s.secure('/247/pair', { pk: wallet.privateKey })).status, 400);
  await s.call('/247/disarm'); assert.equal(s.runner.pk, null);
  assert.equal(s.vault.paired(), true);
  await s.call('/247/wipe'); assert.equal(s.vault.paired(), false);
  s.close();
});

await t('reiniciar sozinho (opt-in): K fica cifrada com a chave mestra e só então reabre; sem opt-in nada vai a disco', async () => {
  const s = await boot();
  const { k } = await (await s.secure('/247/pair', { pk: wallet.privateKey })).open();
  await s.secure('/247/arm', { k, fields: {} });
  assert.equal(fs.existsSync(s.vault.rearmFile), false, 'sem opt-in não há rearm.json');
  await s.secure('/247/arm', { k, fields: {}, autoRearm: true });
  const raw = fs.readFileSync(s.vault.rearmFile, 'utf8'); assert.ok(!raw.includes(k));
  assert.equal(await s.vault.loadRearm(MASTER), k);
  assert.equal(await s.vault.loadRearm(Buffer.alloc(32, 9).toString('base64')), null, 'chave mestra errada não abre');
  await s.call('/247/disarm'); assert.equal(fs.existsSync(s.vault.rearmFile), false);
  s.close();
  const s2 = await boot({ master: '' });
  const k2 = (await (await s2.secure('/247/pair', { pk: wallet.privateKey })).open()).k;
  const r = await s2.secure('/247/arm', { k: k2, fields: {}, autoRearm: true });
  assert.equal(r.status, 400); assert.match(r.json.erro, /SERVER_MASTER_KEY/);
  s2.close();
});

await t('rotas públicas não vazam endereço, saldo nem logs', async () => {
  const s = await boot();
  const { k } = await (await s.secure('/247/pair', { pk: wallet.privateKey })).open();
  await s.secure('/247/arm', { k, fields: {} });
  const pub = (await s.call('/status', 'GET', null, null)).json;
  const txt = JSON.stringify(pub);
  assert.ok(!txt.includes(wallet.address) && !('saldo' in pub) && !('logs' in pub), txt);
  s.close();
});

const msgFee = (w, quando = new Date()) => `${FEE_MSG_HEAD}\nCarteira: ${w.address}\nEmitido em: ${quando.toISOString()}`;

await t('adm: o OWNER_TOKEN (público no site) NÃO abre o painel; sem ADMIN_TOKEN o painel fica desativado', async () => {
  const s = await boot();
  assert.equal((await s.call('/adm/adsterra', 'GET', null, TOKEN)).status, 401);
  assert.equal((await s.call('/adm/fee-recipient', 'POST', {}, TOKEN)).status, 401);
  assert.equal((await s.call('/adm/adsterra', 'GET', null, null)).status, 401);
  s.close();
  const s2 = await boot({ admin: '' });
  assert.equal((await s2.call('/adm/adsterra', 'GET', null, 'x')).status, 503);
  s2.close();
});

await t('destino da taxa: assinatura da própria carteira define; ninguém mais consegue; leitura é pública', async () => {
  const s = await boot(); const adm = ethers.Wallet.createRandom(), outro = ethers.Wallet.createRandom();
  assert.equal((await s.call('/fee-recipient', 'GET', null, null)).json.recipient, null);
  const ok1 = await s.call('/adm/fee-recipient', 'POST', { recipient: adm.address, message: msgFee(adm), signature: await adm.signMessage(msgFee(adm)) });
  assert.equal(ok1.status, 200, JSON.stringify(ok1.json));
  assert.equal((await s.call('/fee-recipient', 'GET', null, null)).json.recipient, adm.address);
  // assinatura de OUTRA carteira para o endereço do admin
  const m = msgFee(adm); assert.equal((await s.call('/adm/fee-recipient', 'POST', { recipient: adm.address, message: m, signature: await outro.signMessage(m) })).status, 400);
  // pedir um endereço diferente do que está na mensagem
  assert.equal((await s.call('/adm/fee-recipient', 'POST', { recipient: outro.address, message: m, signature: await adm.signMessage(m) })).status, 400);
  // assinatura velha (replay)
  const velha = msgFee(adm, new Date(Date.now() - 30 * 60_000));
  const rv = await s.call('/adm/fee-recipient', 'POST', { recipient: adm.address, message: velha, signature: await adm.signMessage(velha) });
  assert.equal(rv.status, 400); assert.match(rv.json.erro, /expirada/);
  // mensagem arbitrária
  assert.equal((await s.call('/adm/fee-recipient', 'POST', { recipient: adm.address, message: 'oi', signature: await adm.signMessage('oi') })).status, 400);
  assert.equal((await s.call('/fee-recipient', 'GET', null, null)).json.recipient, adm.address, 'continua o último válido');
  s.close();
});

await t('adsterra: proxy usa o token só no servidor, valida parâmetros e repassa erros', async () => {
  const visto = [];
  const fetchFn = async (url, o) => { visto.push({ url, key: o.headers['X-API-Key'] }); return { ok: true, status: 200, text: async () => JSON.stringify({ items: [{ date: '2026-10-09', impression: 100, clicks: 2, revenue: 0.31 }] }) }; };
  const s = await boot({ fetchFn });
  const r = await s.call('/adm/adsterra?endpoint=stats&start_date=2026-10-01&finish_date=2026-10-09&group_by=date', 'GET');
  assert.equal(r.status, 200); assert.equal(r.json.items[0].revenue, 0.31);
  assert.ok(visto[0].url.startsWith('https://api3.adsterratools.com/publisher/stats.json?') && visto[0].url.includes('group_by%5B%5D=date') && visto[0].key === 'tok-adsterra');
  assert.ok(!JSON.stringify(r.json).includes('tok-adsterra'), 'token não volta ao navegador');
  for (const q of ['start_date=2026-1-1&finish_date=2026-10-09', 'start_date=2026-10-01&finish_date=2026-10-09&group_by=evil', 'start_date=2026-10-01&finish_date=2026-10-09&domain=1;rm', 'endpoint=outro'])
    assert.equal((await s.call('/adm/adsterra?endpoint=stats&' + q, 'GET')).status, 400, q);
  assert.equal((await s.call('/adm/adsterra?endpoint=domains', 'GET')).status, 200);
  s.close();
  const s2 = await boot({ adsterra: '', fetchFn }); assert.equal((await s2.call('/adm/adsterra?endpoint=domains', 'GET')).status, 400); s2.close();
  const s3 = await boot({ fetchFn: async () => ({ ok: false, status: 401, text: async () => '{"message":"Unauthorized"}' }) });
  assert.equal((await s3.call('/adm/adsterra?endpoint=domains', 'GET')).status, 502); s3.close();
});

await t('login Firebase: só admin da lista entra (UID ou e-mail verificado); conta comum recebe 403 com o próprio UID', async () => {
  const s = await boot({ admin: '', fb: { uids: ['uid-admin-1'], emails: ['outro@exemplo.com'] } });
  const ok1 = await s.call('/adm/ping', 'GET', null, idToken()); assert.equal(ok1.status, 200); assert.equal(ok1.json.admin.uid, 'uid-admin-1');
  const comum = await s.call('/adm/ping', 'GET', null, idToken({ sub: 'uid-qualquer', email: 'x@y.com' }));
  assert.equal(comum.status, 403); assert.equal(comum.json.uid, 'uid-qualquer');
  assert.equal((await s.call('/adm/ping', 'GET', null, idToken({ sub: 'u2', email: 'outro@exemplo.com', email_verified: true }))).status, 200, 'e-mail verificado da lista');
  assert.equal((await s.call('/adm/ping', 'GET', null, idToken({ sub: 'u3', email: 'outro@exemplo.com', email_verified: false }))).status, 403, 'e-mail NÃO verificado não vale');
  s.close();
});

await t('login único: só danimcota@gmail.com (verificado) entra; qualquer outro Google/e-mail é barrado', async () => {
  assert.equal(DEFAULT_ADMIN_EMAIL, 'danimcota@gmail.com');
  const s = await boot({ admin: '', fb: { uids: [], emails: [DEFAULT_ADMIN_EMAIL] } });
  const dono = await s.call('/adm/ping', 'GET', null, idToken({ sub: 'u-dono', email: 'DaniMCota@Gmail.com', email_verified: true })); assert.equal(dono.status, 200, JSON.stringify(dono.json));
  assert.equal((await s.call('/adm/ping', 'GET', null, idToken({ sub: 'u-x', email: 'outro@gmail.com', email_verified: true }))).status, 403);
  assert.equal((await s.call('/adm/ping', 'GET', null, idToken({ sub: 'u-x', email: 'danimcota@gmail.com.evil.com', email_verified: true }))).status, 403);
  const naoVerif = await s.call('/adm/ping', 'GET', null, idToken({ sub: 'u-fake', email: 'danimcota@gmail.com', email_verified: false }));
  assert.equal(naoVerif.status, 403); assert.match(naoVerif.json.erro, /não foi verificado/);
  s.close();
});

await t('login Firebase: token falso, vencido, de outro projeto ou com algoritmo trocado é recusado', async () => {
  const s = await boot({ admin: '', fb: { uids: ['uid-admin-1'] } }), t = Math.floor(Date.now() / 1000);
  const outraChave = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  const ruins = { 'assinado por outra chave': idToken({}, { key: outraChave }), 'vencido': idToken({ exp: t - 600 }), 'outro projeto': idToken({ aud: 'outro', iss: 'https://securetoken.google.com/outro' }),
    'kid desconhecido': idToken({}, { kid: 'zzz' }), 'sem usuário': idToken({ sub: '' }), 'alg none': u64({ alg: 'none', kid: 'k1' }) + '.' + u64({ aud: PROJ, sub: 'uid-admin-1', exp: t + 99 }) + '.',
    'adulterado': idToken().replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')) };
  for (const [nome, tk] of Object.entries(ruins)) assert.equal((await s.call('/adm/ping', 'GET', null, tk)).status, 401, nome);
  assert.equal((await s.call('/adm/ping', 'GET', null, null)).status, 401);
  assert.equal((await s.call('/adm/ping', 'GET', null, TOKEN)).status, 401, 'OWNER_TOKEN público não abre o adm');
  s.close();
});

await t('login Firebase: fee-recipient e Adsterra funcionam com o ID token; sem listas nem token o painel fica desativado', async () => {
  const fetchFn = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ items: [] }) });
  const s = await boot({ admin: '', fb: { uids: ['uid-admin-1'] }, fetchFn }); const adm = ethers.Wallet.createRandom();
  const tk = idToken();
  const m = msgFee(adm); const r = await s.call('/adm/fee-recipient', 'POST', { recipient: adm.address, message: m, signature: await adm.signMessage(m) }, tk);
  assert.equal(r.status, 200, JSON.stringify(r.json)); assert.equal((await s.call('/fee-recipient', 'GET', null, null)).json.recipient, adm.address);
  assert.equal((await s.call('/adm/adsterra?endpoint=domains', 'GET', null, tk)).status, 200);
  assert.equal((await s.call('/adm/fee-recipient', 'POST', { recipient: adm.address, message: m, signature: await adm.signMessage(m) }, idToken({ sub: 'intruso' }))).status, 403);
  s.close();
  const s2 = await boot({ admin: '' }); assert.equal((await s2.call('/adm/ping', 'GET', null, idToken())).status, 503); s2.close();
});

console.log(`\n${ok} testes de servidor ok`);
process.exit(0);
