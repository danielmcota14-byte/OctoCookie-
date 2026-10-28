#!/usr/bin/env node
/**
 * OctoCookie — UM comando que roda TUDO:  node start.mjs   (ou: npm run tudo)
 *
 *   site (TanStack)  ->  /
 *   bot 24/7         ->  /bot/...
 *   CookieScript     ->  /cookiescript-app/...
 *
 * Só UMA porta é pública (process.env.PORT, que o Render define). Os três programas
 * rodam em portas internas e este proxy leve distribui. Se um deles cair, é reiniciado.
 */
import http from "node:http";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// Guard global: proxy/stream não pode derrubar o processo
process.on("uncaughtException", (err) => {
  const code = err && err.code;
  if (code === "ERR_STREAM_WRITE_AFTER_END" || code === "ECONNRESET" || code === "EPIPE" || code === "ERR_HTTP_HEADERS_SENT") {
    console.log(`[proxy] aviso ignorado: ${code}`);
    return;
  }
  console.error(err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => console.error("[proxy] rejection", err));

const PUBLIC_PORT = Number(process.env.PORT) || 3000;
const PORTS = { site: 3100, bot: 3101, cookiescript: 3102 };
const isWin = process.platform === "win32";
const log = (...a) => console.log("[octo]", ...a);
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { stdio: "inherit", shell: isWin, cwd: ROOT, ...opts });

// ---------- preparo (só roda se faltar; no Docker já vem pronto) ----------
const BUILD_ENV = {
  ...process.env,
  VITE_COOKIESCRIPT_URL: process.env.VITE_COOKIESCRIPT_URL || "https://cookiescript-jgvh.onrender.com",
  VITE_BOT_24X7_URL: process.env.VITE_BOT_24X7_URL || "/bot",
};
if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  log("instalando dependências do site…");
  if (sh("npm", ["install", "--no-audit", "--no-fund", "--legacy-peer-deps"]).status !== 0) process.exit(1);
}
if (!fs.existsSync(path.join(ROOT, ".output/server/index.mjs"))) {
  log("compilando o site…");
  if (sh("npm", ["run", "build"], { env: BUILD_ENV }).status !== 0) process.exit(1);
}
if (!fs.existsSync(path.join(ROOT, "bot-server/node_modules"))) {
  log("instalando dependências do bot 24/7…");
  if (sh("npm", ["install", "--omit=dev", "--no-audit", "--no-fund"], { cwd: path.join(ROOT, "bot-server") }).status !== 0) process.exit(1);
}

function findPython() {
  for (const bin of ["python3", "python", "py"]) {
    const r = spawnSync(bin, ["--version"], { shell: isWin });
    if (r.status === 0) return bin;
  }
  return null;
}

// OWNER_TOKEN: se não vier do ambiente, usa o mesmo token que o site já tem em bot-config.js
function ownerToken() {
  if (process.env.OWNER_TOKEN) return process.env.OWNER_TOKEN;
  try {
    const cfg = fs.readFileSync(path.join(ROOT, "public/octocookie-app/bot-config.js"), "utf8");
    const m = cfg.match(/token:\s*"([^"]{24,})"/);
    if (m) { log("OWNER_TOKEN não definido: usando o token de public/octocookie-app/bot-config.js"); return m[1]; }
  } catch { /* sem token */ }
  return "";
}

const dataDir = process.env.DATA_DIR || (fs.existsSync("/data") ? "/data" : path.join(ROOT, "bot-server/data"));

