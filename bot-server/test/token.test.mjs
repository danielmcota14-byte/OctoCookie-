// Testa o módulo do token (pagamentos, catálogo, recompensas) com uma BLOCKCHAIN SIMULADA — sem rede, sem fundos reais.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ethers } from 'ethers';
import { createApp } from '../server.js';
import { Vault } from '../vault.js';
import { loadTokenConfig, DEFAULT_CONTRACT_ADDRESS, DEFAULT_CHAIN_ID, DEFAULT_SEPOLIA_RPC_URL } from '../token/config.js';
import { EXPECTED_RUNTIME_BYTECODE } from '../token/bytecode.js';
import { ChainService } from '../token/chain.js';
import { TokenStore } from '../token/store.js';
import { iface, REQUIRED_FUNCTIONS, OPTIONAL_FUNCTIONS, selector } from '../token/abi.js';

let ok = 0;
const t = async (n, f) => { await f(); ok++; console.log('✓', n); };

const CONTRACT = ethers.getAddress('0x' + '11'.repeat(20));
const TREASURY = ethers.getAddress('0x' + '22'.repeat(20));
const ADMIN = 'admin-token-de-teste-123456789';
const OWNER = ethers.Wallet.createRandom();
const TOPIC = iface.getEvent('Transfer').topicHash;
const pad = (a) => ethers.zeroPadValue(a, 32);
const low = (a) => String(a).toLowerCase();

// ---- blockchain simulada: implementa só o que o ChainService usa ----
class FakeChain {
  constructor({ chainId = 11155111, decimals = 6, missing = [], noCode = false, owner = null, realCode = false } = {}) {
    this.chainId = chainId; this.decimals = decimals; this.noCode = noCode; this.owner = owner; this.head = 1000; this.blocks = {}; this.txs = {}; this.rcs = {}; this.logs = []; this.balances = {}; this.n = 0;
    this.code = '0x6080' + [...REQUIRED_FUNCTIONS, ...OPTIONAL_FUNCTIONS].filter((f) => !missing.includes(f)).map((f) => selector(f).slice(2)).join('');
    if (realCode) this.code = EXPECTED_RUNTIME_BYTECODE;
    this.provider = this; this.now = Date.now();
  }
  async getNetwork() { return { chainId: BigInt(this.chainId) }; }
  async getCode() { return this.noCode ? '0x' : this.code; }
  async getBlockNumber() { return this.head; }
  async getBlock(n) { return { timestamp: Math.floor((this.blocks[n] ?? this.now) / 1000) }; }
  async getTransaction(h) { return this.txs[low(h)] || null; }
  async getTransactionReceipt(h) { return this.rcs[low(h)] || null; }
  async getLogs(f) { return this.logs.filter((l) => l.topics[0] === f.topics[0] && (f.topics[1] == null || l.topics[1] === f.topics[1]) && (f.topics[2] == null || l.topics[2] === f.topics[2])); }
  async call(tx) {
    const p = iface.parseTransaction({ data: tx.data }), r = (v) => iface.encodeFunctionResult(p.name, [v]);
    switch (p.name) {
      case 'name': return r('OctoCookie'); case 'symbol': return r('OCTO'); case 'decimals': return r(this.decimals);
      case 'totalSupply': return r(1_000_000n); case 'tokenPrice': return r(1_000_000_000_000_000n);
      case 'balanceOf': return r(this.balances[low(p.args[0])] ?? 0n);
      case 'owner': return r(this.owner || ethers.ZeroAddress);
      default: throw new Error('chamada não suportada no simulador: ' + p.name);
    }
  }
  /** Registra uma tx de mint (owner → mint(to, amount)); evento Transfer(0x0 → to). */
  addMint({ from = this.owner, to, amount, data, status = 1, blockAt = this.now + 1000, confirmations = 5, toContract = CONTRACT, logTo = to, logAmount = amount }) {
    const hash = ethers.hexlify(ethers.randomBytes(32)), block = this.head - confirmations + 1;
    this.blocks[block] = blockAt;
    this.txs[hash] = { from, to: toContract, data: data ?? iface.encodeFunctionData('mint', [to, amount]) };
    const log = { address: CONTRACT, topics: [TOPIC, pad(ethers.ZeroAddress), pad(logTo)], data: ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [logAmount]), index: this.n++, transactionHash: hash, blockNumber: block };
    this.rcs[hash] = { status, to: toContract, blockNumber: block, logs: status === 1 ? [log] : [] };
    return hash;
  }
  /** Registra uma tx de transferência. opts permite simular valor/destino errados, revertida, remetente errado etc. */
  addTransfer({ from, to = TREASURY, amount, data, status = 1, blockAt = this.now + 1000, confirmations = 5, toContract = CONTRACT, logTo = to, logAmount = amount }) {
    const hash = ethers.hexlify(ethers.randomBytes(32)), block = this.head - confirmations + 1;
    this.blocks[block] = blockAt;
    this.txs[hash] = { from, to: toContract, data: data ?? iface.encodeFunctionData('transfer', [to, amount]) };
    const log = { address: CONTRACT, topics: [TOPIC, pad(from), pad(logTo)], data: ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [logAmount]), index: this.n++, transactionHash: hash, blockNumber: block };
    this.rcs[hash] = { status, to: toContract, blockNumber: block, logs: status === 1 ? [log] : [] };
    if (status === 1) this.logs.push(log);
    return hash;
  }
}

