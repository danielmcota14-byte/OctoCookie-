import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { B as BookOpen, D as Landmark, R as ChartLine, f as Sprout, z as Bot } from "../_libs/lucide-react.mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-D38O-nZB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/launch-DXnsLcYQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var topics = [
	{
		icon: BookOpen,
		title: "Educação financeira",
		desc: "Orçamento, juros compostos, gestão de risco e planejamento.",
		to: "/finance"
	},
	{
		icon: Sprout,
		title: "Empreendedorismo digital",
		desc: "Primeiros passos, modelos de negócio, validação de ideias e no-code.",
		to: "/start"
	},
	{
		icon: Landmark,
		title: "Fundamentos de ações",
		desc: "Bolsa, tickers, tipos de ordem, dividendos e análise — sem hype."
	},
	{
		icon: ChartLine,
		title: "Análise & indicadores",
		desc: "RSI, MACD, médias, Bollinger, backtest e leitura do Holograma."
	},
	{
		icon: Bot,
		title: "Trader de Ações & Holograma",
		desc: "Bot de ações, regra de tendência, stop móvel, carteira virtual e modos de operação.",
		to: "/octo-app"
	}
];
function Launch() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-6 pb-12 pt-16 md:pt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold",
						children: "Explorar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Trilhas de aprendizado. Escolha um tema e comece uma conversa com o OctoCookie."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mt-6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2",
						children: topics.map((t) => {
							const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "h-4 w-4" }),
									" ",
									t.title
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: t.desc
							})] });
							const cls = "rounded-xl border p-5 hover:bg-muted/50";
							return t.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: t.to,
								className: cls,
								children: body
							}, t.title) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cls,
								children: body
							}, t.title);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 2,
						className: "mt-8"
					})
				]
			})
		})]
	});
}
//#endregion
export { Launch as component };
