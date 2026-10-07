const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '../../public/octocookie-app/octocookie.html'), 'utf8');
let seed = 100; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const N = 1000, now = Date.now(); let c = 2000; const kl = [];
for (let i = 0; i < N; i++) { c *= Math.exp(0.0016 + (rnd() - 0.5) * 0.03); const t = now - (N - i) * 8 * 3600e3 + 8 * 3600e3 - 1; kl.push([t - 8 * 3600e3, '0', '0', '0', String(c), '0', t]); }
const errs = [];
const dom = new JSDOM(html, { url: 'http://localhost/octocookie.html', runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
  w.fetch = async (u) => { if (u.includes('/klines')) return { ok: true, status: 200, json: async () => kl }; if (u.includes('/ticker/price')) return { ok: true, status: 200, json: async () => ({ price: String(c) }) }; return { ok: false, status: 404, json: async () => ({}) }; };
  w.Chart = class { constructor() { this.data = { labels: [], datasets: [{ data: [] }] }; } update() {} };
  w.ethers = {}; w.firebase = { initializeApp() {}, database() { return { ref() { return { set() { return Promise.resolve(); } }; } }; } };
  w.addEventListener('error', (e) => errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext = () => null;
} });
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id), ST = () => w.eval('state'), esp = (ms) => new Promise((r) => setTimeout(r, ms));
let falhas = 0; const ok = (cnd, m) => { console.log((cnd ? '  OK  ' : ' FALHA') + ' ' + m); if (!cnd) { falhas++; process.exitCode = 1; } };
const logs = () => d.getElementById('logs').textContent;
// prepara o seu trader: stubs dos indicadores para gerar sinal BUY ou SELL de forma controlada
function sinal(dir) {
  const P = c;
  w.eval(`calculateVolatility=()=>0; calculateBollingerBands=()=>({lower:${P}-10,upper:${P}+10,middle:${P}});
    calculateRSI=()=>${dir === 'BUY' ? 5 : 95}; calculateSMA=()=>${dir === 'BUY' ? P - 1 : P + 1}; calculateMACD=()=>({macd:0,signal:0,histogram:${dir === 'BUY' ? 1 : -1}});
    isWithinTradingHours=()=>true; window.__chamadas=[]; runSecurityAnalysis=(x)=>{ window.__chamadas.push(x); };`);
  const s = ST(); s.currentPrice = P; s.priceHistory = Array.from({ length: 40 }, () => P); s.strategyActive = false; s.openSwap = false; s.tradesToday = 0; s.dailyProfitPct = 0; s.wins = 0; s.losses = 0; s.consecutiveLosses = 0;
}
const chamadas = () => w.eval('window.__chamadas').slice();
const roda = async (dir) => { sinal(dir); w.eval('window.__chamadas=[]'); ST().strategyActive = false; w.startTradingStrategy(); await esp(100); clearTimeout(ST().strategyInterval); return chamadas(); };
(async () => {
  await esp(1500); const E = w.HG.estado;
  console.log('--- padrão ao abrir ---');
  ok(E.trader === 'original' && $('hgTrader').value === 'original', 'modo padrão = trader original');
  console.log('--- MODO 1: trader original ---');
  ST().botRunning = true; await esp(200);
  let r = await roda('BUY'); ok(r.join() === 'BUY', 'sinal BUY do SEU trader segue direto para a análise de segurança: ' + r);
  r = await roda('SELL'); ok(r.join() === 'SELL', 'sinal SELL idem: ' + r);
  E.pos = 0; r = await roda('BUY'); ok(r.join() === 'BUY', 'mesmo com holograma "fora", nada é vetado no modo 1');
  const trades0 = ST().trades.length; await esp(5500);
  ok(ST().trades.length === trades0 && E.w.eth === 0, 'o motor do holograma NÃO negocia no modo 1 (eth virtual=' + E.w.eth + ')');
  ST().botRunning = false; await esp(3600);
  console.log('--- MODO 2: trader original + limitador ---');
  $('hgTrader').value = 'combinado'; $('hgTrader').dispatchEvent(new w.Event('change')); await esp(200);
  ok(E.trader === 'combinado', 'modo trocado para combinado');
  ST().botRunning = true; E.rodAnt = true; E.pronto = true; E.erro = '';
  E.pos = 1; r = await roda('BUY'); ok(r.join() === 'BUY', 'tendência de ALTA: BUY liberado: ' + r);
  r = await roda('SELL'); ok(r.length === 0 && logs().includes('vetou SELL'), 'tendência de ALTA: SELL vetado (log: "Limitador do Holograma vetou SELL")');
  E.pos = 0; r = await roda('BUY'); ok(r.length === 0 && logs().includes('vetou BUY'), 'tendência fora/BAIXA: BUY vetado');
  r = await roda('SELL'); ok(r.join() === 'SELL', 'tendência fora/BAIXA: SELL liberado: ' + r);
  E.stopBloq = true; E.pos = 0; r = await roda('BUY'); ok(r.length === 0, 'stop móvel acionado: BUY vetado');
  E.stopBloq = false;
  await roda('BUY'); const n0 = (logs().match(/vetou BUY/g) || []).length; await roda('BUY'); await roda('BUY'); await roda('BUY');
  ok((logs().match(/vetou BUY/g) || []).length === n0, 'veto repetido não enche o log (limitado a 1 por minuto)');
  E.pronto = false; r = await roda('BUY'); ok(r.join() === 'BUY', 'holograma sem dados: NÃO trava o seu trader (deixa passar)');
  E.pronto = true;
  const t1 = ST().trades.length; await esp(5500);
  ok(ST().trades.length === t1 && E.w.eth === 0, 'o limitador NÃO manda ordens (eth virtual=' + E.w.eth + ', trades=' + ST().trades.length + ')');
  ok(ST().dailyProfitPct === 0, 'P&L diário do SEU trader não é sobrescrito pelo holograma (' + ST().dailyProfitPct + ')');
  ST().botRunning = false; await esp(3600);
  console.log('--- MODO 3: só holograma ---');
  $('hgTrader').value = 'holograma'; $('hgTrader').dispatchEvent(new w.Event('change')); await esp(200);
  ST().botRunning = true; r = await roda('BUY'); ok(r.length === 0, 'seu trader original fica desligado no modo 3');
  ST().botRunning = false;
  console.log('--- seletor trava com o bot rodando ---');
  $('hgTrader').value = 'original'; ST().botRunning = true; $('hgTrader').dispatchEvent(new w.Event('change')); await esp(100);
  ok(E.trader === 'holograma', 'não troca de modo com o bot rodando');
  ST().botRunning = false;
  console.log('erros JS:', errs.length ? errs : 'nenhum'); process.exit(falhas ? 1 : 0);
})();
