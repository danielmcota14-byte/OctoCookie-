import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import {
  createLovableAiGatewayProvider,
  getGroqKeys,
  resetGroqKeyPool,
  withGroqModelFallback,
} from "@/lib/ai-gateway.server";

/**
 * Chat dos módulos Finance e Start (substitui a antiga Netlify Function
 * `chat.js`). Usa o MESMO rodízio de chaves/modelos do resto do sistema e o
 * prompt é escolhido aqui no servidor — o navegador só diz qual módulo é.
 */
const EDU_SYSTEM: Record<string, string> = {
  finance:
    "Você é o assistente do OctoCookie Finance. Ajude com educação financeira de forma clara e acessível. Nunca prometa ganhos fáceis. Não dê recomendação de investimento personalizada nem sinais de compra/venda. Fale em português do Brasil. Reforce autonomia e decisões conscientes.",
  start:
    "Você é o assistente do OctoCookie Start. Ajude com empreendedorismo digital de forma prática e realista. Não prometa sucesso fácil. Fale em português do Brasil. Reforce autonomia e experimentação.",
};

const MAX_MESSAGES = 16;
const MAX_CHARS = 4000;

type Msg = { role: "user" | "assistant"; content: string };

function cleanMessages(input: unknown): Msg[] | null {
  if (!Array.isArray(input)) return null;
  const out: Msg[] = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    out.push({ role, content: content.slice(0, MAX_CHARS) });
  }
  return out.length > 0 && out[out.length - 1].role === "user" ? out : null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/edu-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { module?: unknown; messages?: unknown };
          const system = typeof body.module === "string" ? EDU_SYSTEM[body.module] : undefined;
          if (!system) return json({ error: "Módulo inválido." }, 400);

          const messages = cleanMessages(body.messages);
          if (!messages) return json({ error: "Mensagens inválidas." }, 400);

          resetGroqKeyPool();
          if (getGroqKeys().length === 0) {
            return json(
              {
                error:
                  "GROQ_API_KEYS não configurada no servidor. Defina GROQ_API_KEYS=chave1,chave2 nas variáveis de ambiente e faça redeploy.",
              },
              500,
            );
          }

          const result = await withGroqModelFallback((apiKey, modelId) =>
            generateText({
              model: createLovableAiGatewayProvider(apiKey)(modelId),
              system,
              messages,
              temperature: 0.7,
              maxOutputTokens: 1200,
              maxRetries: 0,
            }),
          );

          return json({ reply: result.text || "Sem resposta." });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[/api/edu-chat]", msg);
          return json({ error: `Não foi possível obter resposta da IA: ${msg.slice(0, 200)}` }, 502);
        }
      },
    },
  },
});
