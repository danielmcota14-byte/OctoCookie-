import { useEffect, useState } from "react";

// Banner 468x60 (Adsterra). Para trocar a chave/tamanho, edite aqui E em public/octocookie-app/ads.js.
const AD_KEY = "5eff732876fbe681c4bcf4138968a691";
const AD_W = 468;
const AD_H = 60;

// Cada banner roda no PRÓPRIO iframe isolado (sandbox SEM allow-same-origin): o script do anunciante não enxerga
// o DOM, o localStorage nem os campos do site (seed, token do bot, etc.) e não consegue redirecionar a página.
// Isso também permite ter dois banners com a mesma chave sem um atrapalhar o outro (o invoke.js usa uma variável global).
const AD_SRC_DOC =
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>` +
  `<script>atOptions={'key':'${AD_KEY}','format':'iframe','height':${AD_H},'width':${AD_W},'params':{}};</scr` +
  `ipt><script src="https://www.highrevenueformat.com/${AD_KEY}/invoke.js"></scr` +
  `ipt></body></html>`;

export function AdBar({ position }: { position: "top" | "bottom" }) {
  const [scale, setScale] = useState(1);

  // No celular a largura da tela é menor que 468px: reduz o banner para caber (no topo sobra espaço para o botão de menu).
  useEffect(() => {
    const reserve = position === "top" ? 64 : 16;
    const fit = () => setScale(Math.max(0.5, Math.min(1, (window.innerWidth - reserve) / AD_W)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [position]);

  return (
    <div
      className={`flex shrink-0 justify-center overflow-hidden bg-background ${
        position === "top" ? "border-b pl-12 md:pl-0" : "border-t"
      }`}
      style={{ height: Math.round(AD_H * scale) + 8 }}
      aria-label="Publicidade"
    >
      <iframe
        title={position === "top" ? "Publicidade (topo)" : "Publicidade (rodapé)"}
        srcDoc={AD_SRC_DOC}
        width={AD_W}
        height={AD_H}
        scrolling="no"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, marginTop: 4, transform: `scale(${scale})`, transformOrigin: "top center", flexShrink: 0 }}
      />
    </div>
  );
}
