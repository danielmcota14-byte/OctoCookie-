import { useEffect, useState } from "react";

// Banner 468x60 (Adsterra). Para trocar a chave/tamanho, edite aqui E em public/octocookie-app/ads.js.
const AD_KEY = "5eff732876fbe681c4bcf4138968a691";
const AD_W = 468;
const AD_H = 60;
// VITE_ADS_SANDBOX=0 desliga o isolamento (alguns anunciantes não renderizam em iframe com sandbox). Menos seguro: o script do anúncio passa a enxergar o site.
const SANDBOX = import.meta.env.VITE_ADS_SANDBOX !== "0";

// Cada banner roda no PRÓPRIO iframe isolado (sandbox SEM allow-same-origin): o script do anunciante não enxerga
// o DOM, o localStorage nem os campos do site (seed, token do bot, etc.) e não consegue redirecionar a página.
// Isso também permite ter dois banners com a mesma chave sem um atrapalhar o outro (o invoke.js usa uma variável global).
const AD_SRC_DOC =
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>` +
  `<script>atOptions={'key':'${AD_KEY}','format':'iframe','height':${AD_H},'width':${AD_W},'params':{}};</scr` +
  `ipt><script src="https://www.highrevenueformat.com/${AD_KEY}/invoke.js"></scr` +
  `ipt></body></html>`;

// Dois anúncios por página, um em cada canto inferior (esquerdo e direito), ocupando a largura toda.
// Em telas estreitas (que não comportam dois de 468px lado a lado) os dois ficam empilhados, reduzidos para caber.
function useScale(count: 1 | 2) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth - 16;
      const lado = w >= AD_W * 2 + 16; // cabem lado a lado
      setScale(lado ? 1 : Math.max(0.5, Math.min(1, w / AD_W)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [count]);
  return scale;
}

function AdFrame({ title, scale }: { title: string; scale: number }) {
  return (
    <div style={{ width: Math.round(AD_W * scale), height: Math.round(AD_H * scale), overflow: "hidden", flexShrink: 0 }}>
      <iframe
        title={title}
        srcDoc={AD_SRC_DOC}
        width={AD_W}
        height={AD_H}
        scrolling="no"
        sandbox={SANDBOX ? "allow-scripts allow-popups allow-popups-to-escape-sandbox" : undefined}
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, transform: `scale(${scale})`, transformOrigin: "top left", display: "block" }}
      />
    </div>
  );
}

export function AdCorners() {
  const scale = useScale(2);
  return (
    <div
      className="flex shrink-0 flex-col items-stretch gap-1 border-t bg-background px-2 py-1 min-[1000px]:flex-row min-[1000px]:justify-between"
      aria-label="Publicidade"
    >
      <div className="flex justify-start">
        <AdFrame title="Publicidade (canto esquerdo)" scale={scale} />
      </div>
      <div className="flex justify-end">
        <AdFrame title="Publicidade (canto direito)" scale={scale} />
      </div>
    </div>
  );
}
