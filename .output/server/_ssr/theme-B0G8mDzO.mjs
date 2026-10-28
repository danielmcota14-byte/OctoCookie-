//#region node_modules/.nitro/vite/services/ssr/assets/theme-B0G8mDzO.js
/** Tema único do OctoCookie. Mesma chave de public/octo.js, para o site e os iframes ficarem sincronizados. */
var KEY = "octo-theme";
function getThemePref() {
	try {
		return localStorage.getItem(KEY) || "system";
	} catch {
		return "system";
	}
}
function effectiveTheme(pref = getThemePref()) {
	if (pref !== "system") return pref;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme() {
	const t = effectiveTheme();
	const r = document.documentElement;
	r.setAttribute("data-theme", t);
	r.classList.toggle("dark", t === "dark");
	r.style.colorScheme = t;
}
function setThemePref(p) {
	try {
		localStorage.setItem(KEY, p);
	} catch {}
	applyTheme();
	document.querySelectorAll("iframe").forEach((f) => {
		try {
			f.contentWindow?.OctoTheme?.set(p);
		} catch {}
	});
}
function toggleTheme() {
	setThemePref(effectiveTheme() === "dark" ? "light" : "dark");
}
/** Script inline para aplicar o tema antes da hidratação (evita piscar). */
var THEME_BOOT = `(function(){try{var p=localStorage.getItem("${KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;
//#endregion
export { effectiveTheme as n, toggleTheme as r, THEME_BOOT as t };
