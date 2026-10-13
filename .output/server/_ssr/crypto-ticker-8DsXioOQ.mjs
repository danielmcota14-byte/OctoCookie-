import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { l as useAuth } from "./router-VJ1IerJ4.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as Input, t as Button } from "./input-B8wkzuVc.mjs";
import { o as TrendingUp, s as TrendingDown, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as Label$1 } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crypto-ticker-8DsXioOQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Label$1.displayName;
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function AuthModal({ open, onOpenChange }) {
	const { signInEmail, signUpEmail, signInGoogle } = useAuth();
	const [mode, setMode] = (0, import_react.useState)("login");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			if (mode === "login") await signInEmail(email, password);
			else {
				if (!displayName.trim()) throw new Error("Nome é obrigatório");
				await signUpEmail(email, password, displayName.trim());
			}
			onOpenChange(false);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erro ao autenticar";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}
	async function handleGoogle() {
		setError("");
		setLoading(true);
		try {
			await signInGoogle();
			onOpenChange(false);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erro no Google";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: mode === "login" ? "Entrar no OctoCommunity" : "Criar conta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Rede social Web3 do OctoCookie — compartilhe análises, portfolios e discussões." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "name",
								children: "Nome de exibição"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "name",
								value: displayName,
								onChange: (e) => setDisplayName(e.target.value),
								placeholder: "Seu nome",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "E-mail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "voce@email.com",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Senha"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: "password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "••••••••",
								minLength: 6,
								required: true
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-destructive",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: loading,
							children: loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative my-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-full border-t" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative flex justify-center text-xs uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "bg-background px-2 text-muted-foreground",
							children: "ou"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full",
					onClick: handleGoogle,
					disabled: loading,
					children: "Continuar com Google"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm text-muted-foreground",
					children: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Não tem conta?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "font-medium text-primary underline-offset-4 hover:underline",
							onClick: () => setMode("signup"),
							children: "Criar agora"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Já tem conta?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "font-medium text-primary underline-offset-4 hover:underline",
							onClick: () => setMode("login"),
							children: "Entrar"
						})
					] })
				})
			]
		})
	});
}
var COINS = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,avalanche-2,polkadot,chainlink";
function MiniSparkline({ data, positive }) {
	if (!data || data.length < 2) return null;
	const w = 64;
	const h = 24;
	const min = Math.min(...data);
	const range = Math.max(...data) - min || 1;
	const points = data.map((v, i) => {
		return `${i / (data.length - 1) * w},${h - (v - min) / range * 20 - 2}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: w,
		height: h,
		className: "shrink-0 opacity-90",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: positive ? "#22c55e" : "#ef4444",
			strokeWidth: "1.5",
			points
		})
	});
}
function formatPrice(n) {
	if (n >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
	if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
	return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}
function CryptoTicker() {
	const [coins, setCoins] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(false);
	const trackRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function fetchPrices() {
			try {
				const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`);
				if (!res.ok) throw new Error("API error");
				const data = await res.json();
				if (!cancelled) {
					setCoins(data);
					setError(false);
				}
			} catch {
				if (!cancelled) setError(true);
			}
		}
		fetchPrices();
		const id = setInterval(fetchPrices, 6e4);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, []);
	if (error && coins.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-9 items-center border-b bg-muted/40 px-4 text-xs text-muted-foreground",
		children: "Não foi possível carregar preços das criptos agora."
	});
	if (coins.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-9 items-center border-b bg-muted/40 px-4 text-xs text-muted-foreground",
		children: "Carregando mercado..."
	});
	const items = [...coins, ...coins];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-9 overflow-hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: trackRef,
			className: "ticker-track flex h-full items-center gap-8 whitespace-nowrap",
			style: { animation: "ticker-scroll 45s linear infinite" },
			children: items.map((c, i) => {
				const pos = (c.price_change_percentage_24h ?? 0) >= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2 px-1 text-xs",
					children: [
						c.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: c.image,
							alt: "",
							className: "h-4 w-4 rounded-full"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold uppercase text-foreground",
							children: c.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: ["$", formatPrice(c.current_price)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("flex items-center gap-0.5 tabular-nums font-medium", pos ? "text-green-500" : "text-red-500"),
							children: [
								pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3 w-3" }),
								Math.abs(c.price_change_percentage_24h ?? 0).toFixed(2),
								"%"
							]
						}),
						c.sparkline_in_7d?.price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniSparkline, {
							data: c.sparkline_in_7d.price.slice(-48),
							positive: pos
						})
					]
				}, `${c.id}-${i}`);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      ` })]
	});
}
//#endregion
export { CryptoTicker as n, Label as r, AuthModal as t };
