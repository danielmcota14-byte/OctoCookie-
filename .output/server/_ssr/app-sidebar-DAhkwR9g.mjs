import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { b as useNavigate, x as useParams, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as toggleTheme, s as effectiveTheme } from "./router-BWxZCkfo.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { C as PiggyBank, F as Cookie, I as Compass, L as Coins, R as CodeXml, T as Moon, W as ChartLine, _ as Server, c as Trash2, d as SquarePen, f as Sprout, g as Settings, j as LayoutDashboard, l as Sun, n as Wallet, p as ShieldCheck, q as BookOpenText, r as Users, t as X, u as SquareTerminal, w as PanelLeft, y as Rocket } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-sidebar-DAhkwR9g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var octocookie_mascot_default = "/assets/octocookie-mascot-D6JIE0Rx.png";
var KEY = "octocookie.threads.v1";
function loadThreads() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveThreads(threads) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(KEY, JSON.stringify(threads));
}
function newThread() {
	return {
		id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
		title: "Novo chat",
		updatedAt: Date.now(),
		messages: []
	};
}
function deriveTitle(messages) {
	const first = messages.find((m) => m.role === "user");
	if (!first) return "Novo chat";
	const text = first.parts.map((p) => p.type === "text" ? p.text : "").join(" ").trim();
	return text.length > 40 ? text.slice(0, 40) + "…" : text || "Novo chat";
}
var NAV_GROUPS = [
	{
		title: "Início",
		items: [{
			to: "/",
			label: "Início",
			icon: Compass,
			exact: true
		}, {
			to: "/pesquisa",
			label: "Pesquisa",
			icon: BookOpenText
		}]
	},
	{
		title: "Ferramentas",
		items: [
			{
				to: "/carteira",
				label: "Carteira",
				icon: Wallet
			},
			{
				to: "/token",
				label: "OctoCookie Token",
				icon: Coins
			},
			{
				to: "/octo-app",
				label: "Bot Trading",
				icon: LayoutDashboard
			},
			{
				to: "/bot-24x7",
				label: "Bot 24/7",
				icon: Server
			},
			{
				to: "/analyzer",
				label: "Analisador",
				icon: ChartLine
			},
			{
				to: "/simulator",
				label: "Simulador",
				icon: SquareTerminal
			}
		]
	},
	{
		title: "Programar",
		items: [{
			to: "/cookiescript",
			label: "CookieScript",
			icon: Cookie
		}, {
			to: "/ide",
			label: "IDE simulada",
			icon: CodeXml
		}]
	},
	{
		title: "Aprender",
		items: [
			{
				to: "/finance",
				label: "Finance",
				icon: PiggyBank
			},
			{
				to: "/start",
				label: "Start",
				icon: Sprout
			},
			{
				to: "/launch",
				label: "Explorar",
				icon: Rocket
			}
		]
	},
	{
		title: "Comunidade",
		items: [{
			to: "/community",
			label: "Comunidade",
			icon: Users
		}, {
			to: "/adm.html",
			label: "Adm",
			icon: ShieldCheck,
			external: true
		}]
	}
];
function AppSidebar({ threads, onThreadsChange }) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [themeTick, setThemeTick] = (0, import_react.useState)(0);
	const [isDark, setIsDark] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setIsDark(effectiveTheme() === "dark");
		const on = () => setIsDark(effectiveTheme() === "dark");
		window.addEventListener("storage", on);
		return () => window.removeEventListener("storage", on);
	}, [themeTick]);
	const navigate = useNavigate();
	const activeId = useParams({ strict: false }).threadId;
	(0, import_react.useEffect)(() => {
		setMobileOpen(false);
	}, [activeId]);
	function handleNew() {
		const t = newThread();
		const next = [t, ...threads];
		onThreadsChange(next);
		saveThreads(next);
		navigate({
			to: "/$threadId",
			params: { threadId: t.id }
		});
		setMobileOpen(false);
	}
	function handleDelete(id) {
		const next = threads.filter((t) => t.id !== id);
		onThreadsChange(next);
		saveThreads(next);
		if (activeId === id) navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setMobileOpen(true),
			className: "fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-md border bg-background/90 shadow-sm backdrop-blur md:hidden",
			"aria-label": "Abrir menu",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { className: "h-4 w-4" })
		}),
		mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40 bg-black/50 md:hidden",
			onClick: () => setMobileOpen(false),
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: cn("flex h-full shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200", "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full", mobileOpen && "translate-x-0", "md:static md:z-auto md:translate-x-0", collapsed ? "md:w-14" : "md:w-64"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setCollapsed((c) => !c),
							className: "hidden h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-sidebar-accent md:grid",
							"aria-label": "Recolher menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMobileOpen(false),
							className: "grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-sidebar-accent md:hidden",
							"aria-label": "Fechar menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						}),
						!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/assets/octocookie-mascot-D6JIE0Rx.png",
								alt: "",
								width: 20,
								height: 20,
								className: "h-5 w-5 dark:invert"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "OctoCookie" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex min-h-0 flex-col gap-0.5 overflow-y-auto px-2 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleNew,
						className: "mb-1 flex items-center gap-3 rounded-md border border-sidebar-border px-2.5 py-2 text-sm font-medium hover:bg-sidebar-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4 shrink-0" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Novo chat" })]
					}), NAV_GROUPS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-col gap-0.5",
						children: [!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2.5 pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
							children: g.title
						}), g.items.map((it) => {
							const Icon = it.icon;
							const cls = "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent";
							const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 shrink-0" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: it.label })] });
							return it.external ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: it.to,
								className: cls,
								title: collapsed ? it.label : void 0,
								children: inner
							}, it.to) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: it.to,
								activeOptions: { exact: !!it.exact },
								className: cls,
								activeProps: { className: "bg-sidebar-accent font-semibold text-sidebar-primary" },
								title: collapsed ? it.label : void 0,
								children: inner
							}, it.to);
						})]
					}, g.title))]
				}),
				!collapsed && threads.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex min-h-0 flex-1 flex-col px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-2.5 pb-1 text-xs font-medium text-muted-foreground",
						children: "Recentes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-y-auto pr-0.5",
						children: threads.map((t) => {
							const active = t.id === activeId;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("group flex items-center gap-1 rounded-md pr-1", active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/$threadId",
									params: { threadId: t.id },
									className: cn("min-w-0 flex-1 truncate rounded-md px-2.5 py-2 text-sm", active ? "text-[var(--link)]" : "text-sidebar-foreground"),
									title: t.title,
									children: t.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.preventDefault();
										handleDelete(t.id);
									},
									className: "grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-background hover:text-foreground group-hover:opacity-100",
									"aria-label": "Excluir",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})]
							}, t.id);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center gap-1 border-t border-sidebar-border p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/settings",
						className: "flex min-w-0 flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent",
						title: "Configurações",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4 shrink-0" }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Configurações" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							toggleTheme();
							setThemeTick((n) => n + 1);
						},
						className: "grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-sidebar-accent",
						"aria-label": "Alternar tema claro/escuro",
						title: "Alternar tema",
						children: isDark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" })
					})]
				})
			]
		})
	] });
}
//#endregion
export { octocookie_mascot_default as a, newThread as i, deriveTitle as n, saveThreads as o, loadThreads as r, AppSidebar as t };
