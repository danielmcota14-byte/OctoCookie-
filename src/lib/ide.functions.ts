import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const IdeInput = z.object({
  code: z.string().min(1).max(10000),
});

const IdeSchema = z.object({
  output: z.string(),
  variables: z.record(z.string(), z.string()).default({}),
  files: z.array(z.object({ path: z.string(), preview: z.string() })).default([]),
  errors: z.array(z.string()).default([]),
  explanation: z.string(),
});

export const runCookieScript = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdeInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("Missing GROQ_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `Você é o interpretador educacional do CookieScript, uma linguagem didática em português com módulos como:
- filesystem.escrever_arquivo(caminho, conteudo, modo?)
- network.http_request(url, metodo)
- crypto.hash_sha256(dados)
- math.seno / math.potencia(base,expoente) / math.numero_aleatorio(minimo,maximo) / math.multiplicar
- time.timestamp_atual / time.data_hora_atual
- string.maiusculo / string.comprimento / string.converter_para_string
- encoding.base64_encode / base64_decode
- json.stringify_json
- antidebug.verificar_debugger / verificar_vm / verificar_sandbox
- controle: if/else com chaves, function nome(params) { ... }, atribuição com =

Simule a execução do código abaixo passo a passo em ambiente sandbox seguro. Nenhum efeito colateral real.

CÓDIGO:
\`\`\`
${data.code}
\`\`\`

Responda APENAS com JSON válido no formato:
{"output":"stdout linha a linha","variables":{"nome":"valor",...},"files":[{"path":"arquivo.txt","preview":"conteúdo simulado (até 400 chars)"}],"errors":["mensagem de erro se houver"],"explanation":"explicação didática curta em pt-BR do que o código faz e possíveis melhorias"}`;

    try {
      const { text } = await generateText({
        model: gateway("llama-3.3-70b-versatile"),
        prompt,
      });
      const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const first = clean.indexOf("{");
      const last = clean.lastIndexOf("}");
      return IdeSchema.parse(JSON.parse(clean.slice(first, last + 1)));
    } catch (e) {
      return {
        output: "",
        variables: {},
        files: [],
        errors: [`Erro ao interpretar: ${e instanceof Error ? e.message : String(e)}`],
        explanation: "",
      };
    }
  });
