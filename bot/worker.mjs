/**
 * OctoCookie Bot Worker 24/7 — roda no Render (Background Worker ou Web Service).
 *
 * O que faz de verdade:
 *  - Mantém o processo vivo 24/7 (não dorme no plano pago / worker)
 *  - Busca preço da Binance a cada 8s
 *  - Aplica a regra simples de tendência (SMA rápida vs lenta) + stop móvel
 *  - Grava estado em ./data/bot-state.json (persistente no disco do serviço se tiver disco)
 *  - Expõe HTTP /health e /status na porta $PORT (obrigatório no Render Web Service)
 *
 * Variáveis de ambiente (Render → Environment):
 *  BOT_SYMBOL=BTCUSDT          (par Binance)
 *  BOT_MODE=paper              (paper | signal) — paper = só simula, signal = loga sinais
 *  BOT_INTERVAL_MS=8000
 *  BOT_FAST_SMA=7
 *  BOT_SLOW_SMA=25
 *  BOT_STOP_PCT=2              (stop móvel % abaixo do pico)
 *  PUBLIC_URL=https://seu-app.onrender.com  (opcional, para auto-ping keep-alive)
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const STATE_FILE = path.join(DATA_DIR, "bot-state.json");

const SYMBOL = (process.env.BOT_SYMBOL || "BTCUSDT").toUpperCase();
const MODE = process.env.BOT_MODE || "paper";
const INTERVAL_MS = Number(process.env.BOT_INTERVAL_MS || 8000);
const FAST = Number(process.env.BOT_FAST_SMA || 7);
const SLOW = Number(process.env.BOT_SLOW_SMA || 25);
const STOP_PCT = Number(process.env.BOT_STOP_PCT || 2);
const PORT = Number(process.env.PORT || 10000);
const PUBLIC_URL = process.env.PUBLIC_URL || "";

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {
      running: true,
      symbol: SYMBOL,
      mode: MODE,
      position: null, // { side: "long", entry, peak, openedAt }
      prices: [],
      trades: [],
      lastPrice: 0,
      lastSignal: "flat",
      startedAt: Date.now(),
      ticks: 0,
      errors: 0,
    };
  }
}

function saveState(s) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
  } catch (e) {
    console.error("[state] save failed", e.message);
  }
}

let state = loadState();
state.running = true;
state.symbol = SYMBOL;
state.mode = MODE;

function sma(arr, n) {
  if (arr.length < n) return null;
  const slice = arr.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

async function fetchPrice() {
  // 1) Binance
  try {
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${SYMBOL}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      const price = Number(data.price);
      if (price > 0) return price;
    }
  } catch (_) {}

  // 2) Fallback CoinGecko (ids comuns)
  const map = {
    BTCUSDT: "bitcoin",
    ETHUSDT: "ethereum",
    BNBUSDT: "binancecoin",
    SOLUSDT: "solana",
  };
  const id = map[SYMBOL] || "bitcoin";
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`price feed failed (${res.status})`);
  const data = await res.json();
  const price = Number(data?.[id]?.usd);
  if (!(price > 0)) throw new Error("invalid price");
  return price;
}

function decide(price) {
  state.prices.push(price);
  if (state.prices.length > 200) state.prices = state.prices.slice(-200);

  const fast = sma(state.prices, FAST);
  const slow = sma(state.prices, SLOW);
  if (fast == null || slow == null) return "wait";

  // stop móvel se em long
  if (state.position?.side === "long") {
    state.position.peak = Math.max(state.position.peak, price);
    const stop = state.position.peak * (1 - STOP_PCT / 100);
    if (price <= stop) return "sell_stop";
  }

  if (fast > slow * 1.001) return "buy";
  if (fast < slow * 0.999) return "sell";
  return "flat";
}

function applySignal(signal, price) {
  const now = Date.now();
  if (signal === "buy" && !state.position) {
    state.position = { side: "long", entry: price, peak: price, openedAt: now };
    state.trades.push({ type: "BUY", price, at: now, reason: "sma_cross" });
    state.lastSignal = "buy";
    console.log(`[${MODE}] BUY ${SYMBOL} @ ${price}`);
  } else if ((signal === "sell" || signal === "sell_stop") && state.position) {
    const pnl = ((price - state.position.entry) / state.position.entry) * 100;
    state.trades.push({
      type: "SELL",
      price,
      at: now,
      reason: signal === "sell_stop" ? "trailing_stop" : "sma_cross",
      pnlPct: Number(pnl.toFixed(3)),
    });
    console.log(`[${MODE}] SELL ${SYMBOL} @ ${price} pnl=${pnl.toFixed(2)}% (${signal})`);
    state.position = null;
    state.lastSignal = "sell";
  } else {
    state.lastSignal = signal;
  }
  if (state.trades.length > 100) state.trades = state.trades.slice(-100);
}

async function tick() {
  if (!state.running) return;
  try {
    const price = await fetchPrice();
    state.lastPrice = price;
    state.ticks += 1;
    const signal = decide(price);
    applySignal(signal, price);
    saveState(state);
    if (state.ticks % 15 === 0) {
      console.log(
        `[tick #${state.ticks}] ${SYMBOL} ${price} signal=${state.lastSignal} pos=${state.position ? "LONG@" + state.position.entry : "FLAT"}`
      );
    }
  } catch (e) {
    state.errors += 1;
    console.error("[tick error]", e.message);
    saveState(state);
  }
}

// HTTP server — health check do Render
const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  if (url.pathname === "/health" || url.pathname === "/") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "octocookie-bot", uptime: process.uptime() }));
    return;
  }
  if (url.pathname === "/status") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify(
        {
          running: state.running,
          symbol: state.symbol,
          mode: state.mode,
          lastPrice: state.lastPrice,
          lastSignal: state.lastSignal,
          position: state.position,
          ticks: state.ticks,
          errors: state.errors,
          trades: state.trades.slice(-10),
          startedAt: state.startedAt,
          uptimeSec: Math.floor(process.uptime()),
        },
        null,
        2
      )
    );
    return;
  }
  if (url.pathname === "/stop" && req.method === "POST") {
    state.running = false;
    saveState(state);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ running: false }));
    return;
  }
  if (url.pathname === "/start" && req.method === "POST") {
    state.running = true;
    saveState(state);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ running: true }));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, () => {
  console.log(`[bot] OctoCookie worker 24/7 on :${PORT} symbol=${SYMBOL} mode=${MODE}`);
});

// loop principal
tick();
setInterval(tick, INTERVAL_MS);

// Keep-alive opcional: ping a si mesmo a cada 5 min (evita sleep em free web service)
if (PUBLIC_URL) {
  setInterval(async () => {
    try {
      await fetch(`${PUBLIC_URL.replace(/\/$/, "")}/health`, { signal: AbortSignal.timeout(8000) });
    } catch (_) {}
  }, 5 * 60 * 1000);
}

process.on("SIGTERM", () => {
  console.log("[bot] SIGTERM — salvando estado");
  saveState(state);
  process.exit(0);
});
