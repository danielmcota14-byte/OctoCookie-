// Verificação de ID token do Firebase Auth (sem firebase-admin): assinatura RS256 contra as chaves públicas do Google,
// emissor/público/validade conferidos. Quem decide quem é ADMIN é este servidor (ADMIN_UIDS / ADMIN_EMAILS), não o navegador.
import crypto from 'node:crypto';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const b64u = (s) => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export class AuthError extends Error { constructor(msg, status = 401) { super(msg); this.status = status; } }

export function createFirebaseVerifier({ projectId, fetchFn = fetch, now = () => Date.now() }) {
  let keys = new Map(), expira = 0, ultimaBusca = 0;
  async function carregarChaves(forcar) {
    if (!forcar && now() < expira && keys.size) return;
    if (forcar && now() - ultimaBusca < 60_000 && keys.size) return; // no máx. 1 busca forçada por minuto
    ultimaBusca = now();
    const r = await fetchFn(JWKS_URL, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new AuthError('Não consegui obter as chaves do Google (HTTP ' + r.status + ').', 503);
    const j = await r.json(), m = /max-age=(\d+)/.exec(r.headers?.get?.('cache-control') || '');
    keys = new Map((j.keys || []).map((k) => [k.kid, crypto.createPublicKey({ key: k, format: 'jwk' })]));
    expira = now() + (m ? Number(m[1]) : 3600) * 1000;
  }
  /** Devolve { uid, email, emailVerified } ou lança AuthError(401). */
  return async function verify(token) {
    if (!projectId) throw new AuthError('Servidor sem FIREBASE_PROJECT_ID.', 503);
    const p = String(token || '').split('.');
    if (p.length !== 3) throw new AuthError('Token inválido.');
    let header, payload;
    try { header = JSON.parse(b64u(p[0]).toString()); payload = JSON.parse(b64u(p[1]).toString()); } catch { throw new AuthError('Token ilegível.'); }
    if (header.alg !== 'RS256' || !header.kid) throw new AuthError('Algoritmo não aceito.');
    await carregarChaves(false);
    if (!keys.has(header.kid)) await carregarChaves(true);
    const key = keys.get(header.kid);
    if (!key) throw new AuthError('Chave de assinatura desconhecida.');
    if (!crypto.verify('RSA-SHA256', Buffer.from(p[0] + '.' + p[1]), key, b64u(p[2]))) throw new AuthError('Assinatura inválida.');
    const t = Math.floor(now() / 1000);
    if (payload.aud !== projectId || payload.iss !== 'https://securetoken.google.com/' + projectId) throw new AuthError('Token de outro projeto.');
    if (!(payload.exp > t - 30)) throw new AuthError('Token expirado. Entre de novo.');
    if (payload.iat > t + 60 || (payload.auth_time && payload.auth_time > t + 60)) throw new AuthError('Token com data inválida.');
    if (typeof payload.sub !== 'string' || !payload.sub) throw new AuthError('Token sem usuário.');
    return { uid: payload.sub, email: payload.email ? String(payload.email).toLowerCase() : null, emailVerified: payload.email_verified === true };
  };
}

/** Lista de admins: UID (recomendado) ou e-mail VERIFICADO (conta não verificada pode ser criada por qualquer um com o e-mail alheio). */
export function isAdmin(user, { uids = [], emails = [] }) {
  if (uids.includes(user.uid)) return true;
  return !!(user.email && user.emailVerified && emails.includes(user.email));
}
export const parseList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