const services = [
  {
    name: "site",
    cmd: process.execPath,
    args: [".output/server/index.mjs"],
    cwd: ROOT,
    env: { PORT: PORTS.site, NITRO_PORT: PORTS.site, HOST: "127.0.0.1", NITRO_HOST: "127.0.0.1" },
  },
  {
    name: "bot",
    cmd: process.execPath,
    args: ["server.js"],
    cwd: path.join(ROOT, "bot-server"),
    env: { PORT: PORTS.bot, DATA_DIR: dataDir, OWNER_TOKEN: ownerToken() },
  },
  {
    name: "cookiescript",
    cmd: findPython(),
    args: ["cookie_ide_app.py"],
    cwd: path.join(ROOT, "cookiescript"),
    env: { PORT: PORTS.cookiescript, DISABLE_LOCAL_AI: process.env.DISABLE_LOCAL_AI || "true", PYTHONUNBUFFERED: "1" },
  },
];

let stopping = false;
const children = new Map();

function launch(svc) {
  if (!svc.cmd) { log(`${svc.name}: Python não encontrado — serviço não iniciado (instale Python 3).`); return; }
  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    env: { ...process.env, ...svc.env },
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  children.set(svc.name, child);
  const tag = (d) => String(d).split(/\r?\n/).filter(Boolean).forEach((l) => console.log(`[${svc.name}] ${l}`));
  child.stdout.on("data", tag);
  child.stderr.on("data", tag);
  child.on("error", (e) => log(`${svc.name}: falha ao iniciar (${e.message})`));
  child.on("exit", (code) => {
    children.delete(svc.name);
    if (stopping) return;
    log(`${svc.name} saiu (código ${code}); reiniciando em 3s…`);
    setTimeout(() => !stopping && launch(svc), 3000);
  });
}
services.forEach(launch);


// ---------- fallback estático (.output/public) quando o site SSR está fora ----------
const PUBLIC_DIR = path.join(ROOT, ".output/public");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(base, reqPath) {
  const decoded = decodeURIComponent((reqPath || "/").split("?")[0].split("#")[0]);
  const rel = decoded.replace(/^\/+/, "");
  const full = path.normalize(path.join(base, rel));
  if (!full.startsWith(path.normalize(base))) return null;
  return full;
}

function tryStatic(req, res) {
  let urlPath = (req.url || "/").split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";
  // apps embutidos
  if (urlPath === "/octocookie-app" || urlPath === "/octocookie-app/") urlPath = "/octocookie-app/octocookie.html";
  if (urlPath === "/cryptex" || urlPath === "/cryptex/") urlPath = "/octocookie-app/cryptex.html";

  let file = safeJoin(PUBLIC_DIR, urlPath);
  if (!file) return false;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    // SPA fallback só para rotas sem extensão
    if (!path.extname(urlPath)) {
      const idx = path.join(PUBLIC_DIR, "index.html");
      if (fs.existsSync(idx)) file = idx;
      else return false;
    } else return false;
  }
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, { "content-type": type, "cache-control": "no-cache" });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}


// ---------- proxy: uma porta pública ----------
function under(url, prefix) {
  return url === prefix || url.startsWith(prefix + "/") || url.startsWith(prefix + "?");
}

