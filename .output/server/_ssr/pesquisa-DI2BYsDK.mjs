import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-D38O-nZB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pesquisa-DI2BYsDK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Pesquisa() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b py-3 pl-14 pr-4 md:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate text-sm font-medium",
					children: "OctoCookie — Pesquisa (Ações)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/pesquisa.html",
					target: "_blank",
					rel: "noreferrer",
					className: "shrink-0 text-xs text-muted-foreground hover:text-foreground",
					children: "Abrir em nova aba"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				src: "/pesquisa.html",
				title: "OctoCookie — Pesquisa",
				className: "h-full w-full flex-1 border-0 bg-background"
			})]
		})]
	});
}
//#endregion
export { Pesquisa as component };
