import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
  image?: string;
};

const COINS = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,avalanche-2,polkadot,chainlink";

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
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function CryptoTicker() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [error, setError] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrices() {
      try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data = (await res.json()) as Coin[];
        if (!cancelled) {
          setCoins(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000); // a cada 1 min
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (error && coins.length === 0) {
    return (
      <div className="flex h-9 items-center border-b bg-muted/40 px-4 text-xs text-muted-foreground">
        Não foi possível carregar preços das criptos agora.
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="flex h-9 items-center border-b bg-muted/40 px-4 text-xs text-muted-foreground">
        Carregando mercado...
      </div>
    );
  }

  // duplica para loop infinito visual
  const items = [...coins, ...coins];

  return (
    <div className="relative h-9 overflow-hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        ref={trackRef}
        className="ticker-track flex h-full items-center gap-8 whitespace-nowrap"
        style={{ animation: "ticker-scroll 45s linear infinite" }}
      >
        {items.map((c, i) => {
          const pos = (c.price_change_percentage_24h ?? 0) >= 0;
          return (
            <div
              key={`${c.id}-${i}`}
              className="flex shrink-0 items-center gap-2 px-1 text-xs"
            >
              {c.image && (
                <img src={c.image} alt="" className="h-4 w-4 rounded-full" />
              )}
              <span className="font-semibold uppercase text-foreground">
                {c.symbol}
              </span>
              <span className="tabular-nums text-muted-foreground">
                ${formatPrice(c.current_price)}
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
                {Math.abs(c.price_change_percentage_24h ?? 0).toFixed(2)}%
              </span>
              {c.sparkline_in_7d?.price && (
                <MiniSparkline
                  data={c.sparkline_in_7d.price.slice(-48)}
                  positive={pos}
                />
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
