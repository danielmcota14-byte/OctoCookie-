import { Ct as union, St as string, bt as object, dt as array, ut as any, xt as record, yt as number } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { i as withGroqModelFallback, t as createLovableAiGatewayProvider } from "./ai-gateway.server-DMankpH_.mjs";
import { i as generateText } from "../_libs/@ai-sdk/react+[...].mjs";
import { i as createServerFn } from "./server-B1PUhjWO.mjs";
import { t as createServerRpc } from "./createServerRpc-C2Brm-qK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ide.functions-Drjd-WfE.js
var IdeInput = object({ code: string().min(1).max(1e4) });
var IdeSchema = object({
	output: union([string(), array(union([string(), number()]))]).transform((v) => Array.isArray(v) ? v.join("\n") : v),
	variables: record(string(), any()).default({}).transform((obj) => {
		const out = {};
		for (const [k, v] of Object.entries(obj)) out[k] = typeof v === "string" ? v : JSON.stringify(v);
		return out;
	}),
	files: array(object({
		path: string(),
		preview: union([string(), number()]).transform(String)
	})).default([]),
	errors: array(union([string(), number()]).transform(String)).default([]),
	explanation: string().default("")
});
var runCookieScript_createServerFn_handler = createServerRpc({
	id: "4fe6f280827bf27395d362e2a785ba12620a002ac8ab2af3dc4336f6714365ff",
	name: "runCookieScript",
	filename: "src/lib/ide.functions.ts"
}, (opts) => runCookieScript.__executeServer(opts));
var runCookieScript = createServerFn({ method: "POST" }).inputValidator((input) => IdeInput.parse(input)).handler(runCookieScript_createServerFn_handler, async ({ data }) => {
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
{"output":"stdout linha a linha","variables":{"nome":"valor sempre como string, mesmo números (ex: \\"12\\" e não 12)",...},"files":[{"path":"arquivo.txt","preview":"conteúdo simulado (até 400 chars)"}],"errors":["mensagem de erro se houver"],"explanation":"explicação didática curta em pt-BR do que o código faz e possíveis melhorias"}

IMPORTANTE: todo valor dentro de "variables" deve ser sempre uma string entre aspas no JSON, mesmo quando o valor real é um número, booleano ou objeto.`;
	try {
		const clean = (await withGroqModelFallback(async (key, modelId) => {
			const gateway = createLovableAiGatewayProvider(key);
			return (await generateText({
				model: gateway(modelId),
				prompt
			})).text;
		})).replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
		const first = clean.indexOf("{");
		const last = clean.lastIndexOf("}");
		return IdeSchema.parse(JSON.parse(clean.slice(first, last + 1)));
	} catch (e) {
		return {
			output: "",
			variables: {},
			files: [],
			errors: [`Erro ao interpretar: ${e instanceof Error ? e.message : String(e)}`],
			explanation: ""
		};
	}
});
//#endregion
export { runCookieScript_createServerFn_handler };
