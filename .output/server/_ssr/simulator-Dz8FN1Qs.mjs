import { o as __toESM } from "../_runtime.mjs";
import { St as string, bt as object, yt as number } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { S as Play, a as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-DAhkwR9g.mjs";
import { i as createServerFn } from "./server-B1PUhjWO.mjs";
import { n as useServerFn, t as createSsrRpc } from "./createSsrRpc-Rxq2Bs-s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/simulator-Dz8FN1Qs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = object({
	code: string().min(1).max(2e4),
	symbol: string().default("BTC/USDT"),
	timeframe: string().default("1h"),
	bars: number().int().min(50).max(500).default(200),
	seed: number().int().optional()
});
var runSimulation = createServerFn({ method: "POST" }).inputValidator((input) => Input.parse(input)).handler(createSsrRpc("c410a89faf47dce2359d3b533a29460077c1136727f015c0b372194d32b658e1"));
var DEFAULT_CODE = `// Estratégia exemplo: cruzamento de médias móveis
// Compra quando MM(9) cruza acima de MM(21); vende no cruzamento oposto.
function sinal(candles, i) {
  if (i < 21) return null;
  const mm = (n) => {
    let s = 0;
    for (let k = i - n + 1; k <= i; k++) s += candles[k].c;
    return s / n;
  };
  const rapida = mm(9), lenta = mm(21);
  const rapidaAnt = (() => { let s = 0; for (let k = i - 9; k < i; k++) s += candles[k].c; return s / 9; })();
  const lentaAnt = (() => { let s = 0; for (let k = i - 21; k < i; k++) s += candles[k].c; return s / 21; })();
  if (rapidaAnt <= lentaAnt && rapida > lenta) return "buy";
  if (rapidaAnt >= lentaAnt && rapida < lenta) return "sell";
  return null;
}`;
function SimulatorPage() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [code, setCode] = (0, import_react.useState)(DEFAULT_CODE);
	const [symbol, setSymbol] = (0, import_react.useState)("BTC/USDT");
	const [timeframe, setTimeframe] = (0, import_react.useState)("1h");
	const [bars, setBars] = (0, import_react.useState)(200);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const run = useServerFn(runSimulation);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	async function handleRun() {
		setRunning(true);
		setError(null);
		try {
			const r = await run({ data: {
				code,
				symbol,
				timeframe,
				bars
			} });
			setResult(r);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Falha ao executar simulação");
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
				className: "mx-auto max-w-5xl px-6 pb-10 pt-16 md:pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold",
							children: "Simulador de bot de trading"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Cole seu código de estratégia (JS, Python, pseudocódigo ou CookieScript). Rodamos em dados sintéticos e devolvemos métricas e feedback educacional. Nenhuma ordem real é enviada."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mb-6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 gap-4 lg:grid-cols-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lg:col-span-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-medium text-muted-foreground",
								children: "Código"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: code,
								onChange: (e) => setCode(e.target.value),
								spellCheck: false,
								className: "h-[420px] w-full rounded-lg border bg-muted/40 p-3 font-mono text-xs outline-none focus:border-ring"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 lg:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1 block text-xs font-medium text-muted-foreground",
									children: "Par"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: symbol,
									onChange: (e) => setSymbol(e.target.value),
									className: "w-full rounded-md border bg-background px-3 py-2 text-sm"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs font-medium text-muted-foreground",
										children: "Timeframe"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: timeframe,
										onChange: (e) => setTimeframe(e.target.value),
										className: "w-full rounded-md border bg-background px-2 py-2 text-sm",
										children: [
											"5m",
											"15m",
											"1h",
											"4h",
											"1d"
										].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs font-medium text-muted-foreground",
										children: "Candles"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 50,
										max: 500,
										value: bars,
										onChange: (e) => setBars(Number(e.target.value) || 200),
										className: "w-full rounded-md border bg-background px-3 py-2 text-sm"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleRun,
									disabled: running,
									className: "mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), running ? "Simulando..." : "Rodar simulação"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Aviso: conteúdo puramente educacional. Sem recomendação de investimento."
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 2,
						className: "mt-6"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: error })]
					}),
					result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, { result })
				]
			})
		})]
	});
}
function Report({ result }) {
	const m = result.metrics;
	const chart = (0, import_react.useMemo)(() => buildChart(result), [result]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Estratégia detectada"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-sm",
				children: result.strategy
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Retorno",
						value: `${m.returnPct.toFixed(2)}%`,
						positive: m.returnPct >= 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Buy & hold",
						value: `${m.buyHoldPct.toFixed(2)}%`,
						positive: m.buyHoldPct >= 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Taxa de acerto",
						value: `${m.winRate.toFixed(0)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Drawdown máx.",
						value: `${m.maxDrawdownPct.toFixed(2)}%`,
						positive: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Trades",
						value: String(m.tradesCount)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Ganhos",
						value: String(m.wins),
						positive: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Perdas",
						value: String(m.losses),
						positive: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Equity final",
						value: `$${m.finalEquity.toFixed(0)}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Curva de preço e trades"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border bg-muted/30 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: `0 0 ${chart.width} ${chart.height}`,
					className: "h-56 w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: chart.pricePath,
							fill: "none",
							stroke: "currentColor",
							strokeWidth: 1,
							className: "text-muted-foreground/60"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: chart.equityPath,
							fill: "none",
							stroke: "currentColor",
							strokeWidth: 1.5,
							className: "text-foreground"
						}),
						chart.markers.map((mk, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: mk.x,
							cy: mk.y,
							r: 3,
							className: mk.side === "buy" ? "fill-emerald-500" : "fill-rose-500"
						}, idx))
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-4 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-2 rounded-full bg-emerald-500" }), " compra"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-2 rounded-full bg-rose-500" }), " venda"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-4 bg-foreground" }), " equity"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-4 bg-muted-foreground/60" }), " preço"]
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Feedback"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed",
				children: result.analysis
			})] }),
			result.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Alertas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm",
				children: result.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-4 w-4 text-amber-600" }), w]
				}, i))
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
			className: cn("mt-1 text-lg font-semibold", positive === true && "text-emerald-600", positive === false && "text-rose-600"),
			children: value
		})]
	});
}
function buildChart(r) {
	const width = 800;
	const height = 220;
	const pad = 8;
	const prices = r.candles.map((c) => c.c);
	const pMin = Math.min(...prices);
	const pMax = Math.max(...prices);
	const eMin = Math.min(...r.equity);
	const eMax = Math.max(...r.equity);
	const xOf = (i) => pad + i / (r.candles.length - 1) * 784;
	const yPrice = (v) => 212 - (v - pMin) / (pMax - pMin || 1) * 204;
	const yEq = (v) => 212 - (v - eMin) / (eMax - eMin || 1) * 204;
	return {
		width,
		height,
		pricePath: prices.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yPrice(v).toFixed(1)}`).join(" "),
		equityPath: r.equity.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yEq(v).toFixed(1)}`).join(" "),
		markers: r.trades.map((t) => ({
			x: xOf(t.i),
			y: yPrice(t.price),
			side: t.side
		}))
	};
}
//#endregion
export { SimulatorPage as component };
