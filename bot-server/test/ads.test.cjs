const { JSDOM } = require('jsdom');
const fs = require('fs'), assert = require('assert');
const dir = require('path').join(__dirname, '../../public/octocookie-app/') ;
const ads = fs.readFileSync(dir + 'ads.js', 'utf8');
const KEY = '5eff732876fbe681c4bcf4138968a691';
async function run(url, embedded) {
  const outer = new JSDOM('<body><iframe id="f"></iframe></body>', { url: 'http://x.test/', runScripts: 'dangerously' });
  const w = embedded ? outer.window.document.getElementById('f').contentWindow : new JSDOM('<body><p>conteudo</p></body>', { url, runScripts: 'dangerously' }).window;
  if (embedded) w.document.body.innerHTML = '<p>conteudo</p>';
  w.eval(ads); await new Promise((r) => setTimeout(r, 80)); return w;
}
let ok = 0; const t = async (n, f) => { await f(); ok++; console.log('✓', n); };
(async () => {
await t('página solta: 2 banners (topo primeiro, rodapé último), isolados e com a chave certa', async () => {
  const w = await run('http://x.test/octocookie.html');
  const bars = w.document.querySelectorAll('.octo-ad'); assert.equal(bars.length, 2);
  assert.equal(w.document.body.firstElementChild, bars[0]); assert.equal(w.document.body.lastElementChild, bars[1]);
  for (const f of w.document.querySelectorAll('.octo-ad iframe')) {
    const sb = f.getAttribute('sandbox'); assert.ok(sb.includes('allow-scripts') && !sb.includes('allow-same-origin') && !sb.includes('allow-top-navigation'), sb);
    const d = f.srcdoc; assert.ok(d.includes("'key':'" + KEY + "'") && d.includes('highrevenueformat.com/' + KEY + '/invoke.js') && d.includes("'height':60") && d.includes("'width':468"));
    assert.equal(f.width, '468'); assert.equal(f.height, '60');
  }
});
await t('dentro do site (iframe) não coloca banner (a moldura do site já mostra os dois)', async () => assert.equal((await run('http://x.test/a.html', true)).document.querySelectorAll('.octo-ad').length, 0));
await t('executor do servidor (?headless=1) nunca carrega anúncio', async () => assert.equal((await run('http://x.test/octocookie.html?headless=1')).document.querySelectorAll('.octo-ad').length, 0));
await t('chamar duas vezes não duplica', async () => { const w = await run('http://x.test/'); w.eval(ads); await new Promise((r) => setTimeout(r, 50)); assert.equal(w.document.querySelectorAll('.octo-ad').length, 2); });
await t('as 4 páginas estáticas incluem ads.js uma vez, sem snippet cru do anunciante', () => {
  for (const f of ['index.html', 'octocookie.html', 'cryptex.html', 'dashboard_analisador.html']) {
    const s = fs.readFileSync(dir + f, 'utf8'); assert.equal((s.match(/src="\.\/ads\.js"/g) || []).length, 1, f); assert.ok(!s.includes('highrevenueformat'), f);
  }
});
console.log(ok + ' testes de anúncio ok'); process.exit(0);
})();
