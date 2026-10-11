/**
 * Dois banners (468x60, Adsterra) juntos no rodapé das páginas estáticas (index, octocookie, cryptex, dashboard_analisador).
 * Chaves/opções (opcional, antes deste script):  window.OCTO_ADS = { keys: ['<chave 1>', '<chave 2>'], sandbox: true }
 *
 * - Cada banner roda num iframe isolado (sandbox SEM allow-same-origin): o script do anunciante não lê o DOM, o
 *   localStorage nem os campos da página (seed, token do bot...). sandbox:false desliga isso, MENOS no octocookie.html.
 * - Dentro do site React (iframe) NÃO coloca banner: quem mostra é a moldura do site, senão ficariam 4.
 * - Nunca roda no executor do servidor (?headless=1), que segura a chave da carteira.
 */
(function () {
  'use strict';
  var W = 468, H = 60, DEFAULT_KEY = '5eff732876fbe681c4bcf4138968a691';
  try { if (window.self !== window.top) return; } catch (e) { return; }
  if (/[?&]headless=1/.test(location.search)) return;

  var cfg = window.OCTO_ADS || {}, ok = function (k) { return /^[0-9a-f]{32}$/i.test(String(k || '')); };
  var keys = [ok(cfg.keys && cfg.keys[0]) ? cfg.keys[0] : DEFAULT_KEY, ok(cfg.keys && cfg.keys[1]) ? cfg.keys[1] : DEFAULT_KEY];
  var isolar = cfg.sandbox !== false || /octocookie\.html$/.test(location.pathname);

  function doc(key) {
    return '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>' +
      "<script>atOptions={'key':'" + key + "','format':'iframe','height':" + H + ",'width':" + W + ",'params':{}};<\/script>" +
      '<script src="https://www.highrevenueformat.com/' + key + '/invoke.js"><\/script></body></html>';
  }
  function init() {
    if (document.getElementById('octo-ads')) return;
    var dock = document.createElement('div'); dock.id = 'octo-ads'; dock.className = 'octo-ad'; dock.setAttribute('aria-label', 'Publicidade');
    dock.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:90;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:0 12px;padding:4px 0;background:rgba(10,14,23,.92);box-sizing:border-box;';
    var wraps = keys.map(function (k, i) {
      var w = document.createElement('div'); w.style.cssText = 'overflow:hidden;';
      var f = document.createElement('iframe'); f.title = 'Publicidade ' + (i + 1); f.width = W; f.height = H; f.scrolling = 'no';
      if (isolar) f.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade'); f.style.cssText = 'border:0;display:block;transform-origin:top left;'; f.srcdoc = doc(k);
      w.appendChild(f); dock.appendChild(w); return { w: w, f: f };
    });
    document.body.appendChild(dock);
    var padOrig = document.body.style.paddingBottom || '';
    function layout() {
      var vw = window.innerWidth, lado = vw >= 2 * W + 40, s = lado ? 1 : Math.max(0.5, Math.min(1, (vw - 16) / W));
      wraps.forEach(function (it) { it.w.style.width = Math.round(W * s) + 'px'; it.w.style.height = Math.round(H * s) + 'px'; it.f.style.transform = 'scale(' + s + ')'; });
      var off = 0; // se a página já tem um menu fixo embaixo, o dock fica logo acima dele
      [].forEach.call(document.body.querySelectorAll('*'), function (el) {
        if (el === dock || dock.contains(el)) return;
        var cs = getComputedStyle(el);
        if (cs.position === 'fixed' && parseFloat(cs.bottom) === 0 && el.offsetHeight > 0 && el.offsetWidth >= vw * 0.5) off = Math.max(off, el.offsetHeight);
      });
      dock.style.bottom = off + 'px';
      document.body.style.paddingBottom = 'calc(' + (padOrig || '0px') + ' + ' + (dock.offsetHeight + off) + 'px)';
    }
    layout(); window.addEventListener('resize', layout); setTimeout(layout, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
