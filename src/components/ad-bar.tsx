import { useEffect, useState } from "react";

// Dois banners 468x60 (Adsterra) juntos no rodapé de TODAS as páginas (lado a lado no desktop, empilhados no celular).
// Chaves: cada banner pode ter a sua. Se o Adsterra mostrar só um banner por chave, crie outra zona 468x60 no painel
// e defina VITE_AD_KEY_2 (ou troque abaixo). Por padrão os dois usam a chave que você passou.
const DEFAULT_KEY = "5eff732876fbe681c4bcf4138968a691";
const AD_KEYS: [string, string] = [
  import.meta.env.VITE_AD_KEY_1 || DEFAULT_KEY,
  import.meta.env.VITE_AD_KEY_2 || DEFAULT_KEY,
];
const AD_W = 468;
const AD_H = 60;
// Cada banner roda no PRÓPRIO iframe com sandbox (sem allow-same-origin): o script do anunciante não enxerga o site,
// o login do Firebase nem a carteira, e não redireciona a página. VITE_ADS_SANDBOX=0 desliga isso (menos seguro),
// caso o anunciante não renderize dentro de sandbox.
const SANDBOX = import.meta.env.VITE_ADS_SANDBOX !== "0";

// Cada banner é uma página real do próprio site (/ad.html?k=CHAVE), não um srcdoc: assim o Adsterra enxerga o domínio.
const adSrc = (key: string) => `/ad.html?k=${encodeURIComponent(key)}`;

export function AdDock() {
  const [vw, setVw] = useState(1280);
  useEffect(() => {
    const fit = () => setVw(window.innerWidth);
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const lado = vw >= 2 * AD_W + 40; // cabem dois lado a lado
  const scale = lado ? 1 : Math.max(0.5, Math.min(1, (vw - 16) / AD_W)); // celular: encolhe e empilha
  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 border-t bg-background py-1"
      aria-label="Publicidade"
    >
      {AD_KEYS.map((key, i) => (
        <div
          key={i}
          style={{ width: Math.round(AD_W * scale), height: Math.round(AD_H * scale), overflow: "hidden" }}
        >
          <iframe
            title={`Publicidade ${i + 1}`}
            src={adSrc(key)}
            width={AD_W}
            height={AD_H}
            scrolling="no"
            sandbox={SANDBOX ? "allow-scripts allow-popups allow-popups-to-escape-sandbox" : undefined}
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, display: "block", transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        </div>
      ))}
    </div>
  );
}
