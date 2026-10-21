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
	"/adm.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"6f89-zGdBe6OWCbCzZeN/k+X2fBN31FI\"",
		"mtime": "2026-10-21T01:44:59.538Z",
		"size": 28553,
		"path": "../public/adm.html"
	},
	"/ad.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"31f-Calufq7hV6dxQEELeGFXChtlwRA\"",
		"mtime": "2026-10-21T01:44:59.420Z",
		"size": 799,
		"path": "../public/ad.html"
	},
	"/octo-legacy.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"aca-oLsnjMurCwjEpEPwb0+y1UQC/bw\"",
		"mtime": "2026-10-21T01:44:59.632Z",
		"size": 2762,
		"path": "../public/octo-legacy.css"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-10-21T01:44:59.494Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/pesquisa.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"6fdc-ctZYVBnLO0v60sk/FnhXISJSYpA\"",
		"mtime": "2026-10-21T01:44:59.459Z",
		"size": 28636,
		"path": "../public/pesquisa.html"
	},
	"/assets/ad-slot-qRK-v5BP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6bb-2M1XWr4rLp24up8pHv74mwhCXyg\"",
		"mtime": "2026-10-21T01:51:42.085Z",
		"size": 1723,
		"path": "../public/assets/ad-slot-qRK-v5BP.js"
	},
	"/assets/adm-wfXU5cRy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17b-osMP2ZyPYLLaFfEzoU0hWuKc0X0\"",
		"mtime": "2026-10-21T01:51:42.087Z",
		"size": 379,
		"path": "../public/assets/adm-wfXU5cRy.js"
	},
	"/assets/analyzer-Bbm2oT09.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15bb-ePqajeJanIkBJabZwCB9Ga1rPY4\"",
		"mtime": "2026-10-21T01:51:42.088Z",
		"size": 5563,
		"path": "../public/assets/analyzer-Bbm2oT09.js"
	},
	"/assets/app-sidebar-BJ4Ncj7O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d72-4pTbwz+vRoyq3S8fMWNFd1JYbgc\"",
		"mtime": "2026-10-21T01:51:42.089Z",
		"size": 11634,
		"path": "../public/assets/app-sidebar-BJ4Ncj7O.js"
	},
	"/octo.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"ac3-jANHvtvkg5nM7zvv9ZUSOcutUOg\"",
		"mtime": "2026-10-21T01:44:59.590Z",
		"size": 2755,
		"path": "../public/octo.css"
	},
	"/universo.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"40e6-uhrk+jX4Qc2BFb6jI0TVDDVV9dc\"",
		"mtime": "2026-10-21T01:44:59.567Z",
		"size": 16614,
		"path": "../public/universo.html"
	},
	"/assets/auth-modal-DAvVhysk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e50-Cwmle2uHxKbMiiZD2y8xDQRmdPA\"",
		"mtime": "2026-10-21T01:51:42.090Z",
		"size": 40528,
		"path": "../public/assets/auth-modal-DAvVhysk.js"
	},
	"/assets/bot-24x7-DVENfDTu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11ab-wWhhvNd9UZmc2caJnXt2UMJdTX4\"",
		"mtime": "2026-10-21T01:51:42.096Z",
		"size": 4523,
		"path": "../public/assets/bot-24x7-DVENfDTu.js"
	},
	"/assets/carteira-CaSFRV9q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"455-Rpcda3xVPHodc37RuAGJ9ppi18s\"",
		"mtime": "2026-10-21T01:51:42.097Z",
		"size": 1109,
		"path": "../public/assets/carteira-CaSFRV9q.js"
	},
	"/assets/community-DKmY6tdL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190a-CZw8H50p5lXpzhMGPHEEnYaYh9c\"",
		"mtime": "2026-10-21T01:51:42.098Z",
		"size": 6410,
		"path": "../public/assets/community-DKmY6tdL.js"
	},
	"/assets/cookiescript-V0lUbOrN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"902-CivRC6uKc+lbrEeYzaTVRuBQk0Q\"",
		"mtime": "2026-10-21T01:51:42.099Z",
		"size": 2306,
		"path": "../public/assets/cookiescript-V0lUbOrN.js"
	},
	"/assets/createServerFn-ZnF6Al0T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12c7-aYu/A1Se7Oj0e4zmMQQUivgTTHU\"",
		"mtime": "2026-10-21T01:51:42.103Z",
		"size": 4807,
		"path": "../public/assets/createServerFn-ZnF6Al0T.js"
	},
	"/assets/crypto-ticker-BKKCWdmx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a9a-WrSisu2qyqHhyoElQ30vFNVSgPg\"",
		"mtime": "2026-10-21T01:51:42.105Z",
		"size": 19098,
		"path": "../public/assets/crypto-ticker-BKKCWdmx.js"
	},
	"/assets/dist-BX8wlqTj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cbc-Ykyq7BIh0jDv/0gTKooKcCJ9arg\"",
		"mtime": "2026-10-21T01:51:42.105Z",
		"size": 7356,
		"path": "../public/assets/dist-BX8wlqTj.js"
	},
	"/assets/edu-chat-JVHUpPM7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ed-6WipJ5Ms0VOF/c/I27lYPm/YtNk\"",
		"mtime": "2026-10-21T01:51:42.109Z",
		"size": 4333,
		"path": "../public/assets/edu-chat-JVHUpPM7.js"
	},
	"/assets/create-post-form-DTz5Mpix.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d837-1m3Dmm+Eek+gA30Q7OoCnAlm9Cs\"",
		"mtime": "2026-10-21T01:51:42.100Z",
		"size": 55351,
		"path": "../public/assets/create-post-form-DTz5Mpix.js"
	},
	"/assets/edu-modules-xXQKyUAk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74e-pnFCs522J8PHqZHOv+xPMLdhApU\"",
		"mtime": "2026-10-21T01:51:42.112Z",
		"size": 1870,
		"path": "../public/assets/edu-modules-xXQKyUAk.js"
	},
	"/assets/finance-D1gTnqQF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-xY5Ir7XIGO+8aYz2Y/YKI3p3br0\"",
		"mtime": "2026-10-21T01:51:42.113Z",
		"size": 192,
		"path": "../public/assets/finance-D1gTnqQF.js"
	},
	"/assets/ide-ynUim0qi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-wwBjUtT9aI/s+s4DQuErl6R2bTY\"",
		"mtime": "2026-10-21T01:51:42.115Z",
		"size": 5839,
		"path": "../public/assets/ide-ynUim0qi.js"
	},
	"/octo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d8-zXpFbfxPQHTKcYR6sA2Yewtng9c\"",
		"mtime": "2026-10-21T01:44:59.611Z",
		"size": 984,
		"path": "../public/octo.js"
	},
	"/assets/input-Dq8mzLTN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"154a-U2OXJsYAfcvk8WPaLHMe/pAlyHg\"",
		"mtime": "2026-10-21T01:51:42.127Z",
		"size": 5450,
		"path": "../public/assets/input-Dq8mzLTN.js"
	},
	"/assets/jsx-runtime-D3jfb0Ew.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22c5-Qh7NbnnF5pPMnr2eoPNshytf37o\"",
		"mtime": "2026-10-21T01:51:42.130Z",
		"size": 8901,
		"path": "../public/assets/jsx-runtime-D3jfb0Ew.js"
	},
	"/assets/launch-B3nY-pJw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9ef-qDrUkKmInr1Smn9CGlH0jGBToQQ\"",
		"mtime": "2026-10-21T01:51:42.143Z",
		"size": 2543,
		"path": "../public/assets/launch-B3nY-pJw.js"
	},
	"/assets/lib-DTYE6SQd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c95c-hNJm1VmehekEob95z0EedTDHM3k\"",
		"mtime": "2026-10-21T01:51:42.144Z",
		"size": 117084,
		"path": "../public/assets/lib-DTYE6SQd.js"
	},
	"/assets/link-Bgx6RHhd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c09-I/VvoskCnwukUWsOIx8p1B2Dk50\"",
		"mtime": "2026-10-21T01:51:42.158Z",
		"size": 11273,
		"path": "../public/assets/link-Bgx6RHhd.js"
	},
	"/assets/octo-app-BDqTag85.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3af-W9zaHThCzV//vud7eZh2Cfo42AE\"",
		"mtime": "2026-10-21T01:51:42.252Z",
		"size": 943,
		"path": "../public/assets/octo-app-BDqTag85.js"
	},
	"/assets/pesquisa-4SmNbM9p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ad-DraLefSjlwuY7/TBJ8ADo8qcpBA\"",
		"mtime": "2026-10-21T01:51:42.254Z",
		"size": 941,
		"path": "../public/assets/pesquisa-4SmNbM9p.js"
	},
	"/assets/play-DZ0hZ1t-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-qQTN1T6IqZur/IsPSjTd6ImTpLM\"",
		"mtime": "2026-10-21T01:51:42.255Z",
		"size": 179,
		"path": "../public/assets/play-DZ0hZ1t-.js"
	},
	"/assets/preload-helper-DMUc-WVB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136f-U7qUKo0ZtyPgc3WXMplEc3wF++k\"",
		"mtime": "2026-10-21T01:51:42.259Z",
		"size": 4975,
		"path": "../public/assets/preload-helper-DMUc-WVB.js"
	},
	"/assets/redirect-DmtLUW0N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"184-TRM49T5nvIhX8okm9YKQe/jdlzE\"",
		"mtime": "2026-10-21T01:51:42.260Z",
		"size": 388,
		"path": "../public/assets/redirect-DmtLUW0N.js"
	},
	"/assets/settings-CgL2IABx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"765-swfWxli/Nj6681rp1yd6TBeQ03w\"",
		"mtime": "2026-10-21T01:51:42.261Z",
		"size": 1893,
		"path": "../public/assets/settings-CgL2IABx.js"
	},
	"/assets/routes-Df7c1RKT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"209-pcRWLbagsaZKv7/CcuuKOlmK9vg\"",
		"mtime": "2026-10-21T01:51:42.260Z",
		"size": 521,
		"path": "../public/assets/routes-Df7c1RKT.js"
	},
	"/assets/octocookie-mascot-D6JIE0Rx.png": {
		"type": "image/png",
		"etag": "\"1227d-lgNZj/cA9WiQ5XPyNCzVp/g6hDU\"",
		"mtime": "2026-10-21T01:51:42.298Z",
		"size": 74365,
		"path": "../public/assets/octocookie-mascot-D6JIE0Rx.png"
	},
	"/assets/start-BJads0wt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-g2NNXYLvQwkg0Vp1DtmhgBUPR80\"",
		"mtime": "2026-10-21T01:51:42.268Z",
		"size": 192,
		"path": "../public/assets/start-BJads0wt.js"
	},
	"/assets/simulator-D2Jpbsy3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21ca-ZyJW+XthV60p4RmKYrI4I+YLll4\"",
		"mtime": "2026-10-21T01:51:42.267Z",
		"size": 8650,
		"path": "../public/assets/simulator-D2Jpbsy3.js"
	},
	"/assets/triangle-alert-KIMFBUBv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-D7UxLiNS2hUwhY1txKCQsEvoJi4\"",
		"mtime": "2026-10-21T01:51:42.274Z",
		"size": 254,
		"path": "../public/assets/triangle-alert-KIMFBUBv.js"
	},
	"/assets/useNavigate-DAuyHf9c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"37f-KoVaAsDmp0dqcIEQFZiwG6dWV/8\"",
		"mtime": "2026-10-21T01:51:42.295Z",
		"size": 895,
		"path": "../public/assets/useNavigate-DAuyHf9c.js"
	},
	"/assets/styles-D1ILq_KD.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17df0-AbG/uzc7Ga895lviDiE5URBQaRo\"",
		"mtime": "2026-10-21T01:51:42.303Z",
		"size": 97776,
		"path": "../public/assets/styles-D1ILq_KD.css"
	},
	"/assets/token-CYJZ5hwD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"43055-Zkz691zLOQH/lKjEJEo6kKopsI0\"",
		"mtime": "2026-10-21T01:51:42.273Z",
		"size": 274517,
		"path": "../public/assets/token-CYJZ5hwD.js"
	},
	"/assets/users-Pc1hU0Pa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-0gSP12GHcfY9Iu7X+gxOIQCoLFQ\"",
		"mtime": "2026-10-21T01:51:42.296Z",
		"size": 295,
		"path": "../public/assets/users-Pc1hU0Pa.js"
	},
	"/assets/_communityId-B288CPiE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11f1-W2+5xMF8YxA3aPSMT3w4WmaB4X8\"",
		"mtime": "2026-10-21T01:51:42.081Z",
		"size": 4593,
		"path": "../public/assets/_communityId-B288CPiE.js"
	},
	"/assets/utils-BpX9Ca1_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70d2-5iD5c6PE06WqNYyEPVrU564/8eg\"",
		"mtime": "2026-10-21T01:51:42.297Z",
		"size": 28882,
		"path": "../public/assets/utils-BpX9Ca1_.js"
	},
	"/assets/_postId-5XIFVnUZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"171d-l59PAkkvM2URjQgtwoc/+OciW6s\"",
		"mtime": "2026-10-21T01:51:42.083Z",
		"size": 5917,
		"path": "../public/assets/_postId-5XIFVnUZ.js"
	},
	"/assets/index-D1J1Qoyk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b409d-b1zR2j9kGqv0NAb6kWRcR4hmVig\"",
		"mtime": "2026-10-21T01:51:42.080Z",
		"size": 737437,
		"path": "../public/assets/index-D1J1Qoyk.js"
	},
	"/assets/_threadId-B0Z5q062.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aca3-0vuBDiaVQvmg/hQtJDIkZqNkgkE\"",
		"mtime": "2026-10-21T01:51:42.084Z",
		"size": 175267,
		"path": "../public/assets/_threadId-B0Z5q062.js"
	},
	"/octocookie-app/.env.example": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"741-aqgCjKlvMzLpYMwCzEVyaNbQvog\"",
		"mtime": "2026-10-21T01:44:59.988Z",
		"size": 1857,
		"path": "../public/octocookie-app/.env.example"
	},
	"/octocookie-app/cryptex.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"2cdc7-pDUIbDP1uMoA1qS19y+VHySJcic\"",
		"mtime": "2026-10-21T01:44:59.736Z",
		"size": 183751,
		"path": "../public/octocookie-app/cryptex.html"
	},
	"/octocookie-app/dashboard_analisador.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"b461-Cc2LQTfqsw/Ui+/tZkkJP5AMqsk\"",
		"mtime": "2026-10-21T01:44:59.940Z",
		"size": 46177,
		"path": "../public/octocookie-app/dashboard_analisador.html"
	},
	"/octocookie-app/env.example.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"544-keUCVzAU64SmyVg5MEAa5vLzpA4\"",
		"mtime": "2026-10-21T01:44:59.703Z",
		"size": 1348,
		"path": "../public/octocookie-app/env.example.txt"
	},
	"/octocookie-app/mascot.png": {
		"type": "image/png",
		"etag": "\"1227d-lgNZj/cA9WiQ5XPyNCzVp/g6hDU\"",
		"mtime": "2026-10-21T01:44:59.911Z",
		"size": 74365,
		"path": "../public/octocookie-app/mascot.png"
	},
	"/octocookie-app/index.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"36f24-ciQS106MXeb8Lct6ORca4wESTGQ\"",
		"mtime": "2026-10-21T01:44:59.759Z",
		"size": 225060,
		"path": "../public/octocookie-app/index.html"
	},
	"/octocookie-app/app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b49-FSoxNFA44+KEcztrGq+gcRpIkrc\"",
		"mtime": "2026-10-21T01:44:59.677Z",
		"size": 19273,
		"path": "../public/octocookie-app/app.js"
	},
	"/octocookie-app/ads.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17e8-usXkY1bcThQ29SnttWDFAaC1SDg\"",
		"mtime": "2026-10-21T01:44:59.661Z",
		"size": 6120,
		"path": "../public/octocookie-app/ads.js"
	},
	"/octocookie-app/modo247.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5161-c7HqC9KPpX8rK4cXoKhlFfyGyAw\"",
		"mtime": "2026-10-21T01:44:59.777Z",
		"size": 20833,
		"path": "../public/octocookie-app/modo247.js"
	},
	"/octocookie-app/bot-config.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18e-K+x8esFnWeYDxEXem0xQhHnI4qk\"",
		"mtime": "2026-10-21T01:44:59.867Z",
		"size": 398,
		"path": "../public/octocookie-app/bot-config.js"
	},
	"/octocookie-app/README-pagamento.md": {
		"type": "text/markdown; charset=utf-8",
		"etag": "\"a53-bUoYBIZ9fg9ai6PEvtqhvIYwWdY\"",
		"mtime": "2026-10-21T01:45:00.005Z",
		"size": 2643,
		"path": "../public/octocookie-app/README-pagamento.md"
	},
	"/octocookie-app/Termo_de_Uso_OctoCookie.docx": {
		"type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"etag": "\"2d93-ilNL79IdhTKLtq2W1KutvXw0HNs\"",
		"mtime": "2026-10-21T01:44:59.835Z",
		"size": 11667,
		"path": "../public/octocookie-app/Termo_de_Uso_OctoCookie.docx"
	},
	"/octocookie-app/octocookie.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"26eea-z9fTO+2mRars+MAMBCp2J481/Do\"",
		"mtime": "2026-10-21T01:44:59.972Z",
		"size": 159466,
		"path": "../public/octocookie-app/octocookie.html"
	},
	"/octocookie-app/perfis.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"520f-gVUtzSkyMFR6K2uS0JUby3k5+lo\"",
		"mtime": "2026-10-21T01:44:59.796Z",
		"size": 21007,
		"path": "../public/octocookie-app/perfis.js"
	},
	"/fonts/bricolage.woff2": {
		"type": "font/woff2",
		"etag": "\"a180-mwP5/+0FoCUlVDqMGMRbxwMsdys\"",
		"mtime": "2026-10-21T01:45:00.168Z",
		"size": 41344,
		"path": "../public/fonts/bricolage.woff2"
	},
	"/fonts/source-serif-italic.woff2": {
		"type": "font/woff2",
		"etag": "\"c978-dkTqMwcjq7D/4Z5kdKkvyM6F80Q\"",
		"mtime": "2026-10-21T01:45:00.149Z",
		"size": 51576,
		"path": "../public/fonts/source-serif-italic.woff2"
	},
	"/fonts/jetbrains.woff2": {
		"type": "font/woff2",
		"etag": "\"9dd4-5yd+cUUhzrXxdMyYebUeD0qml1M\"",
		"mtime": "2026-10-21T01:45:00.131Z",
		"size": 40404,
		"path": "../public/fonts/jetbrains.woff2"
	},
	"/octocookie-app/moonpay-backend-app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4edc-iZzE3pdaLBdA4gqo1LOmaAwLQ0E\"",
		"mtime": "2026-10-21T01:45:00.022Z",
		"size": 20188,
		"path": "../public/octocookie-app/moonpay-backend-app.js"
	},
	"/fonts/source-serif.woff2": {
		"type": "font/woff2",
		"etag": "\"c6f8-+A6smTCatZwVECawxeDj8l7njmQ\"",
		"mtime": "2026-10-21T01:45:00.113Z",
		"size": 50936,
		"path": "../public/fonts/source-serif.woff2"
	},
	"/octocookie-app/netlify-reference/functions/app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b49-FSoxNFA44+KEcztrGq+gcRpIkrc\"",
		"mtime": "2026-10-21T01:45:00.073Z",
		"size": 19273,
		"path": "../public/octocookie-app/netlify-reference/functions/app.js"
	},
	"/octocookie-app/verificar-pagamento.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f30-1GWaDdV6gViOrtQryEunKCp0BoE\"",
		"mtime": "2026-10-21T01:44:59.885Z",
		"size": 3888,
		"path": "../public/octocookie-app/verificar-pagamento.js"
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
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
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
var _lazy_IiGOmm = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_IiGOmm
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
