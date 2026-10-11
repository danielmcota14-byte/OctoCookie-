// Carrega o octocookie.html REAL num navegador simulado (jsdom) e testa o modo executor (headless) e as correções do swap.
// Não usa rede nem blockchain: provider/contratos são simulados. A biblioteca ethers é a real.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pkgRoot } from '../pkgroot.js';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';

const APP = new URL('../../public/octocookie-app/', import.meta.url);
const html = fs.readFileSync(new URL('octocookie.html', APP), 'utf8');
const modo = fs.readFileSync(new URL('modo247.js', APP), 'utf8');
const perfis = fs.readFileSync(new URL('perfis.js', APP), 'utf8');
const ethersUmd = fs.readFileSync(path.join(pkgRoot('ethers'), 'dist/ethers.umd.min.js'), 'utf8');

let ok = 0;
const t = async (nome, fn) => { await fn(); ok++; console.log('✓', nome); };
const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

function carregar({ headless }) {
  const rec = { contracts: [], calls: [], errs: [], sent: [] };
  const dom = new JSDOM(html, {
    url: 'http://127.0.0.1/octocookie.html' + (headless ? '?headless=1' : ''), runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder; // jsdom não traz; navegadores reais têm
      try { Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true }); } catch (e) {}
      w.eval(ethersUmd);
      const real = w.ethers;
      class FakeProvider { constructor() {} async getBalance() { return 2n * 10n ** 18n; } async getBlockNumber() { return 1; } async getFeeData() { return { maxFeePerGas: 10n ** 9n, maxPriorityFeePerGas: 10n ** 9n }; } }
      class FakeContract {
        constructor(addr, abi) {
          const a = abi.join(' '); rec.contracts.push(addr);
          if (a.includes('balanceOf')) { this.balanceOf = async () => 5000n * 10n ** 6n; this.allowance = async () => 2n ** 200n; this.approve = async () => ({ wait: async () => ({}) }); }
          if (a.includes('exactInputSingle')) {
            this.interface = new real.Interface(abi);
            const tx = { hash: '0x' + 'ab'.repeat(32), wait: async () => ({ gasUsed: 1n }) };
            const mc = async (data) => { rec.calls.push(['multicall', data]); return tx; }; mc.staticCall = async (data) => { rec.calls.push(['static', data]); };
            this.multicall = mc;
            const ex = async (p) => { rec.calls.push(['exactInputSingle', p]); return tx; }; ex.staticCall = async () => {}; this.exactInputSingle = ex;
          }
        }
      }
      w.ethers = Object.assign({}, real, { JsonRpcProvider: FakeProvider, Contract: FakeContract });
      w.fetch = async (u) => {
        if (String(u).includes('/ticker')) return { ok: true, status: 200, json: async () => ({ price: '3000' }) };
        if (String(u).includes('/klines')) { const kl = []; let c = 2500; const now = Date.now(); for (let i = 0; i < 400; i++) { c *= 1.002; const ct = now - (400 - i) * 8 * 3600e3 - 1; kl.push([ct - 8 * 3600e3, '0', '0', '0', String(c), '0', ct]); } return { ok: true, status: 200, json: async () => kl }; }
        return { ok: false, status: 404, json: async () => ({}) };
      };
      w.Chart = class { constructor() { this.data = { labels: [], datasets: [{ data: [] }] }; } update() {} };
      w.firebase = { initializeApp() {}, database() { return { ref() { return { set() { return Promise.resolve(); } }; } }; } };
      w.HTMLCanvasElement.prototype.getContext = () => null;
      w.addEventListener('error', (e) => rec.errs.push(e.message));
    },
  });
  const w = dom.window;
  w.eval(perfis); w.eval(modo);
  return { w, rec, $: (id) => w.document.getElementById(id), real: w.ethers };
}

const wallet = (await import('ethers')).Wallet.createRandom();

await t('modo normal: o card 24/7 aparece no lugar do paper trading e o JS antigo sumiu', async () => {
  const { w, $ } = carregar({ headless: false });
  await esp(300);
  assert.ok($('o247Card'), 'card 24/7');
  assert.ok($('o247Card').textContent.includes('ATIVAR 24/7') && $('o247Card').textContent.includes('Diffie-Hellman'));
  assert.equal($('bot24Card'), null); assert.equal(typeof w.bot24Start, 'undefined');
  assert.equal(typeof w.OCTO247.ativar, 'function');
});

