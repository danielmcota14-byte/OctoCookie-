// Cliente da API do token (servidor bot-server). O navegador NUNCA decide nada: ele só pede e exibe.
import { auth } from "@/lib/firebase";

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
const BASE = (env?.VITE_BOT_24X7_URL || "/bot").replace(/\/$/, "");

export type TokenConfig = {
  ready: boolean;
  issues: string[];
  chainId: number;
  contract: string | null;
  treasury: string | null;
  minConfirmations: number;
  explorerUrl: string | null;
  token: { name: string; symbol: string; decimals: number } | null;
};
export type Feature = {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  priceTokens: string;
  durationDays: number | null;
  scope: "simulation" | "live";
};
export type Order = {
  id: string;
  featureId: string;
  featureName?: string;
  wallet?: string;
  treasury?: string;
  amountUnits?: string;
  amountTokens: string;
  status: "awaiting_payment" | "paid" | "expired";
  txHash: string | null;
  createdAt: number;
  expiresAt: number;
  paidAt: number | null;
};
export type Entitlement = {
  featureId: string;
  unlockedAt: number;
  expiresAt: number | null;
  active: boolean;
  txHash: string;
};
export type Reward = {
  id: string;
  kind: string;
  reason: string;
  amountTokens: string;
  recipient: string;
  status: string;
  txHash: string | null;
  createdAt: number;
};
export type Me = {
  wallet: { address: string; linkedAt: string } | null;
  balance: string | null;
  balanceFormatted: string | null;
  entitlements: Entitlement[];
  unlocked: Record<string, boolean>;
  orders: Order[];
  rewards: Reward[];
};
export type SubmitResult = {
  status: "confirmed" | "pending" | "rejected";
  motivo?: string;
  confirmations?: number;
};
export type Transfers = {
  items: {
    txHash: string;
    block: number;
    from: string;
    to: string;
    value: string;
    direction: "in" | "out";
  }[];
  warning?: string;
};

export type Transparency = {
  contrato: {
    endereco: string;
    chainId: number;
    verificado: boolean;
    avisos: string[];
    supply: string | null;
    bytecodeIdentico: boolean | null;
    owner: string | null;
    decimals: number | null;
  };
  pagamentos: {
    metodo: string;
    tesouraria: string;
    confirmacoesMinimas: number;
    totalRecebido: string | null;
    compras: number;
  };
  emissao: {
    politica: string;
    emissaoPeloServidor: boolean;
    totalEmitidoEmRecompensas: string | null;
    recompensas: number;
  };
  queima: { politica: string; totalQueimado: string };
  recompensas: { regras: string };
  administracao: { observacao: string };
};

/** Chave do navegador que guarda o hash de um pagamento enviado, para retomar a verificação se a página for fechada. */
export const pendingKey = (orderId: string) => `octo-token-tx:${orderId}`;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}, authed = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authed) {
    const u = auth.currentUser;
    if (!u) throw new ApiError("Entre na sua conta OctoCookie para continuar.", 401);
    headers.Authorization = `Bearer ${await u.getIdToken()}`;
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}/token${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Servidor do token indisponível. Tente novamente em instantes.", 0);
  }
  const body = (await res.json().catch(() => ({}))) as T & { erro?: string };
  // 202 (pendente) e 422 (rejeitada) carregam um SubmitResult válido: quem chama decide o que mostrar
  if (!res.ok && res.status !== 202 && res.status !== 422)
    throw new ApiError(body.erro || `Erro ${res.status}`, res.status);
  return body;
}

export const api = {
  config: () => request<TokenConfig>("/config"),
  catalog: () => request<{ features: Feature[] }>("/catalog"),
  transparency: () => request<Transparency>("/transparency"),
  me: () => request<Me>("/me", {}, true),
  transfers: () => request<Transfers>("/transfers", {}, true),
  nonce: (address: string) =>
    request<{ message: string }>(
      "/wallet/nonce",
      { method: "POST", body: JSON.stringify({ address }) },
      true,
    ),
  link: (message: string, signature: string) =>
    request<{ ok: true; address: string }>(
      "/wallet/link",
      { method: "POST", body: JSON.stringify({ message, signature }) },
      true,
    ),
  order: (featureId: string) =>
    request<{ order: Order }>(
      "/orders",
      { method: "POST", body: JSON.stringify({ featureId }) },
      true,
    ),
  submit: (orderId: string, txHash: string) =>
    request<SubmitResult>(
      `/orders/${orderId}/submit`,
      { method: "POST", body: JSON.stringify({ txHash }) },
      true,
    ),
};

// ---------- administração (o servidor só responde se a conta for admin; esconder a aba no navegador não protege nada) ----------
export type AdminFeature = Feature & { active: boolean };
export type AdminReward = Reward & {
  ref: string;
  uid: string | null;
  amountUnits: string;
  mintVia?: "wallet" | null;
  error?: string | null;
};
export type AdminUser = { uid: string; email: string | null; address: string; linkedAt: string };
export type MintCheck = {
  status: "confirmed" | "pending";
  motivo?: string;
  confirmations?: number;
};

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const u = auth.currentUser;
  if (!u) throw new ApiError("Entre com a conta de administrador.", 401);
  let res: Response;
  try {
    res = await fetch(`${BASE}/adm/token${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await u.getIdToken()}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Servidor indisponível.", 0);
  }
  const body = (await res.json().catch(() => ({}))) as T & { erro?: string };
  if (!res.ok) throw new ApiError(body.erro || `Erro ${res.status}`, res.status);
  return body;
}
const post = (b?: unknown) => ({ method: "POST", body: JSON.stringify(b ?? {}) });

export const adminApi = {
  status: () =>
    adminRequest<{
      ready: boolean;
      issues: string[];
      mint: { can: boolean; why?: string };
      info: { owner: string | null; decimals: number } | null;
      config: { chainId: number; contract: string; treasury: string; minConfirmations: number };
    }>("/status"),
  catalog: () => adminRequest<{ features: AdminFeature[] }>("/catalog"),
  saveFeature: (id: string, patch: Partial<AdminFeature>) =>
    adminRequest<{ feature: AdminFeature }>(`/catalog/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
  rewards: () => adminRequest<{ rewards: AdminReward[] }>("/rewards"),
  users: () => adminRequest<{ users: AdminUser[] }>("/users"),
  createReward: (b: {
    uid?: string;
    recipient?: string;
    kind: string;
    reason: string;
    ref: string;
    amountTokens: string;
  }) => adminRequest("/rewards", post(b)),
  claim: (id: string) => adminRequest(`/rewards/${id}/claim`, post()),
  release: (id: string) => adminRequest(`/rewards/${id}/release`, post()),
  approve: (id: string) => adminRequest(`/rewards/${id}/approve`, post()),
  reject: (id: string) => adminRequest(`/rewards/${id}/reject`, post()),
  mint: (id: string) => adminRequest(`/rewards/${id}/mint`, post({ confirm: true })),
  /** Registra o hash do mint feito pelo owner. O servidor confere na blockchain (200 = emitida, 202 = aguardando confirmações). */
  manual: (id: string, txHash: string) =>
    adminRequest<MintCheck>(`/rewards/${id}/manual`, post({ txHash })),
};
