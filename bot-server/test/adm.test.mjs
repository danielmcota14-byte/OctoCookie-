// Testa a aba public/adm.html num navegador simulado (jsdom): login Firebase, permissão de admin, carteira dos 2% e Adsterra.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../../public/adm.html', import.meta.url), 'utf8');
let ok = 0;
const t = async (n, f) => { await f(); ok++; console.log('✓', n); };
const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const WALLET = '0x' + 'ab'.repeat(20), ID_TOKEN = 'aaa.bbb.ccc-id-token-firebase';

// servidor simulado: 'admin' | 'comum' (403) | 'semadmin' (503)
function abrir({ modo = 'admin', logado = false, adsItems = [], ethereum = true } = {}) {
  const rec = { fetches: [], signs: [], signedOut: 0, destino: null };
  const dom = new JSDOM(html, { url: 'https://site.test/adm.html', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.TextEncoder = TextEncoder; w.confirm = () => true;
      w.OCTO_BOT_CONFIG = { url: 'https://bot.test', token: 'TOKEN-PUBLICO-DO-SITE-NAO-USAR-123456' };
      let cb = null, user = null;
      const mkUser = (email) => ({ uid: 'uid-123', email, getIdToken: async () => ID_TOKEN });
      const authObj = { get currentUser() { return user; }, onAuthStateChanged(f) { cb = f; setTimeout(() => f(user), 0); },
        async signInWithEmailAndPassword(e, p) { if (p !== 'senha-certa') { const x = new Error('x'); x.code = 'auth/invalid-credential'; throw x; } user = mkUser(e); cb(user); },
        async signInWithPopup() { user = mkUser('google@exemplo.com'); cb(user); }, async signOut() { rec.signedOut++; user = null; cb(null); } };
      if (logado) user = mkUser('dono@exemplo.com');
      w.firebase = { initializeApp() {}, auth: Object.assign(() => authObj, { GoogleAuthProvider: class {} }) };
      w.fetch = async (u, o = {}) => {
        rec.fetches.push({ u: String(u), o });
        const json = (b, status = 200) => ({ ok: status < 400, status, json: async () => b });
        const u2 = String(u);
        if (u2.endsWith('/fee-recipient') && !o.method) return json({ recipient: rec.destino });
        if (u2.includes('/adm/')) {
          if (o.headers.Authorization !== 'Bearer ' + ID_TOKEN) return json({ erro: 'Faça login com a conta de administrador.' }, 401);
          if (modo === 'comum') return json({ erro: 'Esta conta não é administradora.', uid: 'uid-123', email: 'x@y.com' }, 403);
          if (modo === 'semadmin') return json({ erro: 'Painel adm desativado.' }, 503);
          if (u2.endsWith('/adm/ping')) return json({ ok: true, admin: { uid: 'uid-123', email: 'dono@exemplo.com' }, adsterra: true, destinoTaxa: rec.destino });
          if (u2.endsWith('/adm/fee-recipient')) { const b = JSON.parse(o.body); rec.destino = b.recipient; return json({ ok: true, recipient: b.recipient }); }
          if (u2.includes('/adm/adsterra')) return json({ items: adsItems });
        }
        return json({}, 404);
      };
      if (ethereum) w.ethereum = { async request({ method, params }) {
        if (method === 'eth_requestAccounts') return [WALLET];
        if (method === 'eth_getBalance') return '0x' + (1500000000000000000n).toString(16);
        if (method === 'personal_sign') { rec.signs.push(params); return '0x' + 'ee'.repeat(65); }
        throw new Error('método inesperado ' + method);
      }, on() {} };
    } });
  const w = dom.window, $ = (id) => w.document.getElementById(id);
  const visivel = (id) => !$(id).classList.contains('hide');
  return { w, $, rec, visivel, click: (id) => $(id).dispatchEvent(new w.Event('click')) };
}

await t('sem login: mostra só a tela de entrada, nada do painel; URL do servidor vem do site (sem usar o token público)', async () => {
  const { $, visivel, rec } = abrir(); await esp(60);
  assert.ok(visivel('login') && !visivel('app') && !visivel('denied'));
  assert.equal($('url').value, 'https://bot.test'); assert.equal(rec.fetches.length, 0, 'nada é chamado sem login');
  assert.equal($('email').value, 'danimcota@gmail.com'); assert.equal($('email').readOnly, true, 'login único: e-mail travado');
});

await t('entrar com e-mail/senha: servidor confirma admin e o painel abre (ID token no cabeçalho)', async () => {
  const { $, visivel, rec, click } = abrir(); await esp(40);
  $('email').value = 'dono@exemplo.com'; $('senha').value = 'senha-certa'; click('btnEmail'); await esp(120);
  assert.ok(visivel('app') && !visivel('login')); assert.equal($('quem').textContent, 'dono@exemplo.com');
  const ping = rec.fetches.find((f) => f.u.endsWith('/adm/ping')); assert.equal(ping.o.headers.Authorization, 'Bearer ' + ID_TOKEN);
  assert.ok(!rec.fetches.some((f) => JSON.stringify(f.o.headers || {}).includes('TOKEN-PUBLICO')));
  assert.equal($('kAds').textContent, 'configurado');
});

