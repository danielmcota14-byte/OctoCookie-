// Backtest "por usuário": roda a regra REAL do octocookie.html (núcleo extraído do próprio HTML) sobre velas reais ETHUSDT
// (Binance spot, 1h → 8h) e mede quanto um usuário ganha/perde em 30/90/180/365 dias, começando em cada dia possível.
//   node holograma/backtest_usuarios.mjs [saida.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '../public/octocookie-app/octocookie.html'), 'utf8');
const a = html.indexOf('const Q=(function(){'), b = html.indexOf('const HG_CORE = {'), e = html.indexOf('\n', b);
if (a < 0 || b < 0) throw new Error('Núcleo do Holograma não encontrado no HTML.');
const K = new Function(html.slice(a, e) + '\nreturn HG_CORE;')();

// ---------- dados: 1h → barras de 8h (00/08/16 UTC, igual à Binance) ----------
const raw = JSON.parse(fs.readFileSync(path.join(here, 'dados/ethusdt_1h_2022-2026.json'), 'utf8'));
const H8 = 8 * 3600e3, grp = new Map();
for (const [t, c] of raw) { const k = Math.floor(t / H8); (grp.get(k) || grp.set(k, []).get(k)).push(c); }
const bars = [...grp.entries()].sort((x, y) => x[0] - y[0]).filter(([, v]) => v.length === 8).map(([k, v]) => ({ t: k * H8, c: v[7] }));
const closes = bars.map((x) => x.c), N = closes.length;

// ---------- premissas de custo (por usuário) ----------
const VAR = 0.0015;          // 0,05% da pool Uniswap + 0,10% de spread/impacto/slippage, por troca
const GAS_BUY = 2.0, GAS_SELL = 1.5, GAS_FEETX = 0.3; // US$ por transação (approve+swap / swap / transferência da taxa)
const FEE = 0.02;            // taxa de serviço: 2% do lucro de cada operação vencedora
const SIZES = [200, 1000, 10000];
const HORIZ = { '30d': 90, '90d': 270, '180d': 540, '365d': 1095 };
const STRIDE = 6;            // começa um usuário novo a cada 2 dias (6 barras de 8h)
const START0 = 200;          // o bot precisa de ≥200 velas

const PERFIS = [
  { id: 'defensivo', nome: 'Defensivo (barra 20)', barra: 20, filtro: 'estrito', filtroN: 4 },
  { id: 'cauteloso', nome: 'Cauteloso (barra 35)', barra: 35, filtro: 'votacao', filtroN: 3 },
  { id: 'equilibrado', nome: 'Equilibrado (barra 55)', barra: 55, filtro: 'votacao', filtroN: 2 },
  { id: 'crescimento', nome: 'Crescimento (barra 75)', barra: 75, filtro: 'off', filtroN: 3 },
  { id: 'testado', nome: 'Como foi testado (barra 100)', barra: 100, filtro: 'off', filtroN: 3 },
];
const NEUTRO = { caos: 0.5, direcao: 0 }; // em modo tendência o resultado não usa o circuito quântico (conferido: 0 divergências)

function novaConta(usd) { return { usd, eth: 0, entry: 0, fees: 0, gas: 0, trocas: 0 }; }
function rebal(ac, alvoFrac, p) { // rebalReal do bot: só opera se a diferença passar de max(1% do patrimônio, US$5)
  const eq = ac.usd + ac.eth * p, alvo = alvoFrac * eq, cur = ac.eth * p, troca = alvo - cur;
  if (Math.abs(troca) <= Math.max(0.01 * eq, 5)) return;
  if (troca > 0) {
    const v = Math.min(troca, Math.max(0, ac.usd - GAS_BUY)); if (v <= 0) return;
    if (cur < Math.max(0.01 * eq, 5)) ac.entry = p;
    ac.usd -= v + GAS_BUY; ac.gas += GAS_BUY; ac.eth += (v * (1 - VAR)) / p; ac.trocas++;
  } else {
    const e = Math.min(-troca / p, ac.eth), fechou = alvoFrac === 0;
    ac.usd += e * p * (1 - VAR) - GAS_SELL; ac.gas += GAS_SELL; ac.eth -= e; ac.trocas++;
    if (fechou && ac.entry > 0) {
      const lucro = e * (p - ac.entry);
      if (lucro > 0) { const f = FEE * lucro; ac.usd -= f + GAS_FEETX; ac.fees += f; ac.gas += GAS_FEETX; }
      ac.entry = 0;
    }
  }
}

