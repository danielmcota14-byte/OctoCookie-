import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adm-WGtaZq06.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdmRedirect() {
	(0, import_react.useEffect)(() => {
		window.location.replace("/adm.html");
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "p-6 text-sm text-muted-foreground",
		children: [
			"Abrindo o painel… ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/adm.html",
				className: "underline",
				children: "clique aqui"
			}),
			" se não abrir."
		]
	});
}
//#endregion
export { AdmRedirect as component };
