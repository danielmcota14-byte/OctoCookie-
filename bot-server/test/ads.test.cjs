const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '../../');
const dir = root + 'public/octocookie-app/';
const ads = fs.readFileSync(dir + 'ads.js', 'utf8');
const KEY = '53b35e700dd3c5120e2081ce6edf4273', K2 = 'a'.repeat(32);
// página com 2 espaços DENTRO do conteúdo (como as páginas reais): nada no topo nem no fim do <body>
const PAGE = '<body><div id="topo">cabeçalho</div><p>a</p><div class="octo-ad-slot" data-slot="1"></div><p>b</p><div class="octo-ad-slot" data-slot="2"></div><p>c</p><div id="rodape">rodapé</div></body>';
async function run(url, { embedded = false, cfg = null, html = PAGE } = {}) {
  const outer = new JSDOM('<body><iframe id="f"></iframe></body>', { url: 'http://x.test/', runScripts: 'dangerously' });
  const w = embedded ? outer.window.document.getElementById('f').contentWindow : new JSDOM(html, { url, runScripts: 'dangerously', pretendToBeVisual: true }).window;
  if (embedded) w.document.body.innerHTML = html.replace(/<\/?body>/g, '');
  if (cfg) w.OCTO_ADS = cfg;
  w.eval(ads); await new Promise((r) => setTimeout(r, 80)); return w;
}
const frames = (w) => [...w.document.querySelectorAll('.octo-ad-slot iframe')];
let ok = 0; const t = async (n, f) => { await f(); ok++; console.log('✓', n); };
(async () => {
  await t('2 banners DENTRO do conteúdo (não fixos, nada no topo nem no rodapé), isolados e com a chave certa', async () => {
    const w = await run('http://x.test/cryptex.html', { cfg: { keys: [KEY, KEY] } });
    const f = frames(w); assert.equal(f.length, 2);
    assert.equal(w.document.querySelectorAll('#octo-ads').length, 0, 'sem dock de rodapé');
    assert.equal(w.document.body.firstElementChild.id, 'topo'); assert.equal(w.document.body.lastElementChild.id, 'rodape');
    for (const s of w.document.querySelectorAll('.octo-ad-slot')) {
      assert.ok(s.previousElementSibling && s.nextElementSibling, 'slot entre blocos de conteúdo');
      assert.ok(!/fixed|sticky/.test(s.style.position || ''));
    }
    for (const x of f) {
      const sb = x.getAttribute('sandbox'); assert.ok(sb.includes('allow-scripts') && !sb.includes('allow-same-origin') && !sb.includes('allow-top-navigation'), sb);
      assert.equal(x.getAttribute('src'), '/ad.html?k=' + KEY); assert.equal(x.getAttribute('width'), '468'); assert.equal(x.getAttribute('height'), '60');
    }
    assert.equal(w.document.querySelectorAll('.octo-ad-label').length, 2);
  });
  await t('sem configuração usa a chave padrão nos dois espaços; chave inválida cai no padrão', async () => {
    for (const cfg of [null, {}, { keys: [] }, { keys: ['<script>', 'xyz'] }]) {
      const f = frames(await run('http://x.test/cryptex.html', { cfg })); assert.equal(f.length, 2);
      assert.ok(f.every((x) => x.src.endsWith('?k=' + KEY)), 'padrão');
    }
  });
  await t('uma chave por espaço (OCTO_ADS.keys)', async () => {
    const f = frames(await run('http://x.test/a.html', { cfg: { keys: [KEY, K2] } }));
    assert.ok(f[0].src.includes(KEY) && f[1].src.includes(K2) && !f[1].src.includes(KEY));
    const g = frames(await run('http://x.test/a.html', { cfg: { keys: ['<script>', K2] } }));
    assert.ok(g[0].src.includes(KEY) && !g[0].src.includes('<script') && g[1].src.includes(K2));
  });
  await t('sandbox:false desliga o isolamento, mas no octocookie.html ele fica SEMPRE ligado', async () => {
    const a = frames(await run('http://x.test/cryptex.html', { cfg: { sandbox: false } })); assert.ok(a.every((f) => !f.hasAttribute('sandbox')));
    const b = frames(await run('http://x.test/octocookie-app/octocookie.html', { cfg: { sandbox: false } })); assert.ok(b.every((f) => f.hasAttribute('sandbox')));
  });
  await t('funciona dentro do site (iframe); executor do servidor (?headless=1) e disabled:true nunca carregam anúncio', async () => {
    assert.equal(frames(await run('http://x.test/a.html', { embedded: true })).length, 2);
    assert.equal(frames(await run('http://x.test/octocookie.html?headless=1')).length, 0);
    assert.equal(frames(await run('http://x.test/a.html', { cfg: { disabled: true } })).length, 0);
  });
  await t('página sem espaços não ganha nada; chamar duas vezes não duplica', async () => {
    const w0 = await run('http://x.test/', { html: '<body><p>x</p></body>' }); assert.equal(w0.document.querySelectorAll('iframe').length, 0);
    const w = await run('http://x.test/'); w.eval(ads); await new Promise((r) => setTimeout(r, 50)); assert.equal(frames(w).length, 2);
  });
  await t('páginas estáticas: ads.js 1x, espaços 1 e 2 no meio do conteúdo, sem snippet cru, sem dock', async () => {
    const want = { 'index.html': 2, 'octocookie.html': 2, 'dashboard_analisador.html': 2, 'cryptex.html': 12 }; // cryptex: 2 por aba interna
    for (const [f, n] of Object.entries(want)) {
      const s = fs.readFileSync(dir + f, 'utf8');
      assert.equal((s.match(/src="\.\/ads\.js"/g) || []).length, 1, f); assert.ok(!s.includes('highrevenueformat'), f); assert.ok(!s.includes('octo-ads'), f);
      assert.equal((s.match(/class="octo-ad-slot"/g) || []).length, n, f);
      assert.equal((s.match(/data-slot="1"/g) || []).length, n / 2, f); assert.equal((s.match(/data-slot="2"/g) || []).length, n / 2, f);
    }
    // nenhuma das telas de credencial (login, seed, importar) tem anúncio
    const cx = fs.readFileSync(dir + 'cryptex.html', 'utf8'); const d = new JSDOM(cx).window.document;
    for (const id of ['page-login', 'page-seed', 'page-import']) assert.equal(d.getElementById(id).querySelectorAll('.octo-ad-slot').length, 0, id);
    for (const id of ['wallet', 'send', 'receive', 'swap', 'market', 'settings']) assert.equal(d.getElementById('inner-' + id).querySelectorAll('.octo-ad-slot').length, 2, id);
  });
  await t('site React: sem dock no rodapé; cada rota tem <AdSlot slot={1}/> e <AdSlot slot={2}/>', async () => {
    const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
    const rootTsx = rd('src/routes/__root.tsx'); assert.ok(!/AdDock|ad-bar/.test(rootTsx)); assert.ok(!fs.existsSync(path.join(root, 'src/components/ad-bar.tsx')));
    const slot = rd('src/components/ad-slot.tsx'); assert.ok(slot.includes('export function AdSlot') && slot.includes('IntersectionObserver'));
    // [ocorrências do slot 1, ocorrências do slot 2 no código]. Feeds/comentários têm o slot 2 em 2 lugares exclusivos (com itens / sem itens).
    const pages = { 'src/routes/launch.tsx': [1, 1], 'src/routes/settings.tsx': [1, 1], 'src/routes/simulator.tsx': [1, 1], 'src/routes/analyzer.tsx': [1, 1], 'src/routes/ide.tsx': [1, 1],
      'src/routes/bot-24x7.tsx': [1, 1], 'src/routes/community/index.tsx': [1, 2], 'src/routes/community/$communityId.tsx': [1, 2], 'src/routes/post/$postId.tsx': [1, 2],
      'src/components/chat-window.tsx': [2, 2] /* estado vazio + conversa */ };
    for (const [f, [n1, n2]] of Object.entries(pages)) {
      const s = rd(f); assert.equal((s.match(/<AdSlot slot=\{1\}/g) || []).length, n1, f + ' slot 1'); assert.equal((s.match(/<AdSlot slot=\{2\}/g) || []).length, n2, f + ' slot 2');
    }
    // Carteira e Bot Trading são iframes das páginas estáticas (que já têm os seus 2): a moldura React não duplica
    for (const f of ['src/routes/index.tsx', 'src/routes/octo-app.tsx']) assert.ok(!rd(f).includes('AdSlot'), f);
    assert.ok(!/<(button)[^>]*aria-label="(Anexar|Web)"/.test(rd('src/components/chat-window.tsx')), 'botões sem função removidos do chat');
  });
  await t('ad.html: só aceita chave de 32 hex e carrega o invoke.js do Adsterra', async () => {
    const h = fs.readFileSync(root + 'public/ad.html', 'utf8');
    const w = new JSDOM(h, { url: 'http://x.test/ad.html?k=' + KEY, runScripts: 'dangerously' }).window; assert.equal(w.atOptions.key, KEY);
    assert.ok(w.document.querySelector('script[src="https://www.highrevenueformat.com/' + KEY + '/invoke.js"]'));
    const bad = new JSDOM(h, { url: 'http://x.test/ad.html?k=%3Cscript%3E', runScripts: 'dangerously' }).window; assert.equal(bad.atOptions, undefined);
  });
  console.log(ok + ' testes de anúncio ok'); process.exit(0);
})();
