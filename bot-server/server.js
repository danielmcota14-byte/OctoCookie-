/**
 * OctoCookie Bot 24/7 — servidor (Render/VPS).
 * Abre o octocookie.html num Chromium sem tela e o deixa operando on-chain sozinho, com a carteira dedicada do usuário.
 *
 *   POST /247/hello   → chave pública ECDH de uso único (Diffie-Hellman)
 *   POST /247/pair    → recebe a chave da carteira cifrada, cria o cofre e DEVOLVE a chave AES-256 (K) ao usuário
 *   POST /247/arm     → recebe K (cifrada), abre o cofre só na memória e liga o bot
 *   POST /247/disarm  → para o bot e apaga a chave da memória
 *   POST /247/wipe    → disarm + apaga o cofre
 *   GET  /247/status  → estado completo (com token)
 * Todas as rotas /247 exigem  Authorization: Bearer <OWNER_TOKEN>.
 */
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ethers } from 'ethers';
import { newHello, openRequest, normalizePk, Vault } from './vault.js';
import { Runner } from './runner.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const FIELD_IDS = new Set(['networkSelect', 'tradePairSelect', 'stakePct', 'slPct', 'tpPct', 'maxTradesInput', 'securityLevel', 'riskLevel', 'usarLimDia']);
const HG_KEYS = { barra: 'number', auto: 'boolean', qmax: 'number', modo: 'string', lq: 'number', stopVivo: 'boolean', filtro: 'string', filtroN: 'number', trader: 'string' };

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const sameToken = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

function cleanFields(f) {
  const out = {};
  for (const [k, v] of Object.entries(f && typeof f === 'object' ? f : {})) {
    if (!FIELD_IDS.has(k)) continue;
    if (typeof v === 'boolean' || typeof v === 'number') out[k] = v; else if (typeof v === 'string' && v.length <= 40) out[k] = v;
  }
  return out;
}
function cleanHg(h) {
  if (!h || typeof h !== 'object') return null;
  const out = {};
  for (const [k, t] of Object.entries(HG_KEYS)) if (typeof h[k] === t) out[k] = h[k];
  return Object.keys(out).length ? out : null;
}

export const FEE_MSG_HEAD = 'OctoCookie — destino da taxa de serviço (2%)';
const ADSTERRA_BASE = 'https://api3.adsterratools.com/publisher';

