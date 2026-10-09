/**
 * OctoCookie Bot 24/7 — Render Web Service
 * - Loop contínuo com preços reais (Binance)
 * - Estratégia estilo Holograma (tendência + stop móvel) em paper trading
 * - API HTTP para status / start / stop / logs
 * - Mantém o processo vivo no Render (health check em /)
 *
 * NÃO executa swaps on-chain com chave privada (educacional / paper).
 * Para operar de verdade: use a UI octocookie.html com MetaMask.
 */
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const SYMBOL = process.env.BOT_SYMBOL || 'ETHUSDT';
const TICK_MS = Number(process.env.BOT_TICK_MS || 10000); // 10s
const START_BALANCE = Number(process.env.BOT_START_BALANCE || 1000); // USDT paper

const app = express();
app.use(cors());
app.use(express.json());

// ─── Estado do bot ─────────────────────────────────────────
const state = {
  running: true,
  symbol: SYMBOL,
  price: 0,
  priceHistory: [],
  position: 0, // 0 = cash (USDT), 1 = long asset
  entryPrice: 0,
  balance: START_BALANCE,
  equity: START_BALANCE,
  peakEquity: START_BALANCE,
  trades: [],
  wins: 0,
  losses: 0,
  signal: 0,
  lastAction: 'init',
  lastError: null,
  startedAt: Date.now(),
  lastTickAt: null,
  logs: [],
};

function log(msg, level = 'info') {
  const entry = { ts: Date.now(), level, msg };
  state.logs.unshift(entry);
  if (state.logs.length > 200) state.logs.pop();
  const tag = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`[${new Date().toISOString()}] ${tag} ${msg}`);
}

// ─── Preço Binance ─────────────────────────────────────────
async function fetchPrice() {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${state.symbol}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
  const data = await res.json();
  const p = Number(data.price);
  if (!(p > 0)) throw new Error('Preço inválido');
  return p;
}

