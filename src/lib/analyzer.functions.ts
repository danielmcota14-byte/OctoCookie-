import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, withGroqModelFallback } from "./ai-gateway.server";

const Input = z.object({ coinId: z.string().min(1).max(60) });

// Nomes de tickers comuns (Yahoo Finance). Tickers da B3 usam o sufixo .SA automaticamente
const STOCK_NAMES: Record<string, string> = {
  aapl: "Apple Inc.",
  msft: "Microsoft Corporation",
  nvda: "NVIDIA Corporation",
  tsla: "Tesla, Inc.",
  amzn: "Amazon.com, Inc.",
  googl: "Alphabet Inc.",
  goog: "Alphabet Inc.",
  meta: "Meta Platforms, Inc.",
  "brk.b": "Berkshire Hathaway",
  brkb: "Berkshire Hathaway",
  jpm: "JPMorgan Chase",
  v: "Visa Inc.",
  jnj: "Johnson & Johnson",
  wmt: "Walmart Inc.",
  xom: "Exxon Mobil",
  unh: "UnitedHealth Group",
  ma: "Mastercard",
  pg: "Procter & Gamble",
};

async function fetchYahooQuote(symbol: string) {
  let json: any = null;
  let lastErr = "sem resposta";
  for (const host of ["query1", "query2"]) {
    try {
      const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) { lastErr = `Yahoo ${res.status}`; continue; }
      json = await res.json();
      break;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "erro de rede";
    }
  }
  if (!json) throw new Error(lastErr);
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error("Sem dados");
  const meta = result.meta;
  const closes: number[] = (result.indicators?.quote?.[0]?.close ?? []).filter(
    (n: unknown) => typeof n === "number" && !Number.isNaN(n)
  );
  const price = meta.regularMarketPrice ?? closes[closes.length - 1];
  const prev = meta.chartPreviousClose ?? closes[closes.length - 2] ?? price;
  const change24h = prev ? ((price - prev) / prev) * 100 : 0;
  const first = closes[0] ?? price;
  const change30d = first ? ((price - first) / first) * 100 : 0;
  const c7 = closes.length > 7 ? closes[closes.length - 8] : first;
  const change7d = c7 ? ((price - c7) / c7) * 100 : change30d;
  return {
    symbol: (meta.symbol || symbol).toUpperCase(),
    name: STOCK_NAMES[symbol.toLowerCase()] || meta.shortName || meta.symbol || symbol.toUpperCase(),
    price,
    change24h,
    change7d,
    change30d,
    marketCap: meta.marketCap ?? null,
    volume24h: meta.regularMarketVolume ?? null,
    high52: meta.fiftyTwoWeekHigh ?? null,
    low52: meta.fiftyTwoWeekLow ?? null,
    sparkline: closes.slice(-30),
    currency: meta.currency || "USD",
  };
}

export const analyzeToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const rawId = data.coinId.trim();
    let symbol = rawId.toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
    // Ticker da B3 (ex.: PETR4, VALE3, BOVA11) → sufixo .SA do Yahoo Finance
    if (/^[A-Z]{4}\d{1,2}$/.test(symbol)) symbol = `${symbol}.SA`;
    if (!symbol) return { error: "Ticker inválido" as string, coin: null, sparkline: [], analysis: "" };

    let quote: Awaited<ReturnType<typeof fetchYahooQuote>>;
    try {
      quote = await fetchYahooQuote(symbol);
    } catch (e) {
      return {
        error:
          e instanceof Error
            ? `Ação não encontrada ou API indisponível. Use o ticker (ex.: AAPL, NVDA, PETR4, VALE3). (${e.message})`
            : "Erro ao buscar ação",
        coin: null,
        sparkline: [],
        analysis: "",
      };
    }

    const coin = {
      id: quote.symbol.toLowerCase(),
      symbol: quote.symbol,
      name: quote.name,
      image: "",
      rank: null as number | null,
      price: quote.price,
      marketCap: quote.marketCap,
      volume24h: quote.volume24h,
      change24h: quote.change24h,
      change7d: quote.change7d,
      change30d: quote.change30d,
      high52: quote.high52 as number | null,
      low52: quote.low52 as number | null,
      currency: quote.currency,
    };
    const sparkline = quote.sparkline;

    let analysis = "";
    try {
      analysis = await withGroqModelFallback(async (key, modelId) => {
        const gateway = createLovableAiGatewayProvider(key);
        const { text } = await generateText({
          model: gateway(modelId),
          prompt: `Você é o OctoCookie, analista educacional de mercado acionário. Explique em português BR de forma didática e neutra a ação abaixo em 3 parágrafos curtos:
1) O que é a empresa (setor, negócio principal).
2) O que os números atuais dizem (preço, variações 24h/7d/30d, volume quando disponível).
3) Riscos e conceitos que a pessoa deveria estudar antes de investir em ações (volatilidade, diversificação, horizonte).

NUNCA dê recomendação de compra ou venda. Sempre reforce que é educacional.

AÇÃO: ${coin.name} (${coin.symbol})
DADOS: preço ${coin.currency} ${coin.price}, vol 24h ${coin.volume24h ?? "n/d"}, 24h ${coin.change24h?.toFixed(2)}%, 7d ${coin.change7d?.toFixed(2)}%, 30d ${coin.change30d?.toFixed(2)}%`,
        });
        return text.trim();
      });
    } catch {
      /* ignore analysis errors */
    }

    return { error: null as string | null, coin, sparkline, analysis };
  });