function cfgFor(over = {}) {
  return loadTokenConfig({ TOKEN_CONTRACT_ADDRESS: CONTRACT, TOKEN_TREASURY_ADDRESS: TREASURY, TOKEN_CHAIN_ID: '11155111', TOKEN_RPC_URL: 'http://rpc.invalido', TOKEN_MIN_CONFIRMATIONS: '3', ...over });
}

async function boot({ chain = new FakeChain(), cfg = cfgFor(), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'octotoken-')), mintOverride } = {}) {
  const svc = new ChainService(cfg, { provider: chain });
  if (mintOverride) Object.assign(svc, mintOverride);
  const store = new TokenStore(dir);
  const verifyIdToken = async (tok) => { if (!tok.startsWith('u')) throw Object.assign(new Error('Token inválido.'), { status: 401 }); return { uid: tok.split('.')[0], email: null, emailVerified: false }; };
  const runner = { armed: () => false, snap: null, lastError: null, start() {}, stop() {} };
  const app = createApp({ vault: new Vault(dir), runner, ownerToken: 'x'.repeat(30), masterKey: '', adminToken: ADMIN, verifyIdToken, token: { cfg, chain: svc, store } });
  const srv = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const url = 'http://127.0.0.1:' + srv.address().port;
  const call = async (p, { method = 'GET', body, as } = {}) => {
    const h = { 'Content-Type': 'application/json' };
    if (as === 'admin') h.Authorization = 'Bearer ' + ADMIN; else if (as) h.Authorization = 'Bearer ' + as + '.a.b';
    const r = await fetch(url + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, json: await r.json().catch(() => ({})) };
  };
  return { chain, svc, store, dir, cfg, call, close: () => srv.close() };
}

// vincula uma carteira à conta (assinatura real)
async function link(env, uid, wallet) {
  const n = await env.call('/token/wallet/nonce', { method: 'POST', body: { address: wallet.address }, as: uid });
  const sig = await wallet.signMessage(n.json.message);
  return env.call('/token/wallet/link', { method: 'POST', body: { message: n.json.message, signature: sig }, as: uid });
}
const buy = async (env, uid, featureId) => (await env.call('/token/orders', { method: 'POST', body: { featureId }, as: uid })).json.order;
const submit = (env, uid, order, hash) => env.call(`/token/orders/${order.id}/submit`, { method: 'POST', body: { txHash: hash }, as: uid });