async function fetchKlines(limit = 50) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${state.symbol}&interval=1h&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Klines HTTP ${res.status}`);
  const data = await res.json();
  return data.map((k) => Number(k[4])); // close
}

// ─── Indicadores simples (Holograma-lite) ──────────────────
function sma(arr, n) {
  if (arr.length < n) return null;
  const slice = arr.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

function rsi(arr, n = 14) {
  if (arr.length < n + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = arr.length - n; i < arr.length; i++) {
    const d = arr[i] - arr[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function trendSignal(closes, price) {
  const s20 = sma(closes, 20);
  const s50 = sma(closes, Math.min(50, closes.length));
  const r = rsi(closes, 14);
  let score = 0;
  if (s20 && price > s20) score += 0.35;
  if (s50 && price > s50) score += 0.25;
  if (r < 30) score += 0.25;
  else if (r > 70) score -= 0.25;
  else if (r < 50) score += 0.1;
  // momentum curto
  if (closes.length >= 5) {
    const mom = (price - closes[closes.length - 5]) / closes[closes.length - 5];
    score += Math.max(-0.2, Math.min(0.2, mom * 5));
  }
  return { score, rsi: r, sma20: s20, sma50: s50 };
}

// ─── Paper trade ───────────────────────────────────────────
function openLong(price) {
  if (state.position === 1) return;
  state.position = 1;
  state.entryPrice = price;
  state.lastAction = 'BUY';
  log(`BUY paper @ ${price.toFixed(4)} | equity $${state.equity.toFixed(2)}`, 'info');
}

function closeLong(price, reason) {
  if (state.position === 0) return;
  const pnlPct = ((price - state.entryPrice) / state.entryPrice) * 100;
  const pnlUsd = state.balance * (pnlPct / 100);
  state.balance += pnlUsd;
  state.equity = state.balance;
  if (state.equity > state.peakEquity) state.peakEquity = state.equity;
  const trade = {
    ts: Date.now(),
    side: 'SELL',
    entry: state.entryPrice,
    exit: price,
    pnlPct: Number(pnlPct.toFixed(3)),
    pnlUsd: Number(pnlUsd.toFixed(4)),
    reason,
  };
  state.trades.unshift(trade);
  if (state.trades.length > 100) state.trades.pop();
  if (pnlPct >= 0) state.wins++;
  else state.losses++;
  state.position = 0;
  state.entryPrice = 0;
  state.lastAction = `SELL (${reason})`;
  log(`SELL paper @ ${price.toFixed(4)} | PnL ${pnlPct.toFixed(2)}% ($${pnlUsd.toFixed(2)}) · ${reason}`, pnlPct >= 0 ? 'info' : 'warn');
}

// ─── Tick principal ────────────────────────────────────────
let closesCache = [];

async function tick() {
  if (!state.running) return;
  try {
    const price = await fetchPrice();
    state.price = price;
    state.priceHistory.push(price);
    if (state.priceHistory.length > 120) state.priceHistory.shift();

    // atualiza velas a cada ~6 ticks
    if (closesCache.length < 20 || Math.random() < 0.2) {
      closesCache = await fetchKlines(60);
    }
    const closes = closesCache.concat([price]);
    const { score, rsi: r } = trendSignal(closes, price);
    state.signal = Number(score.toFixed(4));

    // Stop móvel: -3% do pico da posição
    if (state.position === 1) {
      const drop = ((price - state.entryPrice) / state.entryPrice) * 100;
      if (drop <= -3) {
        closeLong(price, 'stop-loss -3%');
      } else if (drop >= 8) {
        closeLong(price, 'take-profit +8%');
      } else if (score < -0.15) {
        closeLong(price, 'sinal baixista');
      }
    } else {
      // Entrada
      if (score >= 0.35 && r < 65) {
        openLong(price);
      }
    }

    // marca equity
    if (state.position === 1) {
      const unreal = ((price - state.entryPrice) / state.entryPrice) * state.balance;
      state.equity = state.balance + unreal;
    } else {
      state.equity = state.balance;
    }

    state.lastTickAt = Date.now();
    state.lastError = null;
  } catch (e) {
    state.lastError = e.message || String(e);
    log(`Tick error: ${state.lastError}`, 'error');
  }
}

// ─── Rotas ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service: 'octocookie-bot-24x7',
    status: state.running ? 'online' : 'paused',
    symbol: state.symbol,
    price: state.price,
    position: state.position === 1 ? 'LONG' : 'CASH',
    equity: Number(state.equity.toFixed(4)),
    signal: state.signal,
    lastAction: state.lastAction,
    lastTickAt: state.lastTickAt,
    uptimeSec: Math.floor((Date.now() - state.startedAt) / 1000),
    wins: state.wins,
    losses: state.losses,
    lastError: state.lastError,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, running: state.running });
});

app.get('/status', (req, res) => {
  res.json({
    ...state,
    logs: state.logs.slice(0, 50),
    trades: state.trades.slice(0, 30),
  });
});

app.post('/start', (req, res) => {
  state.running = true;
  log('Bot START via API');
  res.json({ ok: true, running: true });
});

app.post('/stop', (req, res) => {
  state.running = false;
  log('Bot STOP via API', 'warn');
  res.json({ ok: true, running: false });
});

app.post('/reset', (req, res) => {
  state.balance = START_BALANCE;
  state.equity = START_BALANCE;
  state.peakEquity = START_BALANCE;
  state.position = 0;
  state.entryPrice = 0;
  state.trades = [];
  state.wins = 0;
  state.losses = 0;
  log('Bot RESET paper balance');
  res.json({ ok: true, balance: state.balance });
});

// ─── Loop 24/7 ─────────────────────────────────────────────
log(`Iniciando bot 24/7 · ${SYMBOL} · tick ${TICK_MS}ms · paper $${START_BALANCE}`);
tick();
setInterval(tick, TICK_MS);

app.listen(PORT, '0.0.0.0', () => {
  log(`HTTP listening on :${PORT}`);
});
