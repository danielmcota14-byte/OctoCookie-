import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes.functions-BFJosF7W.js
var TICKER_SYMBOLS = [
	{
		symbol: "AAPL",
		name: "Apple"
	},
	{
		symbol: "MSFT",
		name: "Microsoft"
	},
	{
		symbol: "NVDA",
		name: "NVIDIA"
	},
	{
		symbol: "TSLA",
		name: "Tesla"
	},
	{
		symbol: "AMZN",
		name: "Amazon"
	},
	{
		symbol: "GOOGL",
		name: "Alphabet"
	},
	{
		symbol: "META",
		name: "Meta"
	},
	{
		symbol: "BRK-B",
		name: "Berkshire"
	},
	{
		symbol: "JPM",
		name: "JPMorgan"
	},
	{
		symbol: "V",
		name: "Visa"
	}
];
async function fetchQuote(symbol) {
	for (const host of ["query1", "query2"]) try {
		const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1h`;
		const res = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0",
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) continue;
		const r = (await res.json())?.chart?.result?.[0];
		if (!r) continue;
		const closes = (r.indicators?.quote?.[0]?.close ?? []).filter((n) => typeof n === "number" && !Number.isNaN(n));
		const price = r.meta?.regularMarketPrice ?? closes[closes.length - 1];
		const prev = r.meta?.chartPreviousClose ?? closes[0] ?? price;
		if (!price) continue;
		return {
			price,
			changePercent: prev ? (price - prev) / prev * 100 : 0,
			sparkline: closes.slice(-24)
		};
	} catch {}
	return null;
}
/** Cotações reais (Yahoo Finance) para a barra de ações. Sem dados inventados: o que falhar é omitido. */
var getTickerQuotes_createServerFn_handler = createServerRpc({
	id: "5647a098ba84483fdd6b5e9fcc14f659a477bb5936b229ac3dfa6797edcefd5c",
	name: "getTickerQuotes",
	filename: "src/lib/quotes.functions.ts"
}, (opts) => getTickerQuotes.__executeServer(opts));
var getTickerQuotes = createServerFn({ method: "GET" }).handler(getTickerQuotes_createServerFn_handler, async () => {
	return (await Promise.all(TICKER_SYMBOLS.map(async (s) => {
		const q = await fetchQuote(s.symbol);
		return q ? {
			symbol: s.symbol.replace("-", "."),
			name: s.name,
			...q
		} : null;
	}))).filter((x) => x !== null);
});
//#endregion
export { getTickerQuotes_createServerFn_handler };