export function createApp({ vault, runner, ownerToken, masterKey, adminToken = '', adsterraToken = '', fetchFn = fetch, origins = '*', logs = [], now = () => Date.now() }) {
  const app = express();
  app.disable('x-powered-by');
  // Atrás do proxy do Render: sem isto req.ip é sempre o IP do proxy e o limite de tentativas valeria para TODOS juntos (um estranho travaria o admin).
  app.set('trust proxy', 1);
  app.use(cors({ origin: origins === '*' ? true : origins.split(',').map((s) => s.trim()), allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(express.json({ limit: '64kb' }));

  const publicStatus = () => ({ ok: true, status: 'ok', running: runner.armed() && !!runner.snap?.running, armed: runner.armed(), symbol: 'ETHUSDT', price: runner.snap?.price || null, lastError: runner.lastError || null });
  app.get('/', (_q, r) => r.json(publicStatus()));
  app.get('/health', (_q, r) => r.json({ ok: true }));
  app.get('/status', (_q, r) => r.json(publicStatus()));

  // Destino da taxa de serviço: leitura pública (o site consulta ao abrir). Quem ESCREVE é só o admin (/adm).
  app.get('/fee-recipient', (_q, r) => { const f = vault.feeRecipient(); r.set('Cache-Control', 'no-store'); r.json({ recipient: f?.recipient || null, updatedAt: f?.updatedAt || null }); });

  // ---- /adm: token de ADMIN (diferente do OWNER_TOKEN, que o site publica em bot-config.js) ----
  const admHits = new Map();
  app.use('/adm', (req, res, next) => {
    if (!adminToken || adminToken.length < 24) return res.status(503).json({ erro: 'Servidor sem ADMIN_TOKEN (mín. 24 caracteres): painel adm desativado.' });
    const ip = req.ip, t = now(), arr = (admHits.get(ip) || []).filter((x) => t - x < 60_000); arr.push(t); admHits.set(ip, arr);
    if (arr.length > 40) return res.status(429).json({ erro: 'Muitas requisições. Aguarde um minuto.' });
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ') || !sameToken(h.slice(7), adminToken)) return res.status(401).json({ erro: 'Token de admin inválido.' });
    res.set('Cache-Control', 'no-store'); next();
  });
  const wrapA = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(400).json({ erro: e.message || 'erro' }); } };

  app.get('/adm/ping', (_q, r) => r.json({ ok: true, adsterra: !!adsterraToken, destinoTaxa: vault.feeRecipient()?.recipient || null }));

  // Define a carteira que recebe os 2%. Exige assinatura DA PRÓPRIA carteira (prova que você controla o endereço, evita erro de digitação).
  app.post('/adm/fee-recipient', wrapA(async (req, res) => {
    const { recipient, message, signature } = req.body || {};
    if (!ethers.isAddress(recipient)) throw new Error('Endereço inválido.');
    const addr = ethers.getAddress(recipient);
    const m = String(message || '').split('\n');
    if (m[0] !== FEE_MSG_HEAD || m[1] !== 'Carteira: ' + addr || !/^Emitido em: /.test(m[2] || '')) throw new Error('Mensagem assinada fora do formato esperado.');
    const quando = Date.parse(m[2].slice('Emitido em: '.length));
    if (!(Math.abs(now() - quando) <= 10 * 60_000)) throw new Error('Assinatura expirada (10 min). Assine de novo.');
    let quem; try { quem = ethers.verifyMessage(message, signature); } catch { throw new Error('Assinatura inválida.'); }
    if (quem !== addr) throw new Error('A assinatura não é desta carteira.');
    vault.setFeeRecipient({ recipient: addr, updatedAt: new Date(now()).toISOString(), signature });
    res.json({ ok: true, recipient: addr });
  }));

  // Estatísticas do Adsterra pelo servidor: o token fica em ADSTERRA_TOKEN (variável do Render), nunca no navegador.
  app.get('/adm/adsterra', wrapA(async (req, res) => {
    if (!adsterraToken) throw new Error('Servidor sem ADSTERRA_TOKEN.');
    const { endpoint = 'stats', start_date, finish_date, group_by = 'date', domain, placement } = req.query;
    let url;
    if (endpoint === 'domains') url = `${ADSTERRA_BASE}/domains.json`;
    else if (endpoint === 'placements') { if (!/^\d+$/.test(String(domain))) throw new Error('domain inválido.'); url = `${ADSTERRA_BASE}/domain/${domain}/placements.json`; }
    else if (endpoint === 'stats') {
      const ok = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d));
      if (!ok(start_date) || !ok(finish_date)) throw new Error('Datas devem ser AAAA-MM-DD.');
      if (!['date', 'placement', 'domain', 'country'].includes(group_by)) throw new Error('group_by inválido.');
      const q = new URLSearchParams({ start_date, finish_date }); q.append('group_by[]', group_by);
      if (domain !== undefined) { if (!/^\d+$/.test(String(domain))) throw new Error('domain inválido.'); q.set('domain', domain); }
      if (placement !== undefined) { if (!/^\d+$/.test(String(placement))) throw new Error('placement inválido.'); q.set('placement', placement); }
      url = `${ADSTERRA_BASE}/stats.json?${q}`;
    } else throw new Error('endpoint inválido.');
    const r = await fetchFn(url, { headers: { Accept: 'application/json', 'X-API-Key': adsterraToken }, signal: AbortSignal.timeout(15000) });
    const txt = await r.text(); let j; try { j = JSON.parse(txt); } catch { j = { bruto: txt.slice(0, 500) }; }
    res.status(r.ok ? 200 : 502).json(r.ok ? j : { erro: 'Adsterra respondeu HTTP ' + r.status, detalhe: j });
  }));

  // ---- /247: token do dono + limite de tentativas por IP ----
  const hits = new Map();
  app.use('/247', (req, res, next) => {
    if (!ownerToken || ownerToken.length < 24) return res.status(503).json({ erro: 'Servidor sem OWNER_TOKEN (mín. 24 caracteres): modo 24/7 desativado.' });
    const ip = req.ip, t = now(), arr = (hits.get(ip) || []).filter((x) => t - x < 60_000);
    arr.push(t); hits.set(ip, arr);
    if (arr.length > 60) return res.status(429).json({ erro: 'Muitas requisições. Aguarde um minuto.' });
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ') || !sameToken(h.slice(7), ownerToken)) return res.status(401).json({ erro: 'Token inválido.' });
    res.set('Cache-Control', 'no-store');
    next();
  });

  const wrap = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { res.status(400).json({ erro: e.message || 'erro' }); } };

  app.post('/247/hello', wrap(async (_q, res) => res.json(await newHello())));

  app.post('/247/pair', wrap(async (req, res) => {
    if (runner.armed()) throw new Error('Bot ligado: pare o 24/7 antes de trocar a carteira.');
    const { payload, reply } = await openRequest(req.body);
    const { pk, addr } = normalizePk(payload.pk);
    const k = await vault.create(pk, addr); // K aleatória; o servidor NÃO a guarda
    res.json(await reply({ addr, k }));
  }));

  app.post('/247/arm', wrap(async (req, res) => {
    const { payload, reply } = await openRequest(req.body);
    const { pk, addr } = await vault.open(payload.k);
    const cfg = { fields: cleanFields(payload.fields), hg: cleanHg(payload.hg), fee: payload.fee === true };
    if (payload.autoRearm === true) {
      if (!masterKey) throw new Error('Este servidor não tem SERVER_MASTER_KEY: "reiniciar sozinho" indisponível.');
      await vault.saveRearm(payload.k, masterKey);
    } else vault.clearRearm();
    vault.saveConfig(cfg);
    await runner.start(pk, cfg);
    res.json(await reply({ addr, armado: true }));
  }));

  app.post('/247/disarm', wrap(async (_q, res) => { await runner.stop(); vault.clearRearm(); res.json({ ok: true }); }));
  app.post('/247/wipe', wrap(async (_q, res) => { await runner.stop(); vault.wipe(); res.json({ ok: true }); }));

  app.get('/247/status', wrap(async (_q, res) => {
    const s = runner.snap || {};
    res.json({ pareado: vault.paired(), endereco: vault.address(), armado: runner.armed(), rodando: !!s.running, preco: s.price || null, saldo: s.balance ?? null,
      ordensHoje: s.trades ?? 0, pnlDia: s.pnlDia ?? 0, ultimoErro: runner.lastError || null, reiniciaSozinho: !!vault.read(vault.rearmFile), logs: logs.slice(0, 40) });
  }));

  return app;
}

