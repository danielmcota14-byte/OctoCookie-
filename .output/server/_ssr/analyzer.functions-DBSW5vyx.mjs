import { St as string, bt as object } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { i as withGroqModelFallback, t as createLovableAiGatewayProvider } from "./ai-gateway.server-DMankpH_.mjs";
import { i as generateText } from "../_libs/@ai-sdk/react+[...].mjs";
import { i as createServerFn } from "./server-D-FC9CRH.mjs";
import { t as createServerRpc } from "./createServerRpc-BeU67uED.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyzer.functions-DBSW5vyx.js
var Input = object({ coinId: string().min(1).max(60) });
var analyzeToken_createServerFn_handler = createServerRpc({
	id: "b12cdf313c9b2048d7f2c9e4297624ebbabbc2e5a8d067af878fa2673871856f",
	name: "analyzeToken",
	filename: "src/lib/analyzer.functions.ts"
}, (opts) => analyzeToken.__executeServer(opts));
var analyzeToken = createServerFn({ method: "POST" }).inputValidator((input) => Input.parse(input)).handler(analyzeToken_createServerFn_handler, async ({ data }) => {
	const id = data.coinId.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
	if (!id) return {
		error: "ID inválido",
		coin: null,
		sparkline: [],
		analysis: ""
	};
	const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
	let raw;
	try {
		const res = await fetch(url, { headers: { accept: "application/json" } });
		if (!res.ok) return {
			error: res.status === 404 ? "Moeda não encontrada. Use o id do CoinGecko (ex.: bitcoin, ethereum, solana)." : `Falha na API (${res.status})`,
			coin: null,
			sparkline: [],
			analysis: ""
		};
		raw = await res.json();
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "Erro de rede",
			coin: null,
			sparkline: [],
			analysis: ""
		};
	}
	const coin = {
		id: raw.id,
		symbol: raw.symbol.toUpperCase(),
		name: raw.name,
		image: raw.image?.small ?? "",
		rank: raw.market_cap_rank,
		price: raw.market_data.current_price.usd,
		marketCap: raw.market_data.market_cap.usd,
		volume24h: raw.market_data.total_volume.usd,
		change24h: raw.market_data.price_change_percentage_24h,
		change7d: raw.market_data.price_change_percentage_7d,
		change30d: raw.market_data.price_change_percentage_30d,
		ath: raw.market_data.ath.usd,
		atl: raw.market_data.atl.usd,
		supply: raw.market_data.circulating_supply
	};
	const sparkline = raw.market_data.sparkline_7d?.price ?? [];
	const descRaw = (raw.description.en || "").replace(/<[^>]+>/g, "").slice(0, 1200);
	let analysis = "";
	try {
		analysis = await withGroqModelFallback(async (key, modelId) => {
			const gateway = createLovableAiGatewayProvider(key);
			const { text } = await generateText({
				model: gateway(modelId),
				prompt: `Você é o OctoCookie, analista educacional. Explique em português BR de forma didática e neutra o token abaixo em 3 parágrafos curtos:
1) O que é o projeto (com base na descrição).
2) O que os números atuais dizem (preço, market cap, variações 24h/7d/30d, volume, distância do ATH).
3) Riscos e conceitos que a pessoa deveria estudar antes de operar.

NUNCA dê recomendação de compra ou venda. Sempre reforce que é educacional.

TOKEN: ${coin.name} (${coin.symbol})
DESCRIÇÃO: ${descRaw}
DADOS: preço $${coin.price}, market cap $${coin.marketCap}, vol 24h $${coin.volume24h}, 24h ${coin.change24h?.toFixed(2)}%, 7d ${coin.change7d?.toFixed(2)}%, 30d ${coin.change30d?.toFixed(2)}%, ATH $${coin.ath}, ATL $${coin.atl}, supply ${coin.supply}`
			});
			return text.trim();
		});
	} catch {}
	return {
		error: null,
		coin,
		sparkline,
		analysis
	};
});
//#endregion
export { analyzeToken_createServerFn_handler };
