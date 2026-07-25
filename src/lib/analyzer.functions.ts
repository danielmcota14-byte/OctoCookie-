import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({ coinId: z.string().min(1).max(60) });

export const analyzeToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const id = data.coinId.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (!id) return { error: "ID inválido" as string, coin: null, sparkline: [], analysis: "" };

    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
    let raw: {
      id: string;
      symbol: string;
      name: string;
      image: { small: string };
      market_cap_rank: number | null;
      description: { en: string };
      market_data: {
        current_price: { usd: number };
        market_cap: { usd: number };
        total_volume: { usd: number };
        price_change_percentage_24h: number;
        price_change_percentage_7d: number;
        price_change_percentage_30d: number;
        ath: { usd: number };
        atl: { usd: number };
        circulating_supply: number;
        sparkline_7d?: { price: number[] };
      };
    };
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) {
        return { error: res.status === 404 ? "Moeda não encontrada. Use o id do CoinGecko (ex.: bitcoin, ethereum, solana)." : `Falha na API (${res.status})`, coin: null, sparkline: [], analysis: "" };
      }
      raw = await res.json();
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erro de rede", coin: null, sparkline: [], analysis: "" };
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
      supply: raw.market_data.circulating_supply,
    };
    const sparkline = raw.market_data.sparkline_7d?.price ?? [];
    const descRaw = (raw.description.en || "").replace(/<[^>]+>/g, "").slice(0, 1200);

    let analysis = "";
    try {
      const key = process.env.GROQ_API_KEY;
      if (key) {
        const gateway = createLovableAiGatewayProvider(key);
        const { text } = await generateText({
          model: gateway("llama-3.3-70b-versatile"),
          prompt: `Você é o OctoCookie, analista educacional. Explique em português BR de forma didática e neutra o token abaixo em 3 parágrafos curtos:
1) O que é o projeto (com base na descrição).
2) O que os números atuais dizem (preço, market cap, variações 24h/7d/30d, volume, distância do ATH).
3) Riscos e conceitos que a pessoa deveria estudar antes de operar.

NUNCA dê recomendação de compra ou venda. Sempre reforce que é educacional.

TOKEN: ${coin.name} (${coin.symbol})
DESCRIÇÃO: ${descRaw}
DADOS: preço $${coin.price}, market cap $${coin.marketCap}, vol 24h $${coin.volume24h}, 24h ${coin.change24h?.toFixed(2)}%, 7d ${coin.change7d?.toFixed(2)}%, 30d ${coin.change30d?.toFixed(2)}%, ATH $${coin.ath}, ATL $${coin.atl}, supply ${coin.supply}`,
        });
        analysis = text.trim();
      }
    } catch {
      /* ignore analysis errors */
    }

    return { error: null as string | null, coin, sparkline, analysis };
  });
