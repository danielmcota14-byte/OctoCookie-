// netlify/functions/api.js
// ═══════════════════════════════════════════════════════════════════════════════
//  OCTOCOOKIE — Backend Unificado
//  Combina:
//    • server.js  → MoonPay webhook + rota /health legada
//    • backend.js → Trader Bot API (data, command, health, history, dashboard)
//  Usa: Express + serverless-http + @netlify/blobs
// ═══════════════════════════════════════════════════════════════════════════════

const express     = require('express');
const serverless  = require('serverless-http');
const crypto      = require('crypto');
const { getStore } = require('@netlify/blobs');

const app = express();

// ─── Variáveis de ambiente ────────────────────────────────────────────────────
const MOONPAY_PUBLIC_KEY      = process.env.MOONPAY_PUBLIC_KEY      || '';
const MOONPAY_WIDGET_URL      = process.env.MOONPAY_WIDGET_URL      || 'https://buy-sandbox.moonpay.com';
const MOONPAY_SELL_WIDGET_URL = process.env.MOONPAY_SELL_WIDGET_URL ||
  (MOONPAY_WIDGET_URL.includes('sandbox') ? 'https://sell-sandbox.moonpay.com' : 'https://sell.moonpay.com');
const MOONPAY_WEBHOOK_SECRET  = process.env.MOONPAY_WEBHOOK_KEY     || process.env.MOONPAY_WEBHOOK_SECRET || '';

if (!MOONPAY_PUBLIC_KEY) console.warn('[OCTOCOOKIE] ⚠️  MOONPAY_PUBLIC_KEY não definida.');

// ─── Constantes do Bot API ────────────────────────────────────────────────────
const MAX_SNAPSHOTS  = 5000;
const MAX_QUEUE      = 50;
const MAX_LATENCY    = 200;
const HEAP_LIMIT_PCT = 0.80;
const STALE_DATA_MS  = 60000;

// Nomes das stores (Netlify Blobs)
const S_SNAPSHOTS   = 'snapshots';
const S_LATEST      = 'latest';
const S_QUEUE       = 'commandQueue';
const S_STATS       = 'stats';
const S_CIRCUIT     = 'circuitBreaker';
const S_LATENCY_LOG = 'latencyLog';
const S_LAST_DATA   = 'lastDataAt';

// ─── Helpers Netlify Blobs ────────────────────────────────────────────────────
async function loadArray(storeName, maxItems = null) {
  const store = getStore(storeName);
  let arr = [];
  try {
    const raw = await store.get('data');
    arr = raw ? JSON.parse(raw) : [];
  } catch (_) {}
  if (maxItems && arr.length > maxItems) arr = arr.slice(-maxItems);
  return arr;
}

async function saveArray(storeName, arr, maxItems = null) {
  if (maxItems && arr.length > maxItems) arr = arr.slice(-maxItems);
  await getStore(storeName).set('data', JSON.stringify(arr));
}

async function pushCapped(storeName, item, max) {
  const arr = await loadArray(storeName, max);
  arr.push(item);
  await saveArray(storeName, arr, max);
}

async function loadObject(storeName) {
  try {
    const raw = await getStore(storeName).get('data');
    return raw ? JSON.parse(raw) : {};
  } catch (_) { return {}; }
}

async function saveObject(storeName, obj) {
  await getStore(storeName).set('data', JSON.stringify(obj));
}

function now() { return new Date().toISOString(); }

// ─── Circuit Breaker (Blobs) ──────────────────────────────────────────────────
async function recordCircuitFailure(success) {
  const cb = await loadObject(S_CIRCUIT);
  cb.failures  = cb.failures  || 0;
  cb.state     = cb.state     || 'CLOSED';
  cb.threshold = cb.threshold || 5;
  cb.timeout   = cb.timeout   || 30000;
  cb.openedAt  = cb.openedAt  || 0;

  if (success) {
    cb.failures = 0;
    if (cb.state !== 'CLOSED') { console.log('[CB] ✅ Circuito FECHADO'); cb.state = 'CLOSED'; }
  } else {
    cb.failures++;
    if (cb.failures >= cb.threshold && cb.state === 'CLOSED') {
      cb.state = 'OPEN'; cb.openedAt = Date.now();
      console.error(`[CB] ⚡ Circuito ABERTO após ${cb.failures} falhas`);
      const stats = await loadObject(S_STATS);
      stats.watchdog_alerts = (stats.watchdog_alerts || 0) + 1;
      await saveObject(S_STATS, stats);
    }
  }
  await saveObject(S_CIRCUIT, cb);
  return cb;
}

