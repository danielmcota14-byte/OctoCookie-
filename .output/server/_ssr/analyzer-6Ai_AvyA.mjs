import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-CU9uhT0m.mjs";
import { _ as Search, a as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-D38O-nZB.mjs";
import { gt as object, vt as string } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyzer-6Ai_AvyA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = object({ coinId: string().min(1).max(60) });
var analyzeToken = createServerFn({ method: "POST" }).inputValidator((input) => Input.parse(input)).handler(createSsrRpc("b12cdf313c9b2048d7f2c9e4297624ebbabbc2e5a8d067af878fa2673871856f"));
var SUGGESTIONS = [
	"AAPL",
	"MSFT",
	"NVDA",
	"TSLA",
	"PETR4",
	"VALE3"
];
function AnalyzerPage() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [ticker, setTicker] = (0, import_react.useState)("AAPL");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const analyze = useServerFn(analyzeToken);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	async function handleAnalyze(id) {
		const target = (id ?? ticker).trim();
		if (!target) return;
		setTicker(target);
		setLoading(true);
		try {
			setResult(await analyze({ data: { coinId: target } }));
		} finally {
			setLoading(false);
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
				className: "mx-auto max-w-4xl px-6 pb-10 pt-16 md:pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold",
							children: "Analisador de Ações"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Consulta dados de mercado e gera uma análise didática de ações. Conteúdo puramente educacional — sem recomendação de investimento."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mb-6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							handleAnalyze();
						},
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: ticker,
								onChange: (e) => setTicker(e.target.value),
								placeholder: "ticker da ação (ex.: AAPL, NVDA, PETR4, VALE3)",
								className: "w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50",
							children: loading ? "Analisando..." : "Analisar"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => handleAnalyze(s),
							className: "rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted",
							children: s
						}, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 2,
						className: "mt-6"
					}),
					result?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-4 w-4" }), result.error]
					}),
					result?.coin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenReport, { data: result })
				]
			})
		})]
	});
}
function TokenReport({ data }) {
	const coin = data.coin;
	const spark = (0, import_react.useMemo)(() => buildSpark(data.sparkline), [data.sparkline]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [coin.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: coin.image,
					alt: "",
					width: 32,
					height: 32,
					className: "h-8 w-8"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-lg font-semibold",
					children: [
						coin.name,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								"(",
								coin.symbol,
								")"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						"Ticker: ",
						coin.symbol ?? coin.id,
						" · Moeda: ",
						coin.currency
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Preço",
						value: fmt$(coin.price, coin.currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Volume (dia)",
						value: fmtCompact(coin.volume24h)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Máx. 52 sem.",
						value: fmt$(coin.high52, coin.currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Mín. 52 sem.",
						value: fmt$(coin.low52, coin.currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Dia",
						value: `${coin.change24h?.toFixed(2)}%`,
						positive: coin.change24h >= 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "7 dias",
						value: `${coin.change7d?.toFixed(2)}%`,
						positive: coin.change7d >= 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "30 dias",
						value: `${coin.change30d?.toFixed(2)}%`,
						positive: coin.change30d >= 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Cap. de mercado",
						value: fmtCompact(coin.marketCap)
					})
				]
			}),
			spark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Preço · últimos 30 dias"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border bg-muted/30 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: `0 0 ${spark.w} ${spark.h}`,
					className: "h-40 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: spark.path,
						fill: "none",
						stroke: "currentColor",
						strokeWidth: 1.5,
						className: "text-foreground"
					})
				})
			})] }),
			data.analysis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Análise educacional"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed",
				children: data.analysis
			})] })
		]
	});
}
function Metric({ label, value, positive }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-1 text-base font-semibold", positive === true && "text-emerald-600", positive === false && "text-rose-600"),
			children: value
		})]
	});
}
function fmt$(v, currency = "USD") {
	if (v == null) return "—";
	return v.toLocaleString(currency === "BRL" ? "pt-BR" : "en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 2
	});
}
function fmtCompact(v) {
	if (v == null) return "—";
	return v.toLocaleString("en-US", {
		notation: "compact",
		maximumFractionDigits: 2
	});
}
function buildSpark(prices) {
	if (!prices || prices.length < 2) return null;
	const w = 800, h = 160, pad = 6;
	const min = Math.min(...prices);
	const max = Math.max(...prices);
	const x = (i) => pad + i / (prices.length - 1) * (w - pad * 2);
	const y = (v) => h - pad - (v - min) / (max - min || 1) * (h - pad * 2);
	return {
		w,
		h,
		path: prices.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
	};
}
//#endregion
export { AnalyzerPage as component };
