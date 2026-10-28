import { o as __toESM } from "./_runtime.mjs";
import { n as DefaultChatTransport, o as require_jsx_runtime, s as require_react, t as useChat } from "./_libs/@ai-sdk/react+[...].mjs";
import { g as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as AdSlot } from "./_ssr/ad-slot-BWO7WtQH.mjs";
import { H as ArrowUp } from "./_libs/lucide-react.mjs";
import { t as Route } from "./_threadId-c4PYogNI.mjs";
import { a as octocookie_mascot_default, i as newThread, n as deriveTitle, o as saveThreads, r as loadThreads, t as AppSidebar } from "./_ssr/app-sidebar-D38O-nZB.mjs";
import { t as Markdown } from "./_libs/react-markdown+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_threadId-9o8WLUlK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChatWindow({ thread, onUpdate }) {
	const inputRef = (0, import_react.useRef)(null);
	const scrollRef = (0, import_react.useRef)(null);
	const lastSavedSig = (0, import_react.useRef)("");
	const threadRef = (0, import_react.useRef)(thread);
	threadRef.current = thread;
	const onUpdateRef = (0, import_react.useRef)(onUpdate);
	onUpdateRef.current = onUpdate;
	const persist = (0, import_react.useCallback)((msgs) => {
		const sig = msgs.map((m) => m.id).join("|") + "#" + msgs.length;
		if (sig === lastSavedSig.current) return;
		lastSavedSig.current = sig;
		const t = threadRef.current;
		const updated = {
			...t,
			messages: msgs,
			title: deriveTitle(msgs) || t.title,
			updatedAt: Date.now()
		};
		onUpdateRef.current(updated);
		const all = loadThreads();
		saveThreads(all.some((x) => x.id === t.id) ? all.map((x) => x.id === t.id ? updated : x) : [updated, ...all]);
	}, []);
	const { messages, sendMessage, status, error } = useChat({
		id: thread.id,
		messages: thread.messages,
		transport: new DefaultChatTransport({ api: "/api/chat" }),
		onError: (e) => console.error(e),
		onFinish: ({ messages: finalMsgs }) => {
			persist(finalMsgs);
		}
	});
	(0, import_react.useEffect)(() => {
		if (status === "streaming" || status === "submitted") return;
		if (messages.length === 0) return;
		persist(messages);
	}, [
		messages,
		status,
		persist
	]);
	(0, import_react.useEffect)(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [messages, status]);
	(0, import_react.useEffect)(() => {
		inputRef.current?.focus();
	}, [thread.id]);
	const isLoading = status === "submitted" || status === "streaming";
	const isEmpty = messages.length === 0;
	const firstReply = messages.findIndex((m) => m.role !== "user");
	const adAfter = firstReply >= 0 ? firstReply : messages.length - 1;
	function handleSubmit(e) {
		e.preventDefault();
		const text = inputRef.current?.value.trim();
		if (!text || isLoading) return;
		sendMessage({ text });
		if (inputRef.current) inputRef.current.value = "";
	}
	function sendPreset(text) {
		if (isLoading) return;
		sendMessage({ text });
	}
	const starters = [
		"Me ensina a usar o bot do zero",
		"O que é o modo Só Holograma?",
		"Como funciona a carteira virtual?",
		"Qual a diferença entre tendência e quântica?"
	];
	const composer = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "w-full max-w-3xl rounded-3xl bg-muted/80 p-2 shadow-sm ring-1 ring-border/60 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			ref: inputRef,
			rows: 1,
			placeholder: "Ex.: me ensina a usar o bot do zero",
			className: "block max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground",
			onKeyDown: (e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					handleSubmit(e);
				}
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground",
					children: "OctoCookie · educacional"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: isLoading,
					className: "grid h-8 w-8 place-items-center rounded-full bg-muted-foreground/40 text-background hover:bg-foreground disabled:opacity-50",
					"aria-label": "Enviar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
				})]
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollRef,
			className: "flex-1 overflow-y-auto",
			children: isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-full flex-col items-center justify-center gap-6 px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: octocookie_mascot_default,
						alt: "OctoCookie",
						width: 96,
						height: 96,
						className: "h-24 w-24 opacity-90"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-md text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: "Olá! Eu ensino o OctoCookie do zero."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Escolha um atalho ou digite sua dúvida. Conteúdo educacional — sem recomendação de investimento."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex max-w-lg flex-wrap justify-center gap-2",
						children: starters.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => sendPreset(s),
							className: "rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-foreground shadow-sm hover:bg-muted",
							children: s
						}, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {
						slot: 1,
						className: "mt-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex w-full justify-center sm:px-6",
						children: composer
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 2 })
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-40 pt-16 sm:px-6 md:pt-8",
				children: [
					messages.map((m, i) => {
						const text = m.parts.map((p) => p.type === "text" ? p.text : "").join("");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [m.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground sm:max-w-[80%]",
								children: text
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "prose prose-sm max-w-none text-sm text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: text })
						}), i === adAfter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 1 })] }, m.id);
					}),
					status === "submitted" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted-foreground",
						children: "Pensando…"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive",
						children: (() => {
							const m = error.message ?? "";
							if (/rate.?limit|429|quota|too many/i.test(m)) return "Muitas mensagens em pouco tempo — o limite de uso da IA foi atingido. Espere um minuto e tente de novo.";
							if (/invalid.?api.?key|incorrect.?api.?key|401|unauthorized|GROQ_API_KEY inválida/i.test(m)) return "Chave da IA inválida ou revogada. Gere uma nova em https://console.groq.com, coloque em GROQ_API_KEY (.env local ou variáveis do Vercel) e reinicie o servidor / faça redeploy.";
							if (/GROQ_API_KEY não configurada|não configurada/i.test(m)) return "GROQ_API_KEY não configurada. Crie uma chave em https://console.groq.com e defina no .env (local) ou nas Environment Variables do Vercel, depois reinicie / redeploy.";
							if (m.length > 0 && m.length < 400 && !/fetch|network|failed to/i.test(m)) return m;
							return "Não foi possível obter uma resposta agora. Verifique a GROQ_API_KEY e tente novamente em instantes.";
						})()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: 2 })
				]
			})
		}), !isEmpty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 bottom-0 flex justify-center px-3 pb-6 sm:px-6 sm:pb-8",
			children: composer
		})]
	});
}
function ThreadPage() {
	const { threadId } = Route.useParams();
	const [threads, setThreads] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		const all = loadThreads();
		let list = all;
		if (!all.some((t) => t.id === threadId)) {
			list = [{
				...newThread(),
				id: threadId
			}, ...all];
			saveThreads(list);
		}
		setThreads(list);
		setReady(true);
	}, [threadId]);
	if (!ready) return null;
	const active = threads.find((t) => t.id === threadId);
	if (!active) {
		navigate({ to: "/" });
		return null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWindow, {
			thread: active,
			onUpdate: (u) => setThreads((prev) => prev.map((t) => t.id === u.id ? u : t))
		}, active.id)]
	});
}
//#endregion
export { ThreadPage as component };
