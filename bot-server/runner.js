// Roda o PRÓPRIO octocookie.html num Chromium sem tela, com a carteira do cofre, 24/7. Reinicia sozinho se travar.
// A página é isolada: só carrega o app local, as libs servidas daqui (ethers/chart.js) e hosts na lista de permissão.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { pkgRoot } from './pkgroot.js';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
const ALLOWED_HOSTS = ['api.binance.com', 'data-api.binance.vision', 'fapi.binance.com', 'mainnet.infura.io', 'arb1.arbitrum.io', 'bsc-dataseed.binance.org', 'polygon-rpc.com'];

export class Runner {
  constructor({ appDir, dataDir, appPort = 8788, rpc = {}, log = () => {}, launcher = chromium, pollMs = 30000 }) {
    Object.assign(this, { appDir: path.resolve(appDir), dataDir, appPort, rpc, log, launcher, pollMs });
    this.pk = null; this.cfg = null; this.stopping = true; this.snap = null; this.current = null; this.loopId = 0; this.lastError = null; this.startedAt = null;
    this.ethersFile = path.join(pkgRoot('ethers'), 'dist/ethers.umd.min.js');
    this.chartFile = path.join(pkgRoot('chart.js'), 'dist/chart.umd.js');
    for (const f of [this.ethersFile, this.chartFile]) if (!fs.existsSync(f)) throw new Error('Arquivo de biblioteca ausente: ' + f);
  }

