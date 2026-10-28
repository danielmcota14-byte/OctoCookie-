import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getTickerQuotes, type TickerQuote } from "@/lib/quotes.functions";
import { cn } from "@/lib/utils";

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 64;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="shrink-0 opacity-90">
      <polyline
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

function formatPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function StockTicker() {
  const [stocks, setStocks] = useState<TickerQuote[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const load = useServerFn(getTickerQuotes);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrices() {
      try {
        const results = await load();
        if (!cancelled && results.length) setStocks(results);
      } catch {
        /* mantém o último valor válido; nunca inventa preços */
      }
    }
    void fetchPrices();
    const id = setInterval(fetchPrices, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [load]);

  const display = stocks.length ? [...stocks, ...stocks] : [];

  return (
    <div className="relative overflow-hidden border-b border-border bg-background/80 backdrop-blur">
      <div
        ref={trackRef}
        className="ticker-track flex w-max items-center gap-6 py-2"
        style={{ animation: display.length ? "ticker-scroll 40s linear infinite" : undefined }}
      >
        {display.map((s, i) => {
          const pos = (s.changePercent ?? 0) >= 0;
          return (
            <div
              key={`${s.symbol}-${i}`}
              className="flex shrink-0 items-center gap-2 px-1 text-xs"
            >
              <span className="font-semibold uppercase text-foreground">
                {s.symbol}
              </span>
              <span className="tabular-nums text-muted-foreground">
                ${formatPrice(s.price)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-0.5 tabular-nums font-medium",
                  pos ? "text-green-500" : "text-red-500"
                )}
              >
                {pos ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(s.changePercent ?? 0).toFixed(2)}%
              </span>
              {s.sparkline?.length > 1 && (
                <MiniSparkline data={s.sparkline} positive={pos} />
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
