/**
 * OctoCookie — Modo 24/7 no servidor.
 *
 * O bot continua sendo o octocookie.html: o servidor abre ESTA mesma página num Chromium sem tela e ela roda
 * sozinha, com o site fechado. Para assinar sem você, a página do servidor recebe a chave de uma carteira dedicada:
 *
 *   1. Seu navegador pede ao servidor uma chave pública ECDH (P-256) de uso único.
 *   2. Seu navegador cria um par efêmero e faz Diffie-Hellman → HKDF-SHA256 → chave AES-256-GCM de transporte.
 *      A chave da carteira vai cifrada nesse canal (só a chave da conta escolhida, nunca a seed inteira).
 *   3. O servidor decifra, gera uma chave AES-256 ALEATÓRIA (K), cifra a carteira com ela e DEVOLVE K a você pelo
 *      mesmo canal cifrado. O servidor não guarda K: ela fica com você (neste navegador + arquivo exportável).
 *   4. Para ligar o bot, você envia K ao servidor (de novo por Diffie-Hellman). Ele abre a carteira só na memória.
 *      Se o servidor reiniciar, o bot fica TRANCADO até você reenviar K (esta página faz isso sozinha quando aberta),
 *      a menos que você marque "reiniciar sozinho" (aí o servidor guarda K cifrada com a chave mestra dele).
 */