await t('headless: ativa a carteira, aplica campos, troca o RPC, liga o bot e fecha a janela 24h', async () => {
  const { w, rec, $ } = carregar({ headless: true });
  await esp(300);
  assert.equal($('o247Card'), null, 'sem interface no servidor');
  const r = await w.OCTO247.headless(wallet.privateKey, { fields: { networkSelect: 'ethereum', tradePairSelect: 'WETH_USDC', stakePct: '7' }, fee: false, rpc: { ethereum: 'https://rpc.exemplo.com/abc', bsc: 'http://inseguro' } });
  assert.equal(r.address, wallet.address); assert.equal(r.running, true);
  assert.equal(w.eval('NETWORKS.ethereum.rpc'), 'https://rpc.exemplo.com/abc');
  assert.notEqual(w.eval('NETWORKS.bsc.rpc'), 'http://inseguro', 'RPC http é ignorado');
  assert.equal(w.eval('CONFIG.stakePct'), 7);
  assert.equal(w.eval('CONFIG.tradeStartHour + "-" + CONFIG.tradeEndHour'), '0-24');
  const s = w.OCTO247.snapshot(); assert.equal(s.active, true); assert.equal(s.running, true); assert.equal(s.address, wallet.address);
  w.OCTO247.stop(); assert.equal(w.eval('state.wallet'), null);
  assert.deepEqual(rec.errs, [], 'sem erros de JS');
});

await t('taxa automática: sem autorização NÃO envia; com autorização envia só ao destinatário configurado', async () => {
  for (const fee of [false, true]) {
    const { w } = carregar({ headless: true });
    await esp(200);
    await w.OCTO247.headless(wallet.privateKey, { fields: { networkSelect: 'ethereum', tradePairSelect: 'WETH_USDC' }, fee });
    const sent = []; w.eval('state.balance = 1');
    w.state = undefined; // (state é const do script; trocamos o método no signer)
    const st = w.eval('state'); st.wallet.sendTransaction = async (tx) => { sent.push(tx); return { hash: '0xfee', wait: async () => ({}) }; };
    const res = await w.chargeServiceFee(5);
    if (!fee) { assert.equal(res, 'skipped'); assert.equal(sent.length, 0); }
    else { assert.equal(res, 'paid'); assert.equal(sent.length, 1); assert.equal(sent[0].to, w.eval('SERVICE_FEE_RECIPIENT')); }
    w.OCTO247.stop();
  }
});

await t('MetaMask não é chamada com o executor ligado', async () => {
  const { w } = carregar({ headless: true }); await esp(200);
  await w.OCTO247.headless(wallet.privateKey, { fields: { networkSelect: 'ethereum', tradePairSelect: 'WETH_USDC' } });
  let pedidos = 0; w.ethereum = { request: async () => { pedidos++; return []; } };
  await w.connectWallet(); assert.equal(pedidos, 0); w.OCTO247.stop();
});

await t('swap USDC→ETH (venda de token): vende o USDC certo, multicall(bytes[]), recipient zero, mínimo de saída > 0', async () => {
  const { w, rec, real } = carregar({ headless: true }); await esp(200);
  await w.OCTO247.headless(wallet.privateKey, { fields: { networkSelect: 'ethereum', tradePairSelect: 'WETH_USDC' } });
  w.OCTO247.stop();
  const st = w.eval('state'); st.wallet = { address: wallet.address }; st.walletAddress = wallet.address; st.balance = 1; st.currentPrice = 3000;
  st.provider = { getFeeData: async () => ({ maxFeePerGas: 1n, maxPriorityFeePerGas: 1n }) };
  rec.contracts.length = 0; rec.calls.length = 0;
  const res = await w.executeSwap('SELL', { amountToken: 3000n * 10n ** 6n });
  assert.ok(res && res.hash, 'swap executou');
  assert.ok(rec.contracts.includes(USDC), 'contrato do token vendido = USDC (antes era WETH)');
  const mc = rec.calls.find((c) => c[0] === 'multicall'); assert.ok(mc, 'usou multicall');
  assert.equal(mc[1].length, 2, 'multicall(bytes[]) com swap + unwrap');
  const I = new real.Interface(['function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) external payable returns (uint256)', 'function unwrapWETH9(uint256 amountMinimum, address recipient) external payable']);
  const p = I.decodeFunctionData('exactInputSingle', mc[1][0])[0];
  assert.equal(p.tokenIn, USDC); assert.equal(p.tokenOut, WETH); assert.equal(p.recipient, real.ZeroAddress);
  assert.equal(p.amountIn, 3000n * 10n ** 6n);
  const esperado = 1 * (1 - 0.5 / 100); // 3000 USDC a $3000 = 1 ETH, menos 0,5% de slippage
  const min = Number(p.amountOutMinimum) / 1e18; assert.ok(Math.abs(min - esperado) < 0.001, 'mínimo ≈ ' + esperado + ' (veio ' + min + ')');
  const u = I.decodeFunctionData('unwrapWETH9', mc[1][1]); assert.equal(u[1], wallet.address); assert.equal(u[0], p.amountOutMinimum);
});

console.log(`\n${ok} testes de página ok`);
process.exit(0);