// ======================= contrato / rede =======================
await t('endereço sem código na rede (carteira ou rede errada) → token DESABILITADO e pedidos bloqueados', async () => {
  const cfg = cfgFor({ TOKEN_CONTRACT_ADDRESS: DEFAULT_CONTRACT_ADDRESS });
  const env = await boot({ chain: new FakeChain({ noCode: true }), cfg });
  const c = (await env.call('/token/config')).json;
  assert.equal(c.ready, false); assert.match(c.issues.join(' '), /carteira ou a rede está errada/);
  const w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  const o = await env.call('/token/orders', { method: 'POST', body: { featureId: 'desafios' }, as: 'u1' });
  assert.equal(o.status, 503); env.close();
});
await t('rede incorreta é detectada', async () => {
  const env = await boot({ chain: new FakeChain({ chainId: 1 }) });
  const c = (await env.call('/token/config')).json; assert.equal(c.ready, false); assert.match(c.issues.join(' '), /Rede incorreta/); env.close();
});
await t('ABI × bytecode: contrato sem transferFrom() é recusado', async () => {
  const env = await boot({ chain: new FakeChain({ missing: ['transferFrom'] }) });
  const c = (await env.call('/token/config')).json; assert.equal(c.ready, false); assert.match(c.issues.join(' '), /transferFrom/); env.close();
});
await t('sem TOKEN_RPC_URL/TOKEN_TREASURY_ADDRESS: usa o RPC público da Sepolia e a tesouraria = owner() (nada de ficar desligado)', async () => {
  const cfg = loadTokenConfig({ TOKEN_CONTRACT_ADDRESS: CONTRACT, TOKEN_CHAIN_ID: '11155111', TOKEN_RPC_URL: '   ', TOKEN_TREASURY_ADDRESS: '' });
  assert.deepEqual(cfg.issues, []); assert.equal(cfg.rpcUrl, DEFAULT_SEPOLIA_RPC_URL); assert.equal(cfg.treasury, null); assert.equal(cfg.treasuryIsDefault, true);
  const env = await boot({ chain: new FakeChain({ owner: OWNER.address }), cfg });
  const c = (await env.call('/token/config')).json; assert.equal(c.ready, true, c.issues.join(' '));
  assert.equal(c.treasury, OWNER.address); assert.equal(c.treasuryIsOwner, true); env.close();
});
await t('fora da Sepolia o RPC é obrigatório; owner() zero sem tesouraria definida mantém tudo desligado', async () => {
  assert.match(loadTokenConfig({ TOKEN_CONTRACT_ADDRESS: CONTRACT, TOKEN_CHAIN_ID: '1' }).issues.join(' '), /TOKEN_RPC_URL/);
  const env = await boot({ chain: new FakeChain(), cfg: loadTokenConfig({ TOKEN_CONTRACT_ADDRESS: CONTRACT }) }); // owner() = 0x0
  const c = (await env.call('/token/config')).json; assert.equal(c.ready, false); assert.match(c.issues.join(' '), /TOKEN_TREASURY_ADDRESS/); env.close();
});
await t('pagamento com a tesouraria padrão (owner): pedido aponta para o owner e é liberado após verificação', async () => {
  const env = await boot({ chain: new FakeChain({ decimals: 6, owner: OWNER.address }), cfg: loadTokenConfig({ TOKEN_CONTRACT_ADDRESS: CONTRACT, TOKEN_MIN_CONFIRMATIONS: '3' }) }), w = ethers.Wallet.createRandom();
  await link(env, 'u1', w); const o = await buy(env, 'u1', 'desafios'); assert.equal(o.treasury, OWNER.address);
  const r = await submit(env, 'u1', o, env.chain.addTransfer({ from: w.address, to: OWNER.address, amount: BigInt(o.amountUnits) }));
  assert.equal(r.json.status, 'confirmed'); assert.equal((await env.call('/token/me', { as: 'u1' })).json.unlocked.desafios, true); env.close();
});
await t('nome, símbolo e casas decimais vêm do contrato (nunca 18 presumido)', async () => {
  const env = await boot({ chain: new FakeChain({ decimals: 6 }) });
  const c = (await env.call('/token/config')).json; assert.deepEqual(c.token, { name: 'OctoCookie', symbol: 'OCTO', decimals: 6 });
  const i = (await env.call('/token/info')).json; assert.equal(i.tokenPriceWei, '1000000000000000'); assert.equal(i.bytecodeIdentical, false); env.close();
});

await t('OctoToken oficial: padrões (Sepolia, endereço novo) e bytecode real passa na verificação ABI × bytecode', async () => {
  assert.equal(DEFAULT_CONTRACT_ADDRESS, '0x2f5f737D15ec5C79995f2d72dD0A0DaA1b75a44D'); assert.equal(DEFAULT_CHAIN_ID, 11155111);
  const cfg = loadTokenConfig({ TOKEN_TREASURY_ADDRESS: TREASURY, TOKEN_RPC_URL: 'http://rpc.invalido' });
  assert.equal(cfg.contract, DEFAULT_CONTRACT_ADDRESS); assert.equal(cfg.chainId, 11155111); assert.deepEqual(cfg.issues, []);
  const env = await boot({ chain: new FakeChain({ realCode: true }), cfg });
  const c = (await env.call('/token/config')).json; assert.equal(c.ready, true, c.issues.join(' '));
  assert.equal((await env.call('/token/info')).json.bytecodeIdentical, true);
  const caps = (await env.svc.inspect()).caps;
  for (const f of ['mint', 'burn', 'owner', 'tokenPrice', 'buy', 'setPrice', 'withdrawETH', 'recoverTokens']) assert.equal(caps[f], true, f);
  env.close();
});

// ======================= carteira =======================
await t('rotas de usuário exigem login; catálogo é público', async () => {
  const env = await boot();
  assert.equal((await env.call('/token/me')).status, 401);
  assert.equal((await env.call('/token/me', { as: 'x' })).status, 401); // token não aceito pelo verificador
  const cat = (await env.call('/token/catalog')).json.features; assert.ok(cat.length >= 5); assert.ok(cat.every((f) => f.priceTokens && f.name)); env.close();
});
await t('vincular carteira exige assinatura da própria carteira; uma carteira só serve a uma conta', async () => {
  const env = await boot(), a = ethers.Wallet.createRandom(), b = ethers.Wallet.createRandom();
  const n = await env.call('/token/wallet/nonce', { method: 'POST', body: { address: a.address }, as: 'u1' });
  const ruim = await env.call('/token/wallet/link', { method: 'POST', body: { message: n.json.message, signature: await b.signMessage(n.json.message) }, as: 'u1' });
  assert.equal(ruim.status, 400); assert.match(ruim.json.erro, /não é desta carteira/);
  assert.equal((await link(env, 'u1', a)).status, 200);
  const outro = await link(env, 'u2', a); assert.equal(outro.status, 400); assert.match(outro.json.erro, /outra conta/);
  const reuso = await env.call('/token/wallet/link', { method: 'POST', body: { message: n.json.message, signature: await a.signMessage(n.json.message) }, as: 'u1' });
  assert.equal(reuso.status, 400); // nonce de uso único
  env.close();
});

