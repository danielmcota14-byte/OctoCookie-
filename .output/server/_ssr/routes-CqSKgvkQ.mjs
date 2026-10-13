import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-DXiLitwJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CqSKgvkQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex min-w-0 flex-1 flex-col",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				src: "/universo.html",
				title: "OctoCookie",
				className: "h-full w-full flex-1 border-0 bg-background"
			})
		})]
	});
}
//#endregion
export { Home as component };
