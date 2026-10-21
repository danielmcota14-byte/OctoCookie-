import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Banner 468x60 (Adsterra) DENTRO do conteúdo das páginas (nunca no cabeçalho nem no rodapé).
// Cada página usa dois: <AdSlot slot={1} /> e <AdSlot slot={2} />, colocados entre blocos de conteúdo.
// Chave padrão abaixo; VITE_AD_KEY_1 / VITE_AD_KEY_2 (32 hex) sobrescrevem cada espaço, e VITE_ADS_DISABLED=1 desliga tudo.
const DEFAULT_KEY = "53b35e700dd3c5120e2081ce6edf4273";
const isKey = (k: unknown): k is string => typeof k === "string" && /^[0-9a-f]{32}$/i.test(k);
const KEYS: string[] = [import.meta.env.VITE_AD_KEY_1, import.meta.env.VITE_AD_KEY_2].map((k) =>
  isKey(k) ? k : DEFAULT_KEY,
);
const DISABLED = import.meta.env.VITE_ADS_DISABLED === "1";
const AD_W = 468;
const AD_H = 60;
// Sandbox sem allow-same-origin deixa o iframe com origem "null": o script do Adsterra não acessa localStorage/cookies nem
// valida o domínio, e o banner fica em branco. Por isso o padrão é um iframe comum.
// Para isolar de verdade, sirva /ad.html num OUTRO domínio/subdomínio e defina VITE_ADS_ORIGIN=https://ads.seudominio.com:
// aí o iframe é de origem diferente e ganha sandbox COM allow-same-origin. VITE_ADS_SANDBOX=1 força o sandbox estrito (sem anúncio).
const ADS_ORIGIN = String(import.meta.env.VITE_ADS_ORIGIN ?? "").replace(/\/+$/, "");
const CROSS_ORIGIN =
  /^https?:\/\//i.test(ADS_ORIGIN) && (typeof window === "undefined" || ADS_ORIGIN !== window.location.origin);
const SANDBOX_ATTR: string | undefined = CROSS_ORIGIN
  ? "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
  : import.meta.env.VITE_ADS_SANDBOX === "1"
    ? "allow-scripts allow-popups allow-popups-to-escape-sandbox"
    : undefined;

// Página real do próprio site (/ad.html?k=CHAVE), não srcdoc: assim o Adsterra enxerga o domínio.
const adSrc = (key: string) => `${/^https?:\/\//i.test(ADS_ORIGIN) ? ADS_ORIGIN : ""}/ad.html?k=${encodeURIComponent(key)}`;

export function AdSlot({ slot = 1, className }: { slot?: 1 | 2; className?: string }) {
  const boxRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);
  const [show, setShow] = useState(false); // o iframe só nasce quando o espaço chega perto da tela (sem impressão escondida)

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      if (w) setScale(Math.max(0.4, Math.min(1, (w - 6) / AD_W))); // celular: encolhe para caber
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => {
          if (es.some((e) => e.isIntersecting)) {
            setShow(true);
            io?.disconnect();
          }
        },
        { rootMargin: "300px 0px" },
      );
      io.observe(el);
    } else setShow(true);
    return () => {
      ro.disconnect();
      io?.disconnect();
    };
  }, []);

  if (DISABLED) return null;
  const key = KEYS[slot - 1] ?? DEFAULT_KEY;
  return (
    <aside
      ref={boxRef}
      aria-label="Publicidade"
      className={cn("mx-auto flex w-full min-w-0 flex-col items-center", className)}
    >
      <span className="mb-1.5 text-[9px] font-semibold uppercase leading-none tracking-[0.16em] text-muted-foreground/70">
        Publicidade
      </span>
      <div
        className="overflow-hidden rounded-xl border bg-muted/40 shadow-sm"
        style={{ width: Math.round(AD_W * scale) + 2, height: Math.round(AD_H * scale) + 2 }} // +2 = borda
      >
        {show && (
          <iframe
            title={`Publicidade ${slot}`}
            src={adSrc(key)}
            width={AD_W}
            height={AD_H}
            scrolling="no"
            sandbox={SANDBOX_ATTR}
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, display: "block", transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        )}
      </div>
    </aside>
  );
}
