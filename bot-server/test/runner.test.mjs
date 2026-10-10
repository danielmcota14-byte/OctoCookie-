// Testa o Runner com um "Chromium" falso: política de rede da página, entrega da chave, reinício e parada.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Runner } from '../runner.js';

let ok = 0;
const t = async (nome, fn) => { await fn(); ok++; console.log('✓', nome); };
const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const PK = '0x' + 'ab'.repeat(32);

function fakeLauncher(opts = {}) {
  const L = { sessions: [], async launchPersistentContext(dir) {
    const S = { dir, initScripts: [], headlessArgs: null, stopped: false, closed: false, routeHandler: null, crashed: false, handlers: {} };
    const page = {
      on(ev, cb) { S.handlers[ev] = cb; }, isClosed: () => S.closed,
      async addInitScript(fn, arg) { S.initScripts.push(arg); },
      async goto(url) { S.url = url; }, async waitForFunction() {},
      async evaluate(fn, arg) {
        const src = fn.toString();
        if (src.includes('OCTO247.headless')) { S.headlessArgs = arg; return { address: '0xEndereco', running: true }; }
        if (src.includes('OCTO247.snapshot')) { if (S.crashed || opts.snapFail) throw new Error('boom'); return { active: true, running: true, price: 3000 + Math.random(), balance: 1, trades: 0, pnlDia: 0 }; }
        if (src.includes('OCTO247.stop')) { S.stopped = true; return; }
        if (src.includes('window.addLog')) { S.logPatched = true; }
      },
    };
    S.page = page;
    S.ctx = { pages: () => [page], newPage: async () => page, async route(_p, h) { S.routeHandler = h; }, async close() { S.closed = true; } };
    L.sessions.push(S); return S.ctx;
  } };
  return L;
}
function mk(launcher, extra = {}) {
  const logs = [], dir = fs.mkdtempSync(path.join(os.tmpdir(), 'octo-run-'));
  const r = new Runner({ appDir: new URL('../../public/octocookie-app/', import.meta.url).pathname, dataDir: dir, appPort: 18000 + Math.floor(Math.random() * 1000), rpc: { ethereum: 'https://eth-mainnet.g.alchemy.com/v2/xyz' }, log: (m) => logs.push(m), launcher, pollMs: 15, ...extra });
  return { r, logs };
}
async function decide(S, url, type = 'xhr') {
  const res = {};
  await S.routeHandler({ request: () => ({ url: () => url, resourceType: () => type }), continue: async () => { res.v = 'continue'; }, abort: async () => { res.v = 'abort'; }, fulfill: async (o) => { res.v = 'fulfill'; res.o = o; } });
  return res;
}

await t('abre o octocookie.html em modo headless e entrega a chave + campos + RPC só à página', async () => {
  const L = fakeLauncher(), { r } = mk(L);
  await r.start(PK, { fields: { stakePct: '5' }, hg: { barra: 55 }, fee: false });
  await esp(120);
  const S = L.sessions[0];
  assert.match(S.url, /\/octocookie\.html\?headless=1$/);
  assert.equal(S.headlessArgs[0], PK);
  assert.deepEqual(S.headlessArgs[1].fields, { stakePct: '5' });
  assert.equal(S.headlessArgs[1].fee, false);
  assert.equal(S.headlessArgs[1].rpc.ethereum, 'https://eth-mainnet.g.alchemy.com/v2/xyz');
  assert.ok(S.initScripts.includes(JSON.stringify({ barra: 55 })), 'perfil do Holograma aplicado antes da página carregar');
  assert.equal(r.armed(), true); assert.ok(r.snap && r.snap.running);
  await r.stop(); assert.equal(r.pk, null); assert.equal(r.armed(), false); assert.equal(L.sessions[0].stopped, true); assert.equal(L.sessions[0].closed, true);
});