// ======================= pagamentos =======================
await t('pagamento válido: preço convertido por decimals(), tx verificada na rede e funcionalidade liberada', async () => {
  const env = await boot({ chain: new FakeChain({ decimals: 6 }) }), w = ethers.Wallet.createRandom();
  await link(env, 'u1', w);
  const o = await buy(env, 'u1', 'desafios');
  assert.equal(o.amountUnits, '5000000'); assert.equal(o.treasury, TREASURY); assert.equal(o.amountTokens, '5.0');
  assert.equal((await env.call('/token/me', { as: 'u1' })).json.unlocked.desafios, undefined);
  const h = env.chain.addTransfer({ from: w.address, amount: 5_000_000n });
  const r = await submit(env, 'u1', o, h); assert.equal(r.status, 200); assert.equal(r.json.status, 'confirmed');
  const me = (await env.call('/token/me', { as: 'u1' })).json;
  assert.equal(me.unlocked.desafios, true); assert.equal(me.orders[0].status, 'paid');
  const ent = me.entitlements.find((e) => e.featureId === 'desafios'); assert.ok(ent.expiresAt > Date.now()); // 30 dias
  env.close();
});
await t('replay: a mesma transação não paga dois pedidos (nem de outro usuário)', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(), w2 = ethers.Wallet.createRandom();
  await link(env, 'u1', w); await link(env, 'u2', w2);
  const o1 = await buy(env, 'u1', 'desafios'), h = env.chain.addTransfer({ from: w.address, amount: BigInt(o1.amountUnits) });
  assert.equal((await submit(env, 'u1', o1, h)).json.status, 'confirmed');
  assert.equal((await submit(env, 'u1', o1, h)).json.status, 'confirmed'); // reenvio idempotente: não cria nada novo
  const o2 = await buy(env, 'u1', 'desafios'); // novo pedido da mesma funcionalidade
  const r2 = await submit(env, 'u1', o2, h); assert.equal(r2.status, 409);
  const o3 = await buy(env, 'u2', 'desafios'); const r3 = await submit(env, 'u2', o3, h); assert.equal(r3.status, 409);
  assert.equal((await env.call('/token/me', { as: 'u2' })).json.unlocked.desafios, undefined); env.close();
});
await t('envios simultâneos do mesmo hash: só um é processado', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  const o = await buy(env, 'u1', 'desafios'), h = env.chain.addTransfer({ from: w.address, amount: BigInt(o.amountUnits) });
  const rs = await Promise.all([submit(env, 'u1', o, h), submit(env, 'u1', o, h), submit(env, 'u1', o, h)]);
  assert.equal(rs.filter((r) => r.json.status === 'confirmed').length >= 1, true);
  assert.equal(env.store.entitlements('u1').length, 1); assert.equal(env.store.allPurchases().filter((p) => p.status === 'confirmed').length, 1); env.close();
});
await t('recusa: valor menor, destinatário errado, revertida, remetente errado, não-contrato, approve() e transação antiga', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(), outra = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  const cenarios = {
    'valor': { from: w.address, amount: 4_999_999n },
    'destinatário': { from: w.address, amount: 5_000_000n, to: ethers.getAddress('0x' + '33'.repeat(20)) },
    'revertida': { from: w.address, amount: 5_000_000n, status: 0 },
    'remetente': { from: outra.address, amount: 5_000_000n },
    'outro contrato': { from: w.address, amount: 5_000_000n, toContract: ethers.getAddress('0x' + '44'.repeat(20)) },
    'approve': { from: w.address, amount: 5_000_000n, data: iface.encodeFunctionData('approve', [TREASURY, 5_000_000n]) },
    'anterior ao pedido': { from: w.address, amount: 5_000_000n, blockAt: Date.now() - 3_600_000 },
    'evento divergente': { from: w.address, amount: 5_000_000n, logAmount: 1n },
  };
  for (const [nome, c] of Object.entries(cenarios)) {
    const o = await buy(env, 'u1', 'desafios'), r = await submit(env, 'u1', o, env.chain.addTransfer(c));
    assert.equal(r.status, 422, nome); assert.equal(r.json.status, 'rejected', nome);
  }
  assert.equal((await env.call('/token/me', { as: 'u1' })).json.unlocked.desafios, undefined);
  assert.equal((await env.call('/token/orders/x/submit', { method: 'POST', body: { txHash: '0x1234' }, as: 'u1' })).status, 404);
  const o = await buy(env, 'u1', 'desafios'); assert.equal((await submit(env, 'u1', o, '0x1234')).status, 400); env.close();
});
await t('confirmações insuficientes → pendente (202); depois de minerar mais blocos → liberado', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  const o = await buy(env, 'u1', 'desafios'), h = env.chain.addTransfer({ from: w.address, amount: BigInt(o.amountUnits), confirmations: 1 });
  const p = await submit(env, 'u1', o, h); assert.equal(p.status, 202); assert.equal(p.json.status, 'pending'); assert.equal(p.json.confirmations, 1);
  assert.equal(env.store.purchase(h), null); // pendente não consome o hash
  env.chain.head += 2;
  assert.equal((await submit(env, 'u1', o, h)).json.status, 'confirmed'); env.close();
});
await t('transação ainda não encontrada → pendente, sem liberar nada', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  const o = await buy(env, 'u1', 'desafios'), r = await submit(env, 'u1', o, ethers.hexlify(ethers.randomBytes(32)));
  assert.equal(r.status, 202); assert.equal(r.json.status, 'pending'); env.close();
});
await t('o usuário não consegue usar o pedido de outro; sem carteira não compra', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom();
  assert.equal((await env.call('/token/orders', { method: 'POST', body: { featureId: 'desafios' }, as: 'u1' })).status, 400);
  await link(env, 'u1', w); const o = await buy(env, 'u1', 'desafios');
  assert.equal((await submit(env, 'u2', o, ethers.hexlify(ethers.randomBytes(32)))).status, 404); env.close();
});
await t('renovação soma ao tempo restante; compra permanente não expira', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  for (let k = 0; k < 2; k++) { const o = await buy(env, 'u1', 'desafios'); await submit(env, 'u1', o, env.chain.addTransfer({ from: w.address, amount: BigInt(o.amountUnits) })); }
  const e = env.store.entitlements('u1')[0]; assert.ok(e.expiresAt - Date.now() > 55 * 86_400_000);
  const o = await buy(env, 'u1', 'lab-avancado'); await submit(env, 'u1', o, env.chain.addTransfer({ from: w.address, amount: BigInt(o.amountUnits) }));
  assert.equal(env.store.entitlements('u1').find((x) => x.featureId === 'lab-avancado').expiresAt, null); env.close();
});
await t('saldo do token NÃO libera nada: só compra validada', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  env.chain.balances[low(w.address)] = 10n ** 12n;
  const me = (await env.call('/token/me', { as: 'u1' })).json; assert.equal(me.balance, String(10n ** 12n)); assert.equal(me.balanceFormatted, '1000000.0'); assert.deepEqual(me.unlocked, {});
  assert.equal((await env.call('/token/access/desafios', { as: 'u1' })).json.unlocked, false); env.close();
});
await t('histórico on-chain da carteira (Transfer in/out)', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  env.chain.addTransfer({ from: w.address, amount: 7n }); env.chain.addTransfer({ from: TREASURY, to: w.address, amount: 9n });
  const h = (await env.call('/token/transfers', { as: 'u1' })).json.items; assert.deepEqual(h.map((x) => x.direction).sort(), ['in', 'out']); env.close();
});

