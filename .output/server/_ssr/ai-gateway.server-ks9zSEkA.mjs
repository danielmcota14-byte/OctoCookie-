import { t as createOpenAICompatible } from "../_libs/ai-sdk__openai-compatible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-gateway.server-ks9zSEkA.js
/** Cooldown após rate-limit (ms). Plano free Groq ~1 min. */
var RATE_LIMIT_COOLDOWN_MS = 65e3;
/** Cooldown para chave inválida. */
var INVALID_KEY_COOLDOWN_MS = 30 * 6e4;
/** Modelos em ordem de preferência (os da conta atual do Groq). */
var GROQ_MODELS = [
	process.env.GROQ_MODEL?.trim(),
	"qwen/qwen3.8-27b",
	"openai/gpt-oss-120b",
	"openai/gpt-oss-20b"
].filter((m) => Boolean(m)).filter((m) => Boolean(m));
var pool = null;
var nextIndex = 0;
function loadKeys() {
	const fromList = (process.env.GROQ_API_KEYS ?? "").split(/[,;\s]+/).map((k) => k.trim()).filter(Boolean);
	const numbered = [];
	for (const name of [
		"GROQ_API_KEY",
		"GROQ_API_KEY_1",
		"GROQ_API_KEY_2",
		"GROQ_API_KEY_3",
		"GROQ_API_KEY_4",
		"GROQ_API_KEY_5"
	]) {
		const v = process.env[name]?.trim();
		if (v) numbered.push(v);
	}
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const k of [...fromList, ...numbered]) if (!seen.has(k)) {
		seen.add(k);
		out.push(k);
	}
	return out.slice(0, 5);
}
function getPool() {
	if (!pool) pool = loadKeys().map((key) => ({
		key,
		coolUntil: 0
	}));
	return pool;
}
function resetGroqKeyPool() {
	pool = null;
	nextIndex = 0;
}
function getGroqKeys() {
	return loadKeys();
}
function createLovableAiGatewayProvider(apiKey) {
	return createOpenAICompatible({
		name: "groq",
		baseURL: "https://api.groq.com/openai/v1",
		apiKey,
		headers: { Authorization: `Bearer ${apiKey}` }
	});
}
function isRateLimitError(msg) {
	return /rate.?limit|429|quota|too many|tokens per|tpm|rpm/i.test(msg);
}
function isInvalidKeyError(msg) {
	return /invalid.?api.?key|incorrect.?api.?key|401|unauthorized|authentication/i.test(msg);
}
function isModelNotFoundError(msg) {
	return /model.*does not exist|model_not_found|404.*model|do not have access to it/i.test(msg);
}
function markCooldown(state, reason) {
	const ms = reason === "rate_limit" ? RATE_LIMIT_COOLDOWN_MS : reason === "invalid" ? INVALID_KEY_COOLDOWN_MS : RATE_LIMIT_COOLDOWN_MS;
	state.coolUntil = Date.now() + ms;
	state.reason = reason;
	console.warn(`[groq-pool] chave …${state.key.slice(-6)} em cooldown (${reason}) por ${Math.round(ms / 1e3)}s`);
}
/**
* Executa `fn(apiKey)` tentando as chaves em rodízio.
* Se uma esgotar (rate limit) ou for inválida, passa para a próxima.
*/
async function withGroqKeyRotation(fn) {
	const keys = getPool();
	if (keys.length === 0) throw new Error("Nenhuma GROQ_API_KEY configurada. Defina GROQ_API_KEYS=key1,key2,... (até 5) no .env ou nas Environment Variables do Vercel e faça Redeploy.");
	const now = Date.now();
	const start = nextIndex % keys.length;
	let lastError = null;
	let tried = 0;
	for (const force of [false, true]) {
		for (let i = 0; i < keys.length; i++) {
			const idx = (start + i) % keys.length;
			const state = keys[idx];
			if (!force && state.coolUntil > now) continue;
			tried++;
			try {
				const result = await fn(state.key);
				nextIndex = (idx + 1) % keys.length;
				if (state.coolUntil > 0) {
					state.coolUntil = 0;
					state.reason = void 0;
				}
				return result;
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				lastError = err instanceof Error ? err : new Error(msg);
				if (isModelNotFoundError(msg)) throw lastError;
				if (isInvalidKeyError(msg)) {
					markCooldown(state, "invalid");
					continue;
				}
				if (isRateLimitError(msg)) {
					markCooldown(state, "rate_limit");
					continue;
				}
				markCooldown(state, "error");
				continue;
			}
		}
		if (tried > 0 && !force) continue;
		break;
	}
	throw lastError ?? /* @__PURE__ */ new Error("Todas as chaves Groq falharam (rate limit / inválidas). Aguarde ~1 min.");
}
/**
* streamText/generateText com rodízio de chaves E fallback de modelos.
* Tenta cada modelo da lista GROQ_MODELS até um funcionar.
*/
async function withGroqModelFallback(fn) {
	const models = GROQ_MODELS.length > 0 ? GROQ_MODELS : ["openai/gpt-oss-120b"];
	let lastError = null;
	for (const modelId of models) try {
		return await withGroqKeyRotation((apiKey) => fn(apiKey, modelId));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		lastError = err instanceof Error ? err : new Error(msg);
		if (isModelNotFoundError(msg)) {
			console.warn(`[groq-pool] modelo ${modelId} indisponível, tentando próximo…`);
			continue;
		}
		if (isRateLimitError(msg) || /Todas as chaves/i.test(msg)) throw lastError;
		continue;
	}
	throw lastError ?? /* @__PURE__ */ new Error(`Nenhum modelo Groq disponível. Tentados: ${models.join(", ")}`);
}
//#endregion
export { withGroqModelFallback as i, getGroqKeys as n, resetGroqKeyPool as r, createLovableAiGatewayProvider as t };
