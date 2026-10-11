import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import { analyzeToken } from "@/lib/analyzer.functions";
import { Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Analisador de tokens — OctoCookie" },
      { name: "description", content: "Analise educacional de tokens cripto com dados de mercado e contexto didático." },
    ],
  }),
  component: AnalyzerPage,
});

type Result = Awaited<ReturnType<typeof analyzeToken>>;

const SUGGESTIONS = ["bitcoin", "ethereum", "solana", "cardano", "chainlink", "arbitrum"];

function AnalyzerPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [coinId, setCoinId] = useState("bitcoin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const analyze = useServerFn(analyzeToken);

  useEffect(() => setThreads(loadThreads()), []);

  async function handleAnalyze(id?: string) {
    const target = (id ?? coinId).trim();
    if (!target) return;
    setCoinId(target);
    setLoading(true);
    try {
      const r = await analyze({ data: { coinId: target } });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 md:pt-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Analisador de tokens</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta dados públicos do CoinGecko e gera uma análise didática. Conteúdo puramente educacional — sem recomendação de investimento.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAnalyze();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={coinId}
                onChange={(e) => setCoinId(e.target.value)}
                placeholder="id do CoinGecko (ex.: bitcoin, ethereum, solana)"
                className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <button type="submit" disabled={loading} className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50">
              {loading ? "Analisando..." : "Analisar"}
            </button>
          </form>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => handleAnalyze(s)} className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted">
                {s}
              </button>
            ))}
          </div>

          {result?.error && (
            <div className="mt-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              {result.error}
            </div>
          )}

          {result?.coin && <TokenReport data={result} />}
        </div>
      </main>
    </div>
  );
}

function TokenReport({ data }: { data: Extract<Result, { coin: NonNullable<Result["coin"]> }> | Result }) {
  const coin = data.coin!;
  const spark = useMemo(() => buildSpark(data.sparkline), [data.sparkline]);
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-3">
        {coin.image && <img src={coin.image} alt="" width={32} height={32} className="h-8 w-8" />}
        <div>
          <div className="text-lg font-semibold">{coin.name} <span className="text-muted-foreground">({coin.symbol})</span></div>
          <div className="text-xs text-muted-foreground">Rank #{coin.rank ?? "—"} · CoinGecko id: {coin.id}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Preço" value={fmt$(coin.price)} />
        <Metric label="Market cap" value={fmtCompact(coin.marketCap)} />
        <Metric label="Volume 24h" value={fmtCompact(coin.volume24h)} />
        <Metric label="Supply" value={fmtCompact(coin.supply)} />
        <Metric label="24h" value={`${coin.change24h?.toFixed(2)}%`} positive={coin.change24h >= 0} />
        <Metric label="7d" value={`${coin.change7d?.toFixed(2)}%`} positive={coin.change7d >= 0} />
        <Metric label="30d" value={`${coin.change30d?.toFixed(2)}%`} positive={coin.change30d >= 0} />
        <Metric label="ATH" value={fmt$(coin.ath)} />
      </div>

      {spark && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Preço · últimos 7 dias</div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <svg viewBox={`0 0 ${spark.w} ${spark.h}`} className="h-40 w-full">
              <path d={spark.path} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-foreground" />
            </svg>
          </div>
        </div>
      )}

      {data.analysis && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Análise educacional</div>
          <div className="whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed">{data.analysis}</div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-base font-semibold", positive === true && "text-emerald-600", positive === false && "text-rose-600")}>{value}</div>
    </div>
  );
}

function fmt$(v: number) {
  if (v == null) return "—";
  if (v >= 1) return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 8 })}`;
}
function fmtCompact(v: number) {
  if (v == null) return "—";
  return v.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
}
function buildSpark(prices: number[]) {
  if (!prices || prices.length < 2) return null;
  const w = 800, h = 160, pad = 6;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const x = (i: number) => pad + (i / (prices.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const path = prices.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return { w, h, path };
}
