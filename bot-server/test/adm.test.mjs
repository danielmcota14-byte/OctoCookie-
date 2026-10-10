// Testa a aba public/adm.html num navegador simulado (jsdom): conexão, assinatura da carteira, destino dos 2% e tabela do Adsterra.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../../public/adm.html', import.meta.url), 'utf8');
let ok = 0;
const t = async (n, f) => { await f(); ok++; console.log('✓', n); };
const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const ADMIN = 'admin-token-de-teste-123456789', WALLET = '0x' + 'ab'.repeat(20);

function abrir({ adsItems, ethereum = true } = {}) {
  const rec = { fetches: [], signs: [], alerts: [] };
  const dom = new JSDOM(html, { url: 'https://site.test/adm.html', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.TextEncoder = TextEncoder; w.confirm = () => true; w.alert = (m) => rec.alerts.push(m);
      w.OCTO_BOT_CONFIG = { url: 'https://bot.test', token: 'TOKEN-PUBLICO-DO-SITE-NAO-USAR-123456' }; // o que o bot-config.js publica
      w.fetch = async (u, o = {}) => {
        rec.fetches.push({ u: String(u), o });
        const json = (b, status = 200) => ({ ok: status < 400, status, json: async () => b });
        if (String(u).endsWith('/fee-recipient') && !o.method) return json({ recipient: rec.destino || null });
        if (String(u).endsWith('/adm/ping')) return o.headers.Authorization === 'Bearer ' + ADMIN ? json({ ok: true, adsterra: true }) : json({ erro: 'Token de admin inválido.' }, 401); // como o servidor real
        if (String(u).endsWith('/adm/fee-recipient')) { const b = JSON.parse(o.body); rec.destino = b.recipient; return json({ ok: true, recipient: b.recipient }); }
        if (String(u).includes('/adm/adsterra')) return json({ items: adsItems || [] });
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
  return { w, $, rec, click: (id) => $(id).dispatchEvent(new w.Event('click')) };
}

await t('usa o token de ADMIN digitado (nunca o token público do bot-config.js) e a URL do site', async () => {
  const { $, rec, click } = abrir(); await esp(50);
  assert.equal($('area').style.display, 'none', 'carteira e receita ficam ocultas antes do login');
  assert.equal($('url').value, 'https://bot.test');
  assert.equal($('tok').value, '', 'o token público do site não pré-preenche o admin');
  $('tok').value = ADMIN; click('btnPing'); await esp(50);
  const ping = rec.fetches.find((f) => f.u.endsWith('/adm/ping'));
  assert.equal(ping.o.headers.Authorization, 'Bearer ' + ADMIN);
  assert.ok(!rec.fetches.some((f) => JSON.stringify(f.o.headers || {}).includes('TOKEN-PUBLICO')));
  assert.match($('ping').textContent, /Acesso liberado/);
  assert.equal($('area').style.display, 'grid', 'libera as seções depois do login');
});

await t('token errado: continua bloqueado', async () => {
  const { $, click } = abrir(); await esp(50);
  $('tok').value = 'x'.repeat(30); click('btnPing'); await esp(50);
  assert.equal($('area').style.display, 'none');
});

await t('conecta a carteira, mostra saldo e envia a assinatura certa para definir os 2%', async () => {
  const { $, rec, click } = abrir(); await esp(50);
  $('tok').value = ADMIN; click('btnConn'); await esp(80);
  assert.equal($('conn').textContent, WALLET); assert.match($('bal').textContent, /1\.5000 ETH/); assert.equal($('btnSet').disabled, false);
  click('btnSet'); await esp(100);
  const [hex, addr] = rec.signs[0]; assert.equal(addr, WALLET);
  const msg = Buffer.from(hex.slice(2), 'hex').toString('utf8').split('\n');
  assert.equal(msg[0], 'OctoCookie — destino da taxa de serviço (2%)'); assert.equal(msg[1], 'Carteira: ' + WALLET); assert.match(msg[2], /^Emitido em: \d{4}-\d\d-\d\dT/);
  const post = rec.fetches.find((f) => f.u.endsWith('/adm/fee-recipient') && f.o.method === 'POST');
  assert.equal(post.o.headers.Authorization, 'Bearer ' + ADMIN);
  const b = JSON.parse(post.o.body); assert.equal(b.recipient, WALLET); assert.equal(b.signature, '0x' + 'ee'.repeat(65)); assert.equal(b.message, msg.join('\n'));
  assert.match($('msg').textContent, /Pronto/); assert.equal($('atual').textContent, WALLET); assert.match($('cmp').textContent, /já é o destino/);
});

await t('sem carteira instalada: mensagem clara, nada é enviado', async () => {
  const { $, rec, click } = abrir({ ethereum: false }); await esp(50);
  click('btnConn'); await esp(30); assert.match($('msg').textContent, /Nenhuma carteira/); assert.equal(rec.signs.length, 0);
});

await t('Adsterra: tabela e totais corretos; texto da API nunca vira HTML (sem XSS)', async () => {
  const items = [{ date: '2026-10-08', impression: 1000, clicks: 10, ctr: 1, cpm: 0.5, revenue: 0.5 }, { date: '<img src=x onerror=alert(1)>', impressions: '3000', clicks: 20, revenue: '1.5' }];
  const { $, w, rec, click } = abrir({ adsItems: items }); await esp(50);
  $('tok').value = ADMIN; click('btnAds'); await esp(100);
  const call = rec.fetches.find((f) => f.u.includes('/adm/adsterra')); assert.ok(/endpoint=stats&start_date=\d{4}-\d\d-\d\d&finish_date=\d{4}-\d\d-\d\d&group_by=date/.test(call.u), call.u);
  assert.equal(call.o.headers.Authorization, 'Bearer ' + ADMIN);
  const rows = [...$('tbl').tBodies[0].rows]; assert.equal(rows.length, 2);
  assert.equal(rows[1].cells[0].textContent, '<img src=x onerror=alert(1)>'); assert.equal(w.document.querySelector('img'), null);
  const tot = [...$('tbl').tFoot.rows[0].cells].map((c) => c.textContent);
  assert.equal(tot[1].replace(/\D/g, ''), '4000'); assert.equal(tot[2], '30'); assert.equal(tot[5], '2.0000'); assert.equal(tot[4], '0.500');
  assert.match($('kpis').textContent, /US\$ 2\.00/);
});

await t('o arquivo não contém tokens/segredos e bloqueia scripts externos por CSP', async () => {
  assert.ok(!/[0-9a-f]{32}/i.test(html), 'nenhum token/chave hexadecimal pode estar no HTML público');
  assert.match(html, /Content-Security-Policy/); assert.match(html, /default-src 'none'/); assert.ok(!/<script[^>]+src="https?:/.test(html));
});

console.log(`\n${ok} testes do adm ok`); process.exit(0);
