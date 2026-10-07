// LIMITADOR DE PERDAS (porte fiel do teste_rapido.py): tendência + stop móvel (ou queda da carteira) + barra de risco.
// Não prevê preço: limita quedas.
export type Barra = { expo: number; stop: number; lim: number; janela: number };

/** Arredondamento do Python (metade vai para o par): 58,5 → 58. */
const arredondaPar = (x: number) => (Math.abs(x - Math.floor(x) - 0.5) < 1e-9 ? 2 * Math.round(x / 2) : Math.round(x));

export function paramsBarra(v: number): Barra {
  const f = Math.max(0, Math.min(100, v)) / 100;
  return { expo: 100 * f, stop: 2 + 3 * f, lim: 3 + 4 * (1 - f), janela: arredondaPar(30 + 30 * (1 - f)) };
}

/** Posição base da tendência (histerese): >+lim compra, <-lim vende, senão mantém. Só passado. */
export function posBase(c: number[], janela: number, lim: number): number[] {
  const out: number[] = [];
  let at = 0;
  for (let i = 0; i < c.length - 1; i++) {
    const s = Math.log(c[i] / c[Math.max(0, i - janela)]);
    at = s > lim ? 1 : s < -lim ? 0 : at;
    out.push(at);
  }
  return out;
}

/** Limitador sobre a posição base. 'trade' = stop móvel do topo desde a entrada; 'carteira' = queda do patrimônio. */
export function aplicarLimitador(base: number[], r: number[], X: number, modo: "trade" | "carteira", custo: number): number[] {
  const lx = Math.log(1 - X);
  const pos = new Array(r.length).fill(0);
  let bloq = false, prev = 0, cum = 0, topo = 0, eq = 0, eqPico = 0, pend = false;
  for (let i = 0; i < r.length; i++) {
    if (i > 0 && pos[i - 1] === 1) { cum += r[i - 1]; eq += r[i - 1]; }
    const b = base[i];
    if (b === 0) bloq = false;
    let quer = b === 1 && !bloq;
    if (quer && prev === 0) { cum = 0; topo = 0; if (pend) { eqPico = eq; pend = false; } }
    else if (quer && prev === 1) {
      topo = Math.max(topo, cum); eqPico = Math.max(eqPico, eq);
      if ((modo === "trade" && cum - topo <= lx) || (modo === "carteira" && eq - eqPico <= lx)) { quer = false; bloq = true; pend = true; }
    }
    pos[i] = quer ? 1 : 0;
    if (pos[i] !== prev) eq -= custo;
    prev = pos[i];
  }
  return pos;
}

const logRet = (c: number[]) => c.slice(1).map((x, i) => Math.log(x / c[i]));

/** Retorno (log) por vela e posição do sistema com a barra em v. */
export function liqBarra(c: number[], v: number, custo: number, modo: "trade" | "carteira" = "trade") {
  const p = paramsBarra(v), r = logRet(c);
  const base = posBase(c, p.janela, p.lim / 100);
  const pos0 = p.stop > 0 ? aplicarLimitador(base, r, p.stop / 100, modo, custo) : base;
  const pos = pos0.map((x) => x * (p.expo / 100));
  const liq = pos.map((x, i) => x * r[i] - Math.abs(x - (i ? pos[i - 1] : 0)) * custo);
  return { liq, pos, pos0 };
}

function curva(x: number[]) {
  let cs = 0, pico = 0, dd = 0;
  const acc: number[] = [];
  for (const v of x) { cs += v; acc.push(cs); pico = Math.max(pico, cs); dd = Math.min(dd, Math.exp(cs - pico) - 1); }
  return { acc, ret: (Math.exp(cs) - 1) * 100, dd: dd * 100 };
}

/** Histórico com a barra em v: sistema x comprar e segurar, e chance de perda em 30 dias (janelas de 90 velas). */
export function projecao(c: number[], v: number, custo = 0.001, modo: "trade" | "carteira" = "trade") {
  const { liq, pos0 } = liqBarra(c, v, custo, modo);
  const s = curva(liq), b = curva(logRet(c));
  const a = [0, ...s.acc];
  let n = 0, neg = 0;
  for (let i = 90; i < a.length; i++) { n++; if (a[i] - a[i - 90] < 0) neg++; }
  let trocas = 0;
  pos0.forEach((x, i) => { if (x !== (i ? pos0[i - 1] : 0)) trocas++; });
  return { v, ret: s.ret, dd: s.dd, retBh: b.ret, ddBh: b.dd, vant: s.ret - b.ret, perda30: n ? (100 * neg) / n : 0, trocas, posAtual: (pos0[pos0.length - 1] ?? 0) as 0 | 1, n: liq.length };
}

export const curvaBarra = (c: number[], custo = 0.001, modo: "trade" | "carteira" = "trade") =>
  Array.from({ length: 21 }, (_, k) => projecao(c, k * 5, custo, modo));

/** Barra automática: maior vantagem sobre comprar e segurar cuja pior queda histórica cabe no limite aceito. */
export function barraAuto(cv: ReturnType<typeof curvaBarra>, qmax: number): number {
  const ok = cv.filter((x) => x.dd >= -qmax);
  const pick = ok.length ? ok.reduce((a, b) => (b.vant > a.vant || (b.vant === a.vant && b.v > a.v) ? b : a)) : cv.reduce((a, b) => (b.dd > a.dd ? b : a));
  return pick.v;
}