(function () {
  'use strict';

  const LS = 'octocookie.247.v2';
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const S = (globalThis.crypto || {}).subtle;
  const EC = { name: 'ECDH', namedCurve: 'P-256' };
  const FIELD_IDS = ['networkSelect', 'tradePairSelect', 'stakePct', 'slPct', 'tpPct', 'maxTradesInput', 'securityLevel', 'riskLevel', 'usarLimDia'];

  const b64 = (u) => { u = new Uint8Array(u); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); };
  const unb64 = (s) => { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };

  // ---------- criptografia (funções puras, testáveis) ----------
  async function newPair() {
    const kp = await S.generateKey(EC, false, ['deriveBits']);
    return { priv: kp.privateKey, pub: b64(await S.exportKey('raw', kp.publicKey)) };
  }
  async function channelKeys(priv, peerPubB64, serverPubB64) {
    const peer = await S.importKey('raw', unb64(peerPubB64), EC, false, []);
    const bits = await S.deriveBits({ name: 'ECDH', public: peer }, priv, 256);
    const hk = await S.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
    const mk = (info) => S.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: unb64(serverPubB64), info: enc.encode(info) },
      hk, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    return { c2s: await mk('octocookie-247-v2|c2s'), s2c: await mk('octocookie-247-v2|s2c') };
  }
  // Cliente: cifra `payload` para o servidor (identificado por hello.id/hello.pub). Devolve o corpo da requisição + o que precisa para abrir a resposta.
  async function seal(hello, payload) {
    const eph = await newPair();
    const keys = await channelKeys(eph.priv, hello.pub, hello.pub);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await S.encrypt({ name: 'AES-GCM', iv, additionalData: unb64(hello.pub) }, keys.c2s, enc.encode(JSON.stringify(payload)));
    return { body: { id: hello.id, e: eph.pub, i: b64(iv), c: b64(ct) }, keys, id: hello.id };
  }
  async function openReply(sealed, reply) {
    const pt = await S.decrypt({ name: 'AES-GCM', iv: unb64(reply.i), additionalData: enc.encode('reply:' + sealed.id) }, sealed.keys.s2c, unb64(reply.c));
    return JSON.parse(dec.decode(pt));
  }
  // seed (12/24 palavras, conta idx) ou chave privada hex -> { pk, addr }
  function deriveKey(input, idx) {
    const t = String(input || '').trim();
    if (/^(0x)?[0-9a-fA-F]{64}$/.test(t)) {
      const pk = t.startsWith('0x') ? t : '0x' + t;
      return { pk, addr: new ethers.Wallet(pk).address };
    }
    const words = t.toLowerCase().split(/\s+/).filter(Boolean);
    if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error('Informe uma seed de 12/24 palavras ou uma chave privada de 64 caracteres hex.');
    const w = ethers.HDNodeWallet.fromPhrase(words.join(' '), undefined, `m/44'/60'/0'/0/${Number(idx) || 0}`);
    return { pk: w.privateKey, addr: w.address };
  }

  const api = { _crypto: { newPair, channelKeys, seal, openReply, deriveKey, b64, unb64 }, active: false, feeConsent: false };
  globalThis.OCTO247 = api;
  if (typeof document === 'undefined') return; // ambiente de teste (sem DOM)

  const HEADLESS = new URLSearchParams(location.search).get('headless') === '1';
  const $ = (id) => document.getElementById(id);
  const log = (m, t) => { try { addLog(m, t || 'info'); } catch (e) { console.log(m); } };

  // =====================================================================
  //  LADO SERVIDOR (Chromium sem tela): o runner chama OCTO247.headless(pk, opts)
  // =====================================================================
  let pkMem = null, watchdog = null, lastDay = new Date().getDate();

  function buildProvider() {
    const net = NETWORKS[CONFIG.network];
    return new ethers.JsonRpcProvider(net.rpc, net.chainId);
  }

  async function activate(pk, feeConsent) {
    pkMem = pk;
    const prov = buildProvider();
    const w = new ethers.Wallet(pk, prov);
    state.provider = prov; state.browserProvider = null;
    state.wallet = w; state.walletAddress = w.address;
    state.apiStatus.provider = true;
    api.active = true; api.feeConsent = !!feeConsent;
    try { updateAPIStatus(); } catch (e) {}
    const trunc = w.address.slice(0, 6) + '...' + w.address.slice(-4);
    const wa = $('walletAddress'); if (wa) wa.textContent = '🤖 Executor 24/7: ' + trunc;
    try { await refreshBalance(); updateBalance(); } catch (e) {}
    try { updateConnectionBar('connected', 'Executor 24/7 — ' + trunc); } catch (e) {}
    const a = $('tradeStartHour'), b = $('tradeEndHour'); // 24/7: janela de operação o dia todo
    if (a) a.value = 0; if (b) b.value = 24;
    CONFIG.tradeStartHour = 0; CONFIG.tradeEndHour = 24;
    startWatchdog();
    log('🤖 Modo 24/7 ativo em ' + trunc + ' (rodando no servidor).', 'success');
    if (!state.botRunning) confirmFeeConsentAndStart();
  }

  function startWatchdog() {
    if (watchdog) clearInterval(watchdog);
    watchdog = setInterval(async () => {
      if (!api.active) return;
      try {
        try { // saúde do RPC: se falhar, recria provider + signer com a chave em memória
          await Promise.race([state.provider.getBlockNumber(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 15000))]);
        } catch (e) {
          log('⚠️ RPC sem resposta (' + e.message + '). Reconectando...', 'warn');
          const prov = buildProvider();
          state.provider = prov; state.wallet = new ethers.Wallet(pkMem, prov);
        }
        const d = new Date().getDate(); // novo dia: se o bot parou por limite diário, zera e retoma
        if (d !== lastDay) {
          lastDay = d;
          if (!state.botRunning) { resetDaily(); confirmFeeConsentAndStart(); log('🌅 Novo dia: bot retomado automaticamente.', 'info'); }
        }
        try { await refreshBalance(); updateBalance(); } catch (e) {}
      } catch (e) { console.warn('watchdog', e); }
    }, 60000);
  }

  // Entrada do runner: aplica campos da UI (id -> valor), troca RPCs e liga o executor.
  api.headless = async function (pk, opts) {
    opts = opts || {};
    for (const [net, url] of Object.entries(opts.rpc || {})) if (NETWORKS[net] && /^https:\/\//.test(url)) NETWORKS[net].rpc = url;
    if (opts.feeRecipient) window.setFeeRecipient(opts.feeRecipient); // destino dos 2% definido no /adm.html
    for (const [id, v] of Object.entries(opts.fields || {})) {
      const el = $(id); if (!el) { log('⚠️ Campo de configuração inexistente: ' + id, 'warn'); continue; }
      if (el.type === 'checkbox') el.checked = !!v; else el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (opts.fields && opts.fields.networkSelect) CONFIG.network = opts.fields.networkSelect;
    if (opts.fields && opts.fields.tradePairSelect) CONFIG.pair = opts.fields.tradePairSelect;
    await activate(pk, !!opts.fee);
    return { address: state.walletAddress, running: !!state.botRunning };
  };
  api.snapshot = () => ({
    active: api.active, running: !!state.botRunning, price: state.currentPrice, balance: state.balance, trades: state.tradesToday,
    pnlDia: state.dailyProfitPct, wins: state.wins, losses: state.losses, address: state.walletAddress, priceTs: state.priceTs || 0,
    lista: (state.trades || []).slice(0, 20),
  });
  api.stop = () => { api.active = false; if (watchdog) { clearInterval(watchdog); watchdog = null; } try { if (state.botRunning) stopBot(); } catch (e) {} pkMem = null; state.wallet = null; };

  // No servidor não existe MetaMask: trocar de rede só recria o signer com a chave pareada.
  const _change = window.changeNetwork;
  window.changeNetwork = async function () {
    if (!api.active) return _change && _change.apply(this, arguments);
    CONFIG.network = $('networkSelect').value;
    if (pkMem) await activate(pkMem, api.feeConsent);
  };

  if (HEADLESS) return; // o resto é a interface do SEU navegador

  // =====================================================================
  //  LADO USUÁRIO (seu navegador): card "Bot 24/7 no servidor"
  // =====================================================================
  const load = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };
  const say = (t, c) => { const e = $('o247Status'); if (e) { e.textContent = t; e.style.color = c || 'var(--text2)'; } };

  function defaultBotUrl() {
    try {
      const cfg = globalThis.OCTO_BOT_CONFIG || {};
      if (typeof cfg.url === 'string' && cfg.url.trim()) return cfg.url.trim().replace(/\/+$/, '');
    } catch (e) {}
    return 'https://octocookie-bot-24x7.onrender.com';
  }
  function defaultBotToken() {
    try {
      const cfg = globalThis.OCTO_BOT_CONFIG || {};
      if (typeof cfg.token === 'string' && cfg.token.trim().length >= 24) return cfg.token.trim();
    } catch (e) {}
    try {
      const c = load();
      if (c.token && String(c.token).length >= 24) return String(c.token).trim();
    } catch (e) {}
    return '';
  }
  function serverUrl() {
    // URL fixa — sem campo no card
    const u = (defaultBotUrl() || '').trim().replace(/\/+$/, '');
    if (!/^https:\/\/[^\s]+$/.test(u) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(u)) throw new Error('URL do servidor inválida (use https://).');
    return u;
  }
  function ownerToken() {
    const t = defaultBotToken();
    if (!t || t.length < 24) throw new Error('OWNER_TOKEN não configurado (mín. 24 caracteres).');
    return t;
  }
  async function http(url, token, path, method, body) {
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      throw new Error('URL do servidor inválida ou vazia. Configure no card "Bot 24/7 no servidor".');
    }
    const r = await fetch(url + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status === 404) throw new Error('HTTP 404 em ' + path + ' — essa URL não é o bot-server (falta /247/* e /status). Use a URL do serviço separado.');
      throw new Error(j.erro || ('HTTP ' + r.status));
    }
    return j;
  }
  // um pedido protegido: hello → Diffie-Hellman → AES-256-GCM → resposta cifrada
  async function secure(url, token, path, payload) {
    const hello = await http(url, token, '/247/hello', 'POST');
    const sealed = await seal(hello, payload);
    const reply = await http(url, token, path, 'POST', sealed.body);
    return reply.c ? openReply(sealed, reply) : reply;
  }

  function collectConfig() {
    const fields = {};
    FIELD_IDS.forEach((id) => { const el = $(id); if (el) fields[id] = el.type === 'checkbox' ? el.checked : el.value; });
    let hg = null; try { hg = JSON.parse(localStorage.getItem('octo_hg_v3') || 'null'); } catch (e) {}
    return { fields, hg };
  }

  async function armNow(silent) {
    const c = load();
    const url = serverUrl(), token = ownerToken();
    if (!c.k) throw new Error('Falta chave K neste navegador. Ative o 24/7 de novo.');
    const cfg = collectConfig();
    const r = await secure(url, token, '/247/arm', { k: c.k, ...cfg, fee: !!c.fee, autoRearm: !!c.autoRearm });
    if (!silent) say('✅ Bot rodando no servidor na carteira ' + r.addr + '. Pode fechar o site.', 'var(--green)');
    return r;
  }

  async function ativar() {
    try {
      const url = serverUrl(), token = ownerToken();
      if (!$('o247Consent').checked) throw new Error('Marque a autorização para o servidor assinar sozinho.');
      const { pk, addr } = deriveKey($('o247Secret').value, $('o247Idx').value);
      if (!confirm('Enviar a chave da carteira ' + addr + ' ao servidor ' + url + '?\n\nSó a chave DESTA conta viaja (não a seed), cifrada por Diffie-Hellman + AES-256. Use uma carteira dedicada ao bot, com pouco saldo.')) return;
      say('Pareando (Diffie-Hellman + AES-256)...');
      const r = await secure(url, token, '/247/pair', { pk });
      if (String(r.addr).toLowerCase() !== addr.toLowerCase()) throw new Error('O servidor devolveu outro endereço. Abortado.');
      save({ url, token, addr, k: r.k, fee: $('o247Fee').checked, autoRearm: $('o247Auto').checked });
      $('o247Secret').value = '';
      say('Chave K recebida e guardada neste navegador. Ligando o bot...');
      await armNow();
      renderKeyBox();
      atualizar();
    } catch (e) { say('Erro: ' + e.message, 'var(--red)'); }
  }
  async function desativar() {
    try { await http(serverUrl(), ownerToken(), '/247/disarm', 'POST'); say('Bot parado e chave apagada da memória do servidor.', 'var(--green)'); atualizar(); }
    catch (e) { say('Erro: ' + e.message, 'var(--red)'); }
  }
  async function apagar() {
    if (!confirm('Parar o bot, apagar a carteira cifrada do servidor e esta chave K do navegador?')) return;
    try { await http(serverUrl(), ownerToken(), '/247/wipe', 'POST'); save({ url: serverUrl(), token: ownerToken() }); say('Tudo apagado.', 'var(--green)'); renderKeyBox(); atualizar(); }
    catch (e) { say('Erro: ' + e.message, 'var(--red)'); }
  }
  async function atualizar() {
    try {
      const s = await http(serverUrl(), ownerToken(), '/247/status', 'GET');
      const lines = [s.pareado ? 'Carteira: ' + s.endereco : 'Sem carteira pareada', s.armado ? (s.rodando ? '🟢 rodando 24/7' : '🟡 armado, aguardando a página iniciar') : '🔒 trancado (precisa da chave K)',
        s.preco ? 'Preço ' + Number(s.preco).toFixed(2) + ' · saldo ' + Number(s.saldo || 0).toFixed(5) + ' · ordens hoje ' + (s.ordensHoje || 0) + ' · P&L dia ' + Number(s.pnlDia || 0).toFixed(2) + '%' : ''].filter(Boolean);
      say(lines.join('\n'));
      const lg = $('o247Logs'); if (lg) lg.textContent = (s.logs || []).slice(0, 25).join('\n');
      return s;
    } catch (e) { say('Servidor: ' + e.message, 'var(--red)'); return null; }
  }
  // Se o servidor reiniciou (trancado) e esta página está aberta, ela reenvia K sozinha.
  async function vigia() {
    const c = load(); if (!c.k) return;
    const s = await atualizar();
    if (s && s.pareado && !s.armado && c.armarSempre !== false) { try { await armNow(true); log('🔓 Servidor tinha reiniciado: bot 24/7 religado com a sua chave K.', 'info'); atualizar(); } catch (e) {} }
  }
  function exportarK() {
    const c = load(); if (!c.k) return say('Ainda não há chave K neste navegador.', 'var(--red)');
    const txt = 'OctoCookie 24/7 — chave K (AES-256) da carteira ' + c.addr + '\nServidor: ' + serverUrl() + '\nK=' + c.k + '\n\nGuarde em local seguro. Sem ela o servidor não consegue abrir a carteira cifrada.\n';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = 'octocookie-247-chave-K.txt'; a.click();
  }
  function importarK() {
    const k = prompt('Cole a chave K (base64):'); if (!k) return;
    try { if (unb64(k.trim()).length !== 32) throw 0; } catch (e) { return say('Chave K inválida (deve ter 32 bytes em base64).', 'var(--red)'); }
    const c = load(); c.k = k.trim(); save(c); renderKeyBox(); say('Chave K importada.', 'var(--green)');
  }
  function renderKeyBox() { const c = load(), e = $('o247KeyInfo'); if (e) e.textContent = c.k ? '🔑 Chave K guardada neste navegador (carteira ' + c.addr + ').' : 'Nenhuma chave K neste navegador.'; }

  function build() {
    const mount = $('o247Mount'); if (!mount) return;
    const c = load();
    mount.innerHTML = `
    <div class="card" id="o247Card">
      <div class="card-header"><i class="fas fa-server"></i> Bot 24/7 no servidor</div>
      <p style="font-size:11px;color:var(--text3);margin:0 0 10px;line-height:1.5">O servidor abre este mesmo bot sozinho e opera <b>on-chain</b> com uma carteira dedicada, mesmo com o site fechado.
      A chave viaja por <b>Diffie-Hellman + AES-256</b> e a chave K que abre a carteira volta para <b>você</b>.</p>
      <label style="font-size:11px;margin-top:6px;display:block">Seed (12/24 palavras) ou chave privada da carteira DEDICADA ao bot</label>
      <input id="o247Secret" type="password" autocomplete="off" placeholder="••••••••">
      <label style="font-size:11px;margin-top:6px;display:block">Índice da conta (0 = primeira)</label>
      <input id="o247Idx" type="number" value="0" min="0" max="99">
      <label style="text-transform:none;letter-spacing:0;margin-top:8px;display:flex;gap:6px;align-items:flex-start;font-size:11px"><input type="checkbox" id="o247Consent" style="width:auto;margin-top:2px"><span>Autorizo o servidor a assinar swaps sozinho com esta carteira, sem pedir aprovação a cada transação.</span></label>
      <label style="text-transform:none;letter-spacing:0;margin-top:6px;display:flex;gap:6px;align-items:flex-start;font-size:11px"><input type="checkbox" id="o247Fee" ${c.fee ? 'checked' : ''} style="width:auto;margin-top:2px"><span>Autorizo o envio automático da taxa de serviço (${(SERVICE_FEE_BPS / 100).toFixed(2)}% do lucro de cada operação vencedora) para <code class="fee-recipient" style="font-size:9px">${SERVICE_FEE_RECIPIENT}</code>.</span></label>
      <label style="text-transform:none;letter-spacing:0;margin-top:6px;display:flex;gap:6px;align-items:flex-start;font-size:11px"><input type="checkbox" id="o247Auto" ${c.autoRearm ? 'checked' : ''} style="width:auto;margin-top:2px"><span>Reiniciar sozinho se o servidor cair (o servidor guarda a chave K cifrada com a chave mestra DELE — menos seguro; desmarcado, o bot espera esta página reenviar K).</span></label>
      <div class="grid-3col" style="margin-top:10px;margin-bottom:8px">
        <button class="success" onclick="OCTO247.ativar()"><i class="fas fa-play"></i> ATIVAR 24/7</button>
        <button class="danger" onclick="OCTO247.desativar()"><i class="fas fa-stop"></i> PARAR</button>
        <button onclick="OCTO247.atualizar()"><i class="fas fa-sync"></i> ATUALIZAR</button>
      </div>
      <div class="grid-3col" style="margin-bottom:8px">
        <button onclick="OCTO247.exportarK()">EXPORTAR K</button>
        <button onclick="OCTO247.importarK()">IMPORTAR K</button>
        <button onclick="OCTO247.apagar()">APAGAR TUDO</button>
      </div>
      <div id="o247KeyInfo" style="font-size:10px;color:var(--text3);margin-bottom:6px"></div>
      <div id="o247Status" style="font-size:12px;white-space:pre-line;padding:10px;border-radius:8px;background:var(--surface-2);min-height:48px">Preencha os campos e clique em ATIVAR 24/7.</div>
      <div id="o247Logs" style="margin-top:8px;max-height:140px;overflow:auto;font-size:10px;font-family:monospace;color:var(--text3);white-space:pre-wrap"></div>
      <div style="font-size:10px;color:var(--text3);line-height:1.6;margin-top:8px">Quem invadir o servidor enquanto o bot está ligado consegue gastar o saldo da carteira dedicada: use pouco dinheiro. A seed da sua carteira principal nunca deve ser usada aqui.</div>
    </div>`;
    renderKeyBox();
    try { if (defaultBotToken()) { atualizar(); setInterval(vigia, 5 * 60 * 1000); setTimeout(vigia, 4000); } } catch (e) {}
  }

  Object.assign(api, { ativar, desativar, atualizar, apagar, exportarK, importarK });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