// ======================= admin / catálogo =======================
await t('/adm/token exige admin; o admin muda o preço sem tocar no frontend e os novos pedidos usam o novo preço', async () => {
  const env = await boot({ chain: new FakeChain({ decimals: 6 }) }), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  assert.equal((await env.call('/adm/token/catalog')).status, 401);
  assert.equal((await env.call('/adm/token/catalog', { as: 'u1' })).status, 401);
  const o1 = await buy(env, 'u1', 'desafios'); assert.equal(o1.amountUnits, '5000000');
  const put = await env.call('/adm/token/catalog/desafios', { method: 'PUT', as: 'admin', body: { priceTokens: '12.5' } }); assert.equal(put.status, 200);
  assert.equal((await env.call('/token/catalog')).json.features.find((f) => f.id === 'desafios').priceTokens, '12.5');
  const o2 = await buy(env, 'u1', 'desafios'); assert.equal(o2.amountUnits, '12500000'); assert.notEqual(o2.id, o1.id);
  // o pedido antigo (preço antigo) não pode mais ser pago
  const velho = await submit(env, 'u1', o1, env.chain.addTransfer({ from: w.address, amount: 5_000_000n })); assert.equal(velho.status, 409);
  assert.equal((await env.call('/adm/token/catalog/desafios', { method: 'PUT', as: 'admin', body: { priceTokens: '-1' } })).status, 400);
  assert.equal((await env.call('/adm/token/catalog/novo-recurso', { method: 'PUT', as: 'admin', body: { name: 'Novo', priceTokens: '3', active: true } })).status, 200);
  assert.ok((await env.call('/token/catalog')).json.features.some((f) => f.id === 'novo-recurso'));
  await env.call('/adm/token/catalog/novo-recurso', { method: 'PUT', as: 'admin', body: { active: false } });
  assert.ok(!(await env.call('/token/catalog')).json.features.some((f) => f.id === 'novo-recurso'));
  const casas = await env.call('/adm/token/catalog/desafios', { method: 'PUT', as: 'admin', body: { priceTokens: '1.1234567' } }); // 7 casas > decimals=6
  assert.equal(casas.status, 200); assert.equal((await env.call('/token/orders', { method: 'POST', body: { featureId: 'desafios' }, as: 'u1' })).status, 400);
  env.close();
});
await t('persistência: desbloqueios sobrevivem a reinício do servidor', async () => {
  const env = await boot(), w = ethers.Wallet.createRandom(); await link(env, 'u1', w);
  const o = await buy(env, 'u1', 'desafios'); await submit(env, 'u1', o, env.chain.addTransfer({ from: w.address, amount: BigInt(o.amountUnits) }));
  const depois = await boot({ dir: env.dir, chain: env.chain });
  assert.equal((await depois.call('/token/me', { as: 'u1' })).json.unlocked.desafios, true);
  assert.equal(depois.store.wallet('u1').address, w.address); env.close(); depois.close();
});

