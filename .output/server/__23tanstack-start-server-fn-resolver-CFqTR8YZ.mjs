//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CFqTR8YZ.js
var manifest = {
	"4fe6f280827bf27395d362e2a785ba12620a002ac8ab2af3dc4336f6714365ff": {
		functionName: "runCookieScript_createServerFn_handler",
		importer: () => import("./_ssr/ide.functions-Cx5w8QJD.mjs")
	},
	"5647a098ba84483fdd6b5e9fcc14f659a477bb5936b229ac3dfa6797edcefd5c": {
		functionName: "getTickerQuotes_createServerFn_handler",
		importer: () => import("./_ssr/quotes.functions-BFJosF7W.mjs")
	},
	"b12cdf313c9b2048d7f2c9e4297624ebbabbc2e5a8d067af878fa2673871856f": {
		functionName: "analyzeToken_createServerFn_handler",
		importer: () => import("./_ssr/analyzer.functions-x_GTRFc0.mjs")
	},
	"c410a89faf47dce2359d3b533a29460077c1136727f015c0b372194d32b658e1": {
		functionName: "runSimulation_createServerFn_handler",
		importer: () => import("./_ssr/simulator.functions-DdmPPmOC.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
