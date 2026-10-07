const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '../../public/octocookie-app/octocookie.html'), 'utf8');
const SD = +process.argv[2], FILTRO = process.argv[3] || 'votacao';
let seed = SD; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const N = 1000, now = Date.now(); let c = 2000; const kl = [];
for (let i = 0; i < N; i++) { c *= Math.exp(0.0016 + (rnd() - 0.5) * 0.03); const closeT = now - (N - i) * 8 * 3600e3 + 8 * 3600e3 - 1; kl.push([closeT - 8 * 3600e3, '0', '0', '0', String(c), '0', closeT]); }
const ult = c, errs = [];
const dom = new JSDOM(html, { url: 'http://localhost/octocookie.html', runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
  w.fetch = async (u) => { if (u.includes('/klines')) return { ok: true, status: 200, json: async () => kl }; if (u.includes('/ticker/price')) return { ok: true, status: 200, json: async () => ({ price: String(ult) }) }; return { ok: false, status: 404, json: async () => ({}) }; };
  w.Chart = class { constructor() { this.data = { labels: [], datasets: [{ data: [] }] }; } update() {} };
  w.ethers = {}; w.firebase = { initializeApp() {}, database() { return { ref() { return { set() { return Promise.resolve(); } }; } }; } };
  w.addEventListener('error', (e) => errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext = () => null;
  try { w.localStorage.setItem('octo_hg_v2', JSON.stringify({ filtro: FILTRO, filtroN: 3 })); } catch (e) {}
} });
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id), ST = () => w.eval('state'), esp = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (cnd, m) => { console.log((cnd ? '  OK  ' : ' FALHA') + ' ' + m); if (!cnd) process.exitCode = 1; };
(async () => {
  await esp(1500);
  const E = w.HG.estado;
  console.log(`--- série ${SD}, filtro "${FILTRO}" ---`);
  ok($('hgFiltro').value === FILTRO, 'controle do filtro mostra: ' + $('hgFiltro').value);
  ok($('hgFiltroSt').textContent.length > 5, 'linha do filtro: ' + $('hgFiltroSt').textContent.slice(0, 110));
  ok($('hgHist').innerHTML.includes('Regra + filtro antigo') === (FILTRO !== 'off'), 'histórico com filtro ' + (FILTRO !== 'off' ? 'aparece' : 'não aparece'));
  w.startBot(); w.confirmFeeConsentAndStart(); await esp(7000);
  console.log(`   regraPos=${E.regraPos} pos=${E.pos} bloqEntrada=${E.bloqEntrada} votos=${E.ind.votos}/${E.ind.min} trades=${ST().trades.length} eth=${E.w.eth.toFixed(4)}`);
  const log = d.body.innerHTML;
  if (process.argv[4] === 'espera-bloqueio') {
    ok(E.regraPos === 1, 'regra manda comprar');
    ok(E.pos === 0 && E.w.eth === 0 && ST().trades.length === 0, 'filtro segurou: nada comprado');
    ok(E.bloqEntrada, 'bloqEntrada ligado');
    ok($('hgPosSub').textContent.includes('ainda não confirmou'), 'tela: ' + $('hgPosSub').textContent.slice(0, 70));
    ok(log.includes('A regra manda COMPRAR'), 'log avisa que está aguardando');
    ok($('aiReason').textContent.includes('aguardando'), 'card Sinal: ' + $('aiReason').textContent);
    console.log('--- afrouxar o filtro para votação 3/4 com o bot rodando ---');
    $('hgFiltro').value = 'votacao'; $('hgFiltro').dispatchEvent(new w.Event('change')); await esp(7000);
    ok(E.pos === 1 && E.w.eth > 0 && ST().trades.length === 1 && ST().trades[0].direction === 'BUY', `entrou ao confirmar: eth=${E.w.eth.toFixed(4)} trades=${ST().trades.length}`);
    ok(d.body.innerHTML.includes('Lógica antiga confirmou a entrada'), 'log registra a confirmação');
  } else {
    ok(E.pos === 1 && E.w.eth > 0, 'filtro liberou e a regra entrou em ETH: eth=' + E.w.eth.toFixed(4));
    ok(ST().trades.length === 1 && ST().trades[0].direction === 'BUY', 'uma ordem BUY registrada');
    ok(!E.bloqEntrada, 'sem bloqueio');
  }
  w.stopBot(); console.log('erros JS:', errs.length ? errs : 'nenhum'); process.exit(process.exitCode || 0);
})();