  async startStatic() {
    if (this.srv) return;
    this.srv = http.createServer((req, res) => {
      try {
        const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        const f = path.resolve(this.appDir, '.' + (u === '/' ? '/octocookie.html' : u));
        if (!f.startsWith(this.appDir + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        fs.createReadStream(f).pipe(res);
      } catch { res.writeHead(400); res.end(); }
    });
    await new Promise((r) => this.srv.listen(this.appPort, '127.0.0.1', r));
  }

  allowedHosts() {
    const hosts = new Set(ALLOWED_HOSTS);
    for (const u of Object.values(this.rpc)) { try { hosts.add(new URL(u).host); } catch {} }
    return hosts;
  }

  async route(ctx) {
    const hosts = this.allowedHosts();
    await ctx.route('**/*', async (route) => {
      const req = route.request(), url = new URL(req.url());
      if (url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
      if (url.host === `127.0.0.1:${this.appPort}`) return route.continue();
      if (url.host === 'cdn.jsdelivr.net' && url.pathname.includes('/ethers@')) return route.fulfill({ path: this.ethersFile, contentType: 'text/javascript' });
      if (url.host === 'cdn.jsdelivr.net' && url.pathname.includes('/chart.js@')) return route.fulfill({ path: this.chartFile, contentType: 'text/javascript' });
      if (['image', 'font', 'stylesheet', 'media'].includes(req.resourceType())) return route.abort();
      if (url.host === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/10.12.0/')) return route.continue();
      if (url.host.endsWith('.firebaseio.com') || hosts.has(url.host)) return route.continue();
      this.log('[bloqueado] ' + url.host);
      return route.abort();
    });
  }

  /** Liga o bot. cfg = { fields, hg, fee } (do usuário). pk fica só em memória. */
  async start(pk, cfg) {
    await this.stop();
    this.pk = pk; this.cfg = cfg || {}; this.stopping = false; this.lastError = null; this.startedAt = Date.now();
    await this.startStatic();
    const id = ++this.loopId;
    this.loop(id).catch((e) => this.log('loop encerrado: ' + e.message));
  }

  async stop() {
    this.stopping = true; this.loopId++;
    try { await this.current?.page.evaluate(() => { try { OCTO247.stop(); } catch (e) {} }); } catch {}
    try { await this.current?.ctx.close(); } catch {}
    this.current = null; this.pk = null; this.snap = null;
  }

  async session(id) {
    const ctx = await this.launcher.launchPersistentContext(path.join(this.dataDir, 'profile'), {
      headless: true, viewport: { width: 1280, height: 900 },
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--js-flags=--max-old-space-size=300'],
    });
    const page = ctx.pages()[0] || await ctx.newPage();
    this.current = { ctx, page };
    let crashed = false;
    page.on('crash', () => { crashed = true; });
    page.on('pageerror', (e) => this.log('[pageerror] ' + e.message));
    page.on('console', (m) => { const t = m.text(); if (t.startsWith('[bot]')) this.log(t); });
    await this.route(ctx);
    const hg = this.cfg.hg && typeof this.cfg.hg === 'object' ? JSON.stringify(this.cfg.hg) : null;
    await page.addInitScript((hgJson) => { try { localStorage.setItem('termsAcceptedSwap', '1'); if (hgJson) localStorage.setItem('octo_hg_v3', hgJson); } catch (e) {} }, hg);
    await page.goto(`http://127.0.0.1:${this.appPort}/octocookie.html?headless=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => window.OCTO247 && OCTO247.headless && typeof ethers !== 'undefined' && typeof state !== 'undefined', null, { timeout: 90000 });
    await page.evaluate(() => { const o = window.addLog; window.addLog = function (m, t) { try { console.log('[bot][' + (t || 'info') + '] ' + m); } catch (e) {} return o.apply(this, arguments); }; });
    const r = await page.evaluate(([k, o]) => OCTO247.headless(k, o), [this.pk, { fields: this.cfg.fields || {}, fee: !!this.cfg.fee, rpc: this.rpc }]);
    this.log(`Executor ativo: ${r.address} | rodando: ${r.running} | taxa automática: ${this.cfg.fee ? 'sim' : 'não'}`);

    let lastPrice = null, lastChange = Date.now(), lastBeat = 0, fails = 0;
    while (!this.stopping && id === this.loopId) {
      await new Promise((r2) => setTimeout(r2, this.pollMs));
      if (this.stopping || id !== this.loopId) break;
      if (crashed || page.isClosed()) throw new Error('página fechou/crashou');
      let h;
      try { h = await page.evaluate(() => OCTO247.snapshot()); } catch (e) { if (++fails >= 3) throw new Error('página não responde'); continue; }
      fails = 0; this.snap = { ...h, at: Date.now() };
      if (!h.active) throw new Error('executor desativou sozinho');
      if (h.price !== lastPrice) { lastPrice = h.price; lastChange = Date.now(); }
      if (h.running && Date.now() - lastChange > 10 * 60 * 1000) throw new Error('preço parado há 10 min (feed travado)');
      if (Date.now() - lastBeat > 10 * 60 * 1000) { lastBeat = Date.now(); this.log(`♥ preço=${h.price} saldo=${Number(h.balance).toFixed(5)} ordens=${h.trades} pnl_dia=${Number(h.pnlDia).toFixed(2)}% rodando=${h.running}`); }
    }
  }

  async loop(id) {
    let backoff = 5, failures = 0;
    while (!this.stopping && id === this.loopId) {
      const started = Date.now();
      try { await this.session(id); } catch (e) { this.lastError = e.message; this.log('⚠️ Sessão encerrada: ' + e.message); }
      try { await this.current?.ctx.close(); } catch {}
      this.current = null;
      if (this.stopping || id !== this.loopId) break;
      failures = Date.now() - started > 10 * 60 * 1000 ? 0 : failures + 1;
      if (failures >= 10) { this.log('❌ Muitas falhas seguidas: bot parado. Religue pelo site.'); this.pk = null; this.stopping = true; break; }
      backoff = failures === 0 ? 5 : Math.min(backoff * 2, 300);
      this.log(`Reiniciando em ${backoff}s...`);
      await new Promise((r) => setTimeout(r, backoff * 1000));
    }
  }

  armed() { return !!this.pk && !this.stopping; }
}
