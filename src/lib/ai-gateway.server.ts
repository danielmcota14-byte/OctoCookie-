import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Cooldown após rate-limit (ms). Plano free Groq ~1 min. */
const RATE_LIMIT_COOLDOWN_MS = 65_000;
/** Cooldown para chave inválida. */
const INVALID_KEY_COOLDOWN_MS = 30 * 60_000;

/** Modelos em ordem de preferência (os da conta atual do Groq). */
export const GROQ_MODELS = [
  process.env.GROQ_MODEL?.trim(),
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
].filter((m): m is string => Boolean(m)).filter((m): m is string => Boolean(m));

type KeyState = {
  key: string;
  coolUntil: number;
  reason?: "rate_limit" | "invalid" | "error";
};

let pool: KeyState[] | null = null;
let nextIndex = 0;

function loadKeys(): string[] {
  const fromList = (process.env.GROQ_API_KEYS ?? "")
    .split(/[,;\s]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  const numbered: string[] = [];
  for (const name of [
    "GROQ_API_KEY",
    "GROQ_API_KEY_1",
    "GROQ_API_KEY_2",
    "GROQ_API_KEY_3",
    "GROQ_API_KEY_4",
    "GROQ_API_KEY_5",
  ]) {
    const v = process.env[name]?.trim();
    if (v) numbered.push(v);
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of [...fromList, ...numbered]) {
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out.slice(0, 5);
}

function getPool(): KeyState[] {
  if (!pool) {
    pool = loadKeys().map((key) => ({ key, coolUntil: 0 }));
  }
  return pool;
}

export function resetGroqKeyPool() {
  pool = null;
  nextIndex = 0;
}

export function getGroqKeyCount(): number {
  return getPool().length;
}

export function getGroqKeys(): string[] {
  return loadKeys();
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export function createGroqModel(apiKey: string, modelId = GROQ_MODELS[0] ?? "openai/gpt-oss-120b") {
  return createLovableAiGatewayProvider(apiKey)(modelId);
}

function isRateLimitError(msg: string): boolean {
  return /rate.?limit|429|quota|too many|tokens per|tpm|rpm/i.test(msg);
}

function isInvalidKeyError(msg: string): boolean {
  return /invalid.?api.?key|incorrect.?api.?key|401|unauthorized|authentication/i.test(msg);
}

function isModelNotFoundError(msg: string): boolean {
  return /model.*does not exist|model_not_found|404.*model|do not have access to it/i.test(msg);
}

function markCooldown(state: KeyState, reason: KeyState["reason"]) {
  const ms =
    reason === "rate_limit"
      ? RATE_LIMIT_COOLDOWN_MS
      : reason === "invalid"
        ? INVALID_KEY_COOLDOWN_MS
        : RATE_LIMIT_COOLDOWN_MS;
  state.coolUntil = Date.now() + ms;
  state.reason = reason;
  console.warn(
    `[groq-pool] chave …${state.key.slice(-6)} em cooldown (${reason}) por ${Math.round(ms / 1000)}s`,
  );
}

/**
 * Executa `fn(apiKey)` tentando as chaves em rodízio.
 * Se uma esgotar (rate limit) ou for inválida, passa para a próxima.
 */
export async function withGroqKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>,
): Promise<T> {
  const keys = getPool();
  if (keys.length === 0) {
    throw new Error(
      "Nenhuma GROQ_API_KEY configurada. Defina GROQ_API_KEYS=key1,key2,... (até 5) no .env ou nas Environment Variables do Vercel e faça Redeploy.",
    );
  }

  const now = Date.now();
  const start = nextIndex % keys.length;
  let lastError: Error | null = null;
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
          state.reason = undefined;
        }
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = err instanceof Error ? err : new Error(msg);

        // Modelo inexistente: não adianta trocar de chave — propaga na hora
        if (isModelNotFoundError(msg)) {
          throw lastError;
        }
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

  throw lastError ?? new Error("Todas as chaves Groq falharam (rate limit / inválidas). Aguarde ~1 min.");
}

/**
 * streamText/generateText com rodízio de chaves E fallback de modelos.
 * Tenta cada modelo da lista GROQ_MODELS até um funcionar.
 */
export async function withGroqModelFallback<T>(
  fn: (apiKey: string, modelId: string) => Promise<T>,
): Promise<T> {
  const models = GROQ_MODELS.length > 0 ? GROQ_MODELS : ["openai/gpt-oss-120b"];
  let lastError: Error | null = null;

  for (const modelId of models) {
    try {
      return await withGroqKeyRotation((apiKey) => fn(apiKey, modelId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(msg);
      if (isModelNotFoundError(msg)) {
        console.warn(`[groq-pool] modelo ${modelId} indisponível, tentando próximo…`);
        continue;
      }
      // rate limit / invalid já tentou todas as chaves para este modelo
      if (isRateLimitError(msg) || /Todas as chaves/i.test(msg)) {
        throw lastError;
      }
      continue;
    }
  }

  throw lastError ?? new Error(`Nenhum modelo Groq disponível. Tentados: ${models.join(", ")}`);
}
