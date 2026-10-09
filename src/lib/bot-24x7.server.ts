/**
 * Bot 24/7 paper trading — roda no mesmo processo do site (Render).
 * Singleton: inicia o loop na primeira importação no servidor.
 */

const SYMBOL = process.env.BOT_SYMBOL || "ETHUSDT";
const TICK_MS = Number(process.env.BOT_TICK_MS || 10000);
const START_BALANCE = Number(process.env.BOT_START_BALANCE || 1000);

type LogEntry = { ts: number; level: string; msg: string };
type Trade = {
  ts: number;
  side: string;
  entry: number;
  exit: number;
  pnlPct: number;
  pnlUsd: number;
  reason: string;
};

type BotState = {
  running: boolean;
  symbol: string;
  price: number;
  position: number;
  entryPrice: number;
  balance: number;
  equity: number;
  peakEquity: number;
  trades: Trade[];
  wins: number;
  losses: number;
  signal: number;
  lastAction: string;
  lastError: string | null;
  startedAt: number;
  lastTickAt: number | null;
  logs: LogEntry[];
  status: "online" | "paused";
};

const g = globalThis as unknown as { __octoBot?: BotState; __octoBotTimer?: ReturnType<typeof setInterval> };

function state(): BotState {
  if (!g.__octoBot) {
    g.__octoBot = {
      running: true,
      symbol: SYMBOL,
      price: 0,
      position: 0,
      entryPrice: 0,
      balance: START_BALANCE,
      equity: START_BALANCE,
      peakEquity: START_BALANCE,
      trades: [],
      wins: 0,
      losses: 0,
      signal: 0,
      lastAction: "init",
      lastError: null,
      startedAt: Date.now(),
      lastTickAt: null,
      logs: [],
      status: "online",
    };
  }
  return g.__octoBot;
}

function log(msg: string, level = "info") {
  const s = state();
  s.logs.unshift({ ts: Date.now(), level, msg });
  if (s.logs.length > 200) s.logs.pop();
  console.log(`[bot24] ${msg}`);
}

