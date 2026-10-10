/**
 * Dois banners (cantos inferiores esquerdo e direito) nas páginas estáticas (index, octocookie, cryptex, dashboard_analisador).
 * Chave/tamanho: iguais aos de src/components/ad-bar.tsx (edite nos dois lugares).
 *
 * - Cada banner roda num iframe isolado (sandbox SEM allow-same-origin): o script do anunciante não lê o DOM, o
 *   localStorage nem os campos desta página (seed, token do bot...) e não consegue redirecionar a página.
 * - Dentro do site React (iframe) NÃO coloca banner: quem mostra é a moldura do site, senão ficariam 4.
 * - Nunca roda no executor do servidor (?headless=1), que segura a chave da carteira.
 */
(function () {
  'use strict';
  var KEY = '5eff732876fbe681c4bcf4138968a691', W = 468, H = 60;
  try { if (window.self !== window.top) return; } catch (e) { return; }
  if (/[?&]headless=1/.test(location.search)) return;

  var doc = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>' +
    "<script>atOptions={'key':'" + KEY + "','format':'iframe','height':" + H + ",'width':" + W + ",'params':{}};<\/script>" +
    '<script src="https://www.highrevenueformat.com/' + KEY + '/invoke.js"><\/script></body></html>';

  // Dois banners nos cantos inferiores: esquerdo e direito (lado a lado se couber, senão empilhados e reduzidos).
  function frame(title) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'overflow:hidden;flex-shrink:0;';
    var f = document.createElement('iframe');
    f.title = title; f.width = W; f.height = H; f.scrolling = 'no';
    // window.OCTO_ADS = { sandbox: false } desliga o isolamento (menos seguro). No octocookie.html o isolamento é SEMPRE mantido: ele tem o card da carteira.
    var isolar = !(window.OCTO_ADS && window.OCTO_ADS.sandbox === false) || /octocookie\.html$/.test(location.pathname);
    if (isolar) f.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
    f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    f.style.cssText = 'border:0;display:block;transform-origin:top left;';
    f.srcdoc = doc;
    wrap.appendChild(f);
    return { wrap: wrap, frame: f };
  }
  function fit(bar, items) {
    var w = window.innerWidth - 16, lado = w >= W * 2 + 16;
    var s = lado ? 1 : Math.max(0.5, Math.min(1, w / W));
    bar.style.flexDirection = lado ? 'row' : 'column';
    bar.style.justifyContent = 'space-between';
    items.forEach(function (it) {
      it.frame.style.transform = 'scale(' + s + ')';
      it.wrap.style.width = Math.round(W * s) + 'px';
      it.wrap.style.height = Math.round(H * s) + 'px';
    });
  }
  function init() {
    if (document.querySelector('.octo-ad')) return;
    var bar = document.createElement('div');
    bar.className = 'octo-ad';
    bar.setAttribute('aria-label', 'Publicidade');
    bar.style.cssText = 'display:flex;gap:4px;width:100%;box-sizing:border-box;padding:4px 8px;background:transparent;';
    var left = frame('Publicidade (canto esquerdo)'), right = frame('Publicidade (canto direito)');
    left.wrap.style.alignSelf = 'flex-start'; right.wrap.style.alignSelf = 'flex-end';
    bar.appendChild(left.wrap); bar.appendChild(right.wrap);
    document.body.appendChild(bar);
    var items = [left, right]; fit(bar, items);
    window.addEventListener('resize', function () { fit(bar, items); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
