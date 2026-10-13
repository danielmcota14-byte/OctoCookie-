import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ad-slot-DTrVDkyQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_KEY = "53b35e700dd3c5120e2081ce6edf4273";
var isKey = (k) => typeof k === "string" && /^[0-9a-f]{32}$/i.test(k);
var KEYS = [void 0, void 0].map((k) => isKey(k) ? k : DEFAULT_KEY);
var AD_W = 468;
var AD_H = 60;
var adSrc = (key) => `/ad.html?k=${encodeURIComponent(key)}`;
function AdSlot({ slot = 1, className }) {
	const boxRef = (0, import_react.useRef)(null);
	const [scale, setScale] = (0, import_react.useState)(1);
	const [show, setShow] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = boxRef.current;
		if (!el) return;
		const fit = () => {
			const w = el.clientWidth;
			if (w) setScale(Math.max(.4, Math.min(1, (w - 6) / AD_W)));
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(el);
		let io;
		if ("IntersectionObserver" in window) {
			io = new IntersectionObserver((es) => {
				if (es.some((e) => e.isIntersecting)) {
					setShow(true);
					io?.disconnect();
				}
			}, { rootMargin: "300px 0px" });
			io.observe(el);
		} else setShow(true);
		return () => {
			ro.disconnect();
			io?.disconnect();
		};
	}, []);
	const key = KEYS[slot - 1] ?? DEFAULT_KEY;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		ref: boxRef,
		"aria-label": "Publicidade",
		className: cn("mx-auto flex w-full min-w-0 flex-col items-center", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 text-[9px] font-semibold uppercase leading-none tracking-[0.16em] text-muted-foreground/70",
			children: "Publicidade"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-xl border bg-muted/40 shadow-sm",
			style: {
				width: Math.round(AD_W * scale) + 2,
				height: Math.round(AD_H * scale) + 2
			},
			children: show && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: `Publicidade ${slot}`,
				src: adSrc(key),
				width: AD_W,
				height: AD_H,
				scrolling: "no",
				sandbox: "allow-scripts allow-popups allow-popups-to-escape-sandbox",
				referrerPolicy: "no-referrer-when-downgrade",
				style: {
					border: 0,
					display: "block",
					transform: `scale(${scale})`,
					transformOrigin: "top left"
				}
			})
		})]
	});
}
//#endregion
export { AdSlot as t };
