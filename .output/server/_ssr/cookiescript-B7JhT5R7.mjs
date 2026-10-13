import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-DXiLitwJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cookiescript-B7JhT5R7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function serviceUrl() {
	try {
		return "/cookiescript-app".trim().replace(/\/+$/, "");
	} catch {
		return "";
	}
}
var TABS = [
	{
		label: "IDE",
		path: "/index.html"
	},
	{
		label: "Cookie AI",
		path: "/"
	},
	{
		label: "Documentação",
		path: "/index2.html"
	}
];
function CookieScriptPage() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)(0);
	const base = serviceUrl();
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b py-3 pl-14 pr-4 md:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-sm font-medium",
						children: "CookieScript"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1",
						children: TABS.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setTab(i),
							className: `rounded-md px-2.5 py-1 text-xs ${i === tab ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60"}`,
							children: t.label
						}, t.label))
					}),
					base && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: base + TABS[tab].path,
						target: "_blank",
						rel: "noreferrer",
						className: "ml-auto text-xs text-muted-foreground hover:text-foreground",
						children: "Abrir em nova aba"
					})
				]
			}), base ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				src: base + TABS[tab].path,
				title: "CookieScript",
				className: "h-full w-full flex-1 border-0 bg-background"
			}, tab) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-xl p-8 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "Serviço do CookieScript não configurado"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted-foreground",
						children: [
							"O CookieScript é um servidor Python (pasta ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "cookiescript/" }),
							"). Publique-o no Render (serviço",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "octocookie-cookiescript" }),
							" do ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "render.yaml" }),
							") e defina no site a variável",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "VITE_COOKIESCRIPT_URL=https://seu-cookiescript.onrender.com" }),
							", depois faça redeploy."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted-foreground",
						children: [
							"Local: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "cd cookiescript && python cookie_ide_app.py" }),
							" e use ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "http://localhost:8080" }),
							"."
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { CookieScriptPage as component };
