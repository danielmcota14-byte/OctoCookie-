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
	"/ad.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"31f-Calufq7hV6dxQEELeGFXChtlwRA\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 799,
		"path": "../public/ad.html"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/adm.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"6f89-zGdBe6OWCbCzZeN/k+X2fBN31FI\"",
		"mtime": "2026-10-13T05:57:24.000Z",
		"size": 28553,
		"path": "../public/adm.html"
	},
	"/octo-legacy.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"aca-oLsnjMurCwjEpEPwb0+y1UQC/bw\"",
		"mtime": "2026-10-13T05:58:54.000Z",
		"size": 2762,
		"path": "../public/octo-legacy.css"
	},
	"/universo.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"39da-cd0TttD1ORk1rQnjvapSDlkCEJ8\"",
		"mtime": "2026-10-13T05:55:34.000Z",
		"size": 14810,
		"path": "../public/universo.html"
	},
	"/assets/ad-slot-DM5c3hbf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"612-7u/4n99jqsaC7WphTCJ90SjveU4\"",
		"mtime": "2026-10-13T03:05:52.807Z",
		"size": 1554,
		"path": "../public/assets/ad-slot-DM5c3hbf.js"
	},
	"/assets/adm-wfXU5cRy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17b-osMP2ZyPYLLaFfEzoU0hWuKc0X0\"",
		"mtime": "2026-10-13T03:05:52.809Z",
		"size": 379,
		"path": "../public/assets/adm-wfXU5cRy.js"
	},
	"/assets/analyzer-DrtLLFlJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1591-yTZsXfWW4L4++ZznwECm96LhLA0\"",
		"mtime": "2026-10-13T03:05:52.810Z",
		"size": 5521,
		"path": "../public/assets/analyzer-DrtLLFlJ.js"
	},
	"/assets/app-sidebar-BRu984Dl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c64-DgOQikPRU5o6Ld/SqVbsSXhfSps\"",
		"mtime": "2026-10-13T03:05:52.812Z",
		"size": 11364,
		"path": "../public/assets/app-sidebar-BRu984Dl.js"
	},
	"/assets/bot-24x7-BBzANWDI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11ab-3U0Q5NS+JnTWN47NIAZ/8Sg52kE\"",
		"mtime": "2026-10-13T03:05:52.814Z",
		"size": 4523,
		"path": "../public/assets/bot-24x7-BBzANWDI.js"
	},
	"/assets/carteira-Dtek0P4H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"455-zKQ4dWeLzHHuxEOD9StVA7HbCO8\"",
		"mtime": "2026-10-13T03:05:52.815Z",
		"size": 1109,
		"path": "../public/assets/carteira-Dtek0P4H.js"
	},
	"/assets/community-CTk4kXsh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18e4-G8k+/qh9hRQUEA+WSHPuvnd3AHY\"",
		"mtime": "2026-10-13T03:05:52.817Z",
		"size": 6372,
		"path": "../public/assets/community-CTk4kXsh.js"
	},
	"/assets/cookiescript-B1nKeC69.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8a0-IgF8Rq+FD6myDCZAYh1wLJTYGCg\"",
		"mtime": "2026-10-13T03:05:52.819Z",
		"size": 2208,
		"path": "../public/assets/cookiescript-B1nKeC69.js"
	},
	"/assets/create-post-form-BlvsUvCg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f417-4/YtB4TLfdOmwSEj1vzGm+Mwgcw\"",
		"mtime": "2026-10-13T03:05:52.820Z",
		"size": 62487,
		"path": "../public/assets/create-post-form-BlvsUvCg.js"
	},
	"/assets/crypto-ticker-Drqf6965.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e819-3QNReWGuYFYH/l1k49smey2Zkfc\"",
		"mtime": "2026-10-13T03:05:52.822Z",
		"size": 59417,
		"path": "../public/assets/crypto-ticker-Drqf6965.js"
	},
	"/assets/edu-chat-BGxAnhwz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ed-vFezwQ4oV0yLZ1+Ir2mG8plLkP0\"",
		"mtime": "2026-10-13T03:05:52.823Z",
		"size": 4333,
		"path": "../public/assets/edu-chat-BGxAnhwz.js"
	},
	"/assets/edu-modules-xXQKyUAk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74e-pnFCs522J8PHqZHOv+xPMLdhApU\"",
		"mtime": "2026-10-13T03:05:52.825Z",
		"size": 1870,
		"path": "../public/assets/edu-modules-xXQKyUAk.js"
	},
	"/assets/finance-quPCEHJH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-T9FFn15J/iJRcbn3AdJvJoJZgW0\"",
		"mtime": "2026-10-13T03:05:52.827Z",
		"size": 192,
		"path": "../public/assets/finance-quPCEHJH.js"
	},
	"/assets/ide-BemN0fJu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16a5-1aB+eiIDLqhWOC9P73TK2qr/6nI\"",
		"mtime": "2026-10-13T03:05:52.966Z",
		"size": 5797,
		"path": "../public/assets/ide-BemN0fJu.js"
	},
	"/assets/jsx-runtime-D3jfb0Ew.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22c5-Qh7NbnnF5pPMnr2eoPNshytf37o\"",
		"mtime": "2026-10-13T03:05:52.968Z",
		"size": 8901,
		"path": "../public/assets/jsx-runtime-D3jfb0Ew.js"
	},
	"/assets/input-Dq8mzLTN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"154a-U2OXJsYAfcvk8WPaLHMe/pAlyHg\"",
		"mtime": "2026-10-13T03:05:52.967Z",
		"size": 5450,
		"path": "../public/assets/input-Dq8mzLTN.js"
	},
	"/octo.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"ac3-jANHvtvkg5nM7zvv9ZUSOcutUOg\"",
		"mtime": "2026-10-13T05:54:32.000Z",
		"size": 2755,
		"path": "../public/octo.css"
	},
	"/assets/index-D3ukeoWA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3dfb-NnnBN9Ea5mVb7VLck2dRd1T9tcI\"",
		"mtime": "2026-10-13T03:05:52.800Z",
		"size": 736763,
		"path": "../public/assets/index-D3ukeoWA.js"
	},
	"/octo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d8-zXpFbfxPQHTKcYR6sA2Yewtng9c\"",
		"mtime": "2026-10-13T05:54:32.000Z",
		"size": 984,
		"path": "../public/octo.js"
	},
	"/pesquisa.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"13973b-XvbtYVJk6jWuxGJ7amgb/DaWaY0\"",
		"mtime": "2026-10-13T05:55:58.000Z",
		"size": 1283899,
		"path": "../public/pesquisa.html"
	},
	"/assets/launch-DSc_jgPR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ac4-sj0cVgG6FDqzfnQzA2913UDSPNI\"",
		"mtime": "2026-10-13T03:05:52.969Z",
		"size": 2756,
		"path": "../public/assets/launch-DSc_jgPR.js"
	},
	"/assets/lib-DTYE6SQd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c95c-hNJm1VmehekEob95z0EedTDHM3k\"",
		"mtime": "2026-10-13T03:05:52.970Z",
		"size": 117084,
		"path": "../public/assets/lib-DTYE6SQd.js"
	},
	"/assets/link-Bgx6RHhd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c09-I/VvoskCnwukUWsOIx8p1B2Dk50\"",
		"mtime": "2026-10-13T03:05:52.972Z",
		"size": 11273,
		"path": "../public/assets/link-Bgx6RHhd.js"
	},
	"/assets/octo-app-BVm54yCr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3af-GEXKnen3Y+0tmvWsgXtlVYF/6Fc\"",
		"mtime": "2026-10-13T03:05:52.973Z",
		"size": 943,
		"path": "../public/assets/octo-app-BVm54yCr.js"
	},
	"/assets/pesquisa-8LprMZFu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ab-hgbZ7AsLdq6E3j3ScCrkG9OVAvg\"",
		"mtime": "2026-10-13T03:05:52.974Z",
		"size": 939,
		"path": "../public/assets/pesquisa-8LprMZFu.js"
	},
	"/assets/preload-helper-DMUc-WVB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136f-U7qUKo0ZtyPgc3WXMplEc3wF++k\"",
		"mtime": "2026-10-13T03:05:52.983Z",
		"size": 4975,
		"path": "../public/assets/preload-helper-DMUc-WVB.js"
	},
	"/assets/play-DZ0hZ1t-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-qQTN1T6IqZur/IsPSjTd6ImTpLM\"",
		"mtime": "2026-10-13T03:05:52.975Z",
		"size": 179,
		"path": "../public/assets/play-DZ0hZ1t-.js"
	},
	"/assets/redirect-DmtLUW0N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"184-TRM49T5nvIhX8okm9YKQe/jdlzE\"",
		"mtime": "2026-10-13T03:05:52.984Z",
		"size": 388,
		"path": "../public/assets/redirect-DmtLUW0N.js"
	},
	"/assets/octocookie-mascot-D6JIE0Rx.png": {
		"type": "image/png",
		"etag": "\"1227d-lgNZj/cA9WiQ5XPyNCzVp/g6hDU\"",
		"mtime": "2026-10-13T03:05:53.000Z",
		"size": 74365,
		"path": "../public/assets/octocookie-mascot-D6JIE0Rx.png"
	},
	"/assets/routes-zwOeTnYp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"209-SopM3+mO07Np9gAecMHwBQatLjo\"",
		"mtime": "2026-10-13T03:05:52.985Z",
		"size": 521,
		"path": "../public/assets/routes-zwOeTnYp.js"
	},
	"/assets/settings-CZex-xCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"765-I8KnoLGRU53X+paig/GC9dNe+kE\"",
		"mtime": "2026-10-13T03:05:52.986Z",
		"size": 1893,
		"path": "../public/assets/settings-CZex-xCG.js"
	},
	"/assets/simulator-C1lANcfA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21a0-vSCpMe4lBMKi+Mkgl130Efs8mkM\"",
		"mtime": "2026-10-13T03:05:52.987Z",
		"size": 8608,
		"path": "../public/assets/simulator-C1lANcfA.js"
	},
	"/assets/start-noqu2HNA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-g7G7xmoLtIifpGiUmMJGx5LHbF8\"",
		"mtime": "2026-10-13T03:05:52.988Z",
		"size": 192,
		"path": "../public/assets/start-noqu2HNA.js"
	},
	"/assets/triangle-alert-D1N5ajFR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c2-tJOKBRHxBJAOuprid9YYLJVeAfQ\"",
		"mtime": "2026-10-13T03:05:52.989Z",
		"size": 5058,
		"path": "../public/assets/triangle-alert-D1N5ajFR.js"
	},
	"/assets/useNavigate-DAuyHf9c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"37f-KoVaAsDmp0dqcIEQFZiwG6dWV/8\"",
		"mtime": "2026-10-13T03:05:52.993Z",
		"size": 895,
		"path": "../public/assets/useNavigate-DAuyHf9c.js"
	},
	"/assets/users-Pc1hU0Pa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"127-0gSP12GHcfY9Iu7X+gxOIQCoLFQ\"",
		"mtime": "2026-10-13T03:05:52.994Z",
		"size": 295,
		"path": "../public/assets/users-Pc1hU0Pa.js"
	},
	"/assets/utils-BpX9Ca1_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70d2-5iD5c6PE06WqNYyEPVrU564/8eg\"",
		"mtime": "2026-10-13T03:05:52.999Z",
		"size": 28882,
		"path": "../public/assets/utils-BpX9Ca1_.js"
	},
	"/assets/styles-CyaDgMOk.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17965-ySTSS1wjCpPHzT9IR9ERc4Wp0no\"",
		"mtime": "2026-10-13T03:05:53.001Z",
		"size": 96613,
		"path": "../public/assets/styles-CyaDgMOk.css"
	},
	"/assets/_communityId-DMBNUU75.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11cb-HGJRwq0bk2jcs4Xq5HNCH5Y5ksk\"",
		"mtime": "2026-10-13T03:05:52.801Z",
		"size": 4555,
		"path": "../public/assets/_communityId-DMBNUU75.js"
	},
	"/assets/_postId-De_93kpo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16f7-n7xnsiu0Tca6c87DfnLF40GeLQs\"",
		"mtime": "2026-10-13T03:05:52.803Z",
		"size": 5879,
		"path": "../public/assets/_postId-De_93kpo.js"
	},
	"/assets/_threadId-B7iasC_f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aca3-vHEsQC0JF0Cd7NWXqgXtLEkwPuA\"",
		"mtime": "2026-10-13T03:05:52.804Z",
		"size": 175267,
		"path": "../public/assets/_threadId-B7iasC_f.js"
	},
	"/fonts/bricolage.woff2": {
		"type": "font/woff2",
		"etag": "\"a180-mwP5/+0FoCUlVDqMGMRbxwMsdys\"",
		"mtime": "2026-10-13T05:54:10.000Z",
		"size": 41344,
		"path": "../public/fonts/bricolage.woff2"
	},
	"/fonts/jetbrains.woff2": {
		"type": "font/woff2",
		"etag": "\"9dd4-5yd+cUUhzrXxdMyYebUeD0qml1M\"",
		"mtime": "2026-10-13T05:54:10.000Z",
		"size": 40404,
		"path": "../public/fonts/jetbrains.woff2"
	},
	"/fonts/source-serif-italic.woff2": {
		"type": "font/woff2",
		"etag": "\"c978-dkTqMwcjq7D/4Z5kdKkvyM6F80Q\"",
		"mtime": "2026-10-13T05:54:10.000Z",
		"size": 51576,
		"path": "../public/fonts/source-serif-italic.woff2"
	},
	"/fonts/source-serif.woff2": {
		"type": "font/woff2",
		"etag": "\"c6f8-+A6smTCatZwVECawxeDj8l7njmQ\"",
		"mtime": "2026-10-13T05:54:10.000Z",
		"size": 50936,
		"path": "../public/fonts/source-serif.woff2"
	},
	"/octocookie-app/.env.example": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"741-aqgCjKlvMzLpYMwCzEVyaNbQvog\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 1857,
		"path": "../public/octocookie-app/.env.example"
	},
	"/octocookie-app/cryptex.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"2cdc7-pDUIbDP1uMoA1qS19y+VHySJcic\"",
		"mtime": "2026-10-13T05:58:54.000Z",
		"size": 183751,
		"path": "../public/octocookie-app/cryptex.html"
	},
	"/octocookie-app/dashboard_analisador.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"b461-Cc2LQTfqsw/Ui+/tZkkJP5AMqsk\"",
		"mtime": "2026-10-13T05:58:54.000Z",
		"size": 46177,
		"path": "../public/octocookie-app/dashboard_analisador.html"
	},
	"/octocookie-app/env.example.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"544-keUCVzAU64SmyVg5MEAa5vLzpA4\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 1348,
		"path": "../public/octocookie-app/env.example.txt"
	},
	"/octocookie-app/index.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"36f24-ciQS106MXeb8Lct6ORca4wESTGQ\"",
		"mtime": "2026-10-13T05:58:54.000Z",
		"size": 225060,
		"path": "../public/octocookie-app/index.html"
	},
	"/octocookie-app/mascot.png": {
		"type": "image/png",
		"etag": "\"1227d-lgNZj/cA9WiQ5XPyNCzVp/g6hDU\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 74365,
		"path": "../public/octocookie-app/mascot.png"
	},
	"/octocookie-app/bot-config.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18e-K+x8esFnWeYDxEXem0xQhHnI4qk\"",
		"mtime": "2026-10-13T05:12:10.000Z",
		"size": 398,
		"path": "../public/octocookie-app/bot-config.js"
	},
	"/octocookie-app/app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b49-FSoxNFA44+KEcztrGq+gcRpIkrc\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 19273,
		"path": "../public/octocookie-app/app.js"
	},
	"/octocookie-app/ads.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1438-uFA5u0Ule84ufFbC2r3Xz11qSWM\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 5176,
		"path": "../public/octocookie-app/ads.js"
	},
	"/octocookie-app/octocookie.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"26eea-z9fTO+2mRars+MAMBCp2J481/Do\"",
		"mtime": "2026-10-13T05:58:54.000Z",
		"size": 159466,
		"path": "../public/octocookie-app/octocookie.html"
	},
	"/octocookie-app/README-pagamento.md": {
		"type": "text/markdown; charset=utf-8",
		"etag": "\"a53-bUoYBIZ9fg9ai6PEvtqhvIYwWdY\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 2643,
		"path": "../public/octocookie-app/README-pagamento.md"
	},
	"/octocookie-app/Termo_de_Uso_OctoCookie.docx": {
		"type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"etag": "\"2d93-ilNL79IdhTKLtq2W1KutvXw0HNs\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 11667,
		"path": "../public/octocookie-app/Termo_de_Uso_OctoCookie.docx"
	},
	"/octocookie-app/modo247.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5161-c7HqC9KPpX8rK4cXoKhlFfyGyAw\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 20833,
		"path": "../public/octocookie-app/modo247.js"
	},
	"/octocookie-app/moonpay-backend-app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4edc-iZzE3pdaLBdA4gqo1LOmaAwLQ0E\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 20188,
		"path": "../public/octocookie-app/moonpay-backend-app.js"
	},
	"/octocookie-app/verificar-pagamento.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f30-1GWaDdV6gViOrtQryEunKCp0BoE\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 3888,
		"path": "../public/octocookie-app/verificar-pagamento.js"
	},
	"/octocookie-app/perfis.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"520f-gVUtzSkyMFR6K2uS0JUby3k5+lo\"",
		"mtime": "2026-10-13T04:55:18.000Z",
		"size": 21007,
		"path": "../public/octocookie-app/perfis.js"
	},
	"/octocookie-app/netlify-reference/functions/app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b49-FSoxNFA44+KEcztrGq+gcRpIkrc\"",
		"mtime": "2026-10-13T04:55:18.000Z",
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
var _lazy_LWXWaU = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_LWXWaU
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