async function canCircuitRequest() {
  const cb = await loadObject(S_CIRCUIT);
  if ((cb.state || 'CLOSED') === 'CLOSED') return true;
  if (cb.state === 'OPEN') {
    if (Date.now() - (cb.openedAt || 0) >= (cb.timeout || 30000)) {
      cb.state = 'HALF_OPEN';
      await saveObject(S_CIRCUIT, cb);
      return true;
    }
    return false;
  }
  return true; // HALF_OPEN
}

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, moonpay-signature');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Atualiza contador de requests + start_time
app.use(async (req, res, next) => {
  try {
    const stats = await loadObject(S_STATS);
    stats.total_requests = (stats.total_requests || 0) + 1;
    if (!stats.start_time) stats.start_time = now();
    await saveObject(S_STATS, stats);
  } catch (_) {}
  next();
});

// ─── Circuit Breaker middleware ───────────────────────────────────────────────
app.use('/api/', async (req, res, next) => {
  // Sempre deixar /api/repair passar
  if (req.path === '/repair') return next();
  const ok = await canCircuitRequest();
  if (!ok) {
    const cb = await loadObject(S_CIRCUIT);
    const retryAfter = (cb.timeout || 30000) - (Date.now() - (cb.openedAt || 0));
    return res.status(503).json({
      ok: false,
      error: 'Circuito aberto — servidor em modo de proteção.',
      retry_after_ms: retryAfter,
    });
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ROTAS — MOONPAY (herdadas do server.js)
// ═══════════════════════════════════════════════════════════════════════════════

// Health check legado (server.js usava GET /health sem /api/)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'netlify-serverless',
    timestamp: now(),
  });
});

// MoonPay — gerar URL assinada
app.get('/api/moonpay/url', (req, res) => {
  const { amount = '100.00', walletAddress = '', currencyCode = 'eth' } = req.query;
  if (!MOONPAY_PUBLIC_KEY) return res.status(500).json({ error: 'MOONPAY_PUBLIC_KEY não configurada' });

  const params = new URLSearchParams({
    apiKey:       MOONPAY_PUBLIC_KEY,
    currencyCode,
    walletAddress,
    baseCurrencyAmount: amount,
  });
  const url = `${MOONPAY_WIDGET_URL}?${params.toString()}`;
  res.json({ url });
});

// MoonPay — redirecionar direto para o widget
app.get('/api/moonpay/open', (req, res) => {
  const { amount = '100.00', walletAddress = '', currencyCode = 'eth' } = req.query;
  if (!MOONPAY_PUBLIC_KEY) return res.status(500).json({ error: 'MOONPAY_PUBLIC_KEY não configurada' });

  const params = new URLSearchParams({
    apiKey:       MOONPAY_PUBLIC_KEY,
    currencyCode,
    walletAddress,
    baseCurrencyAmount: amount,
  });
  res.redirect(`${MOONPAY_WIDGET_URL}?${params.toString()}`);
});

// MoonPay — config pública (chave + URL do widget)
app.get('/api/moonpay/config', (req, res) => {
  res.json({
    publicKey:  MOONPAY_PUBLIC_KEY,
    widgetUrl:  MOONPAY_WIDGET_URL,
    sellWidgetUrl: MOONPAY_SELL_WIDGET_URL,
    configured: !!MOONPAY_PUBLIC_KEY,
  });
});

// MoonPay — gerar URL de VENDA (off-ramp). O payout em PIX é escolhido
// pelo próprio usuário dentro do widget do MoonPay quando quoteCurrencyCode=brl
// (PIX é o método de recebimento padrão do MoonPay para reais no Brasil).
app.get('/api/moonpay/sell-url', (req, res) => {
  const { amount = '', baseCurrencyCode = 'eth', quoteCurrencyCode = 'brl' } = req.query;
  if (!MOONPAY_PUBLIC_KEY) return res.status(500).json({ error: 'MOONPAY_PUBLIC_KEY não configurada' });

  const params = new URLSearchParams({
    apiKey: MOONPAY_PUBLIC_KEY,
    baseCurrencyCode,
    quoteCurrencyCode,
  });
  if (amount) params.set('baseCurrencyAmount', amount);

  const url = `${MOONPAY_SELL_WIDGET_URL}?${params.toString()}`;
  res.json({ url });
});

