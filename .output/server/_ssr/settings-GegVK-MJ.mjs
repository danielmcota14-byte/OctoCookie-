import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { o as saveThreads, r as loadThreads, t as AppSidebar } from "./app-sidebar-D38O-nZB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-GegVK-MJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	function clearAll() {
		if (!confirm("Apagar todo o histórico de chats?")) return;
		saveThreads([]);
		setThreads([]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-6 pb-12 pt-16 md:pt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: "Configurações"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-xl border p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium",
								children: "Sobre o OctoCookie"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "O OctoCookie é uma plataforma educacional: chat com IA, Swap Trader Bot (Holograma Quântico em modo tendência por padrão, trader clássico opcional) e ferramentas de estudo em ações e finanças. Não oferecemos recomendações de investimento nem sinais de compra/venda. As chaves da IA (GROQ_API_KEYS, até 5) ficam só no servidor (variáveis de ambiente do Vercel) — nunca no navegador. Se uma esgota o limite, o app troca para a próxima automaticamente."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 1 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-xl border p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium",
									children: "Histórico"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "Suas conversas ficam salvas apenas neste navegador (localStorage)."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: clearAll,
									className: "mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-muted",
									children: "Apagar todo o histórico"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 2 })
					]
				})]
			})
		})]
	});
}
//#endregion
export { SettingsPage as component };