// ======================= recompensas =======================
const rew = { recipient: ethers.Wallet.createRandom().address, kind: 'contribuicao', reason: 'Tutorial aprovado', amountTokens: '2.5', ref: 'post:abc123' };
await t('recompensas: registro com motivo/valor/destinatário/ref única; nada é emitido sozinho', async () => {
  const env = await boot({ chain: new FakeChain({ decimals: 6 }) });
  const r = await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: rew }); assert.equal(r.status, 200);
  assert.equal(r.json.reward.status, 'pending'); assert.equal(r.json.reward.amountUnits, '2500000');
  assert.equal((await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: rew })).status, 400); // ref duplicada
  assert.equal((await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: { ...rew, ref: 'x:1', recipient: '0x123' } })).status, 400);
  assert.equal((await env.call('/adm/token/rewards', { method: 'POST', as: 'u1', body: { ...rew, ref: 'x:2' } })).status, 401);
  const id = r.json.reward.id;
  assert.equal((await env.call(`/adm/token/rewards/${id}/mint`, { method: 'POST', as: 'admin', body: { confirm: true } })).status, 409); // precisa aprovar antes
  env.close();
});
await t('recompensas só existem com o token verificado (contrato inválido → bloqueado)', async () => {
  const env = await boot({ chain: new FakeChain({ noCode: true }) });
  assert.equal((await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: rew })).status, 503); env.close();
});
await t('mint: sem chave operacional ou sem ser owner() a emissão fica indisponível (aprovação manual)', async () => {
  const env = await boot({ chain: new FakeChain({ owner: ethers.Wallet.createRandom().address }) });
  const id = (await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: rew })).json.reward.id;
  await env.call(`/adm/token/rewards/${id}/approve`, { method: 'POST', as: 'admin' });
  const m = await env.call(`/adm/token/rewards/${id}/mint`, { method: 'POST', as: 'admin', body: { confirm: true } });
  assert.equal(m.status, 400); assert.match(m.json.erro, /Emissão indisponível/);
  assert.equal(env.store.reward(id).status, 'approved'); // volta para aprovada, pronta para emissão manual
  const st = (await env.call('/adm/token/status', { as: 'admin' })).json; assert.equal(st.mint.can, false);
  const falso = await env.call(`/adm/token/rewards/${id}/manual`, { method: 'POST', as: 'admin', body: { txHash: ethers.hexlify(ethers.randomBytes(32)) } });
  assert.equal(falso.status, 202); assert.notEqual(env.store.reward(id).status, 'minted'); // hash inexistente NÃO vira "emitida"
  env.close();
});
await t('mint com carteira operacional owner: exige confirm e não duplica', async () => {
  const wallet = ethers.Wallet.createRandom(), sent = [];
  const env = await boot({ chain: new FakeChain({ decimals: 6, owner: wallet.address }), cfg: cfgFor({ TOKEN_MINTER_PRIVATE_KEY: wallet.privateKey }) });
  assert.equal((await env.svc.mintCapability()).can, true);
  env.svc.mint = async (to, units) => { sent.push([to, units]); return { txHash: ethers.hexlify(ethers.randomBytes(32)), wait: async () => ({ status: 1 }) }; }; // não há rede: só o fluxo da rota
  const id = (await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: rew })).json.reward.id;
  await env.call(`/adm/token/rewards/${id}/approve`, { method: 'POST', as: 'admin' });
  assert.equal((await env.call(`/adm/token/rewards/${id}/mint`, { method: 'POST', as: 'admin', body: {} })).status, 400); // sem confirm
  const ok1 = await env.call(`/adm/token/rewards/${id}/mint`, { method: 'POST', as: 'admin', body: { confirm: true } });
  assert.equal(ok1.json.reward.status, 'minted'); assert.equal(sent.length, 1); assert.equal(sent[0][1], '2500000');
  assert.equal((await env.call(`/adm/token/rewards/${id}/mint`, { method: 'POST', as: 'admin', body: { confirm: true } })).status, 409); // já emitida
  assert.equal(sent.length, 1);
  // o usuário vê sua recompensa no histórico
  env.close();
});
await t('mint do ChainService: se a simulação (staticCall) falhar, nada é enviado', async () => {
  const wallet = ethers.Wallet.createRandom();
  const env = await boot({ chain: new FakeChain({ decimals: 6, owner: wallet.address }), cfg: cfgFor({ TOKEN_MINTER_PRIVATE_KEY: wallet.privateKey }) });
  await assert.rejects(env.svc.mint(rew.recipient, (10_000_000n).toString()), /simulação do mint falhou/); env.close();
});

