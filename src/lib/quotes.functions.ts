import { createServerFn } from "@tanstack/react-start";

export const TICKER_SYMBOLS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta" },
  { symbol: "BRK-B", name: "Berkshire" },
  { symbol: "JPM", name: "JPMorgan" },
  { symbol: "V", name: "Visa" },
];

export type TickerQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline: number[];
};

async function fetchQuote(symbol: string): Promise<{ price: number; changePercent: number; sparkline: number[] } | null> {
  for (const host of ["query1", "query2"]) {
    try {
      const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1h`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const r = json?.chart?.result?.[0];
      if (!r) continue;
      const closes: number[] = (r.indicators?.quote?.[0]?.close ?? []).filter(
        (n: unknown) => typeof n === "number" && !Number.isNaN(n),
      );
      const price: number = r.meta?.regularMarketPrice ?? closes[closes.length - 1];
      const prev: number = r.meta?.chartPreviousClose ?? closes[0] ?? price;
      if (!price) continue;
      return {
        price,
        changePercent: prev ? ((price - prev) / prev) * 100 : 0,
        sparkline: closes.slice(-24),
      };
    } catch {
      /* tenta o próximo host */
    }
  }
  return null;
}

/** Cotações reais (Yahoo Finance) para a barra de ações. Sem dados inventados: o que falhar é omitido. */
export const getTickerQuotes = createServerFn({ method: "GET" }).handler(async () => {
  const all = await Promise.all(
    TICKER_SYMBOLS.map(async (s) => {
      const q = await fetchQuote(s.symbol);
      return q ? ({ symbol: s.symbol.replace("-", "."), name: s.name, ...q } as TickerQuote) : null;
    }),
  );
  return all.filter((x): x is TickerQuote => x !== null);
});
