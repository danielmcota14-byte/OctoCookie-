/**
 * Dois banners (topo e rodapé) nas páginas estáticas (index, octocookie, cryptex, dashboard_analisador).
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

  function bar(pos) {
    var box = document.createElement('div');
    box.className = 'octo-ad octo-ad-' + pos;
    box.setAttribute('aria-label', 'Publicidade');
    box.style.cssText = 'display:flex;justify-content:center;overflow:hidden;width:100%;box-sizing:border-box;padding:4px 0;background:transparent;';
    var f = document.createElement('iframe');
    f.title = pos === 'top' ? 'Publicidade (topo)' : 'Publicidade (rodapé)';
    f.width = W; f.height = H; f.scrolling = 'no';
    f.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
    f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    f.style.cssText = 'border:0;flex-shrink:0;transform-origin:top center;';
    f.srcdoc = doc;
    box.appendChild(f);
    return { box: box, frame: f };
  }
  function fit(items) { // celular: reduz o banner para caber na largura
    var s = Math.max(0.5, Math.min(1, (window.innerWidth - 16) / W));
    items.forEach(function (it) { it.frame.style.transform = 'scale(' + s + ')'; it.box.style.height = Math.round(H * s + 8) + 'px'; });
  }
  function init() {
    if (document.querySelector('.octo-ad')) return;
    var top = bar('top'), bottom = bar('bottom');
    document.body.insertBefore(top.box, document.body.firstChild);
    document.body.appendChild(bottom.box);
    var items = [top, bottom]; fit(items);
    window.addEventListener('resize', function () { fit(items); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
