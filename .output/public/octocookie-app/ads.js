/**
 * Anúncios (Adsterra 468x60) DENTRO do conteúdo das páginas estáticas (index, octocookie, cryptex, dashboard_analisador).
 * Nada de rodapé nem cabeçalho: cada página tem 2 espaços  <div class="octo-ad-slot" data-slot="1|2"></div>  colocados
 * entre blocos de conteúdo. Este script só preenche esses espaços.
 *
 * Opções (antes deste script, opcional):  window.OCTO_ADS = { keys: ['<chave 1>', '<chave 2>'], sandbox: true, disabled: false }
 * Sem opções, os dois espaços usam a chave padrão abaixo.
 *
 * - O banner roda num iframe isolado (sandbox SEM allow-same-origin): o script do anunciante não lê o DOM, o
 *   localStorage nem os campos da página (seed, token do bot...). sandbox:false desliga isso, MENOS no octocookie.html.
 * - O iframe só é criado quando o espaço aparece na tela (lazy): páginas/abas escondidas não geram impressão invisível.
 * - Escala sozinho em telas estreitas (celular) e reserva a altura antes de carregar (sem "pulo" de layout).
 * - Funciona também dentro do iframe do site React (essas páginas NÃO têm banner na moldura React, para não duplicar).
 * - Nunca roda no executor do servidor (?headless=1), que segura a chave da carteira.
 */
(function () {
  'use strict';
  var W = 468, H = 60, DEFAULT_KEY = '53b35e700dd3c5120e2081ce6edf4273';
  if (/[?&]headless=1/.test(location.search)) return;

  var cfg = window.OCTO_ADS || {};
  if (cfg.disabled) return;
  var ok = function (k) { return /^[0-9a-f]{32}$/i.test(String(k || '')); };
  var keys = [0, 1].map(function (i) { var k = cfg.keys && cfg.keys[i]; return ok(k) ? String(k) : DEFAULT_KEY; });
  var isolar = cfg.sandbox !== false || /octocookie\.html$/.test(location.pathname);

  function src(key) { return '/ad.html?k=' + key; } // página real do site (não srcdoc): o Adsterra enxerga o domínio

  var CSS =
    '.octo-ad-slot{display:block;box-sizing:border-box;width:100%;max-width:100%;margin:18px auto;text-align:center;' +
    'grid-column:1/-1;align-self:stretch;flex:none;clear:both;min-width:0;}' +
    '.octo-ad-slot .octo-ad-label{display:block;margin:0 0 5px;font:600 9px/1 system-ui,-apple-system,Segoe UI,sans-serif;' +
    'letter-spacing:.16em;text-transform:uppercase;opacity:.5;color:inherit;}' +
    '.octo-ad-slot .octo-ad-frame{display:inline-block;box-sizing:content-box;overflow:hidden;line-height:0;vertical-align:top;' +
    'border-radius:10px;border:1px solid rgba(128,128,128,.28);background:rgba(128,128,128,.07);}';

  function addCss() {
    if (document.getElementById('octo-ad-css')) return;
    var st = document.createElement('style'); st.id = 'octo-ad-css'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function setup(slot) {
    if (slot.getAttribute('data-octo-ready')) return;
    slot.setAttribute('data-octo-ready', '1');
    var idx = slot.getAttribute('data-slot') === '2' ? 1 : 0;
    slot.setAttribute('role', 'complementary'); slot.setAttribute('aria-label', 'Publicidade');

    var label = document.createElement('span'); label.className = 'octo-ad-label'; label.textContent = 'Publicidade';
    var frame = document.createElement('div'); frame.className = 'octo-ad-frame';
    slot.appendChild(label); slot.appendChild(frame);

    var f = null, scale = 1;
    function layout() {
      var w = slot.clientWidth; if (!w) return; // escondido (aba/tela não ativa)
      scale = Math.max(0.4, Math.min(1, (w - 6) / W));
      frame.style.width = Math.round(W * scale) + 'px'; frame.style.height = Math.round(H * scale) + 'px';
      if (f) f.style.setProperty('transform', 'scale(' + scale + ')');
    }
    function load() {
      if (f) return;
      f = document.createElement('iframe'); f.title = 'Publicidade ' + (idx + 1);
      f.setAttribute('width', W); f.setAttribute('height', H); f.setAttribute('scrolling', 'no');
      if (isolar) f.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      // !important: algumas páginas têm regra global "iframe{width:100%;border:...}"
      [['border', '0'], ['width', W + 'px'], ['height', H + 'px'], ['max-width', 'none'], ['margin', '0'], ['padding', '0'],
        ['border-radius', '0'], ['background', 'transparent'], ['display', 'block'], ['transform-origin', 'top left']]
        .forEach(function (p) { f.style.setProperty(p[0], p[1], 'important'); });
      f.src = src(keys[idx]); frame.appendChild(f); layout();
    }
    layout();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(slot); else window.addEventListener('resize', layout);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { layout(); load(); io.disconnect(); }
      }, { rootMargin: '300px 0px' });
      io.observe(slot);
    } else load();
  }

  function init() {
    addCss();
    [].forEach.call(document.querySelectorAll('.octo-ad-slot'), setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
