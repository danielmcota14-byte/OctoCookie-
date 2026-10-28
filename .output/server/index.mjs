globalThis.__nitro_main__ = import.meta.url;
import { i as serve, r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { i as toEventHandler, n as defineHandler, o as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/cryptex.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"2c3e2-hohUeYCZItwhnYQe+owAQ/0Q6Ew\"",
		"mtime": "2026-10-28T02:47:26.302Z",
		"size": 181218,
		"path": "../public/cryptex.html"
	},
	"/adm.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"6f89-zGdBe6OWCbCzZeN/k+X2fBN31FI\"",
		"mtime": "2026-10-28T02:47:26.206Z",
		"size": 28553,
		"path": "../public/adm.html"
	},
	"/ad.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"31f-Calufq7hV6dxQEELeGFXChtlwRA\"",
		"mtime": "2026-10-28T02:47:26.144Z",
		"size": 799,
		"path": "../public/ad.html"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-10-28T02:47:26.184Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/octo.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"ac3-jANHvtvkg5nM7zvv9ZUSOcutUOg\"",
		"mtime": "2026-10-28T02:47:26.246Z",
		"size": 2755,
		"path": "../public/octo.css"
	},
	"/octo-legacy.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"aca-oLsnjMurCwjEpEPwb0+y1UQC/bw\"",
		"mtime": "2026-10-28T02:47:26.282Z",
		"size": 2762,
		"path": "../public/octo-legacy.css"
	},
	"/universo.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"4112-KKuzoRn2ttcprVFI1asoJXGy8b0\"",
		"mtime": "2026-10-28T02:47:26.226Z",
		"size": 16658,
		"path": "../public/universo.html"
	},
	"/fonts/jetbrains.woff2": {
		"type": "font/woff2",
		"etag": "\"9dd4-5yd+cUUhzrXxdMyYebUeD0qml1M\"",
		"mtime": "2026-10-28T02:47:26.753Z",
		"size": 40404,
		"path": "../public/fonts/jetbrains.woff2"
	},
	"/fonts/source-serif-italic.woff2": {
		"type": "font/woff2",
		"etag": "\"c978-dkTqMwcjq7D/4Z5kdKkvyM6F80Q\"",
		"mtime": "2026-10-28T02:47:26.768Z",
		"size": 51576,
		"path": "../public/fonts/source-serif-italic.woff2"
	},
	"/fonts/bricolage.woff2": {
		"type": "font/woff2",
		"etag": "\"a180-mwP5/+0FoCUlVDqMGMRbxwMsdys\"",
		"mtime": "2026-10-28T02:47:26.784Z",
		"size": 41344,
		"path": "../public/fonts/bricolage.woff2"
	},
	"/fonts/source-serif.woff2": {
		"type": "font/woff2",
		"etag": "\"c6f8-+A6smTCatZwVECawxeDj8l7njmQ\"",
		"mtime": "2026-10-28T02:47:26.734Z",
		"size": 50936,
		"path": "../public/fonts/source-serif.woff2"
	},
	"/octocookie-app/.env.example": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"741-aqgCjKlvMzLpYMwCzEVyaNbQvog\"",
		"mtime": "2026-10-28T02:47:26.630Z",
		"size": 1857,
		"path": "../public/octocookie-app/.env.example"
	},
	"/octocookie-app/bot-config.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18e-K+x8esFnWeYDxEXem0xQhHnI4qk\"",
		"mtime": "2026-10-28T02:47:26.495Z",
		"size": 398,
		"path": "../public/octocookie-app/bot-config.js"
	},
	"/octo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d8-zXpFbfxPQHTKcYR6sA2Yewtng9c\"",
		"mtime": "2026-10-28T02:47:26.259Z",
		"size": 984,
		"path": "../public/octo.js"
	},
	"/octocookie-app/dashboard_analisador.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"b461-Cc2LQTfqsw/Ui+/tZkkJP5AMqsk\"",
		"mtime": "2026-10-28T02:47:26.554Z",
		"size": 46177,
		"path": "../public/octocookie-app/dashboard_analisador.html"
	},
	"/octocookie-app/env.example.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"544-keUCVzAU64SmyVg5MEAa5vLzpA4\"",
		"mtime": "2026-10-28T02:47:26.366Z",
		"size": 1348,
		"path": "../public/octocookie-app/env.example.txt"
	},
	"/octocookie-app/cryptex.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"2c3e2-hohUeYCZItwhnYQe+owAQ/0Q6Ew\"",
		"mtime": "2026-10-28T02:47:26.390Z",
		"size": 181218,
		"path": "../public/octocookie-app/cryptex.html"
	},
	"/octocookie-app/index.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"36f24-ciQS106MXeb8Lct6ORca4wESTGQ\"",
		"mtime": "2026-10-28T02:47:26.412Z",
		"size": 225060,
		"path": "../public/octocookie-app/index.html"
	},
	"/octocookie-app/mascot.png": {
		"type": "image/png",
		"etag": "\"1227d-lgNZj/cA9WiQ5XPyNCzVp/g6hDU\"",
		"mtime": "2026-10-28T02:47:26.532Z",
		"size": 74365,
		"path": "../public/octocookie-app/mascot.png"
	},
	"/octocookie-app/app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b49-FSoxNFA44+KEcztrGq+gcRpIkrc\"",
		"mtime": "2026-10-28T02:47:26.343Z",
		"size": 19273,
		"path": "../public/octocookie-app/app.js"
	},
	"/octocookie-app/octocookie.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"28ee2-aWQunHEMP/Mzyrry3otg0sz0QAg\"",
		"mtime": "2026-10-28T02:47:26.613Z",
		"size": 167650,
		"path": "../public/octocookie-app/octocookie.html"
	},
	"/pesquisa.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"6fdc-Qj1QcuGKdvcxKYjGmUvyour0gts\"",
		"mtime": "2026-10-28T02:47:26.164Z",
		"size": 28636,
		"path": "../public/pesquisa.html"
	},
	"/octocookie-app/ads.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17e8-usXkY1bcThQ29SnttWDFAaC1SDg\"",
		"mtime": "2026-10-28T02:47:26.328Z",
		"size": 6120,
		"path": "../public/octocookie-app/ads.js"
	},
	"/octocookie-app/README-pagamento.md": {
		"type": "text/markdown; charset=utf-8",
		"etag": "\"a53-bUoYBIZ9fg9ai6PEvtqhvIYwWdY\"",
		"mtime": "2026-10-28T02:47:26.645Z",
		"size": 2643,
		"path": "../public/octocookie-app/README-pagamento.md"
	},
	"/octocookie-app/Termo_de_Uso_OctoCookie.docx": {
		"type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"etag": "\"2d93-ilNL79IdhTKLtq2W1KutvXw0HNs\"",
		"mtime": "2026-10-28T02:47:26.478Z",
		"size": 11667,
		"path": "../public/octocookie-app/Termo_de_Uso_OctoCookie.docx"
	},
	"/octocookie-app/moonpay-backend-app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4edc-iZzE3pdaLBdA4gqo1LOmaAwLQ0E\"",
		"mtime": "2026-10-28T02:47:26.660Z",
		"size": 20188,
		"path": "../public/octocookie-app/moonpay-backend-app.js"
	},
	"/octocookie-app/xstocks-tokens.json": {
		"type": "application/json",
		"etag": "\"73591-hxYT9iHwG2i9t8KqtmWDEoDOcO8\"",
		"mtime": "2026-10-28T02:47:26.582Z",
		"size": 472465,
		"path": "../public/octocookie-app/xstocks-tokens.json"
	},
	"/assets/ad-slot-e-Nc36Hh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6bb-HMsY0ljPp/BzGo2Obie73ibRJY8\"",
		"mtime": "2026-10-28T02:51:58.680Z",
		"size": 1723,
		"path": "../public/assets/ad-slot-e-Nc36Hh.js"
	},
	"/assets/adm-naJG_wMT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17b-/nfby7LY6oSa2JBHO0fXnvrG1HY\"",
		"mtime": "2026-10-28T02:51:58.680Z",
		"size": 379,
		"path": "../public/assets/adm-naJG_wMT.js"
	},
	"/assets/analyzer-BQzRcJ_U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15d4-QwDa8PIeWXo+MBktT/ClF46j6ig\"",
		"mtime": "2026-10-28T02:51:58.682Z",
		"size": 5588,
		"path": "../public/assets/analyzer-BQzRcJ_U.js"
	},
	"/assets/app-sidebar-044aPQ-S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c68-QwtIhEMErsN+lsQfqXUCnfz665c\"",
		"mtime": "2026-10-28T02:51:58.684Z",
		"size": 11368,
		"path": "../public/assets/app-sidebar-044aPQ-S.js"
	},
	"/assets/carteira-8heNkVDG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"454-zL+3w5uwx3jwIlKhhzjvO9S06jY\"",
		"mtime": "2026-10-28T02:51:58.723Z",
		"size": 1108,
		"path": "../public/assets/carteira-8heNkVDG.js"
	},
	"/assets/cookiescript-CZ-pnUDz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"902-NkZspim1njCHpPJd41jC5XCP7Ck\"",
		"mtime": "2026-10-28T02:51:58.724Z",
		"size": 2306,
		"path": "../public/assets/cookiescript-CZ-pnUDz.js"
	},
	"/assets/community-D26oEVdi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a93-+kcZ3nPBSPcDJR4ewIApJHASrKM\"",
		"mtime": "2026-10-28T02:51:58.724Z",
		"size": 6803,
		"path": "../public/assets/community-D26oEVdi.js"
	},
	"/assets/create-post-form-K2o-r6qH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e361-0+yf4Gprh4yBiXwzjiNQK+6zlqs\"",
		"mtime": "2026-10-28T02:51:58.733Z",
		"size": 58209,
		"path": "../public/assets/create-post-form-K2o-r6qH.js"
	},
	"/assets/createServerFn-CG5PQH6x.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12a7-afSPkpow6xGEeBYBaLaYc+Kh3vQ\"",
		"mtime": "2026-10-28T02:51:58.735Z",
		"size": 4775,
		"path": "../public/assets/createServerFn-CG5PQH6x.js"
	},
	"/assets/edu-chat-BZ_1pkxe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ed-+QaRSahz5ej7YTBqAa7j2+O9IhY\"",
		"mtime": "2026-10-28T02:51:58.770Z",
		"size": 4333,
		"path": "../public/assets/edu-chat-BZ_1pkxe.js"
	},
	"/assets/finance-CFtpW-0K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-0oKXTC19SdrK9bF8/ahZmHwqE6o\"",
		"mtime": "2026-10-28T02:51:58.770Z",
		"size": 192,
		"path": "../public/assets/finance-CFtpW-0K.js"
	},
	"/octocookie-app/modo247.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5161-c7HqC9KPpX8rK4cXoKhlFfyGyAw\"",
		"mtime": "2026-10-28T02:47:26.430Z",
		"size": 20833,
		"path": "../public/octocookie-app/modo247.js"
	},
	"/assets/ide-dnhBtXtE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16c7-ygsMVCpodg6RIdHSsFGr1vh3o1o\"",
		"mtime": "2026-10-28T02:51:58.772Z",
		"size": 5831,
		"path": "../public/assets/ide-dnhBtXtE.js"
	},
	"/assets/input-Bqln_LNA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1151-CLjBSc5J/4B7eThz1NQh4nTIlSM\"",
		"mtime": "2026-10-28T02:51:58.779Z",
		"size": 4433,
		"path": "../public/assets/input-Bqln_LNA.js"
	},
	"/assets/jsx-runtime-C27Mmbu5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2157-K7z7JulAsA1EGRDTmPYOvz5HqGU\"",
		"mtime": "2026-10-28T02:51:58.780Z",
		"size": 8535,
		"path": "../public/assets/jsx-runtime-C27Mmbu5.js"
	},
	"/assets/launch-Cllb-Q85.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b51-BTkUlfmFe0d/+7w9WgH/T6YClWw\"",
		"mtime": "2026-10-28T02:51:58.780Z",
		"size": 2897,
		"path": "../public/assets/launch-Cllb-Q85.js"
	},
	"/assets/index-2SFNVLDY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0220-q3QRL+49Mx4LHvI1pXyPSBzRGpw\"",
		"mtime": "2026-10-28T02:51:58.660Z",
		"size": 721440,
		"path": "../public/assets/index-2SFNVLDY.js"
	},
	"/assets/bot-24x7-Dw9AJ9fW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11b3-CEezK6291SKAlnnYlXJd/N4lxGQ\"",
		"mtime": "2026-10-28T02:51:58.684Z",
		"size": 4531,
		"path": "../public/assets/bot-24x7-Dw9AJ9fW.js"
	},
	"/assets/lib-BdaPisMS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cdc6-1LpVjwffQclO6bFG01n4dgowf5g\"",
		"mtime": "2026-10-28T02:51:58.796Z",
		"size": 118214,
		"path": "../public/assets/lib-BdaPisMS.js"
	},
	"/assets/link-CcOyVtVv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6873-PzXmDGqSckGvM1Lru0V3yQ5t1J0\"",
		"mtime": "2026-10-28T02:51:58.801Z",
		"size": 26739,
		"path": "../public/assets/link-CcOyVtVv.js"
	},
	"/assets/octo-app-C5kVTJ29.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bb-WRFRnvbB0AL9wDimnAbs97vRDuE\"",
		"mtime": "2026-10-28T02:51:58.801Z",
		"size": 955,
		"path": "../public/assets/octo-app-C5kVTJ29.js"
	},
	"/assets/octocookie-mascot-D6JIE0Rx.png": {
		"type": "image/png",
		"etag": "\"1227d-lgNZj/cA9WiQ5XPyNCzVp/g6hDU\"",
		"mtime": "2026-10-28T02:51:58.894Z",
		"size": 74365,
		"path": "../public/assets/octocookie-mascot-D6JIE0Rx.png"
	},
	"/assets/play-Dx8kzqUF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-dEFRHfBrkREw0jloGT3GdGHrOkU\"",
		"mtime": "2026-10-28T02:51:58.808Z",
		"size": 179,
		"path": "../public/assets/play-Dx8kzqUF.js"
	},
	"/assets/pesquisa-PPTkspnL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b7-ClKK7CN0wflR4+rOvxbLqDkBDps\"",
		"mtime": "2026-10-28T02:51:58.808Z",
		"size": 951,
		"path": "../public/assets/pesquisa-PPTkspnL.js"
	},
	"/assets/redirect-C-eRQtnH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22d-XWldT6wFIL00QHpfP609loBAcNQ\"",
		"mtime": "2026-10-28T02:51:58.827Z",
		"size": 557,
		"path": "../public/assets/redirect-C-eRQtnH.js"
	},
	"/assets/routes-08baxu1p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"209-vx6wS/XptDh4RrJ5qKFDVJIguGE\"",
		"mtime": "2026-10-28T02:51:58.830Z",
		"size": 521,
		"path": "../public/assets/routes-08baxu1p.js"
	},
	"/assets/settings-XnVbzd3d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-dxl/3PYccFfAwzuXKesf1Ky8df4\"",
		"mtime": "2026-10-28T02:51:58.831Z",
		"size": 1906,
		"path": "../public/assets/settings-XnVbzd3d.js"
	},
	"/assets/start-CRcSSFJf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-AMqe6yGzQJYF16cZ9FC2iKVtB0I\"",
		"mtime": "2026-10-28T02:51:58.872Z",
		"size": 192,
		"path": "../public/assets/start-CRcSSFJf.js"
	},
	"/assets/simulator-_pNDb3Ud.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21be-Z+ZIHe3yq3/s3rwqmxo+H20D8gU\"",
		"mtime": "2026-10-28T02:51:58.840Z",
		"size": 8638,
		"path": "../public/assets/simulator-_pNDb3Ud.js"
	},
	"/assets/stock-ticker-ByYiVDkb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db65-CzbUEvnE5RYP9q0h1pr0NdLYaCY\"",
		"mtime": "2026-10-28T02:51:58.873Z",
		"size": 56165,
		"path": "../public/assets/stock-ticker-ByYiVDkb.js"
	},
	"/octocookie-app/perfis.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"520f-gVUtzSkyMFR6K2uS0JUby3k5+lo\"",
		"mtime": "2026-10-28T02:47:26.450Z",
		"size": 21007,
		"path": "../public/octocookie-app/perfis.js"
	},
	"/assets/triangle-alert-Cd1MjuWb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-8KHphJwqAWtK/Non29h2yQFCUlc\"",
		"mtime": "2026-10-28T02:51:58.874Z",
		"size": 254,
		"path": "../public/assets/triangle-alert-Cd1MjuWb.js"
	},
	"/assets/users-DS4jUkhS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-e3uheCmLHpltXDQLKPbGtVuOzN0\"",
		"mtime": "2026-10-28T02:51:58.875Z",
		"size": 295,
		"path": "../public/assets/users-DS4jUkhS.js"
	},
	"/assets/styles-TpymljAf.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17ba9-Vh6XFVWpwyVB+EyvyNI82gu7HAc\"",
		"mtime": "2026-10-28T02:51:58.923Z",
		"size": 97193,
		"path": "../public/assets/styles-TpymljAf.css"
	},
	"/assets/utils-BKVFOtEN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c53-EwFPxuUBxYXotF31eTgpfQSfCdg\"",
		"mtime": "2026-10-28T02:51:58.894Z",
		"size": 27731,
		"path": "../public/assets/utils-BKVFOtEN.js"
	},
	"/assets/_communityId-DviGSi01.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d4-Yr6anH0IOtp0LVhuVhJ1JtYjLVE\"",
		"mtime": "2026-10-28T02:51:58.675Z",
		"size": 4564,
		"path": "../public/assets/_communityId-DviGSi01.js"
	},
	"/assets/_postId-DsoM2mpB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16ee-R+UjoEg+Kn9R9J9HRxAnB9WXt9I\"",
		"mtime": "2026-10-28T02:51:58.676Z",
		"size": 5870,
		"path": "../public/assets/_postId-DsoM2mpB.js"
	},
	"/assets/_threadId-BobBcxZr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32196-LGmfr/tPXxW150aw6mg8dW0N+ps\"",
		"mtime": "2026-10-28T02:51:58.678Z",
		"size": 205206,
		"path": "../public/assets/_threadId-BobBcxZr.js"
	},
	"/octocookie-app/verificar-pagamento.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f30-1GWaDdV6gViOrtQryEunKCp0BoE\"",
		"mtime": "2026-10-28T02:47:26.512Z",
		"size": 3888,
		"path": "../public/octocookie-app/verificar-pagamento.js"
	},
	"/octocookie-app/netlify-reference/functions/app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b49-FSoxNFA44+KEcztrGq+gcRpIkrc\"",
		"mtime": "2026-10-28T02:47:26.703Z",
		"size": 19273,
		"path": "../public/octocookie-app/netlify-reference/functions/app.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_hgJwQO = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_hgJwQO
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