function sma(arr: number[], n: number) {
  if (arr.length < n) return null;
  const slice = arr.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

function rsi(arr: number[], n = 14) {
  if (arr.length < n + 1) return 50;
  let gains = 0,
    losses = 0;
  for (let i = arr.length - n; i < arr.length; i++) {
    const d = arr[i] - arr[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  if (losses === 0) return 100;
  return 100 - 100 / (1 + gains / losses);
}

function trendSignal(closes: number[], price: number) {
  const s20 = sma(closes, 20);
  const s50 = sma(closes, Math.min(50, closes.length));
  const r = rsi(closes, 14);
  let score = 0;
  if (s20 && price > s20) score += 0.35;
  if (s50 && price > s50) score += 0.25;
  if (r < 30) score += 0.25;
  else if (r > 70) score -= 0.25;
  else if (r < 50) score += 0.1;
  if (closes.length >= 5) {
    const mom = (price - closes[closes.length - 5]) / closes[closes.length - 5];
    score += Math.max(-0.2, Math.min(0.2, mom * 5));
  }
  return { score, rsi: r };
}

let closesCache: number[] = [];

async function fetchPrice() {
  const s = state();
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${s.symbol}`
  );
  if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
  const data = (await res.json()) as { price: string };
  const p = Number(data.price);
  if (!(p > 0)) throw new Error("Preço inválido");
  return p;
}

async function fetchKlines() {
  const s = state();
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${s.symbol}&interval=1h&limit=60`
  );
  if (!res.ok) throw new Error(`Klines HTTP ${res.status}`);
  const data = (await res.json()) as unknown[][];
  return data.map((k) => Number(k[4]));
}

function openLong(price: number) {
  const s = state();
  if (s.position === 1) return;
  s.position = 1;
  s.entryPrice = price;
  s.lastAction = "BUY";
  log(`BUY paper @ ${price.toFixed(4)} | equity $${s.equity.toFixed(2)}`);
}

function closeLong(price: number, reason: string) {
  const s = state();
  if (s.position === 0) return;
  const pnlPct = ((price - s.entryPrice) / s.entryPrice) * 100;
  const pnlUsd = s.balance * (pnlPct / 100);
  s.balance += pnlUsd;
  s.equity = s.balance;
  if (s.equity > s.peakEquity) s.peakEquity = s.equity;
  s.trades.unshift({
    ts: Date.now(),
    side: "SELL",
    entry: s.entryPrice,
    exit: price,
    pnlPct: Number(pnlPct.toFixed(3)),
    pnlUsd: Number(pnlUsd.toFixed(4)),
    reason,
  });
  if (s.trades.length > 100) s.trades.pop();
  if (pnlPct >= 0) s.wins++;
  else s.losses++;
  s.position = 0;
  s.entryPrice = 0;
  s.lastAction = `SELL (${reason})`;
  log(`SELL @ ${price.toFixed(4)} | ${pnlPct.toFixed(2)}% · ${reason}`);
}

async function tick() {
  const s = state();
  if (!s.running) return;
  try {
    const price = await fetchPrice();
    s.price = price;
    if (closesCache.length < 20 || Math.random() < 0.2) {
      closesCache = await fetchKlines();
    }
    const closes = closesCache.concat([price]);
    const { score } = trendSignal(closes, price);
    s.signal = Number(score.toFixed(4));
    const r = rsi(closes, 14);

    if (s.position === 1) {
      const drop = ((price - s.entryPrice) / s.entryPrice) * 100;
      if (drop <= -3) closeLong(price, "stop-loss -3%");
      else if (drop >= 8) closeLong(price, "take-profit +8%");
      else if (score < -0.15) closeLong(price, "sinal baixista");
    } else if (score >= 0.35 && r < 65) {
      openLong(price);
    }

    if (s.position === 1) {
      const unreal = ((price - s.entryPrice) / s.entryPrice) * s.balance;
      s.equity = s.balance + unreal;
    } else {
      s.equity = s.balance;
    }
    s.lastTickAt = Date.now();
    s.lastError = null;
    s.status = "online";
  } catch (e: unknown) {
    s.lastError = e instanceof Error ? e.message : String(e);
    log(`Tick error: ${s.lastError}`, "error");
  }
}

function ensureLoop() {
  if (g.__octoBotTimer) return;
  log(`Loop 24/7 iniciado · ${SYMBOL} · ${TICK_MS}ms`);
  tick();
  g.__octoBotTimer = setInterval(tick, TICK_MS);
}

export function getBotStatus() {
  ensureLoop();
  const s = state();
  return {
    service: "octocookie-bot-24x7",
    status: s.running ? "online" : "paused",
    running: s.running,
    symbol: s.symbol,
    price: s.price,
    position: s.position === 1 ? "LONG" : "CASH",
    equity: Number(s.equity.toFixed(4)),
    signal: s.signal,
    lastAction: s.lastAction,
    lastTickAt: s.lastTickAt,
    uptimeSec: Math.floor((Date.now() - s.startedAt) / 1000),
    wins: s.wins,
    losses: s.losses,
    lastError: s.lastError,
    logs: s.logs.slice(0, 50),
    trades: s.trades.slice(0, 30),
  };
}

export function botStart() {
  ensureLoop();
  const s = state();
  s.running = true;
  s.status = "online";
  log("START");
  return getBotStatus();
}

export function botStop() {
  ensureLoop();
  const s = state();
  s.running = false;
  s.status = "paused";
  log("STOP", "warn");
  return getBotStatus();
}

export function botReset() {
  ensureLoop();
  const s = state();
  s.balance = START_BALANCE;
  s.equity = START_BALANCE;
  s.peakEquity = START_BALANCE;
  s.position = 0;
  s.entryPrice = 0;
  s.trades = [];
  s.wins = 0;
  s.losses = 0;
  log("RESET paper");
  return getBotStatus();
}

// auto-start on module load (server only)
if (typeof process !== "undefined" && process.versions?.node) {
  ensureLoop();
}