async function main() {
  const dataDir = process.env.DATA_DIR || path.join(here, 'data');
  const appDir = process.env.APP_DIR || path.join(here, '../public/octocookie-app');
  const logs = [];
  const log = (m) => { const l = `${new Date().toISOString()} ${m}`; logs.unshift(l); if (logs.length > 200) logs.pop(); console.log(l); };
  const rpc = {}; if (process.env.RPC_URL_ETHEREUM) rpc.ethereum = process.env.RPC_URL_ETHEREUM;
  const vault = new Vault(dataDir);
  const runner = new Runner({ appDir, dataDir, rpc, log, feeSource: () => vault.feeRecipient()?.recipient || null });
  const masterKey = process.env.SERVER_MASTER_KEY || '';
  const app = createApp({ vault, runner, ownerToken: process.env.OWNER_TOKEN || '', masterKey, adminToken: process.env.ADMIN_TOKEN || '', adsterraToken: process.env.ADSTERRA_TOKEN || '', origins: process.env.ALLOWED_ORIGINS || '*', logs });
  const port = process.env.PORT || 3000;
  app.listen(port, () => log(`Servidor 24/7 na porta ${port}. Carteira pareada: ${vault.address() || 'nenhuma'}.`));
  if (!process.env.OWNER_TOKEN) log('⚠️ OWNER_TOKEN ausente: rotas /247 desativadas.');
  if (!process.env.ADMIN_TOKEN) log('ℹ️ ADMIN_TOKEN ausente: painel /adm.html desativado.');

  // reinício sozinho (só se o usuário optou por isso e o servidor tem SERVER_MASTER_KEY)
  const k = await vault.loadRearm(masterKey);
  if (k && vault.paired()) {
    try { const { pk } = await vault.open(k); await runner.start(pk, vault.loadConfig() || {}); log('🔓 Bot religado automaticamente após reinício.'); }
    catch (e) { log('Falha ao religar sozinho: ' + e.message); }
  } else if (vault.paired()) log('🔒 Carteira pareada, bot TRANCADO: aguardando a chave K (abra o site e a página reenvia).');

  const bye = async (s) => { log(s + ': parando o bot...'); try { await runner.stop(); } catch {} process.exit(0); };
  process.on('SIGINT', () => bye('SIGINT')); process.on('SIGTERM', () => bye('SIGTERM'));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exit(1); });