function forward(req, res, port, strip) {
  const target = strip ? req.url.slice(strip.length) || "/" : req.url;
  const headers = { ...req.headers, "x-forwarded-for": req.socket.remoteAddress || "" };
  if (!headers["x-forwarded-proto"]) headers["x-forwarded-proto"] = "http";
  let done = false;
  const kill = (s) => { try { s.destroy(); } catch (_) {} };
  const endRes = (code, body) => {
    if (done || res.writableEnded || res.destroyed) return;
    done = true;
    try {
      if (!res.headersSent) res.writeHead(code || 502, { "content-type": "application/json", "connection": "close" });
      res.end(body || "");
    } catch (_) {}
  };
  // cliente já foi embora
  res.on("error", () => { done = true; });
  res.on("close", () => { done = true; });

  const up = http.request({ host: "127.0.0.1", port, method: req.method, path: target.startsWith("/") ? target : "/" + target, headers }, (r) => {
    if (done || res.writableEnded || res.destroyed) { r.resume(); kill(r); return; }
    r.on("error", () => endRes(502, JSON.stringify({ error: "upstream error" })));
    try {
      const hdrs = { ...r.headers };
      delete hdrs["transfer-encoding"];
      delete hdrs.connection;
      delete hdrs["keep-alive"];
      if (!res.headersSent) res.writeHead(r.statusCode || 502, hdrs);
    } catch (_) { r.resume(); return; }
    // pipe com proteção: se res já fechou, não escreve
    r.on("data", (chunk) => {
      if (done || res.writableEnded || res.destroyed) { kill(r); return; }
      try {
        const ok = res.write(chunk);
        if (ok === false) r.pause();
      } catch (_) { done = true; kill(r); }
    });
    r.on("end", () => {
      if (!res.writableEnded && !res.destroyed) {
        try { res.end(); } catch (_) {}
      }
      done = true;
    });
    res.on("drain", () => { try { r.resume(); } catch (_) {} });
  });
  up.on("error", () => endRes(502, JSON.stringify({ error: "Serviço iniciando ou fora do ar. Tente de novo em alguns segundos." })));
  res.on("close", () => { done = true; kill(up); });
  req.on("error", () => { done = true; kill(up); });
  req.on("aborted", () => { done = true; kill(up); });
  if (req.readable) req.pipe(up);
  else up.end();
}