// MoonPay — webhook
app.post('/api/moonpay-webhook', (req, res) => {
  const signature = req.headers['moonpay-signature'];
  console.log('[MoonPay] Webhook recebido', { sig: signature?.substring(0, 20) });

  if (!signature) return res.status(400).json({ error: 'Missing signature' });

  if (MOONPAY_WEBHOOK_SECRET && req.rawBody) {
    const expected = crypto
      .createHmac('sha256', MOONPAY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest('base64');
    if (signature !== expected) {
      console.error('[MoonPay] ❌ Assinatura inválida');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    console.log('[MoonPay] ✅ Assinatura verificada');
  }

  const event = req.body;
  console.log('[MoonPay] Evento:', event.type, event.data?.id);
  res.json({ received: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ROTAS — TRADER BOT API (herdadas do backend.js)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/data — recebe snapshot do bot (analize.py)
app.post('/api/data', async (req, res) => {
  const t0 = Date.now();
  try {
    const body = { ...req.body, _received_at: now() };
    await saveObject(S_LATEST, body);
    await pushCapped(S_SNAPSHOTS, body, MAX_SNAPSHOTS);
    await saveObject(S_LAST_DATA, { ts: Date.now() });
    await recordCircuitFailure(true);
    const count = (await loadArray(S_SNAPSHOTS)).length;
    await _logLatency(t0);
    res.json({ ok: true, stored: count });
  } catch (err) {
    await recordCircuitFailure(false);
    console.error('[POST /api/data]', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
});

// POST /api/command — enfileira CALL ou PUT do analize.py
app.post('/api/command', async (req, res) => {
  const t0 = Date.now();
  try {
    const body = req.body;
    if (!body.action) return res.status(400).json({ ok: false, error: 'Campo action obrigatório' });
    body._queued_at = now();
    await pushCapped(S_QUEUE, body, MAX_QUEUE);

    const stats = await loadObject(S_STATS);
    stats.total_commands = (stats.total_commands || 0) + 1;
    if (body.action === 'CALL') stats.calls_sent = (stats.calls_sent || 0) + 1;
    if (body.action === 'PUT')  stats.puts_sent  = (stats.puts_sent  || 0) + 1;
    stats.last_signal = body.action === 'CALL' ? 'COMPRAR (CALL)' : body.action === 'PUT' ? 'VENDER (PUT)' : (stats.last_signal || 'AGUARDAR');
    stats.last_score  = body.score || 0;
    await saveObject(S_STATS, stats);

    const queueLen = (await loadArray(S_QUEUE)).length;
    await _logLatency(t0);
    res.json({ ok: true, queued: queueLen });
  } catch (err) {
    await recordCircuitFailure(false);
    res.status(400).json({ ok: false, error: err.message });
  }
});

// GET /api/command — bot.html busca próximo CALL/PUT
app.get('/api/command', async (req, res) => {
  const t0 = Date.now();
  try {
    const queue = await loadArray(S_QUEUE);
    if (queue.length) {
      const cmd = queue.shift();
      await saveArray(S_QUEUE, queue, MAX_QUEUE);
      await _logLatency(t0);
      return res.json({ ok: true, command: cmd });
    }
    await _logLatency(t0);
    res.json({ ok: true, command: null });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// GET /api/health — status completo
app.get('/api/health', async (req, res) => {
  try {
    const lats    = (await loadArray(S_LATENCY_LOG)).map(l => l.ms);
    const avg     = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
    const max     = lats.length ? Math.max(...lats) : 0;
    const mem     = process.memoryUsage();
    const ld      = await loadObject(S_LAST_DATA);
    const stale   = ld.ts ? (Date.now() - ld.ts) : null;
    const stats   = await loadObject(S_STATS);
    const cb      = await loadObject(S_CIRCUIT);

    res.json({
      status:           'online',
      snapshots:        (await loadArray(S_SNAPSHOTS)).length,
      pending_commands: (await loadArray(S_QUEUE)).length,
      time:             now(),
      latency_avg_ms:   +avg.toFixed(2),
      latency_max_ms:   +max.toFixed(2),
      uptime_since:     stats.start_time || now(),
      circuit_breaker:  cb.state || 'CLOSED',
      heap_used_pct:    +((mem.heapUsed / mem.heapTotal) * 100).toFixed(1),
      data_stale_ms:    stale,
      data_fresh:       stale !== null ? stale < STALE_DATA_MS : null,
      auto_cleanups:    stats.auto_cleanups   || 0,
      watchdog_alerts:  stats.watchdog_alerts || 0,
      moonpay_ready:    !!MOONPAY_PUBLIC_KEY,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /api/latest — último snapshot
app.get('/api/latest', async (req, res) => {
  try {
    const latest = await loadObject(S_LATEST);
    res.json(Object.keys(latest).length ? latest : { error: 'sem dados ainda' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history — histórico de snapshots
app.get('/api/history', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '200', 10), 2000);
    const snaps = await loadArray(S_SNAPSHOTS);
    res.json(snaps.slice(-limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard — dados completos para dashboard_analisador.html
app.get('/api/dashboard', async (req, res) => {
  try {
    const lats   = (await loadArray(S_LATENCY_LOG)).map(l => l.ms);
    const avg    = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
    const mx     = lats.length ? Math.max(...lats) : 0;
    const mem    = process.memoryUsage();
    const ld     = await loadObject(S_LAST_DATA);
    const stale  = ld.ts ? (Date.now() - ld.ts) : null;
    const stats  = await loadObject(S_STATS);
    const cb     = await loadObject(S_CIRCUIT);
    const latest = await loadObject(S_LATEST);
    const queue  = await loadArray(S_QUEUE);
    const snaps  = await loadArray(S_SNAPSHOTS);

    res.json({
      api_status:       'online',
      snapshots:        snaps.length,
      pending_commands: queue.length,
      stats: {
        total_commands:  stats.total_commands  || 0,
        calls_sent:      stats.calls_sent      || 0,
        puts_sent:       stats.puts_sent       || 0,
        start_time:      stats.start_time      || now(),
        last_signal:     stats.last_signal     || 'AGUARDAR',
        last_score:      stats.last_score      || 0,
        auto_cleanups:   stats.auto_cleanups   || 0,
        watchdog_alerts: stats.watchdog_alerts || 0,
        total_requests:  stats.total_requests  || 0,
        errors_caught:   stats.errors_caught   || 0,
      },
      latency: {
        avg_ms:  +avg.toFixed(2),
        max_ms:  +mx.toFixed(2),
        last_ms: lats.length ? lats[lats.length - 1] : 0,
        history: (await loadArray(S_LATENCY_LOG)).slice(-50),
      },
      latest_data:     latest,
      uptime_since:    stats.start_time || now(),
      circuit_breaker: cb.state || 'CLOSED',
      heap_used_pct:   +((mem.heapUsed / mem.heapTotal) * 100).toFixed(1),
      data_stale_ms:   stale,
      data_fresh:      stale !== null ? stale < STALE_DATA_MS : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/repair — reseta circuit breaker
app.post('/api/repair', async (req, res) => {
  try {
    await saveObject(S_CIRCUIT, { failures: 0, state: 'CLOSED', threshold: 5, timeout: 30000, openedAt: 0 });
    await saveArray(S_QUEUE, [], MAX_QUEUE);
    const stats = await loadObject(S_STATS);
    stats.watchdog_alerts = 0;
    await saveObject(S_STATS, stats);
    console.log('[REPAIR] ♻️ Auto-reparo executado');
    res.json({ ok: true, repaired: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /bot/reset-restarts — legado do server.js
app.post('/bot/reset-restarts', (req, res) => {
  res.json({ ok: true, restartCount: 0, autoStartEnabled: true, note: 'Netlify serverless mode' });
});

// ─── Helper: registra latência ────────────────────────────────────────────────
async function _logLatency(t0) {
  try {
    const ms = Date.now() - t0;
    await pushCapped(S_LATENCY_LOG, { ms: +ms.toFixed(2), ts: now() }, MAX_LATENCY);

    // Watchdog: heap alto → limpa snapshots
    const mem = process.memoryUsage();
    if (mem.heapUsed / mem.heapTotal > HEAP_LIMIT_PCT) {
      const snaps = await loadArray(S_SNAPSHOTS);
      if (snaps.length > 500) {
        await saveArray(S_SNAPSHOTS, snaps.slice(-500), MAX_SNAPSHOTS);
        const st = await loadObject(S_STATS);
        st.auto_cleanups = (st.auto_cleanups || 0) + 1;
        await saveObject(S_STATS, st);
        console.warn('[WD] ⚠️ Heap alto — limpei snapshots antigos');
      }
    }

    // Watchdog: dados stale
    const ld = await loadObject(S_LAST_DATA);
    if (ld.ts && (Date.now() - ld.ts) > STALE_DATA_MS) {
      console.warn('[WD] ⚠️ Sem dados do bot há mais de 60s');
      const st = await loadObject(S_STATS);
      st.watchdog_alerts = (st.watchdog_alerts || 0) + 1;
      await saveObject(S_STATS, st);
    }
  } catch (_) {}
}

// ─── Export para Netlify Function ─────────────────────────────────────────────
exports.handler = serverless(app);