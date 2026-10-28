import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { a as createCommunity, h as useAuth, m as listPosts, n as COMMUNITY_GROUPS, p as listCommunities, r as DEFAULT_COMMUNITIES } from "./auth-context-BBr6EEBW.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AdSlot } from "./ad-slot-BWO7WtQH.mjs";
import { t as Button } from "./input-B8wkzuVc.mjs";
import { O as Flame, P as Clock, b as Plus, i as Trophy, r as Users } from "../_libs/lucide-react.mjs";
import { r as StockTicker, t as AuthModal } from "./stock-ticker-BIJGgkVH.mjs";
import { n as PostCard, t as CreatePostForm } from "./create-post-form-BfsA2qf4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/community-DR18FLlI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CRYPTO_COMMUNITY_BLOCK = new Set([
	"bitcoin",
	"ethereum",
	"defi",
	"solana",
	"web3",
	"crypto",
	"nft",
	"bnb",
	"doge",
	"xrp",
	"btc",
	"eth",
	"layer1",
	"altcoin"
]);
function isStockCommunity(c) {
	const id = (c.id || "").toLowerCase();
	const group = (c.group || "").toLowerCase();
	const name = (c.name || "").toLowerCase();
	if (group === "cripto" || group === "crypto") return false;
	if (CRYPTO_COMMUNITY_BLOCK.has(id)) return false;
	if ([
		"bitcoin",
		"ethereum",
		"solana",
		"defi",
		"web3",
		"nft"
	].some((k) => name.includes(k))) return false;
	return true;
}
function CommunityHome() {
	const { user, profile, loading: authLoading, signOut } = useAuth();
	const [communities, setCommunities] = (0, import_react.useState)([]);
	const [posts, setPosts] = (0, import_react.useState)([]);
	const [sort, setSort] = (0, import_react.useState)("hot");
	const [authOpen, setAuthOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showCreate, setShowCreate] = (0, import_react.useState)(false);
	const [targetCommunity, setTargetCommunity] = (0, import_react.useState)("octocookie");
	const fallbackCommunities = DEFAULT_COMMUNITIES.filter(isStockCommunity).map((c) => ({
		...c,
		memberCount: 0,
		createdAt: 0,
		createdBy: ""
	}));
	const shownCommunities = (() => {
		const map = /* @__PURE__ */ new Map();
		fallbackCommunities.forEach((c) => map.set(c.id, c));
		communities.filter(isStockCommunity).forEach((c) => {
			const def = DEFAULT_COMMUNITIES.find((d) => d.id === c.id);
			map.set(c.id, {
				...c,
				group: c.group ?? def?.group
			});
		});
		return Array.from(map.values());
	})();
	(0, import_react.useEffect)(() => {
		async function load() {
			setLoading(true);
			try {
				let list = [];
				try {
					list = await listCommunities();
					if (user) {
						const have = new Set(list.map((c) => c.id));
						const missing = DEFAULT_COMMUNITIES.filter((c) => !have.has(c.id));
						for (const c of missing) try {
							await createCommunity({
								...c,
								createdBy: user.uid,
								id: c.id
							});
						} catch {}
						if (missing.length > 0) list = await listCommunities();
					}
				} catch (e) {
					console.error("listCommunities", e);
				}
				setCommunities(list.filter(isStockCommunity));
				try {
					const { posts: p } = await listPosts({
						sort,
						max: 30
					});
					setPosts(p);
				} catch (e) {
					console.error("listPosts", e);
				}
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [sort, user?.uid]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b bg-background/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "text-sm text-muted-foreground hover:text-foreground",
							children: "← OctoCookie"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold",
							children: "🐙 OctoCommunity"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: !authLoading && (user && profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden text-xs text-muted-foreground sm:inline",
							children: [
								"u/",
								profile.username,
								" · ",
								profile.karma,
								" karma"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => signOut(),
							children: "Sair"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => setAuthOpen(true),
							children: "Entrar"
						}))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockTicker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "min-w-0 flex-1 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: sort === "hot" ? "default" : "ghost",
									size: "sm",
									onClick: () => setSort("hot"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "mr-1 h-3.5 w-3.5" }), " Hot"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: sort === "new" ? "default" : "ghost",
									size: "sm",
									onClick: () => setSort("new"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 h-3.5 w-3.5" }), " New"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: sort === "top" ? "default" : "ghost",
									size: "sm",
									onClick: () => setSort("top"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mr-1 h-3.5 w-3.5" }), " Top"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden",
							children: shownCommunities.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/community/$communityId",
								params: { communityId: c.id },
								className: "shrink-0 rounded-full border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted",
								children: ["c/", c.id]
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "w-full sm:w-auto",
								onClick: () => {
									if (!user) setAuthOpen(true);
									else setShowCreate((v) => !v);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), " Criar post"]
							}), showCreate && user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: targetCommunity,
									onChange: (e) => setTargetCommunity(e.target.value),
									className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
									children: shownCommunities.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: c.id,
										children: ["c/", c.id]
									}, c.id))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePostForm, {
									communityId: targetCommunity,
									onCreated: (p) => {
										setPosts((prev) => [p, ...prev]);
										setShowCreate(false);
									},
									onNeedAuth: () => setAuthOpen(true)
								}, targetCommunity)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
							slot: 1,
							className: "py-1"
						}),
						loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Carregando feed..."
						}) : posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground",
							children: "Nenhum post ainda. Toque em \"Criar post\" e publique o primeiro!"
						}) : posts.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
							post: p,
							onNeedAuth: () => setAuthOpen(true)
						}), i === Math.min(2, posts.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
							slot: 2,
							className: "py-1"
						})] }, p.id)),
						(loading || posts.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
							slot: 2,
							className: "py-1"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden w-64 shrink-0 space-y-3 lg:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border bg-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "mb-2 flex items-center gap-1.5 text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }), " Comunidades"]
						}), [...COMMUNITY_GROUPS, "Outras"].filter((g) => !/^cripto|crypto$/i.test(g)).map((g) => {
							const items = shownCommunities.filter((c) => (COMMUNITY_GROUPS.includes(c.group ?? "") ? c.group : "Outras") === g);
							if (items.length === 0) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: g
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-0.5",
									children: items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/community/$communityId",
										params: { communityId: c.id },
										className: "flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-medium",
											children: ["c/", c.id]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: c.memberCount
										})]
									}) }, c.id))
								})]
							}, g);
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border bg-card p-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-foreground",
							children: "Sobre o OctoCommunity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1",
							children: "Rede social estilo Reddit focada em ações. Discuta a pesquisa Holograma, a carteira, os bots, o CookieScript, educação financeira e mercado acionário. Compartilhe dados do app nos posts."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
				open: authOpen,
				onOpenChange: setAuthOpen
			})
		]
	});
}
//#endregion
export { CommunityHome as component };
