import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-CU9uhT0m.mjs";
import { a as TriangleAlert, k as FileCode, x as Play } from "../_libs/lucide-react.mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-D38O-nZB.mjs";
import { gt as object, vt as string } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ide-BLuM-7_0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var IdeInput = object({ code: string().min(1).max(1e4) });
var runCookieScript = createServerFn({ method: "POST" }).inputValidator((input) => IdeInput.parse(input)).handler(createSsrRpc("4fe6f280827bf27395d362e2a785ba12620a002ac8ab2af3dc4336f6714365ff"));
var DEFAULT_CODE = `// CookieScript — exemplo educacional
mensagem = string.maiusculo("cookiescript")
tamanho = string.comprimento(mensagem)

hash = crypto.hash_sha256(dados=mensagem)

if tamanho > 5 {
    filesystem.escrever_arquivo(caminho="saida.txt", conteudo=mensagem)
} else {
    filesystem.escrever_arquivo(caminho="saida.txt", conteudo="curto")
}`;
var MODULES = [
	{
		name: "filesystem",
		fns: ["escrever_arquivo", "ler_arquivo"]
	},
	{
		name: "network",
		fns: ["http_request"]
	},
	{
		name: "crypto",
		fns: ["hash_sha256"]
	},
	{
		name: "math",
		fns: [
			"seno",
			"potencia",
			"numero_aleatorio",
			"multiplicar"
		]
	},
	{
		name: "time",
		fns: ["timestamp_atual", "data_hora_atual"]
	},
	{
		name: "string",
		fns: [
			"maiusculo",
			"comprimento",
			"converter_para_string"
		]
	},
	{
		name: "encoding",
		fns: ["base64_encode", "base64_decode"]
	},
	{
		name: "json",
		fns: ["stringify_json"]
	}
];
function IdePage() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [code, setCode] = (0, import_react.useState)(DEFAULT_CODE);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const run = useServerFn(runCookieScript);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	async function handleRun() {
		setRunning(true);
		try {
			setResult(await run({ data: { code } }));
		} finally {
			setRunning(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-6 pb-10 pt-16 md:pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold",
							children: "CookieScript IDE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Escreva scripts em CookieScript e rode em sandbox educacional. A execução é simulada — nenhum arquivo real é criado nem requisição real é feita."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleRun,
							disabled: running,
							className: "inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), running ? "Executando..." : "Executar"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mb-6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-4 lg:grid-cols-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lg:col-span-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: code,
								onChange: (e) => setCode(e.target.value),
								spellCheck: false,
								className: "h-[440px] w-full rounded-lg border bg-muted/40 p-3 font-mono text-xs outline-none focus:border-ring"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "rounded-lg border p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Módulos"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2",
								children: MODULES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xs font-semibold",
									children: m.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: m.fns.join(", ")
								})] }, m.name))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 2,
						className: "mt-6"
					}),
					result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-4",
						children: [
							result.errors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "whitespace-pre-wrap",
									children: result.errors.join("\n")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Saída"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "max-h-64 overflow-auto rounded-lg border bg-background p-3 font-mono text-xs",
								children: result.output || "(vazio)"
							})] }),
							Object.keys(result.variables).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Variáveis"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
									className: "w-full text-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: Object.entries(result.variables).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b last:border-b-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "w-1/3 border-r bg-muted/30 px-3 py-1.5 font-mono text-xs",
											children: k
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-1.5 font-mono text-xs",
											children: v
										})]
									}, k)) })
								})
							})] }),
							result.files.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Arquivos simulados"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: result.files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono",
											children: f.path
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
										className: "max-h-40 overflow-auto p-3 font-mono text-xs",
										children: f.preview
									})]
								}, f.path))
							})] }),
							result.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Explicação"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed",
								children: result.explanation
							})] })
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { IdePage as component };
