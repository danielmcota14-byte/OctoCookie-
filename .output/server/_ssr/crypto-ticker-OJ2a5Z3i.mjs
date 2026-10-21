import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { o as TrendingUp, s as TrendingDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crypto-ticker-OJ2a5Z3i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COINS = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,avalanche-2,polkadot,chainlink";
function MiniSparkline({ data, positive }) {
	if (!data || data.length < 2) return null;
	const w = 64;
	const h = 24;
	const min = Math.min(...data);
	const range = Math.max(...data) - min || 1;
	const points = data.map((v, i) => {
		return `${i / (data.length - 1) * w},${h - (v - min) / range * 20 - 2}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: w,
		height: h,
		className: "shrink-0 opacity-90",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: positive ? "#22c55e" : "#ef4444",
			strokeWidth: "1.5",
			points
		})
	});
}
function formatPrice(n) {
	if (n >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
	if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
	return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}
function CryptoTicker() {
	const [coins, setCoins] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(false);
	const trackRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function fetchPrices() {
			try {
				const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`);
				if (!res.ok) throw new Error("API error");
				const data = await res.json();
				if (!cancelled) {
					setCoins(data);
					setError(false);
				}
			} catch {
				if (!cancelled) setError(true);
			}
		}
		fetchPrices();
		const id = setInterval(fetchPrices, 6e4);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, []);
	if (error && coins.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-9 items-center border-b bg-muted/40 px-4 text-xs text-muted-foreground",
		children: "Não foi possível carregar preços das criptos agora."
	});
	if (coins.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-9 items-center border-b bg-muted/40 px-4 text-xs text-muted-foreground",
		children: "Carregando mercado..."
	});
	const items = [...coins, ...coins];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-9 overflow-hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: trackRef,
			className: "ticker-track flex h-full items-center gap-8 whitespace-nowrap",
			style: { animation: "ticker-scroll 45s linear infinite" },
			children: items.map((c, i) => {
				const pos = (c.price_change_percentage_24h ?? 0) >= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2 px-1 text-xs",
					children: [
						c.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: c.image,
							alt: "",
							className: "h-4 w-4 rounded-full"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold uppercase text-foreground",
							children: c.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: ["$", formatPrice(c.current_price)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("flex items-center gap-0.5 tabular-nums font-medium", pos ? "text-green-500" : "text-red-500"),
							children: [
								pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3 w-3" }),
								Math.abs(c.price_change_percentage_24h ?? 0).toFixed(2),
								"%"
							]
						}),
						c.sparkline_in_7d?.price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSparkline, {
							data: c.sparkline_in_7d.price.slice(-48),
							positive: pos
						})
					]
				}, `${c.id}-${i}`);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      ` })]
	});
}
//#endregion
export { CryptoTicker as t };
