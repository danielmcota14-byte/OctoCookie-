#!/usr/bin/env node
// Sobe o sistema OctoCookie inteiro com UM comando:  node iniciar.mjs   (ou: npm run tudo)
//   site (porta 3000) + CookieScript (porta 8080)  [+ bot 24/7 (porta 3001) com --bot]
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = dirname(fileURLToPath(import.meta.url));
const win = process.platform === "win32";
const comBot = process.argv.includes("--bot");
const P = { site: 3000, cookie: 8080, bot: 3001 };

// .env simples (não sobrescreve variáveis já definidas no terminal)
const env = { ...process.env };
const envFile = join(raiz, ".env");
if (existsSync(envFile)) {
  for (const l of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (!env.GROQ_API_KEYS && !env.GROQ_API_KEY)
  console.log("⚠️  Sem GROQ_API_KEYS: o site abre, mas a IA (chats, Finance, Start) não responde.\n   Crie um arquivo .env com:  GROQ_API_KEYS=chave1,chave2\n");

const rodar = (cmd, args, opts = {}) => spawnSync(cmd, args, { stdio: "inherit", shell: win, ...opts });

function achaPython() {
  for (const c of win ? ["py", "python"] : ["python3", "python"]) {
    const r = spawnSync(c, ["--version"], { shell: win });
    if (r.status === 0) return c === "py" ? ["py", ["-3"]] : [c, []];
  }
  return null;
}

// 1) dependências do site
if (!existsSync(join(raiz, "node_modules"))) {
  console.log("📦 Instalando dependências do site (só na primeira vez)...");
  if (rodar("npm", ["install", "--legacy-peer-deps", "--no-audit", "--no-fund"], { cwd: raiz }).status !== 0) process.exit(1);
}

const filhos = [];
function iniciar(nome, cmd, args, opts) {
  const p = spawn(cmd, args, { shell: win, ...opts, stdio: ["ignore", "pipe", "pipe"] });
  const pref = (d) => String(d).split(/\r?\n/).filter(Boolean).forEach((l) => console.log(`[${nome}] ${l}`));
  p.stdout.on("data", pref);
  p.stderr.on("data", pref);
  p.on("exit", (c) => console.log(`[${nome}] encerrou (código ${c})`));
  filhos.push(p);
}

// 2) CookieScript (Python)
const py = achaPython();
if (py) {
  iniciar("cookiescript", py[0], [...py[1], "cookie_ide_app.py"], {
    cwd: join(raiz, "cookiescript"),
    env: { ...env, PORT: String(P.cookie), DISABLE_LOCAL_AI: env.DISABLE_LOCAL_AI ?? "true", PYTHONUNBUFFERED: "1" },
  });
} else {
  console.log("⚠️  Python não encontrado: CookieScript não vai subir (instale em python.org).");
}

// 3) Bot 24/7 (opcional)
let botUrl = "";
if (comBot) {
  const dir = join(raiz, "bot-server");
  if (!existsSync(join(dir, "node_modules"))) {
    console.log("📦 Instalando bot-server + Chromium (demora na primeira vez)...");
    rodar("npm", ["install", "--no-audit", "--no-fund"], { cwd: dir });
    rodar("npx", ["playwright", "install", "chromium"], { cwd: dir });
  }
  const token = env.OWNER_TOKEN || randomBytes(16).toString("hex");
  botUrl = `http://localhost:${P.bot}`;
  iniciar("bot24x7", "node", ["server.js"], { cwd: dir, env: { ...env, PORT: String(P.bot), OWNER_TOKEN: token } });
  console.log(`🤖 Bot 24/7 local — OWNER_TOKEN desta sessão: ${token}`);
}

// 4) Site
iniciar("site", "npx", ["vite", "dev", "--port", String(P.site), "--host", "localhost"], {
  cwd: raiz,
  env: { ...env, VITE_COOKIESCRIPT_URL: `http://localhost:${P.cookie}`, ...(botUrl ? { VITE_BOT_24X7_URL: botUrl } : {}) },
});

setTimeout(() => {
  console.log(`\n✅ Tudo no ar:\n   Site          http://localhost:${P.site}\n   Universo      http://localhost:${P.site}/universo.html\n   CookieScript  http://localhost:${P.site}/cookiescript\n${comBot ? `   Bot 24/7      ${botUrl}\n` : ""}   (Ctrl+C para parar tudo)\n`);
}, 6000);

let saindo = false;
function parar() {
  if (saindo) return;
  saindo = true;
  for (const p of filhos) {
    try {
      if (win) spawnSync("taskkill", ["/pid", String(p.pid), "/T", "/F"]);
      else p.kill("SIGTERM");
    } catch {}
  }
  setTimeout(() => process.exit(0), 500);
}
process.on("SIGINT", parar);
process.on("SIGTERM", parar);