// ======================= recompensas pela aba Admin (por conta + carteira do owner) =======================
async function rewardFlow(over = {}) {
  const env = await boot({ chain: new FakeChain({ decimals: 6, owner: OWNER.address }) }), user = ethers.Wallet.createRandom();
  await link(env, 'u1', user);
  const c = await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: { uid: 'u1', kind: 'desafio', reason: 'Desafio da semana', amountTokens: '2.5', ref: 'desafio:s1', ...over } });
  return { env, user, c, id: c.json.reward?.id };
}
const approve = (env, id) => env.call(`/adm/token/rewards/${id}/approve`, { method: 'POST', as: 'admin' });
const claim = (env, id) => env.call(`/adm/token/rewards/${id}/claim`, { method: 'POST', as: 'admin' });
const manual = (env, id, h) => env.call(`/adm/token/rewards/${id}/manual`, { method: 'POST', as: 'admin', body: { txHash: h } });

await t('admin: lista contas com carteira vinculada e cria a recompensa só com a conta (destinatário vem da carteira vinculada)', async () => {
  const { env, user, c } = await rewardFlow();
  assert.equal(c.status, 200); assert.equal(c.json.reward.recipient, user.address); assert.equal(c.json.reward.uid, 'u1'); assert.equal(c.json.reward.status, 'pending');
  const us = await env.call('/adm/token/users', { as: 'admin' }); assert.equal(us.status, 200);
  assert.deepEqual(us.json.users.map((u) => [u.uid, u.address]), [['u1', user.address]]);
  assert.equal((await env.call('/adm/token/users', { as: 'u1' })).status, 401); // só admin
  env.close();
});
await t('admin: conta sem carteira ou carteira divergente da vinculada é recusada', async () => {
  const { env } = await rewardFlow();
  assert.equal((await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: { uid: 'u2', kind: 'desafio', reason: 'Teste ok', amountTokens: '1', ref: 'x:9' } })).status, 400);
  const outra = await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: { uid: 'u1', recipient: ethers.Wallet.createRandom().address, kind: 'desafio', reason: 'Teste ok', amountTokens: '1', ref: 'x:10' } });
  assert.equal(outra.status, 400); assert.match(outra.json.erro, /não é a vinculada/); env.close();
});
await t('emissão pela carteira do owner: reservar → mint on-chain → servidor confere → recompensa emitida e visível ao usuário', async () => {
  const { env, user, id } = await rewardFlow();
  assert.equal((await claim(env, id)).status, 409); // ainda pendente
  await approve(env, id);
  assert.equal((await claim(env, id)).status, 200); assert.equal((await claim(env, id)).status, 409); // sem duplo clique/duplo admin
  const h = env.chain.addMint({ to: user.address, amount: 2_500_000n });
  const m = await manual(env, id, h); assert.equal(m.status, 200); assert.equal(m.json.reward.status, 'minted'); assert.equal(m.json.reward.txHash, h.toLowerCase());
  const me = (await env.call('/token/me', { as: 'u1' })).json; assert.equal(me.rewards[0].status, 'minted'); assert.equal(me.rewards[0].amountTokens, '2.5');
  assert.equal((await manual(env, id, h)).status, 200); // idempotente
  env.close();
});
await t('emissão recusada: valor, destinatário, remetente (não-owner), revertida, tx antiga — e a recompensa volta a "aprovada"', async () => {
  const { env, user, id } = await rewardFlow(); await approve(env, id);
  const casos = [
    ['valor menor', () => env.chain.addMint({ to: user.address, amount: 1_000_000n }), /Valor do mint/],
    ['destinatário errado', () => env.chain.addMint({ to: ethers.Wallet.createRandom().address, amount: 2_500_000n }), /Destinatário/],
    ['não é o owner', () => env.chain.addMint({ from: ethers.Wallet.createRandom().address, to: user.address, amount: 2_500_000n }), /owner\(\)/],
    ['revertida', () => env.chain.addMint({ to: user.address, amount: 2_500_000n, status: 0 }), /revertida/],
    ['outro contrato', () => env.chain.addMint({ to: user.address, amount: 2_500_000n, toContract: ethers.Wallet.createRandom().address }), /não foi enviada ao contrato/],
    ['evento divergente', () => env.chain.addMint({ to: user.address, amount: 2_500_000n, logAmount: 1n }), /Evento Transfer/],
    ['tx anterior à recompensa', () => env.chain.addMint({ to: user.address, amount: 2_500_000n, blockAt: env.chain.now - 3_600_000 }), /anterior/],
    ['não é mint()', () => env.chain.addMint({ to: user.address, amount: 2_500_000n, data: iface.encodeFunctionData('transfer', [user.address, 2_500_000n]) }), /não é uma chamada mint/],
  ];
  for (const [nome, mk, re] of casos) { const m = await manual(env, id, mk()); // cada tx é criada e conferida em seguida (o simulador reaproveita o número do bloco)
    assert.equal(m.status, 422, nome); assert.match(m.json.erro, re, nome); assert.equal(env.store.reward(id).status, 'approved', nome); }
  env.close();
});
await t('emissão: confirmações insuficientes → pendente (202, fica "minting"); depois de mais blocos → emitida', async () => {
  const { env, user, id } = await rewardFlow(); await approve(env, id); await claim(env, id);
  const h = env.chain.addMint({ to: user.address, amount: 2_500_000n, confirmations: 1 });
  const p = await manual(env, id, h); assert.equal(p.status, 202); assert.equal(env.store.reward(id).status, 'minting'); assert.equal(env.store.reward(id).txHash, h.toLowerCase());
  const rel = await env.call(`/adm/token/rewards/${id}/release`, { method: 'POST', as: 'admin' }); assert.equal(rel.status, 409); // já há tx: não pode liberar
  env.chain.head += 5; const ok = await manual(env, id, h); assert.equal(ok.status, 200); assert.equal(ok.json.reward.status, 'minted'); env.close();
});
await t('emissão: o mesmo hash não vale para duas recompensas; release devolve a recompensa quando o admin cancela na carteira', async () => {
  const { env, user, id } = await rewardFlow(); await approve(env, id); await claim(env, id);
  const rel = await env.call(`/adm/token/rewards/${id}/release`, { method: 'POST', as: 'admin' }); assert.equal(rel.status, 200); assert.equal(env.store.reward(id).status, 'approved');
  const h = env.chain.addMint({ to: user.address, amount: 2_500_000n }); assert.equal((await manual(env, id, h)).status, 200); // também aceita direto de "aprovada"
  const b = (await env.call('/adm/token/rewards', { method: 'POST', as: 'admin', body: { uid: 'u1', kind: 'desafio', reason: 'Outra', amountTokens: '2.5', ref: 'desafio:s2' } })).json.reward.id;
  await approve(env, b); const dup = await manual(env, b, h); assert.equal(dup.status, 409); assert.match(dup.json.erro, /já foi usada/);
  assert.equal((await env.call(`/adm/token/rewards/${b}/mint`, { method: 'POST', as: 'admin', body: { confirm: true } })).status, 400); // sem chave no servidor
  env.close();
});

// ======================= transparência / segredos =======================
await t('transparência pública: regras, sem queima automática e sem segredos', async () => {
  const wallet = ethers.Wallet.createRandom();
  const env = await boot({ cfg: cfgFor({ TOKEN_MINTER_PRIVATE_KEY: wallet.privateKey }) });
  const r = await env.call('/token/transparency'); assert.equal(r.status, 200);
  assert.match(r.json.queima.politica, /Não há queima automática/); assert.equal(r.json.pagamentos.tesouraria, TREASURY);
  const txt = JSON.stringify(r.json) + JSON.stringify((await env.call('/token/config')).json);
  assert.ok(!txt.includes(wallet.privateKey.slice(2)) && !txt.includes(wallet.address)); // chave/endereço operacional nunca saem
  env.close();
});

console.log(`\n${ok} testes do token OK`);
process.exit(0);