await t('política de rede: só app local, libs locais, Binance, RPC configurado e Firebase; o resto é bloqueado', async () => {
  const L = fakeLauncher(), { r, logs } = mk(L);
  await r.start(PK, {}); await esp(60);
  const S = L.sessions[0], port = r.appPort;
  assert.equal((await decide(S, `http://127.0.0.1:${port}/octocookie.html`, 'document')).v, 'continue');
  const eth = await decide(S, 'https://cdn.jsdelivr.net/npm/ethers@6.9.1/dist/ethers.umd.min.js', 'script');
  assert.equal(eth.v, 'fulfill'); assert.ok(eth.o.path.endsWith('ethers.umd.min.js') && fs.existsSync(eth.o.path), 'ethers vem do disco, não da CDN');
  const ch = await decide(S, 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', 'script');
  assert.equal(ch.v, 'fulfill'); assert.ok(fs.existsSync(ch.o.path));
  for (const u of ['https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', 'https://data-api.binance.vision/api/v3/klines', 'https://eth-mainnet.g.alchemy.com/v2/xyz', 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js', 'https://cookiescript-bf257-default-rtdb.firebaseio.com/x.json'])
    assert.equal((await decide(S, u)).v, 'continue', u);
  for (const u of ['https://evil.example.com/steal.js', 'https://cdn.jsdelivr.net/npm/outro@1.0.0/x.js', 'https://www.gstatic.com/outra/coisa.js', 'https://api.binance.com.evil.com/x'])
    assert.equal((await decide(S, u, 'script')).v, 'abort', u);
  assert.equal((await decide(S, 'https://fonts.googleapis.com/css2', 'stylesheet')).v, 'abort');
  assert.ok(logs.some((l) => l.includes('[bloqueado] evil.example.com')));
  await r.stop();
});

await t('servidor estático interno só serve a pasta do app (sem path traversal)', async () => {
  const L = fakeLauncher(), { r } = mk(L);
  await r.start(PK, {}); await esp(40);
  const base = `http://127.0.0.1:${r.appPort}`;
  assert.equal((await fetch(base + '/octocookie.html')).status, 200);
  assert.equal((await fetch(base + '/modo247.js')).status, 200);
  assert.equal((await fetch(base + '/..%2f..%2fbot-server%2fpackage.json')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e/%2e%2e/etc/passwd')).status, 404);
  await r.stop(); r.srv.close();
});

await t('se a página trava/cai, reinicia sozinha com a mesma chave (backoff) e para quando mandam parar', async () => {
  const L = fakeLauncher({ snapFail: true }), { r, logs } = mk(L);
  await r.start(PK, {});
  await esp(300); // snapshot falha 3x -> "página não responde" -> reinicia (backoff 5s no real; aqui basta ver a 1ª queda)
  assert.ok(logs.some((l) => l.includes('página não responde')), logs.join('\n'));
  assert.ok(logs.some((l) => l.includes('Reiniciando em')));
  await r.stop(); assert.equal(r.pk, null);
});

await t('destino da taxa do admin é entregue à página e atualizado em execução', async () => {
  let dest = '0x' + '11'.repeat(20); const L = fakeLauncher(), { r } = mk(L, { feeSource: () => dest });
  const seen = []; const orig = L.launchPersistentContext.bind(L);
  L.launchPersistentContext = async (d) => { const c = await orig(d); const pg = c.pages()[0]; const ev = pg.evaluate.bind(pg); pg.evaluate = async (fn, arg) => { if (fn.toString().includes('setFeeRecipient')) { seen.push(arg); return; } return ev(fn, arg); }; return c; };
  await r.start(PK, {}); await esp(60);
  assert.equal(L.sessions[0].headlessArgs[1].feeRecipient, dest);
  dest = '0x' + '22'.repeat(20); await esp(80);
  assert.deepEqual(seen, [dest]);
  await r.stop();
});

console.log(`\n${ok} testes do runner ok`);
process.exit(0);
