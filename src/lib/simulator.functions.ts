import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  code: z.string().min(1).max(20000),
  symbol: z.string().default("BTC/USDT"),
  timeframe: z.string().default("1h"),
  bars: z.number().int().min(50).max(500).default(200),
  seed: z.number().int().optional(),
});

type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function synth(bars: number, seed: number): Candle[] {
  const r = rng(seed);
  const out: Candle[] = [];
  let price = 30000;
  const now = Date.now();
  for (let i = 0; i < bars; i++) {
    const drift = (r() - 0.5) * 0.015;
    const o = price;
    const c = Math.max(1, o * (1 + drift));
    const h = Math.max(o, c) * (1 + r() * 0.005);
    const l = Math.min(o, c) * (1 - r() * 0.005);
    out.push({ t: now - (bars - i) * 3600_000, o, h, l, c, v: 100 + r() * 900 });
    price = c;
  }
  return out;
}

const Trades = z.object({
  trades: z.array(
    z.object({
      i: z.number().int().min(0),
      side: z.enum(["buy", "sell"]),
    }),
  ),
  analysis: z.string(),
  warnings: z.array(z.string()).default([]),
  strategy: z.string(),
});

export const runSimulation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("Missing GROQ_API_KEY");

    const seed = data.seed ?? Math.floor(Math.random() * 1e9);
    const candles = synth(data.bars, seed);
    const closes = candles.map((c) => c.c.toFixed(2)).join(",");

    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `Você é um simulador educacional de estratégias de trading. Analise o CÓDIGO abaixo (pode ser Python, JavaScript, pseudocódigo ou CookieScript) e simule seus sinais sobre a série de preços fornecida.

MERCADO: ${data.symbol} timeframe ${data.timeframe}, ${data.bars} candles.
CLOSES (índice 0..${data.bars - 1}): ${closes}

CÓDIGO DO USUÁRIO:
\`\`\`
${data.code}
\`\`\`

Tarefa:
1. Identifique a estratégia (uma frase curta).
2. Gere uma lista de trades como pares alternados buy/sell nos índices onde a lógica dispararia. No máximo 40 trades. Comece com "buy". Se a estratégia não fizer sentido, retorne trades = [].
3. Analise o código: bugs, riscos, melhorias, gestão de risco. Português BR, didático, sem recomendação de investimento.
4. Liste warnings sobre práticas perigosas se houver.

Responda APENAS com JSON válido no formato:
{"strategy":"...","trades":[{"i":10,"side":"buy"},{"i":25,"side":"sell"}],"analysis":"...","warnings":["..."]}`;

    let parsed: z.infer<typeof Trades>;
    try {
      const { text } = await generateText({
        model: gateway("llama-3.3-70b-versatile"),
        prompt,
      });
      const jsonStr = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const first = jsonStr.indexOf("{");
      const last = jsonStr.lastIndexOf("}");
      parsed = Trades.parse(JSON.parse(jsonStr.slice(first, last + 1)));
    } catch (e) {
      parsed = {
        strategy: "Não identificada",
        trades: [],
        analysis: `Não foi possível interpretar o código automaticamente: ${e instanceof Error ? e.message : String(e)}`,
        warnings: [],
      };
    }

    // Compute equity from alternating buy/sell trades
    let cash = 10000;
    let position = 0;
    let entryPrice = 0;
    let wins = 0;
    let losses = 0;
    const executed: Array<{ i: number; side: "buy" | "sell"; price: number; pnl?: number }> = [];
    const equity: number[] = [];
    let lastEquity = cash;

    for (let i = 0; i < candles.length; i++) {
      const trade = parsed.trades.find((t) => t.i === i);
      const price = candles[i].c;
      if (trade) {
        if (trade.side === "buy" && position === 0) {
          position = cash / price;
          entryPrice = price;
          cash = 0;
          executed.push({ i, side: "buy", price });
        } else if (trade.side === "sell" && position > 0) {
          cash = position * price;
          const pnl = (price - entryPrice) * position;
          if (pnl >= 0) wins++;
          else losses++;
          executed.push({ i, side: "sell", price, pnl });
          position = 0;
        }
      }
      lastEquity = cash + position * price;
      equity.push(lastEquity);
    }
    if (position > 0) {
      const price = candles[candles.length - 1].c;
      cash = position * price;
      position = 0;
    }

    const finalEquity = cash;
    const returnPct = ((finalEquity - 10000) / 10000) * 100;
    const buyHold = ((candles[candles.length - 1].c - candles[0].c) / candles[0].c) * 100;
    const total = wins + losses;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    let maxDd = 0;
    let peak = equity[0] ?? 10000;
    for (const v of equity) {
      if (v > peak) peak = v;
      const dd = ((peak - v) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }

    return {
      strategy: parsed.strategy,
      analysis: parsed.analysis,
      warnings: parsed.warnings,
      candles,
      equity,
      trades: executed,
      metrics: {
        initial: 10000,
        finalEquity,
        returnPct,
        buyHoldPct: buyHold,
        wins,
        losses,
        winRate,
        maxDrawdownPct: maxDd,
        tradesCount: executed.length,
      },
    };
  });
