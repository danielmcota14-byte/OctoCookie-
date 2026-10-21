import { o as __toESM } from "./_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "./_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { S as listPosts, _ as isMember, d as DEFAULT_COMMUNITIES, h as getCommunity, l as useAuth, p as createCommunity, r as Route$1, v as joinCommunity, y as leaveCommunity } from "./_ssr/router-BWxZCkfo.mjs";
import { t as AdSlot } from "./_ssr/ad-slot-BWO7WtQH.mjs";
import { t as Button } from "./_ssr/input-B8wkzuVc.mjs";
import { M as Flame, r as Users, z as Clock } from "./_libs/lucide-react.mjs";
import { t as AuthModal } from "./_ssr/auth-modal-BPSQdXM3.mjs";
import { n as PostCard, t as CreatePostForm } from "./_ssr/create-post-form-wJgFsiBw.mjs";
import { t as CryptoTicker } from "./_ssr/crypto-ticker-OJ2a5Z3i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_communityId-BqcTuSUl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommunityPage() {
	const { communityId } = Route$1.useParams();
	const { user, profile, loading: authLoading, signOut } = useAuth();
	const [community, setCommunity] = (0, import_react.useState)(null);
	const [posts, setPosts] = (0, import_react.useState)([]);
	const [sort, setSort] = (0, import_react.useState)("hot");
	const [member, setMember] = (0, import_react.useState)(false);
	const [authOpen, setAuthOpen] = (0, import_react.useState)(false);
	const [showCreate, setShowCreate] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function load() {
			setLoading(true);
			try {
				let c = null;
				try {
					c = await getCommunity(communityId);
				} catch (e) {
					console.error("getCommunity", e);
				}
				const def = DEFAULT_COMMUNITIES.find((d) => d.id === communityId);
				if (!c && def && user) try {
					c = await createCommunity({
						...def,
						createdBy: user.uid,
						id: def.id
					});
				} catch (e) {
					console.error("seed community", e);
				}
				if (!c && def) c = {
					...def,
					memberCount: 0,
					createdAt: 0,
					createdBy: ""
				};
				setCommunity(c);
				try {
					const { posts: p } = await listPosts({
						communityId,
						sort,
						max: 40
					});
					setPosts(p);
				} catch (e) {
					console.error("listPosts", e);
				}
				if (user) setMember(await isMember(user.uid, communityId));
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [
		communityId,
		sort,
		user?.uid
	]);
	async function handleJoin() {
		if (!user) {
			setAuthOpen(true);
			return;
		}
		await joinCommunity(user.uid, communityId);
		setMember(true);
		setCommunity((prev) => prev ? {
			...prev,
			memberCount: prev.memberCount + 1
		} : prev);
	}
	async function handleLeave() {
		if (!user) return;
		await leaveCommunity(user.uid, communityId);
		setMember(false);
		setCommunity((prev) => prev ? {
			...prev,
			memberCount: Math.max(0, prev.memberCount - 1)
		} : prev);
	}
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
							to: "/community",
							className: "text-sm text-muted-foreground hover:text-foreground",
							children: "← Comunidades"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-bold",
							children: ["c/", communityId]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: !authLoading && (user && profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden text-xs text-muted-foreground sm:inline",
							children: ["u/", profile.username]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CryptoTicker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-6xl px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 rounded-lg border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-xl font-bold",
								children: ["c/", communityId]
							}), community && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: community.description
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex items-center gap-1 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
									community.memberCount,
									" membros"
								]
							})] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [member ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: handleLeave,
									children: "Sair da comunidade"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: handleJoin,
									children: "Entrar"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										if (!user) setAuthOpen(true);
										else setShowCreate((v) => !v);
									},
									children: "Criar post"
								})]
							})]
						}), community?.rules && community.rules.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 list-inside list-disc text-xs text-muted-foreground",
							children: community.rules.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
						})]
					}),
					showCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePostForm, {
							communityId,
							onCreated: (p) => {
								setPosts((prev) => [p, ...prev]);
								setShowCreate(false);
							},
							onNeedAuth: () => setAuthOpen(true)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: sort === "hot" ? "default" : "ghost",
							size: "sm",
							onClick: () => setSort("hot"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "mr-1 h-3.5 w-3.5" }), " Hot"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: sort === "new" ? "default" : "ghost",
							size: "sm",
							onClick: () => setSort("new"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 h-3.5 w-3.5" }), " New"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mb-3"
					}),
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Carregando..."
					}) : posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground",
						children: "Nenhum post nesta comunidade ainda."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: posts.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
							post: p,
							onNeedAuth: () => setAuthOpen(true)
						}), i === Math.min(2, posts.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
							slot: 2,
							className: "py-1"
						})] }, p.id))
					}),
					(loading || posts.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 2,
						className: "mt-3"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
				open: authOpen,
				onOpenChange: setAuthOpen
			})
		]
	});
}
//#endregion
export { CommunityPage as component };
