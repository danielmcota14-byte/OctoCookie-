/** Tema único do OctoCookie. Mesma chave de public/octo.js, para o site e os iframes ficarem sincronizados. */
const KEY = "octo-theme";
export type ThemePref = "light" | "dark" | "system";

export function getThemePref(): ThemePref {
  try {
    return (localStorage.getItem(KEY) as ThemePref) || "system";
  } catch {
    return "system";
  }
}
export function effectiveTheme(pref = getThemePref()): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function applyTheme() {
  const t = effectiveTheme();
  const r = document.documentElement;
  r.setAttribute("data-theme", t);
  r.classList.toggle("dark", t === "dark");
  r.style.colorScheme = t;
}
export function setThemePref(p: ThemePref) {
  try {
    localStorage.setItem(KEY, p);
  } catch {
    /* sem storage */
  }
  applyTheme();
  // avisa os iframes (mesma origem) que já escutam o evento "storage" de forma nativa;
  // para os que carregaram depois, força a reaplicação
  document.querySelectorAll("iframe").forEach((f) => {
    try {
      (f.contentWindow as any)?.OctoTheme?.set(p);
    } catch {
      /* iframe de outra origem */
    }
  });
}
export function toggleTheme() {
  setThemePref(effectiveTheme() === "dark" ? "light" : "dark");
}
/** Script inline para aplicar o tema antes da hidratação (evita piscar). */
export const THEME_BOOT = `(function(){try{var p=localStorage.getItem("${KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;
