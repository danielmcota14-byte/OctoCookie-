import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Cooldown após rate-limit (ms). Plano free Groq ~1 min. */
const RATE_LIMIT_COOLDOWN_MS = 65_000;
/** Cooldown curto para chave inválida (não fica tentando a mesma o tempo todo). */
const INVALID_KEY_COOLDOWN_MS = 30 * 60_000;

type KeyState = {
  key: string;
  /** timestamp até quando a chave está em cooldown */
  coolUntil: number;
  /** motivo do último cooldown */
  reason?: "rate_limit" | "invalid" | "error";
};

let pool: KeyState[] | null = null;
/** índice da próxima chave a tentar (round-robin) */
let nextIndex = 0;

/**
 * Carrega até 5 chaves a partir de:
 * - GROQ_API_KEYS=key1,key2,key3,key4,key5
 * - ou GROQ_API_KEY + GROQ_API_KEY_2 … GROQ_API_KEY_5
 * - ou GROQ_API_KEY_1 … GROQ_API_KEY_5
 */
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

/** Reinicia o pool (útil em testes ou após mudar env em runtime). */
export function resetGroqKeyPool() {
  pool = null;
  nextIndex = 0;
}

export function getGroqKeyCount(): number {
  return getPool().length;
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export function createGroqModel(apiKey: string, modelId = "openai/gpt-oss-120b") {
  return createLovableAiGatewayProvider(apiKey)(modelId);
}

function isRateLimitError(msg: string): boolean {
  return /rate.?limit|429|quota|too many|tokens per|tpm|rpm/i.test(msg);
}

function isInvalidKeyError(msg: string): boolean {
  return /invalid.?api.?key|incorrect.?api.?key|401|unauthorized|authentication/i.test(msg);
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
 * Só falha se todas as chaves falharem.
 */
export async function withGroqKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>,
): Promise<T> {
  const keys = getPool();
  if (keys.length === 0) {
    throw new Error(
      "Nenhuma GROQ_API_KEY configurada. Defina GROQ_API_KEYS=key1,key2,... (até 5) ou GROQ_API_KEY / GROQ_API_KEY_2 … no .env ou nas Environment Variables do Vercel.",
    );
  }

  const now = Date.now();
  const start = nextIndex % keys.length;
  let lastError: Error | null = null;
  let tried = 0;

  // 1ª passagem: só chaves fora de cooldown
  // 2ª passagem: se todas em cooldown, tenta mesmo assim (a mais antiga)
  for (const force of [false, true]) {
    for (let i = 0; i < keys.length; i++) {
      const idx = (start + i) % keys.length;
      const state = keys[idx];
      if (!force && state.coolUntil > now) continue;

      tried++;
      try {
        const result = await fn(state.key);
        // sucesso → próxima chamada começa na seguinte (rodízio)
        nextIndex = (idx + 1) % keys.length;
        if (state.coolUntil > 0) {
          state.coolUntil = 0;
          state.reason = undefined;
        }
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = err instanceof Error ? err : new Error(msg);

        if (isInvalidKeyError(msg)) {
          markCooldown(state, "invalid");
          continue;
        }
        if (isRateLimitError(msg)) {
          markCooldown(state, "rate_limit");
          continue;
        }
        // Outros erros: tenta a próxima chave também (rede/temporário)
        markCooldown(state, "error");
        continue;
      }
    }
    if (tried > 0 && !force) {
      continue;
    }
    break;
  }

  throw lastError ?? new Error("Todas as chaves Groq falharam (rate limit / inválidas). Aguarde ~1 min.");
}
