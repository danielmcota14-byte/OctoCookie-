import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { g as vote, h as useAuth, o as createPost } from "./auth-context-BBr6EEBW.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as Input, t as Button } from "./input-B8wkzuVc.mjs";
import { A as ExternalLink, F as ChevronUp, I as ChevronDown, L as Check, T as MessageSquare, U as ArrowBigUp, W as ArrowBigDown, m as Share2 } from "../_libs/lucide-react.mjs";
import { n as Label } from "./stock-ticker-BIJGgkVH.mjs";
import { n as formatDistanceToNow, t as ptBR } from "../_libs/date-fns.mjs";
import { a as ItemText, c as Root2, d as Separator, f as Trigger, i as ItemIndicator, l as ScrollDownButton, m as Viewport, n as Icon, o as Label$1, p as Value, r as Item, s as Portal, t as Content2, u as ScrollUpButton } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-post-form-BfsA2qf4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostCard({ post, onNeedAuth }) {
	const { user } = useAuth();
	const [score, setScore] = (0, import_react.useState)(post.score);
	const [myVote, setMyVote] = (0, import_react.useState)(0);
	const [voting, setVoting] = (0, import_react.useState)(false);
	async function handleVote(value) {
		if (!user) {
			onNeedAuth?.();
			return;
		}
		if (voting) return;
		setVoting(true);
		try {
			const prev = myVote;
			await vote(user.uid, post.id, "post", value);
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
		} catch (e) {
			console.error(e);
		} finally {
			setVoting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-10 shrink-0 flex-col items-center gap-0.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => handleVote(1),
					className: cn("rounded p-0.5 hover:bg-muted", myVote === 1 && "text-orange-500"),
					"aria-label": "Upvote",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowBigUp, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-xs font-bold tabular-nums", score > 0 && "text-orange-500", score < 0 && "text-blue-500"),
					children: score
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => handleVote(-1),
					className: cn("rounded p-0.5 hover:bg-muted", myVote === -1 && "text-blue-500"),
					"aria-label": "Downvote",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowBigDown, { className: "h-5 w-5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/community/$communityId",
							params: { communityId: post.communityId },
							className: "font-semibold text-foreground hover:underline",
							children: ["c/", post.communityId]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["u/", post.authorUsername] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: formatDistanceToNow(post.createdAt, {
							addSuffix: true,
							locale: ptBR
						}) }),
						post.flair && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary",
							children: post.flair
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/post/$postId",
					params: { postId: post.id },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold leading-snug text-foreground hover:text-primary",
						children: post.title
					})
				}),
				post.body && post.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-3 text-sm text-muted-foreground",
					children: post.body
				}),
				post.type === "link" && post.linkUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: post.linkUrl,
					target: "_blank",
					rel: "noreferrer",
					className: "mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" }), new URL(post.linkUrl).hostname]
				}),
				post.type === "share_app_data" && post.appData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium text-primary",
						children: ["📊 Dados do app · ", post.appData.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-muted-foreground",
						children: [
							"(fonte: ",
							post.appData.source,
							")"
						]
					})]
				}),
				post.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: post.imageUrl,
					alt: "",
					className: "mt-2 max-h-64 rounded-md object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center gap-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/post/$postId",
						params: { postId: post.id },
						className: "inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }),
							post.commentCount,
							" comentários"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-muted",
						onClick: () => {
							navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-3.5 w-3.5" }), "Compartilhar"]
					})]
				})
			]
		})]
	});
}
var Select = Root2;
var SelectValue = Value;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = Trigger.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollUpButton, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = ScrollUpButton.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollDownButton, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = ScrollDownButton.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = Content2.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = Label$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemText, { children })]
}));
SelectItem.displayName = Item.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = Separator.displayName;
function CreatePostForm({ communityId, onCreated, onNeedAuth, initialAppData }) {
	const { user, profile } = useAuth();
	const [title, setTitle] = (0, import_react.useState)(initialAppData ? `Compartilhei: ${initialAppData.label}` : "");
	const [body, setBody] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)(initialAppData ? "share_app_data" : "text");
	const [linkUrl, setLinkUrl] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function handleSubmit(e) {
		e.preventDefault();
		if (!user || !profile) {
			onNeedAuth();
			return;
		}
		if (!title.trim()) {
			setError("Título obrigatório");
			return;
		}
		setLoading(true);
		setError("");
		try {
			onCreated(await createPost({
				communityId,
				authorId: user.uid,
				authorName: profile.displayName,
				authorUsername: profile.username,
				authorPhoto: profile.photoURL,
				title: title.trim(),
				body: body.trim() || void 0,
				type,
				linkUrl: type === "link" ? linkUrl : void 0,
				appData: type === "share_app_data" ? initialAppData : void 0
			}));
			setTitle("");
			setBody("");
			setLinkUrl("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao publicar");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-3 rounded-lg border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "text-sm font-semibold",
				children: ["Criar post em c/", communityId]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tipo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: type,
					onValueChange: (v) => setType(v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "text",
							children: "Texto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "link",
							children: "Link"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "share_app_data",
							children: "Dados do App"
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Título" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Um título chamativo...",
					maxLength: 300,
					required: true
				})]
			}),
			type === "link" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "URL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "url",
					value: linkUrl,
					onChange: (e) => setLinkUrl(e.target.value),
					placeholder: "https://...",
					required: true
				})]
			}),
			(type === "text" || type === "share_app_data") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Corpo (opcional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					value: body,
					onChange: (e) => setBody(e.target.value),
					placeholder: "Conte mais detalhes..."
				})]
			}),
			type === "share_app_data" && initialAppData && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded border border-dashed border-primary/40 bg-primary/5 p-2 text-xs text-primary",
				children: [
					"📊 Anexando: ",
					initialAppData.label,
					" (",
					initialAppData.source,
					")"
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: loading,
				className: "w-full sm:w-auto",
				children: loading ? "Publicando..." : "Publicar"
			})
		]
	});
}
//#endregion
export { PostCard as n, CreatePostForm as t };