function alive(port) {
  return new Promise((resolve) => {
    const s = net.connect({ host: "127.0.0.1", port, timeout: 500 });
    s.on("connect", () => { s.destroy(); resolve(true); });
    s.on("error", () => resolve(false));
    s.on("timeout", () => { s.destroy(); resolve(false); });
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  if (url === "/healthz") {
    const stt = { site: await alive(PORTS.site), bot: await alive(PORTS.bot), cookiescript: await alive(PORTS.cookiescript) };
    res.writeHead(stt.site ? 200 : 503, { "content-type": "application/json" });
    return res.end(JSON.stringify(stt));
  }
  if (url === "/cookiescript-app") { res.writeHead(301, { Location: "/cookiescript-app/" }); return res.end(); }
  if (under(url, "/cookiescript-app")) return forward(req, res, PORTS.cookiescript, "/cookiescript-app");
  if (under(url, "/bot")) return forward(req, res, PORTS.bot, "/bot");

  const pathOnly = url.split("?")[0];
  const accept = String(req.headers.accept || "");
  const wantsHtml = accept.includes("text/html") || !path.extname(pathOnly);

  // Estáticos do trader/cryptex/assets sempre do disco
  if (
    pathOnly.startsWith("/octocookie-app/") ||
    pathOnly.startsWith("/assets/") ||
    pathOnly.endsWith(".json") ||
    pathOnly.endsWith(".html") ||
    pathOnly === "/cryptex" || pathOnly === "/cryptex/"
  ) {
    if (tryStatic(req, res)) return;
  }

  // Atalhos diretos para apps embutidos (não dependem do React SSR)
  if (pathOnly === "/trader" || pathOnly === "/trader/") {
    res.writeHead(302, { Location: "/octocookie-app/octocookie.html" });
    return res.end();
  }
  if (pathOnly === "/carteira" || pathOnly === "/cryptex" || pathOnly.startsWith("/carteira")) {
    // carteira React pode estar fora — oferece cryptex estático como fallback de conteúdo
  }

  const siteUp = await alive(PORTS.site);
  if (siteUp) {
    // Proxy com fallback: se o upstream falhar e for navegação HTML, serve estático
    return forwardWithFallback(req, res, PORTS.site, "");
  }
  if (tryStatic(req, res)) return;
  res.writeHead(503, { "content-type": "text/html; charset=utf-8" });
  res.end(`<!doctype html><html><body style="font-family:sans-serif;padding:2rem;background:#faf7f2;color:#1a1a1a">
    <h1>Site iniciando…</h1>
    <p>O React ainda está subindo. Enquanto isso você pode usar:</p>
    <ul>
      <li><a href="/octocookie-app/octocookie.html">Trader / Bot</a></li>
      <li><a href="/octocookie-app/cryptex.html">Cryptex (carteira)</a></li>
      <li><a href="/healthz">Status /healthz</a></li>
    </ul>
    <p>Perfil financeiro: rota <code>/finance</code> (volta quando o site React estabilizar).</p>
  </body></html>`);
});

function forwardWithFallback(req, res, port, strip) {
  const target = strip ? req.url.slice(strip.length) || "/" : req.url;
  const headers = { ...req.headers, "x-forwarded-for": req.socket.remoteAddress || "" };
  if (!headers["x-forwarded-proto"]) headers["x-forwarded-proto"] = "http";
  let done = false;
  const kill = (s) => { try { s.destroy(); } catch (_) {} };
  const fallback = () => {
    if (done || res.headersSent) return;
    if (tryStatic(req, res)) { done = true; return; }
    done = true;
    try {
      res.writeHead(503, { "content-type": "text/html; charset=utf-8" });
      res.end(`<!doctype html><html><body style="font-family:sans-serif;padding:2rem">
        <h1>Serviço reiniciando</h1>
        <p><a href="/octocookie-app/octocookie.html">Trader</a> · <a href="/octocookie-app/cryptex.html">Cryptex</a> · <a href="/">Início</a></p>
      </body></html>`);
    } catch (_) {}
  };
  const up = http.request({ host: "127.0.0.1", port, method: req.method, path: target.startsWith("/") ? target : "/" + target, headers }, (r) => {
    if (done || res.writableEnded) { r.resume(); return; }
    // Se upstream devolve 502/503 em navegação, tenta estático
    if ((r.statusCode === 502 || r.statusCode === 503) && String(req.headers.accept || "").includes("text/html")) {
      r.resume();
      return fallback();
    }
    try {
      const hdrs = { ...r.headers };
      delete hdrs["transfer-encoding"];
      delete hdrs.connection;
      if (!res.headersSent) res.writeHead(r.statusCode || 502, hdrs);
    } catch (_) { r.resume(); return fallback(); }
    r.on("error", () => fallback());
    r.on("data", (chunk) => {
      if (done || res.writableEnded) { kill(r); return; }
      try {
        if (res.write(chunk) === false) r.pause();
      } catch (_) { done = true; kill(r); }
    });
    r.on("end", () => {
      if (!res.writableEnded) { try { res.end(); } catch (_) {} }
      done = true;
    });
    res.on("drain", () => { try { r.resume(); } catch (_) {} });
  });
  up.on("error", () => fallback());
  res.on("close", () => { done = true; kill(up); });
  res.on("error", () => { done = true; kill(up); });
  req.on("error", () => { done = true; kill(up); });
  if (req.readable) req.pipe(up);
  else up.end();
}

server.on("upgrade", (req, socket, head) => {
  const t = net.connect(PORTS.site, "127.0.0.1", () => {
    try {
      t.write(`${req.method} ${req.url} HTTP/1.1\r\n` + Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") + "\r\n\r\n");
      if (head && head.length) t.write(head);
      socket.pipe(t);
      t.pipe(socket);
    } catch (_) {
      try { socket.destroy(); } catch (__) {}
      try { t.destroy(); } catch (__) {}
    }
  });
  t.on("error", () => { try { socket.destroy(); } catch (_) {} });
  socket.on("error", () => { try { t.destroy(); } catch (_) {} });
  socket.on("close", () => { try { t.destroy(); } catch (_) {} });
});

server.listen(PUBLIC_PORT, "0.0.0.0", () => log(`pronto em http://localhost:${PUBLIC_PORT}  (site /, bot /bot, CookieScript /cookiescript-app/)`));

function shutdown() {
  if (stopping) return;
  stopping = true;
  log("encerrando tudo…");
  server.close();
  for (const c of children.values()) c.kill("SIGTERM");
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