await t('senha errada mostra erro claro e não abre o painel', async () => {
  const { $, visivel, click } = abrir(); await esp(40);
  $('email').value = 'dono@exemplo.com'; $('senha').value = 'errada'; click('btnEmail'); await esp(80);
  assert.match($('loginMsg').textContent, /incorretos/); assert.ok(visivel('login') && !visivel('app'));
});

await t('conta que não é admin vê "Sem permissão" com o próprio UID para colocar em ADMIN_UIDS; painel não abre', async () => {
  const { $, visivel, click } = abrir({ modo: 'comum' }); await esp(40);
  click('btnGoogle'); await esp(120);
  assert.ok(visivel('denied') && !visivel('app')); assert.equal($('uid').textContent, 'uid-123');
});

await t('servidor sem admin configurado: avisa e não abre o painel', async () => {
  const { $, visivel, click } = abrir({ modo: 'semadmin' }); await esp(40);
  $('email').value = 'a@b.com'; $('senha').value = 'senha-certa'; click('btnEmail'); await esp(120);
  assert.ok(visivel('login') && !visivel('app')); assert.match($('loginMsg').textContent, /Servidor sem admin configurado/);
});

await t('já logado no site (sessão compartilhada) entra direto; sair volta para a tela de login', async () => {
  const { $, visivel, rec, click } = abrir({ logado: true }); await esp(150);
  assert.ok(visivel('app')); click('btnSair'); await esp(60); assert.equal(rec.signedOut, 1); assert.ok(visivel('login') && !visivel('app'));
});

await t('carteira dos 2%: conecta, assina a mensagem certa e o servidor recebe com o ID token', async () => {
  const { $, rec, click } = abrir({ logado: true }); await esp(150);
  click('btnConn'); await esp(100);
  assert.equal($('conn').textContent, WALLET); assert.match($('bal').textContent, /1\.5000 ETH/); assert.equal($('btnSet').disabled, false);
  click('btnSet'); await esp(120);
  const [hex, addr] = rec.signs[0]; assert.equal(addr, WALLET);
  const msg = Buffer.from(hex.slice(2), 'hex').toString('utf8').split('\n');
  assert.equal(msg[0], 'OctoCookie — destino da taxa de serviço (2%)'); assert.equal(msg[1], 'Carteira: ' + WALLET); assert.match(msg[2], /^Emitido em: \d{4}-\d\d-\d\dT/);
  const post = rec.fetches.find((f) => f.u.endsWith('/adm/fee-recipient') && f.o.method === 'POST');
  assert.equal(post.o.headers.Authorization, 'Bearer ' + ID_TOKEN);
  const b = JSON.parse(post.o.body); assert.equal(b.recipient, WALLET); assert.equal(b.signature, '0x' + 'ee'.repeat(65)); assert.equal(b.message, msg.join('\n'));
  assert.match($('msg').textContent, /Pronto/); assert.equal($('atual').textContent, WALLET); assert.match($('cmp').textContent, /já é o destino/);
});

await t('Adsterra: visão geral, tabela e totais corretos; texto da API nunca vira HTML (sem XSS)', async () => {
  const items = [{ date: '2026-10-08', impression: 1000, clicks: 10, ctr: 1, cpm: 0.5, revenue: 0.5 }, { date: '<img src=x onerror=alert(1)>', impressions: '3000', clicks: 20, revenue: '1.5' }];
  const { $, w, rec, click } = abrir({ logado: true, adsItems: items }); await esp(200);
  assert.equal($('kRev').textContent, 'US$ 2.00'); assert.equal($('spark').children.length, 2);
  click('btnAds'); await esp(100);
  const call = rec.fetches.filter((f) => f.u.includes('/adm/adsterra')).pop(); assert.ok(/endpoint=stats&start_date=\d{4}-\d\d-\d\d&finish_date=\d{4}-\d\d-\d\d&group_by=date/.test(call.u), call.u);
  const rows = [...$('tbl').tBodies[0].rows]; assert.equal(rows.length, 2);
  assert.equal(rows[1].cells[0].textContent, '<img src=x onerror=alert(1)>'); assert.equal(w.document.querySelector('img'), null);
  const tot = [...$('tbl').tFoot.rows[0].cells].map((c) => c.textContent);
  assert.equal(tot[1].replace(/\D/g, ''), '4000'); assert.equal(tot[2], '30'); assert.equal(tot[5], '2.0000'); assert.equal(tot[4], '0.500');
});

await t('o arquivo não contém tokens/segredos, só carrega scripts do próprio site e do Google/Firebase, e tem CSP', async () => {
  assert.ok(!/[0-9a-f]{32}/i.test(html), 'nenhum token hexadecimal pode estar no HTML público');
  assert.match(html, /Content-Security-Policy/); assert.match(html, /default-src 'none'/);
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.every((s) => s.startsWith('./') || s.startsWith('https://www.gstatic.com/firebasejs/10.12.0/')), srcs.join(', '));
  assert.ok(!/ADMIN_TOKEN|X-API-Key/.test(html));
});

console.log(`\n${ok} testes do adm ok`); process.exit(0);
