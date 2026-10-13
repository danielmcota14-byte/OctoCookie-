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

// ---------- proxy: uma porta pública ----------
function under(url, prefix) {
  return url === prefix || url.startsWith(prefix + "/") || url.startsWith(prefix + "?");
}

function forward(req, res, port, strip) {
  const target = strip ? req.url.slice(strip.length) || "/" : req.url;
  const headers = { ...req.headers, "x-forwarded-for": req.socket.remoteAddress || "" };
  if (!headers["x-forwarded-proto"]) headers["x-forwarded-proto"] = "http";
  const up = http.request({ host: "127.0.0.1", port, method: req.method, path: target.startsWith("/") ? target : "/" + target, headers }, (r) => {
    res.writeHead(r.statusCode || 502, r.headers);
    r.pipe(res);
  });
  up.on("error", () => {
    if (!res.headersSent) res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Serviço iniciando ou fora do ar. Tente de novo em alguns segundos." }));
  });
  res.on("close", () => up.destroy());
  req.pipe(up);
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
    const st = { site: await alive(PORTS.site), bot: await alive(PORTS.bot), cookiescript: await alive(PORTS.cookiescript) };
    res.writeHead(st.site ? 200 : 503, { "content-type": "application/json" });
    return res.end(JSON.stringify(st));
  }
  if (url === "/cookiescript-app") { res.writeHead(301, { Location: "/cookiescript-app/" }); return res.end(); }
  if (under(url, "/cookiescript-app")) return forward(req, res, PORTS.cookiescript, "/cookiescript-app");
  if (under(url, "/bot")) return forward(req, res, PORTS.bot, "/bot");
  return forward(req, res, PORTS.site, "");
});

server.on("upgrade", (req, socket, head) => {
  const t = net.connect(PORTS.site, "127.0.0.1", () => {
    t.write(`${req.method} ${req.url} HTTP/1.1\r\n` + Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") + "\r\n\r\n");
    t.write(head);
    socket.pipe(t).pipe(socket);
  });
  t.on("error", () => socket.destroy());
  socket.on("error", () => t.destroy());
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
