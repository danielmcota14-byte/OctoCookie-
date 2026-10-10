// Bateria de teste em Node (equivale ao teste_rapido.py --regra stop): baixa ~720 dias de ETH 8h e compara
// comprar e segurar x sistema (tendência 30/3% + stop móvel 3..7%). Uso: npm run bateria
import { aplicarLimitador, posBase } from "./limitador.ts";

async function baixar(dias: number): Promise<number[]> {
  const out: number[] = [];
  let fim = Date.now();
  while (out.length < dias * 3) {
    const r = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=ETHUSDT&interval=8h&limit=1000&endTime=${fim}`);
    if (!r.ok) throw new Error(`Binance HTTP ${r.status}`);
    const j = (await r.json()) as [number, string, string, string, string, string, number][];
    if (!j.length) break;
    out.unshift(...j.filter((x) => x[6] < Date.now()).map((x) => parseFloat(x[4])));
    fim = j[0][0] - 1;
  }
  return out.slice(-dias * 3 - 1);
}

const dd = (x: number[]) => { let cs = 0, p = 0, m = 0; for (const v of x) { cs += v; p = Math.max(p, cs); m = Math.min(m, Math.exp(cs - p) - 1); } return m * 100; };
const tot = (x: number[]) => (Math.exp(x.reduce((a, b) => a + b, 0)) - 1) * 100;

function rodada(nome: string, c: number[], custo = 0.001) {
  const r = c.slice(1).map((x, i) => Math.log(x / c[i]));
  const base = posBase(c, 30, 0.03);
  console.log(`\n${nome}  (${r.length} velas)  comprar e segurar: ${tot(r).toFixed(1)}% | queda ${dd(r).toFixed(1)}%`);
  console.log("stop  retorno  queda máx.  trocas");
  for (const X of [0, 3, 4, 5, 6, 7]) {
    const pos = X ? aplicarLimitador(base, r, X / 100, "trade", custo) : base;
    let tr = 0;
    const liq = pos.map((p, i) => { const t = Math.abs(p - (i ? pos[i - 1] : 0)); tr += t; return p * r[i] - t * custo; });
    console.log(`${X ? X + "%" : "sem"}`.padEnd(6), `${tot(liq).toFixed(1)}%`.padStart(8), `${dd(liq).toFixed(1)}%`.padStart(10), String(tr).padStart(8));
  }
}

const c = await baixar(720);
rodada("Últimos 360 dias", c.slice(-1081));
rodada("360 dias anteriores", c.slice(-2161, -1080));
rodada("540 dias", c.slice(-1621));
console.log("\nPassado não é previsão. Sem recomendação de investimento.");
