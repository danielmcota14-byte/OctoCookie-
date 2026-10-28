import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { n as Input, t as Button } from "./input-B8wkzuVc.mjs";
import { g as Server, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-D38O-nZB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bot-24x7-C9kJ7c3C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CARD_KEY = "octocookie.247.v2";
function envBotUrl() {
	try {
		return "/bot".trim().replace(/\/+$/, "");
	} catch {
		return "";
	}
}
function savedUrl() {
	try {
		const c = JSON.parse(localStorage.getItem(CARD_KEY) || "{}");
		if (typeof c.url === "string" && c.url.trim()) return c.url.trim().replace(/\/+$/, "");
	} catch {}
	return envBotUrl();
}
function Bot24Page() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [url, setUrl] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setThreads(loadThreads());
		setUrl(savedUrl());
	}, []);
	const base = url.trim().replace(/\/+$/, "");
	const refresh = (0, import_react.useCallback)(async () => {
		if (!base) {
			setError("Informe a URL do seu servidor 24/7 (ou defina VITE_BOT_24X7_URL no deploy).");
			return;
		}
		if (!/^https:\/\/[^\s/]+/i.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/bot)?$/i.test(base) && !/^\/bot$/.test(base)) {
			setError("URL inválida. Use a URL do serviço bot-server (ex.: https://seu-bot.onrender.com), não a rota /octo-app do site.");
			setStatus(null);
			return;
		}
		if (/\/octo-app\/?$/i.test(base) || /\/bot-24x7\/?$/i.test(base)) {
			setError("Essa URL é do site React, não do bot-server. Deploy o bot-server à parte e use a URL dele (sem /octo-app).");
			setStatus(null);
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${base}/status`);
			if (!res.ok) {
				if (res.status === 404) throw new Error("HTTP 404 — endpoint /status não existe nessa URL. Confira se é o serviço bot-server (não o site principal).");
				throw new Error(`HTTP ${res.status}`);
			}
			setStatus(await res.json());
		} catch (e) {
			setStatus(null);
			setError(e instanceof Error ? e.message + " — confira a URL e se o serviço está de pé (plano free dorme)." : "Falha ao conectar");
		} finally {
			setLoading(false);
		}
	}, [base]);
	(0, import_react.useEffect)(() => {
		if (!base) return;
		refresh();
		const id = setInterval(refresh, 3e4);
		return () => clearInterval(id);
	}, [base, refresh]);
	const label = status?.running ? "● RODANDO 24/7" : status?.armed ? "◐ ARMADO (aguardando a página iniciar)" : status ? "🔒 TRANCADO / PARADO" : "○ Sem resposta";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex flex-1 flex-col overflow-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-b py-3 pl-14 pr-4 md:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-sm font-medium",
						children: "Bot 24/7 (servidor)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/octo-app",
					className: "text-xs text-muted-foreground hover:text-foreground",
					children: "Bot Trading →"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 rounded-lg border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Aqui você só acompanha o status. Para parear a carteira, ligar e parar o bot, use o card",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "“Bot 24/7 no servidor”" }),
								" em ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/octo-app",
									className: "underline",
									children: "Bot Trading"
								}),
								": a chave viaja por Diffie-Hellman + AES-256 e a chave K que abre a carteira volta para você."
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: url,
								onChange: (e) => setUrl(e.target.value),
								placeholder: "https://seu-bot.onrender.com"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: refresh,
								disabled: loading || !base,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1 h-3.5 w-3.5" }), "Atualizar"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 1 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 rounded-lg border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-sm font-semibold ${status?.running ? "text-green-500" : "text-muted-foreground"}`,
								children: label
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-destructive",
								children: error
							}),
							status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Par"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: status.symbol ?? "—" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Preço"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: status.price ? `$${status.price.toFixed(2)}` : "—" })] }),
									status.lastError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "col-span-2 text-xs text-destructive",
										children: ["Último erro: ", status.lastError]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 2 })
				]
			})]
		})]
	});
}
//#endregion
export { Bot24Page as component };
