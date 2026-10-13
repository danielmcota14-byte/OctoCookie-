import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { H as ArrowUp, c as Trash2 } from "../_libs/lucide-react.mjs";
import { r as loadThreads, t as AppSidebar } from "./app-sidebar-DXiLitwJ.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/edu-chat-BwQADaT9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Chat educativo simples (Finance / Start). Histórico só na memória da página. */
function EduChat({ module: cfg }) {
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [msgs, setMsgs] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const bottomRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	(0, import_react.useEffect)(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [msgs, loading]);
	async function send(text) {
		const q = text.trim();
		if (!q || loading) return;
		const history = [...msgs.filter((m) => !m.error), {
			role: "user",
			content: q
		}];
		setMsgs(history);
		setInput("");
		setLoading(true);
		try {
			const r = await fetch("/api/edu-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					module: cfg.id,
					messages: history.map(({ role, content }) => ({
						role,
						content
					}))
				})
			});
			const data = await r.json().catch(() => ({}));
			if (!r.ok) throw new Error(data.error || `Erro ${r.status}`);
			setMsgs([...history, {
				role: "assistant",
				content: data.reply || "Sem resposta."
			}]);
		} catch (e) {
			setMsgs([...history, {
				role: "assistant",
				content: e instanceof Error ? e.message : String(e),
				error: true
			}]);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center gap-2 border-b py-3 pl-14 pr-4 md:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold text-white",
							style: { background: cfg.accent },
							children: cfg.logo
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate text-sm font-medium",
							children: cfg.topbar
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full px-2 py-0.5 text-[11px] font-semibold",
							style: {
								color: cfg.accent,
								background: `${cfg.accent}1a`
							},
							children: cfg.name
						}),
						msgs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setMsgs([]),
							className: "ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Limpar"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto px-4 py-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-2xl flex-col gap-4",
						children: [
							msgs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border p-4 text-sm",
								style: {
									borderColor: `${cfg.accent}40`,
									background: `${cfg.accent}0d`
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: cfg.welcomeTitle }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-muted-foreground",
										children: cfg.welcome
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: cfg.suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => send(s.question),
											className: "rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-muted",
											children: s.label
										}, s.label))
									})
								]
							}),
							msgs.map((m, i) => m.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto max-w-[85%] rounded-2xl bg-muted px-4 py-2 text-sm",
								children: m.content
							}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: m.error ? "rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive" : "max-w-none space-y-3 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
								children: m.error ? m.content : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: m.content })
							}, i)),
							loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: "Pensando..."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-2xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-2 rounded-2xl border bg-background p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: input,
								onChange: (e) => setInput(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										send(input);
									}
								},
								rows: 1,
								maxLength: 4e3,
								placeholder: cfg.placeholder,
								className: "max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => send(input),
								disabled: loading || !input.trim(),
								"aria-label": "Enviar",
								className: "grid h-9 w-9 shrink-0 place-items-center rounded-full text-white disabled:opacity-40",
								style: { background: cfg.accent },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-center text-[11px] text-muted-foreground",
							children: cfg.hint
						})]
					})
				})
			]
		})]
	});
}
//#endregion
export { EduChat as t };
