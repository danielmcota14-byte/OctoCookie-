import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import { runSimulation } from "@/lib/simulator.functions";
import { Play, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Simulador de bot — OctoCookie" },
      { name: "description", content: "Cole seu código de estratégia e simule em dados sintéticos com feedback educacional." },
    ],
  }),
  component: SimulatorPage,
});

const DEFAULT_CODE = `// Estratégia exemplo: cruzamento de médias móveis
// Compra quando MM(9) cruza acima de MM(21); vende no cruzamento oposto.
function sinal(candles, i) {
  if (i < 21) return null;
  const mm = (n) => {
    let s = 0;
    for (let k = i - n + 1; k <= i; k++) s += candles[k].c;
    return s / n;
  };
  const rapida = mm(9), lenta = mm(21);
  const rapidaAnt = (() => { let s = 0; for (let k = i - 9; k < i; k++) s += candles[k].c; return s / 9; })();
  const lentaAnt = (() => { let s = 0; for (let k = i - 21; k < i; k++) s += candles[k].c; return s / 21; })();
  if (rapidaAnt <= lentaAnt && rapida > lenta) return "buy";
  if (rapidaAnt >= lentaAnt && rapida < lenta) return "sell";
  return null;
}`;

type SimResult = Awaited<ReturnType<typeof runSimulation>>;

function SimulatorPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [bars, setBars] = useState(200);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = useServerFn(runSimulation);

  useEffect(() => setThreads(loadThreads()), []);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      const r = await run({ data: { code, symbol, timeframe, bars } });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao executar simulação");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-16 md:pt-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Simulador de bot de trading</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cole seu código de estratégia (JS, Python, pseudocódigo ou CookieScript). Rodamos em dados sintéticos e devolvemos métricas e feedback educacional. Nenhuma ordem real é enviada.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Código</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="h-[420px] w-full rounded-lg border bg-muted/40 p-3 font-mono text-xs outline-none focus:border-ring"
              />
            </div>
            <div className="flex flex-col gap-3 lg:col-span-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Par</label>
                <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Timeframe</label>
                  <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full rounded-md border bg-background px-2 py-2 text-sm">
                    {["5m","15m","1h","4h","1d"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Candles</label>
                  <input type="number" min={50} max={500} value={bars} onChange={(e) => setBars(Number(e.target.value) || 200)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {running ? "Simulando..." : "Rodar simulação"}
              </button>
              <p className="text-xs text-muted-foreground">
                Aviso: conteúdo puramente educacional. Sem recomendação de investimento.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>{error}</div>
            </div>
          )}

          {result && <Report result={result} />}
        </div>
      </main>
    </div>
  );
}

function Report({ result }: { result: SimResult }) {
  const m = result.metrics;
  const chart = useMemo(() => buildChart(result), [result]);
  return (
    <div className="mt-8 space-y-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estratégia detectada</div>
        <div className="mt-1 text-sm">{result.strategy}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Retorno" value={`${m.returnPct.toFixed(2)}%`} positive={m.returnPct >= 0} />
        <Metric label="Buy & hold" value={`${m.buyHoldPct.toFixed(2)}%`} positive={m.buyHoldPct >= 0} />
        <Metric label="Taxa de acerto" value={`${m.winRate.toFixed(0)}%`} />
        <Metric label="Drawdown máx." value={`${m.maxDrawdownPct.toFixed(2)}%`} positive={false} />
        <Metric label="Trades" value={String(m.tradesCount)} />
        <Metric label="Ganhos" value={String(m.wins)} positive />
        <Metric label="Perdas" value={String(m.losses)} positive={false} />
        <Metric label="Equity final" value={`$${m.finalEquity.toFixed(0)}`} />
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Curva de preço e trades</div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-56 w-full">
            <path d={chart.pricePath} fill="none" stroke="currentColor" strokeWidth={1} className="text-muted-foreground/60" />
            <path d={chart.equityPath} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-foreground" />
            {chart.markers.map((mk, idx) => (
              <circle key={idx} cx={mk.x} cy={mk.y} r={3} className={mk.side === "buy" ? "fill-emerald-500" : "fill-rose-500"} />
            ))}
          </svg>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> compra</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> venda</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-4 bg-foreground" /> equity</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-4 bg-muted-foreground/60" /> preço</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Feedback</div>
        <div className="whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed">{result.analysis}</div>
      </div>

      {result.warnings.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Alertas</div>
          <ul className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold", positive === true && "text-emerald-600", positive === false && "text-rose-600")}>{value}</div>
    </div>
  );
}

function buildChart(r: SimResult) {
  const width = 800;
  const height = 220;
  const pad = 8;
  const prices = r.candles.map((c) => c.c);
  const pMin = Math.min(...prices);
  const pMax = Math.max(...prices);
  const eMin = Math.min(...r.equity);
  const eMax = Math.max(...r.equity);
  const xOf = (i: number) => pad + (i / (r.candles.length - 1)) * (width - pad * 2);
  const yPrice = (v: number) => height - pad - ((v - pMin) / (pMax - pMin || 1)) * (height - pad * 2);
  const yEq = (v: number) => height - pad - ((v - eMin) / (eMax - eMin || 1)) * (height - pad * 2);
  const pricePath = prices.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yPrice(v).toFixed(1)}`).join(" ");
  const equityPath = r.equity.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yEq(v).toFixed(1)}`).join(" ");
  const markers = r.trades.map((t) => ({ x: xOf(t.i), y: yPrice(t.price), side: t.side }));
  return { width, height, pricePath, equityPath, markers };
}
