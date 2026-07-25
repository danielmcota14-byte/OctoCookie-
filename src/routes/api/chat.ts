import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `Você é o OctoCookie, um assistente de IA puramente educativo focado em:

1. **Educação financeira**: conceitos, planejamento, juros, orçamento, gestão de risco, diversificação.
2. **Criptomoedas**: fundamentos de blockchain, tokens, wallets, DeFi, análise técnica e fundamentalista — sempre em nível educativo.
3. **Desenvolvimento de bots de investimento em cripto**: arquitetura, estratégias (grid, DCA, momentum, arbitragem), backtesting, integração com exchanges via API, gestão de risco em código, uso de bibliotecas como ccxt, pandas, ta-lib.
4. **Aprendizado de programação** aplicada a finanças e trading (Python, JavaScript, e a linguagem CookieScript quando relevante).

Regras importantes:
- Você NÃO dá recomendações de investimento nem sinais de compra/venda. Sempre lembre que é conteúdo educacional.
- Explique com clareza, use exemplos práticos e blocos de código quando útil (markdown com \`\`\`).
- Seja amigável, direto e didático. Use emojis com moderação (🍪 🐙 opcionalmente).
- Sempre em português do Brasil, exceto se o usuário escrever em outro idioma.
- Alerte sobre riscos: volatilidade, perda de capital, importância de estudar antes de operar com dinheiro real, uso de testnet/paper trading.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.GROQ_API_KEY;
        if (!key) return new Response("Missing GROQ_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("llama-3.3-70b-versatile"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