function simular(perfil, s) {
  const pr = K.L.paramsBarra(perfil.barra), janela = pr.janela, lim = pr.lim / 100, risco = K.arPar(pr.expo);
  const C = { janela, lim, modo: 'tendencia', lq: 0.3, stopPct: pr.stop / 100, stopVivo: true };
  // início do usuário = resetarPosicao() do bot: acompanha a posição da regra no histórico e rebalanceia no 1º ciclo
  const hist0 = closes.slice(Math.max(0, s - 999), s + 1);
  const bt = K.backtest(hist0, K.sinalTendencia(hist0, janela), lim, 0.001);
  let st = { regraPos: bt.posFinal, pos: perfil.filtro === 'off' ? bt.posFinal : 0, stopBloq: false, topo: null };
  let reb = true, pronto = false;
  const accs = SIZES.map((u) => novaConta(u));
  const pico = SIZES.slice(), dd = SIZES.map(() => 0), minEq = SIZES.slice();
  const p0 = closes[s]; let bhPico = p0, bhDD = 0, bhMin = p0;
  const fim = Math.min(s + HORIZ['365d'], N - 1), out = {}, ponto = new Map(Object.entries(HORIZ).map(([k, v]) => [s + v, k]));
  for (let t = s; t <= fim; t++) {
    const c = closes.slice(Math.max(0, t - 999), t + 1), p = closes[t];
    const ind = K.avaliarEntrada(c, p, perfil.filtro, perfil.filtroN, 30, 70);
    const d = K.decidir(C, c, p, st, NEUTRO, ind.ok);
    const flip = pronto && d.st.pos !== st.pos;
    st = { regraPos: d.st.regraPos, pos: d.st.pos, stopBloq: d.st.stopBloq, topo: d.st.topo };
    if (flip || reb) { for (const ac of accs) rebal(ac, st.pos === 1 ? (risco / 100) * d.expo : 0, p); reb = false; }
    pronto = true;
    accs.forEach((ac, i) => { const eq = ac.usd + ac.eth * p; if (eq > pico[i]) pico[i] = eq; if (eq < minEq[i]) minEq[i] = eq; dd[i] = Math.max(dd[i], 1 - eq / pico[i]); });
    if (p > bhPico) bhPico = p; if (p < bhMin) bhMin = p; bhDD = Math.max(bhDD, 1 - p / bhPico);
    const h = ponto.get(t);
    if (h) out[h] = {
      sizes: accs.map((ac, i) => ({ ret: (ac.usd + ac.eth * p) / SIZES[i] - 1, dd: dd[i], pior: minEq[i] / SIZES[i] - 1, fees: ac.fees, gas: ac.gas, trocas: ac.trocas })),
      bh: { ret: p / p0 - 1, dd: bhDD, pior: bhMin / p0 - 1 },
    };
  }
  return out;
}

const pct = (arr, q) => { const v = arr.slice().sort((x, y) => x - y); const i = (v.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return v[lo] + (v[hi] - v[lo]) * (i - lo); };
const stats = (arr) => ({ n: arr.length, min: Math.min(...arr), p5: pct(arr, 0.05), p25: pct(arr, 0.25), mediana: pct(arr, 0.5), p75: pct(arr, 0.75), p95: pct(arr, 0.95), max: Math.max(...arr), media: arr.reduce((x, y) => x + y, 0) / arr.length, probPerda: arr.filter((x) => x < 0).length / arr.length });

function rodar(saida) {
  const res = { gerado: new Date().toISOString(), dados: { barras8h: N, de: new Date(bars[0].t).toISOString(), ate: new Date(bars[N - 1].t).toISOString() },
    premissas: { varPct: VAR * 100, gasUsd: { compra: GAS_BUY, venda: GAS_SELL, taxaTx: GAS_FEETX }, taxaServicoPct: FEE * 100, passoDias: STRIDE / 3 }, perfis: {} };
  const t0 = Date.now();
  for (const perfil of PERFIS) {
    const acum = {}; // horizonte -> lista de resultados
    for (let s = START0; s < N - 1; s += STRIDE) {
      const o = simular(perfil, s);
      for (const [h, r] of Object.entries(o)) (acum[h] ||= []).push(r);
    }
    const P = {};
    for (const [h, lista] of Object.entries(acum)) {
      P[h] = { janelas: lista.length, bh: { ret: stats(lista.map((r) => r.bh.ret)), dd: stats(lista.map((r) => r.bh.dd)), pior: stats(lista.map((r) => r.bh.pior)) }, tamanhos: {} };
      SIZES.forEach((u, i) => {
        P[h].tamanhos[u] = { ret: stats(lista.map((r) => r.sizes[i].ret)), dd: stats(lista.map((r) => r.sizes[i].dd)), pior: stats(lista.map((r) => r.sizes[i].pior)),
          taxaServicoUsd: stats(lista.map((r) => r.sizes[i].fees)), gasUsd: stats(lista.map((r) => r.sizes[i].gas)), trocas: stats(lista.map((r) => r.sizes[i].trocas)) };
      });
    }
    res.perfis[perfil.id] = { nome: perfil.nome, horizontes: P };
    console.error(`${perfil.nome}: ok (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  fs.writeFileSync(saida, JSON.stringify(res, null, 1));
  return res;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  rodar(process.argv[2] || path.join(here, 'resultado_backtest.json'));
}
export { K, closes, bars, N, PERFIS, SIZES, HORIZ, simular, rodar };
