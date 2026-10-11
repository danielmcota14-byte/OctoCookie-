const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path'), assert = require('assert');
const dir = path.join(__dirname, '../../public/octocookie-app/');
const ads = fs.readFileSync(dir + 'ads.js', 'utf8');
const KEY = '5eff732876fbe681c4bcf4138968a691', K2 = 'a'.repeat(32);
async function run(url, { embedded = false, cfg = null } = {}) {
  const outer = new JSDOM('<body><iframe id="f"></iframe></body>', { url: 'http://x.test/', runScripts: 'dangerously' });
  const w = embedded ? outer.window.document.getElementById('f').contentWindow : new JSDOM('<body><p>conteudo</p></body>', { url, runScripts: 'dangerously', pretendToBeVisual: true }).window;
  if (embedded) w.document.body.innerHTML = '<p>conteudo</p>';
  if (cfg) w.OCTO_ADS = cfg;
  w.eval(ads); await new Promise((r) => setTimeout(r, 80)); return w;
}
let ok = 0; const t = async (n, f) => { await f(); ok++; console.log('✓', n); };
(async () => {
  await t('página solta: dois banners JUNTOS no rodapé (nenhum no topo), isolados e com a chave certa', async () => {
    const w = await run('http://x.test/cryptex.html');
    const docks = w.document.querySelectorAll('#octo-ads'); assert.equal(docks.length, 1);
    const frames = docks[0].querySelectorAll('iframe'); assert.equal(frames.length, 2);
    assert.equal(w.document.body.firstElementChild.tagName, 'P', 'nada no topo');
    assert.equal(docks[0].style.position, 'fixed'); assert.equal(parseFloat(docks[0].style.bottom), 0);
    for (const f of frames) {
      const sb = f.getAttribute('sandbox'); assert.ok(sb.includes('allow-scripts') && !sb.includes('allow-same-origin') && !sb.includes('allow-top-navigation'), sb);
      assert.equal(f.getAttribute('src'), '/ad.html?k=' + KEY); assert.equal(f.getAttribute('width'), '468'); assert.equal(f.getAttribute('height'), '60');
    }
    assert.ok(w.document.body.style.paddingBottom, 'conteúdo não fica escondido atrás do rodapé');
  });
  await t('uma chave por banner (OCTO_ADS.keys); chave inválida cai no padrão', async () => {
    const w = await run('http://x.test/a.html', { cfg: { keys: [KEY, K2] } }); const f = [...w.document.querySelectorAll('#octo-ads iframe')];
    assert.ok(f[0].src.includes(KEY) && f[1].src.includes(K2) && !f[1].src.includes(KEY));
    const w2 = await run('http://x.test/a.html', { cfg: { keys: ['<script>', K2] } }); const g = [...w2.document.querySelectorAll('#octo-ads iframe')];
    assert.ok(g[0].src.includes(KEY) && !g[0].src.includes('<script') && g[1].src.includes(K2));
  });
  await t('sandbox:false desliga o isolamento, mas no octocookie.html ele fica SEMPRE ligado', async () => {
    const a = await run('http://x.test/cryptex.html', { cfg: { sandbox: false } }); assert.ok([...a.document.querySelectorAll('#octo-ads iframe')].every((f) => !f.hasAttribute('sandbox')));
    const b = await run('http://x.test/octocookie-app/octocookie.html', { cfg: { sandbox: false } }); assert.ok([...b.document.querySelectorAll('#octo-ads iframe')].every((f) => f.hasAttribute('sandbox')));
  });
  await t('dentro do site (iframe) não coloca banner; executor do servidor (?headless=1) nunca carrega anúncio', async () => {
    assert.equal((await run('http://x.test/a.html', { embedded: true })).document.querySelectorAll('#octo-ads').length, 0);
    assert.equal((await run('http://x.test/octocookie.html?headless=1')).document.querySelectorAll('#octo-ads').length, 0);
  });
  await t('chamar duas vezes não duplica', async () => { const w = await run('http://x.test/'); w.eval(ads); await new Promise((r) => setTimeout(r, 50)); assert.equal(w.document.querySelectorAll('#octo-ads iframe').length, 2); });
  await t('as 4 páginas estáticas incluem ads.js uma vez, sem snippet cru do anunciante', async () => {
    for (const f of ['index.html', 'octocookie.html', 'cryptex.html', 'dashboard_analisador.html']) {
      const s = fs.readFileSync(dir + f, 'utf8'); assert.equal((s.match(/src="\.\/ads\.js"/g) || []).length, 1, f); assert.ok(!s.includes('highrevenueformat'), f);
    }
  });
  await t('site React: dois banners no rodapé e nenhum no topo (código-fonte)', async () => {
    const root = fs.readFileSync(path.join(__dirname, '../../src/routes/__root.tsx'), 'utf8'), bar = fs.readFileSync(path.join(__dirname, '../../src/components/ad-bar.tsx'), 'utf8');
    assert.equal((root.match(/<AdDock/g) || []).length, 1); assert.ok(!/AdBar/.test(root)); assert.ok(/AD_KEYS: \[string, string\]/.test(bar) && bar.includes('AD_KEYS.map'));
    assert.ok(root.indexOf('<Outlet') < root.indexOf('<AdDock'), 'banners depois do conteúdo');
  });
  await t('ad.html: só aceita chave de 32 hex e carrega o invoke.js do Adsterra', async () => {
    const h = fs.readFileSync(path.join(__dirname, '../../public/ad.html'), 'utf8');
    const w = new JSDOM(h, { url: 'http://x.test/ad.html?k=' + KEY, runScripts: 'dangerously' }).window; assert.equal(w.atOptions.key, KEY);
    assert.ok(w.document.querySelector('script[src="https://www.highrevenueformat.com/' + KEY + '/invoke.js"]'));
    const bad = new JSDOM(h, { url: 'http://x.test/ad.html?k=%3Cscript%3E', runScripts: 'dangerously' }).window; assert.equal(bad.atOptions, undefined);
  });
  console.log(ok + ' testes de anúncio ok'); process.exit(0);
})();
