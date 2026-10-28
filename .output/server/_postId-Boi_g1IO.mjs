import { o as __toESM } from "./_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "./_libs/@ai-sdk/react+[...].mjs";
import { c as getPost, f as listComments, g as vote, h as useAuth, i as createComment } from "./_ssr/auth-context-BBr6EEBW.mjs";
import { h as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as AdSlot } from "./_ssr/ad-slot-BWO7WtQH.mjs";
import { t as Button } from "./_ssr/input-B8wkzuVc.mjs";
import { A as ExternalLink, T as MessageSquare, U as ArrowBigUp, W as ArrowBigDown } from "./_libs/lucide-react.mjs";
import { r as StockTicker, t as AuthModal } from "./_ssr/stock-ticker-BIJGgkVH.mjs";
import { n as formatDistanceToNow, t as ptBR } from "./_libs/date-fns.mjs";
import { t as Route } from "./_postId-Dn4AXAZ_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_postId-Boi_g1IO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostPage() {
	const { postId } = Route.useParams();
	const { user, profile, signOut } = useAuth();
	const [post, setPost] = (0, import_react.useState)(null);
	const [comments, setComments] = (0, import_react.useState)([]);
	const [body, setBody] = (0, import_react.useState)("");
	const [authOpen, setAuthOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [score, setScore] = (0, import_react.useState)(0);
	const [myVote, setMyVote] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		async function load() {
			setLoading(true);
			try {
				const p = await getPost(postId);
				setPost(p);
				if (p) setScore(p.score);
				setComments(await listComments(postId));
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [postId]);
	async function handleVote(value) {
		if (!user) {
			setAuthOpen(true);
			return;
		}
		const prev = myVote;
		await vote(user.uid, postId, "post", value);
		if (prev === value) {
			setMyVote(0);
			setScore((s) => s - value);
		} else if (prev === 0) {
			setMyVote(value);
			setScore((s) => s + value);
		} else {
			setMyVote(value);
			setScore((s) => s + value * 2);
		}
	}
	async function handleComment(e) {
		e.preventDefault();
		if (!user || !profile) {
			setAuthOpen(true);
			return;
		}
		if (!body.trim()) return;
		const c = await createComment({
			postId,
			authorId: user.uid,
			authorName: profile.displayName,
			authorUsername: profile.username,
			authorPhoto: profile.photoURL,
			body: body.trim()
		});
		setComments((prev) => [...prev, c]);
		setBody("");
		if (post) setPost({
			...post,
			commentCount: post.commentCount + 1
		});
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center text-sm text-muted-foreground",
		children: "Carregando post..."
	});
	if (!post) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Post não encontrado."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/community",
			className: "text-sm text-primary underline",
			children: "Voltar às comunidades"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b bg-background/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-12 max-w-3xl items-center justify-between gap-4 px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/community/$communityId",
						params: { communityId: post.communityId },
						className: "text-sm text-muted-foreground hover:text-foreground",
						children: ["← c/", post.communityId]
					}), user && profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => signOut(),
						children: "Sair"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => setAuthOpen(true),
						children: "Entrar"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockTicker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-3xl px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-3 rounded-lg border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-10 shrink-0 flex-col items-center gap-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => handleVote(1),
									className: cn("rounded p-0.5 hover:bg-muted", myVote === 1 && "text-orange-500"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowBigUp, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold tabular-nums",
									children: score
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => handleVote(-1),
									className: cn("rounded p-0.5 hover:bg-muted", myVote === -1 && "text-blue-500"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowBigDown, { className: "h-5 w-5" })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/community/$communityId",
											params: { communityId: post.communityId },
											className: "font-semibold text-foreground hover:underline",
											children: ["c/", post.communityId]
										}),
										" · ",
										"u/",
										post.authorUsername,
										" · ",
										formatDistanceToNow(post.createdAt, {
											addSuffix: true,
											locale: ptBR
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-xl font-bold",
									children: post.title
								}),
								post.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 whitespace-pre-wrap text-sm leading-relaxed",
									children: post.body
								}),
								post.type === "link" && post.linkUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: post.linkUrl,
									target: "_blank",
									rel: "noreferrer",
									className: "mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" }), post.linkUrl]
								}),
								post.type === "share_app_data" && post.appData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-medium text-primary",
											children: ["📊 ", post.appData.label]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: ["Fonte: ", post.appData.source]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
											className: "mt-2 max-h-48 overflow-auto rounded bg-muted/50 p-2 text-xs",
											children: JSON.stringify(post.appData.payload, null, 2)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 flex items-center gap-1 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }),
										post.commentCount,
										" comentários"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mt-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleComment,
						className: "mt-4 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							placeholder: user ? "Escreva um comentário..." : "Faça login para comentar",
							value: body,
							onChange: (e) => setBody(e.target.value),
							disabled: !user
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "sm",
							disabled: !user || !body.trim(),
							children: "Comentar"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-3",
						children: [
							comments.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border bg-card p-3",
								style: { marginLeft: Math.min(c.depth, 4) * 16 },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1 text-xs text-muted-foreground",
										children: [
											"u/",
											c.authorUsername,
											" ·",
											" ",
											formatDistanceToNow(c.createdAt, {
												addSuffix: true,
												locale: ptBR
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm whitespace-pre-wrap",
										children: c.body
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: c.score
										}), " pontos"]
									})
								]
							}), i === Math.min(1, comments.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
								slot: 2,
								className: "py-1"
							})] }, c.id)),
							comments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-sm text-muted-foreground",
								children: "Nenhum comentário ainda. Seja o primeiro!"
							}),
							comments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
								slot: 2,
								className: "py-1"
							})
						]
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
export { PostPage as component };
