import { St as string, bt as object, dt as array, st as _enum, yt as number } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { i as withGroqModelFallback, t as createLovableAiGatewayProvider } from "./ai-gateway.server-DMankpH_.mjs";
import { i as generateText } from "../_libs/@ai-sdk/react+[...].mjs";
import { i as createServerFn } from "./server-B1PUhjWO.mjs";
import { t as createServerRpc } from "./createServerRpc-C2Brm-qK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/simulator.functions-B2QgCJvg.js
var Input = object({
	code: string().min(1).max(2e4),
	symbol: string().default("BTC/USDT"),
	timeframe: string().default("1h"),
	bars: number().int().min(50).max(500).default(200),
	seed: number().int().optional()
});
function rng(seed) {
	let s = seed >>> 0;
	return () => {
		s = s * 1664525 + 1013904223 >>> 0;
		return s / 4294967295;
	};
}
function synth(bars, seed) {
	const r = rng(seed);
	const out = [];
	let price = 3e4;
	const now = Date.now();
	for (let i = 0; i < bars; i++) {
		const drift = (r() - .5) * .015;
		const o = price;
		const c = Math.max(1, o * (1 + drift));
		const h = Math.max(o, c) * (1 + r() * .005);
		const l = Math.min(o, c) * (1 - r() * .005);
		out.push({
			t: now - (bars - i) * 36e5,
			o,
			h,
			l,
			c,
			v: 100 + r() * 900
		});
		price = c;
	}
	return out;
}
var Trades = object({
	trades: array(object({
		i: number().int().min(0),
		side: _enum(["buy", "sell"])
	})),
	analysis: string(),
	warnings: array(string()).default([]),
	strategy: string()
});
var runSimulation_createServerFn_handler = createServerRpc({
	id: "c410a89faf47dce2359d3b533a29460077c1136727f015c0b372194d32b658e1",
	name: "runSimulation",
	filename: "src/lib/simulator.functions.ts"
}, (opts) => runSimulation.__executeServer(opts));
var runSimulation = createServerFn({ method: "POST" }).inputValidator((input) => Input.parse(input)).handler(runSimulation_createServerFn_handler, async ({ data }) => {
	const seed = data.seed ?? Math.floor(Math.random() * 1e9);
	const candles = synth(data.bars, seed);
	const closes = candles.map((c) => c.c.toFixed(2)).join(",");
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
	let parsed;
	try {
		const jsonStr = (await withGroqModelFallback(async (key, modelId) => {
			const gateway = createLovableAiGatewayProvider(key);
			return (await generateText({
				model: gateway(modelId),
				prompt
			})).text;
		})).replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
		const first = jsonStr.indexOf("{");
		const last = jsonStr.lastIndexOf("}");
		parsed = Trades.parse(JSON.parse(jsonStr.slice(first, last + 1)));
	} catch (e) {
		parsed = {
			strategy: "Não identificada",
			trades: [],
			analysis: `Não foi possível interpretar o código automaticamente: ${e instanceof Error ? e.message : String(e)}`,
			warnings: []
		};
	}
	let cash = 1e4;
	let position = 0;
	let entryPrice = 0;
	let wins = 0;
	let losses = 0;
	const executed = [];
	const equity = [];
	let lastEquity = cash;
	for (let i = 0; i < candles.length; i++) {
		const trade = parsed.trades.find((t) => t.i === i);
		const price = candles[i].c;
		if (trade) {
			if (trade.side === "buy" && position === 0) {
				position = cash / price;
				entryPrice = price;
				cash = 0;
				executed.push({
					i,
					side: "buy",
					price
				});
			} else if (trade.side === "sell" && position > 0) {
				cash = position * price;
				const pnl = (price - entryPrice) * position;
				if (pnl >= 0) wins++;
				else losses++;
				executed.push({
					i,
					side: "sell",
					price,
					pnl
				});
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
	const returnPct = (finalEquity - 1e4) / 1e4 * 100;
	const buyHold = (candles[candles.length - 1].c - candles[0].c) / candles[0].c * 100;
	const total = wins + losses;
	const winRate = total > 0 ? wins / total * 100 : 0;
	let maxDd = 0;
	let peak = equity[0] ?? 1e4;
	for (const v of equity) {
		if (v > peak) peak = v;
		const dd = (peak - v) / peak * 100;
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
			initial: 1e4,
			finalEquity,
			returnPct,
			buyHoldPct: buyHold,
			wins,
			losses,
			winRate,
			maxDrawdownPct: maxDd,
			tradesCount: executed.length
		}
	};
});
//#endregion
export { runSimulation_createServerFn_handler };
