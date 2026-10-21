import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { l as useAuth, w as auth } from "./router-BWxZCkfo.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as Input, t as Button } from "./input-B8wkzuVc.mjs";
import { A as Link2, B as CircleCheck, D as Lock, L as Coins, O as LockOpen, P as ExternalLink, a as TriangleAlert, k as LoaderCircle, m as ShieldAlert, n as Wallet } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, t as AuthModal } from "./auth-modal-BPSQdXM3.mjs";
import { a as octocookie_mascot_default, r as loadThreads, t as AppSidebar } from "./app-sidebar-DAhkwR9g.mjs";
import { i as TabsTrigger$1, n as TabsContent$1, r as TabsList$1, t as Tabs$1 } from "../_libs/radix-ui__react-tabs.mjs";
import { i as parseUnits, n as Contract, r as formatUnits, t as BrowserProvider } from "../_libs/ethers.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token-BSeOT3vU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var Tabs = Tabs$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList$1, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = TabsList$1.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger$1, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = TabsTrigger$1.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent$1, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = TabsContent$1.displayName;
var BASE = ({
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_BOT_24X7_URL": "/bot",
	"VITE_COOKIESCRIPT_URL": "https://cookiescript-jgvh.onrender.com"
}.VITE_BOT_24X7_URL || "/bot").replace(/\/$/, "");
/** Chave do navegador que guarda o hash de um pagamento enviado, para retomar a verificação se a página for fechada. */
var pendingKey = (orderId) => `octo-token-tx:${orderId}`;
var ApiError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.status = status;
	}
};
async function request(path, init = {}, authed = false) {
	const headers = { "Content-Type": "application/json" };
	if (authed) {
		const u = auth.currentUser;
		if (!u) throw new ApiError("Entre na sua conta OctoCookie para continuar.", 401);
		headers.Authorization = `Bearer ${await u.getIdToken()}`;
	}
	let res;
	try {
		res = await fetch(`${BASE}/token${path}`, {
			...init,
			headers: {
				...headers,
				...init.headers
			},
			cache: "no-store"
		});
	} catch {
		throw new ApiError("Servidor do token indisponível. Tente novamente em instantes.", 0);
	}
	const body = await res.json().catch(() => ({}));
	if (!res.ok && res.status !== 202 && res.status !== 422) throw new ApiError(body.erro || `Erro ${res.status}`, res.status);
	return body;
}
var api = {
	config: () => request("/config"),
	catalog: () => request("/catalog"),
	transparency: () => request("/transparency"),
	me: () => request("/me", {}, true),
	transfers: () => request("/transfers", {}, true),
	nonce: (address) => request("/wallet/nonce", {
		method: "POST",
		body: JSON.stringify({ address })
	}, true),
	link: (message, signature) => request("/wallet/link", {
		method: "POST",
		body: JSON.stringify({
			message,
			signature
		})
	}, true),
	order: (featureId) => request("/orders", {
		method: "POST",
		body: JSON.stringify({ featureId })
	}, true),
	submit: (orderId, txHash) => request(`/orders/${orderId}/submit`, {
		method: "POST",
		body: JSON.stringify({ txHash })
	}, true)
};
async function adminRequest(path, init = {}) {
	const u = auth.currentUser;
	if (!u) throw new ApiError("Entre com a conta de administrador.", 401);
	let res;
	try {
		res = await fetch(`${BASE}/adm/token${path}`, {
			...init,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${await u.getIdToken()}`
			},
			cache: "no-store"
		});
	} catch {
		throw new ApiError("Servidor indisponível.", 0);
	}
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new ApiError(body.erro || `Erro ${res.status}`, res.status);
	return body;
}
var post = (b) => ({
	method: "POST",
	body: JSON.stringify(b ?? {})
});
var adminApi = {
	status: () => adminRequest("/status"),
	catalog: () => adminRequest("/catalog"),
	saveFeature: (id, patch) => adminRequest(`/catalog/${id}`, {
		method: "PUT",
		body: JSON.stringify(patch)
	}),
	rewards: () => adminRequest("/rewards"),
	createReward: (b) => adminRequest("/rewards", post(b)),
	approve: (id) => adminRequest(`/rewards/${id}/approve`, post()),
	reject: (id) => adminRequest(`/rewards/${id}/reject`, post()),
	mint: (id) => adminRequest(`/rewards/${id}/mint`, post({ confirm: true })),
	manual: (id, txHash) => adminRequest(`/rewards/${id}/manual`, post({ txHash }))
};
var TOKEN_ABI = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function decimals() view returns (uint8)",
	"function totalSupply() view returns (uint256)",
	"function balanceOf(address account) view returns (uint256)",
	"function transfer(address to, uint256 value) returns (bool)"
];
var getEthereum = () => typeof window !== "undefined" ? window.ethereum ?? null : null;
function walletError(e) {
	const err = e;
	if (err?.code === 4001 || err?.code === "ACTION_REJECTED") return "Operação cancelada na carteira.";
	if (err?.code === -32002) return "Já existe uma solicitação pendente na carteira. Abra-a para continuar.";
	return err?.info?.error?.message || err?.shortMessage || err?.message || "Erro desconhecido na carteira.";
}
async function connectWallet() {
	const eth = getEthereum();
	if (!eth) throw new Error("Nenhuma carteira Web3 encontrada. Instale a MetaMask (ou outra compatível).");
	const provider = new BrowserProvider(eth);
	const accounts = await provider.send("eth_requestAccounts", []);
	if (!accounts?.length) throw new Error("Nenhuma conta autorizada na carteira.");
	const net = await provider.getNetwork();
	return {
		provider,
		account: accounts[0],
		chainId: Number(net.chainId)
	};
}
async function switchChain(chainId) {
	const eth = getEthereum();
	if (!eth) throw new Error("Carteira não encontrada.");
	await eth.request({
		method: "wallet_switchEthereumChain",
		params: [{ chainId: "0x" + chainId.toString(16) }]
	});
}
/** Lê o token DIRETAMENTE do contrato (nome, símbolo, decimals, saldo, oferta). */
async function readToken(provider, contract, account) {
	const c = new Contract(contract, TOKEN_ABI, provider);
	const [name, symbol, decimals, balance, totalSupply] = await Promise.all([
		c.name(),
		c.symbol(),
		c.decimals(),
		c.balanceOf(account),
		c.totalSupply()
	]);
	return {
		name,
		symbol,
		decimals: Number(decimals),
		balance,
		totalSupply
	};
}
/** Pagamento direto: transfer(tesouraria, valor). O usuário confirma na própria carteira. Retorna o hash. */
async function sendTransfer(provider, contract, treasury, amountUnits) {
	const signer = await provider.getSigner();
	return (await new Contract(contract, TOKEN_ABI, signer).transfer(treasury, amountUnits)).hash;
}
async function signMessage(provider, message) {
	return (await provider.getSigner()).signMessage(message);
}
var fmtUnits = (v, decimals, maxFrac = 4) => {
	const [i, f = ""] = formatUnits(v, decimals).split(".");
	const frac = f.slice(0, maxFrac).replace(/0+$/, "");
	return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (frac ? "," + frac : "");
};
var short = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
/** Estado da carteira conectada + dados do token lidos do contrato. Reage a troca de conta/rede. */
function useTokenWallet(contract, ready, expectedChainId) {
	const [account, setAccount] = (0, import_react.useState)(null);
	const [chainId, setChainId] = (0, import_react.useState)(null);
	const [onChain, setOnChain] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const providerRef = (0, import_react.useRef)(null);
	const refresh = (0, import_react.useCallback)(async (acc = account) => {
		if (!acc || !contract || !ready || !providerRef.current || chainId !== expectedChainId) return;
		setLoading(true);
		setError("");
		try {
			setOnChain(await readToken(providerRef.current, contract, acc));
		} catch (e) {
			setOnChain(null);
			setError("Não foi possível ler o contrato nesta rede: " + walletError(e));
		} finally {
			setLoading(false);
		}
	}, [
		account,
		contract,
		ready,
		chainId,
		expectedChainId
	]);
	const connect = (0, import_react.useCallback)(async () => {
		setError("");
		try {
			const c = await connectWallet();
			providerRef.current = c.provider;
			setAccount(c.account);
			setChainId(c.chainId);
		} catch (e) {
			setError(walletError(e));
		}
	}, []);
	const disconnect = (0, import_react.useCallback)(() => {
		providerRef.current = null;
		setAccount(null);
		setChainId(null);
		setOnChain(null);
	}, []);
	(0, import_react.useEffect)(() => {
		const eth = getEthereum();
		if (!eth?.on) return;
		const onAccounts = (accs) => {
			const list = Array.isArray(accs) ? accs : [];
			if (list.length) setAccount(list[0]);
			else disconnect();
		};
		const onChain = () => connect();
		eth.on("accountsChanged", onAccounts);
		eth.on("chainChanged", onChain);
		return () => {
			eth.removeListener?.("accountsChanged", onAccounts);
			eth.removeListener?.("chainChanged", onChain);
		};
	}, [connect, disconnect]);
	(0, import_react.useEffect)(() => {
		if (account && chainId) refresh(account);
	}, [
		account,
		chainId,
		contract,
		ready,
		refresh
	]);
	return {
		account,
		chainId,
		onChain,
		loading,
		error,
		provider: providerRef.current,
		connect,
		disconnect,
		refresh
	};
}
/** Fluxo: revisar preço/destino → pedido no servidor → transfer() assinado na carteira → servidor verifica na blockchain → libera. */
function PurchaseDialog({ feature, cfg, provider, onChain, onClose, onDone }) {
	const [step, setStep] = (0, import_react.useState)("review");
	const [msg, setMsg] = (0, import_react.useState)("");
	const [tx, setTx] = (0, import_react.useState)("");
	const alive = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		setStep("review");
		setMsg("");
		setTx("");
		return () => {
			alive.current = false;
		};
	}, [feature?.id]);
	if (!feature) return null;
	let price = null;
	try {
		price = parseUnits(feature.priceTokens, onChain.decimals);
	} catch {
		price = null;
	}
	const insufficient = price !== null && onChain.balance < price;
	const busy = step === "order" || step === "wallet";
	async function verifyLoop(orderId, hash) {
		setStep("verifying");
		for (let i = 0; i < 90 && alive.current; i++) {
			try {
				const r = await api.submit(orderId, hash);
				if (r.status === "confirmed") {
					localStorage.removeItem(pendingKey(orderId));
					setStep("done");
					onDone();
					return;
				}
				if (r.status === "rejected") {
					localStorage.removeItem(pendingKey(orderId));
					setMsg(r.motivo || "Pagamento rejeitado pelo servidor.");
					setStep("error");
					return;
				}
				setMsg(r.motivo || "Aguardando confirmações na rede…");
			} catch (e) {
				if (e instanceof ApiError && e.status !== 0 && e.status < 500) {
					setMsg(e.message);
					setStep("error");
					return;
				}
				setMsg("Servidor ocupado, tentando de novo…");
			}
			await new Promise((r) => setTimeout(r, 7e3));
		}
		if (alive.current) {
			setMsg("A confirmação está demorando. Seu pagamento fica registrado: reabra esta página mais tarde e ele será verificado automaticamente.");
			setStep("error");
		}
	}
	async function pay() {
		if (!feature || price === null) return;
		setMsg("");
		try {
			setStep("order");
			const { order } = await api.order(feature.id);
			if (order.treasury?.toLowerCase() !== cfg.treasury?.toLowerCase() || !order.amountUnits) throw new Error("O pedido não confere com a configuração pública. Pagamento abortado.");
			setStep("wallet");
			const hash = await sendTransfer(provider, cfg.contract, order.treasury, BigInt(order.amountUnits));
			localStorage.setItem(pendingKey(order.id), hash);
			setTx(hash);
			await verifyLoop(order.id, hash);
		} catch (e) {
			setMsg(e instanceof ApiError ? e.message : walletError(e));
			setStep("error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!feature,
		onOpenChange: (o) => !o && !busy && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Desbloquear: ", feature.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: feature.description })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Preço"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-medium",
						children: [
							feature.priceTokens,
							" ",
							onChain.symbol
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Enviar para (tesouraria)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "break-all font-mono text-xs",
						children: cfg.treasury
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Seu saldo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
						fmtUnits(onChain.balance, onChain.decimals),
						" ",
						onChain.symbol
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Método"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "transfer() direto — você confirma na sua carteira" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Acesso"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: feature.durationDays ? `${feature.durationDays} dias` : "Permanente" })
				]
			}),
			price === null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Preço incompatível" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "O preço tem mais casas decimais do que o token permite. Avise o administrador." })
				]
			}),
			insufficient && step === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Saldo insuficiente" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
						"Você precisa de pelo menos ",
						feature.priceTokens,
						" ",
						onChain.symbol,
						" nesta carteira."
					] })
				]
			}),
			step === "wallet" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Confirme a transação na sua carteira…"]
			}),
			step === "order" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Criando o pedido…"]
			}),
			step === "verifying" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Transação enviada. O servidor está verificando na blockchain…"]
					}),
					msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: msg
					}),
					tx && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: short(tx)
					})
				]
			}),
			step === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Pagamento confirmado" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
					"“",
					feature.name,
					"” foi liberado na sua conta. Veja o recibo no Histórico."
				] })
			] }),
			step === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Não foi possível concluir" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: msg })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [(step === "review" || step === "error") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: pay,
				disabled: price === null || insufficient,
				children: step === "error" ? "Tentar de novo" : "Pagar com a carteira"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				disabled: busy,
				children: step === "done" || step === "verifying" ? "Fechar" : "Cancelar"
			})] })
		] })
	});
}
var when = (t) => new Date(t).toLocaleString("pt-BR");
var ORDER_LABEL = {
	awaiting_payment: "Aguardando pagamento",
	paid: "Pago",
	expired: "Expirado"
};
var REWARD_LABEL = {
	pending: "Pendente de aprovação",
	approved: "Aprovada (aguardando emissão)",
	minting: "Emissão em andamento",
	minted: "Emitida",
	rejected: "Rejeitada"
};
function TxLink({ hash, cfg }) {
	if (!cfg.explorerUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-xs",
		children: short(hash)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: `${cfg.explorerUrl}/tx/${hash}`,
		target: "_blank",
		rel: "noreferrer",
		className: "inline-flex items-center gap-1 font-mono text-xs underline",
		children: [
			short(hash),
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })
		]
	});
}
function TokenHistory({ me, cfg, decimals, symbol }) {
	const [tr, setTr] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
	async function loadTransfers() {
		setBusy(true);
		setErr("");
		try {
			setTr(await api.transfers());
		} catch (e) {
			setErr(e instanceof ApiError ? e.message : "Falha ao carregar.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium",
				children: "Compras e recursos desbloqueados"
			}), me.orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nenhuma compra ainda."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y rounded-xl border",
				children: me.orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-2 p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: o.featureName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							when(o.paidAt ?? o.createdAt),
							" · ",
							o.amountTokens,
							" ",
							symbol
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [o.txHash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxLink, {
							hash: o.txHash,
							cfg
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: o.status === "paid" ? "default" : "secondary",
							children: ORDER_LABEL[o.status] ?? o.status
						})]
					})]
				}, o.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium",
				children: "Recompensas"
			}), me.rewards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nenhuma recompensa registrada. Recompensas são aprovadas pela administração e nunca emitidas automaticamente."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y rounded-xl border",
				children: me.rewards.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-2 p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: r.reason
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							when(r.createdAt),
							" · ",
							r.amountTokens,
							" ",
							symbol,
							" · ",
							r.kind
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [r.txHash && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxLink, {
							hash: r.txHash,
							cfg
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: r.status === "minted" ? "default" : "secondary",
							children: REWARD_LABEL[r.status] ?? r.status
						})]
					})]
				}, r.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: "Transações do token (on-chain, janela recente)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: loadTransfers,
						disabled: busy || !me.wallet || !cfg.ready,
						children: busy ? "Carregando…" : tr ? "Atualizar" : "Carregar"
					})]
				}),
				err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-destructive",
					children: err
				}),
				tr?.warning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: tr.warning
				}),
				tr && tr.items.length === 0 && !tr.warning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nenhuma transferência na janela consultada."
				}),
				tr && tr.items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y rounded-xl border",
					children: tr.items.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							t.direction === "out" ? "Enviou" : "Recebeu",
							" ",
							decimals != null ? fmtUnits(t.value, decimals) : t.value,
							" ",
							symbol,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									" ",
									"· ",
									t.direction === "out" ? "para " + short(t.to) : "de " + short(t.from)
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxLink, {
							hash: t.txHash,
							cfg
						})]
					}, t.txHash + t.block + t.direction))
				})
			] })
		]
	});
}
var Row = ({ k, v }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "grid gap-1 py-2 sm:grid-cols-[200px_1fr]",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-sm text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "break-words text-sm",
		children: v
	})]
});
function TokenTransparency() {
	const [t, setT] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		api.transparency().then(setT).catch(() => setErr("Não foi possível carregar a página de transparência agora."));
	}, []);
	if (err) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-destructive",
		children: err
	});
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Carregando…"
	});
	const dec = t.contrato.decimals;
	const u = (v) => v == null ? "—" : dec != null ? fmtUnits(v, dec, 6) : v;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-1 text-sm font-medium",
				children: "Contrato"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "divide-y rounded-xl border px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Endereço",
						v: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: t.contrato.endereco
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Rede (chainId)",
						v: t.contrato.chainId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Verificado na rede",
						v: t.contrato.verificado ? "Sim" : "Não — " + (t.contrato.avisos || []).join(" ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Oferta atual",
						v: u(t.contrato.supply)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Bytecode igual ao OctoToken oficial",
						v: t.contrato.bytecodeIdentico == null ? "—" : t.contrato.bytecodeIdentico ? "Sim" : "Não"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Owner (administrador)",
						v: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: t.contrato.owner ?? "—"
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-1 text-sm font-medium",
				children: "Pagamentos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "divide-y rounded-xl border px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Método",
						v: t.pagamentos.metodo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Tesouraria",
						v: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: t.pagamentos.tesouraria
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Confirmações mínimas",
						v: t.pagamentos.confirmacoesMinimas
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Total recebido / compras",
						v: `${t.pagamentos.totalRecebido ?? "—"} (${t.pagamentos.compras})`
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-1 text-sm font-medium",
				children: "Emissão e recompensas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "divide-y rounded-xl border px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Política de emissão",
						v: t.emissao.politica
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Emitido em recompensas",
						v: `${t.emissao.totalEmitidoEmRecompensas ?? "—"} (${t.emissao.recompensas} recompensas)`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Regras de recompensa",
						v: t.recompensas.regras
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-1 text-sm font-medium",
				children: "Queima e administração"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "divide-y rounded-xl border px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Queima",
					v: t.queima.politica
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Administração",
					v: t.administracao.observacao
				})]
			})] })
		]
	});
}
var msgOf = (e) => e instanceof ApiError ? e.message : "Falha na operação.";
function FeatureRow({ f, onSaved, onError }) {
	const [price, setPrice] = (0, import_react.useState)(f.priceTokens);
	(0, import_react.useEffect)(() => setPrice(f.priceTokens), [f.priceTokens]);
	const save = (patch) => adminApi.saveFeature(f.id, patch).then(onSaved).catch((e) => onError(msgOf(e)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex flex-wrap items-center gap-2 p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-40 flex-1 font-medium",
				children: [
					f.name,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted-foreground",
						children: f.id
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "h-8 w-28",
				value: price,
				onChange: (e) => setPrice(e.target.value),
				"aria-label": `Preço de ${f.name}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				disabled: price === f.priceTokens,
				onClick: () => save({ priceTokens: price }),
				children: "Salvar preço"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: f.active ? "secondary" : "default",
				onClick: () => save({ active: !f.active }),
				children: f.active ? "Desativar" : "Ativar"
			})
		]
	});
}
function TokenAdmin() {
	const [status, setStatus] = (0, import_react.useState)(null);
	const [features, setFeatures] = (0, import_react.useState)([]);
	const [rewards, setRewards] = (0, import_react.useState)([]);
	const [err, setErr] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		recipient: "",
		kind: "contribuicao",
		reason: "",
		ref: "",
		amountTokens: ""
	});
	const load = (0, import_react.useCallback)(async () => {
		try {
			const [s, c, r] = await Promise.all([
				adminApi.status(),
				adminApi.catalog(),
				adminApi.rewards()
			]);
			setStatus(s);
			setFeatures(c.features);
			setRewards(r.rewards);
		} catch (e) {
			setErr(msgOf(e));
		}
	}, []);
	(0, import_react.useEffect)(() => void load(), [load]);
	const act = (p) => p.then(() => {
		setErr("");
		return load();
	}).catch((e) => setErr(msgOf(e)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Contrato: ",
					status.ready ? "verificado" : "NÃO verificado — " + status.issues.join(" "),
					" · Emissão pelo servidor:",
					" ",
					status.mint.can ? "disponível" : "indisponível (" + (status.mint.why ?? "") + ")"
				]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: err
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-sm font-medium",
					children: "Catálogo e preços (em tokens inteiros, ex.: 12.5)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y rounded-xl border",
					children: features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureRow, {
						f,
						onSaved: load,
						onError: setErr
					}, f.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Mudanças valem só para novos pedidos; pedidos abertos com o preço antigo são invalidados."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium",
				children: "Nova recompensa (fica pendente até aprovação)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 md:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					act(adminApi.createReward(form).then(() => setForm({
						...form,
						reason: "",
						ref: "",
						amountTokens: ""
					})));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Carteira do destinatário (0x…)",
						value: form.recipient,
						onChange: (e) => setForm({
							...form,
							recipient: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-9 rounded-md border bg-background px-2 text-sm",
						value: form.kind,
						onChange: (e) => setForm({
							...form,
							kind: e.target.value
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "contribuicao",
								children: "Contribuição verificada"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "desafio",
								children: "Desafio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "atividade",
								children: "Atividade elegível"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Motivo",
						value: form.reason,
						onChange: (e) => setForm({
							...form,
							reason: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Referência única (ex.: post:abc123)",
						value: form.ref,
						onChange: (e) => setForm({
							...form,
							ref: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Valor em tokens",
						value: form.amountTokens,
						onChange: (e) => setForm({
							...form,
							amountTokens: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Registrar recompensa"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium",
				children: "Recompensas"
			}), rewards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nenhuma recompensa."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y rounded-xl border",
				children: rewards.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "space-y-2 p-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: r.reason
								}),
								" · ",
								r.amountTokens,
								" →",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs",
									children: r.recipient
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: r.status === "minted" ? "default" : "secondary",
								children: r.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"ref ",
								r.ref,
								r.error ? " · erro: " + r.error : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => act(adminApi.approve(r.id)),
									children: "Aprovar"
								}),
								["pending", "approved"].includes(r.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => act(adminApi.reject(r.id)),
									children: "Rejeitar"
								}),
								(r.status === "approved" || r.status === "minting") && status?.mint.can && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => confirm(`Emitir ${r.amountTokens} tokens on-chain para ${r.recipient}? Esta ação é irreversível.`) && act(adminApi.mint(r.id)),
									children: r.status === "minting" ? "Reconciliar emissão" : "Emitir (mint)"
								}),
								r.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										const h = prompt("Hash da transação de emissão manual (0x…):");
										if (h) act(adminApi.manual(r.id, h.trim()));
									},
									children: "Registrar emissão manual"
								})
							]
						})
					]
				}, r.id))
			})] })
		]
	});
}
var day = (t) => new Date(t).toLocaleDateString("pt-BR");
function TokenPanel() {
	const { user, loading: authLoading } = useAuth();
	const [authOpen, setAuthOpen] = (0, import_react.useState)(false);
	const [cfg, setCfg] = (0, import_react.useState)(null);
	const [features, setFeatures] = (0, import_react.useState)(null);
	const [loadErr, setLoadErr] = (0, import_react.useState)("");
	const [me, setMe] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [linking, setLinking] = (0, import_react.useState)(false);
	const [buying, setBuying] = (0, import_react.useState)(null);
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(false);
	const w = useTokenWallet(cfg?.contract ?? null, !!cfg?.ready, cfg?.chainId ?? null);
	const wrongNetwork = !!(w.account && cfg && w.chainId !== cfg.chainId);
	(0, import_react.useEffect)(() => {
		Promise.all([api.config(), api.catalog()]).then(([c, f]) => {
			setCfg(c);
			setFeatures(f.features);
		}).catch((e) => setLoadErr(e instanceof ApiError ? e.message : "Falha ao carregar o token."));
	}, []);
	const refreshMe = (0, import_react.useCallback)(async () => {
		if (!user) return setMe(null);
		try {
			setMe(await api.me());
		} catch (e) {
			setNotice(e instanceof ApiError ? e.message : "Falha ao carregar sua conta.");
		}
	}, [user]);
	(0, import_react.useEffect)(() => {
		refreshMe();
	}, [refreshMe]);
	(0, import_react.useEffect)(() => {
		setIsAdmin(false);
		if (user) adminApi.status().then(() => setIsAdmin(true)).catch(() => {});
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!me) return;
		for (const o of me.orders.filter((x) => x.status === "awaiting_payment")) {
			const hash = localStorage.getItem(pendingKey(o.id));
			if (!hash) continue;
			api.submit(o.id, hash).then((r) => {
				if (r.status === "confirmed") {
					localStorage.removeItem(pendingKey(o.id));
					refreshMe();
				} else if (r.status === "rejected") {
					localStorage.removeItem(pendingKey(o.id));
					setNotice(r.motivo || "Um pagamento enviado foi rejeitado.");
				}
			}).catch(() => {});
		}
	}, [me?.orders.length]);
	async function linkWallet() {
		if (!w.account || !w.provider) return;
		setLinking(true);
		setNotice("");
		try {
			const { message } = await api.nonce(w.account);
			await api.link(message, await signMessage(w.provider, message));
			await refreshMe();
		} catch (e) {
			setNotice(e instanceof ApiError ? e.message : walletError(e));
		} finally {
			setLinking(false);
		}
	}
	async function fixNetwork() {
		if (!cfg) return;
		try {
			await switchChain(cfg.chainId);
		} catch (e) {
			setNotice(walletError(e) + " Troque a rede manualmente na carteira (chainId " + cfg.chainId + ").");
		}
	}
	if (loadErr) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Token indisponível" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: loadErr })
		]
	});
	if (!cfg || !features) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" })]
	});
	const symbol = w.onChain?.symbol ?? cfg.token?.symbol ?? "OCTO";
	const decimals = w.onChain?.decimals ?? cfg.token?.decimals ?? null;
	const walletLinked = !!me?.wallet && !!w.account && me.wallet.address.toLowerCase() === w.account.toLowerCase();
	const walletMismatch = !!me?.wallet && !!w.account && !walletLinked;
	function blocker(f) {
		if (!cfg.ready) return "Pagamentos desabilitados até o contrato ser verificado.";
		if (!user) return "Entre na sua conta para comprar.";
		if (!w.account) return "Conecte sua carteira.";
		if (wrongNetwork) return "Troque para a rede correta.";
		if (!me?.wallet) return "Vincule sua carteira à conta.";
		if (walletMismatch) return "A carteira conectada não é a vinculada.";
		if (!w.onChain) return "Carregando saldo…";
		try {
			if (w.onChain.balance < parseUnits(f.priceTokens, w.onChain.decimals)) return "Saldo insuficiente.";
		} catch {
			return "Preço incompatível com as casas decimais do token.";
		}
		return null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			!cfg.ready && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Token ainda não habilitado" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: ["O servidor não conseguiu verificar o contrato na rede configurada, então compras e recompensas estão desligadas por segurança. ", cfg.issues.join(" ")] })
				]
			}),
			wrongNetwork && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Rede incorreta" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
						className: "flex flex-wrap items-center gap-3",
						children: [
							"Sua carteira está na rede ",
							w.chainId,
							"; o token usa a rede ",
							cfg.chainId,
							".",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: fixNetwork,
								children: "Trocar de rede"
							})
						]
					})
				]
			}),
			(notice || w.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: notice || w.error }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }), " Carteira"]
					}), !w.account ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Conecte uma carteira compatível (MetaMask, etc.) para ver seu saldo e pagar com o token."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: w.connect,
							disabled: !getEthereum(),
							children: getEthereum() ? "Conectar carteira" : "Carteira não encontrada"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "break-all font-mono text-xs",
								children: w.account
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									walletLinked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-1 h-3 w-3" }), " Vinculada à sua conta"] }),
									walletMismatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "destructive",
										children: [
											"Diferente da vinculada (",
											short(me.wallet.address),
											")"
										]
									}),
									!authLoading && !user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => setAuthOpen(true),
										children: "Entrar para vincular"
									}),
									user && me && !me.wallet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: linkWallet,
										disabled: linking || wrongNetwork,
										children: linking ? "Assine na carteira…" : "Vincular à minha conta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: w.disconnect,
										children: "Desconectar"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "A vinculação é uma assinatura de mensagem (sem gás, sem custo)."
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" }),
							" ",
							w.onChain ? `${w.onChain.name} (${symbol})` : "Saldo"
						]
					}), w.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-12 w-full" }) : w.onChain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-3xl font-semibold tabular-nums",
								children: [
									fmtUnits(w.onChain.balance, w.onChain.decimals),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-base font-normal text-muted-foreground",
										children: symbol
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: ["Oferta total: ", fmtUnits(w.onChain.totalSupply, w.onChain.decimals)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "O saldo sozinho não libera nada: só pagamentos verificados desbloqueiam recursos."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: cfg.token ? `${cfg.token.name} (${cfg.token.symbol})` : "Conecte a carteira para ver seu saldo."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "catalogo",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "catalogo",
							children: "Funcionalidades"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "historico",
							children: "Histórico"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "transparencia",
							children: "Transparência"
						}),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "admin",
							children: "Admin"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "catalogo",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 md:grid-cols-2",
							children: [features.map((f) => {
								const ent = me?.entitlements.find((e) => e.featureId === f.id && e.active);
								const why = blocker(f);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "flex flex-col rounded-xl border p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-medium",
												children: f.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: f.scope === "live" ? "destructive" : "secondary",
												children: f.scope === "live" ? "Operação real" : "Simulação"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted-foreground",
											children: f.description
										}),
										f.requirements.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: ["Requisitos: ", f.requirements.join(" · ")]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-auto flex flex-wrap items-center justify-between gap-2 pt-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-lg font-semibold tabular-nums",
												children: [
													f.priceTokens,
													" ",
													symbol
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: f.durationDays ? `${f.durationDays} dias de acesso` : "Acesso permanente"
											})] }), ent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "mr-1 h-3 w-3" }),
												" ",
												ent.expiresAt ? `Liberado até ${day(ent.expiresAt)}` : "Liberado"
											] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 h-3 w-3" }), " Bloqueado"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												disabled: !!why,
												onClick: () => setBuying(f),
												children: ent ? "Renovar" : "Desbloquear"
											}), why && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: why
											})]
										}),
										f.scope === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: "O pagamento libera o acesso, mas não autoriza operações reais: elas continuam exigindo a carteira dedicada e a sua confirmação no Bot 24/7."
										})
									]
								}, f.id);
							}), features.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Nenhuma funcionalidade disponível no momento."
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "historico",
						className: "mt-4",
						children: !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Entre na sua conta para ver compras, recompensas e transações." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => setAuthOpen(true),
								children: "Entrar"
							})]
						}) : me ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenHistory, {
							me,
							cfg,
							decimals,
							symbol
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "transparencia",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenTransparency, {})
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "admin",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenAdmin, {})
					})
				]
			}),
			w.provider && w.onChain && cfg.ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseDialog, {
				feature: buying,
				cfg,
				provider: w.provider,
				onChain: w.onChain,
				onClose: () => {
					setBuying(null);
					refreshMe();
				},
				onDone: () => {
					refreshMe();
					w.refresh();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
				open: authOpen,
				onOpenChange: setAuthOpen
			})
		]
	});
}
function TokenPage() {
	const [threads, setThreads] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setThreads(loadThreads()), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			threads,
			onThreadsChange: setThreads
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-5xl px-4 pb-12 pt-16 md:px-6 md:pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: octocookie_mascot_default,
							alt: "",
							width: 28,
							height: 28,
							className: "h-7 w-7"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold",
							children: "OctoCookie Token"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Moeda de utilidade do laboratório: desbloqueie recursos, participe de desafios e acompanhe recompensas."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenPanel, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-xs text-muted-foreground",
						children: "Conteúdo educacional e de utilidade da plataforma. Não é recomendação de investimento."
					})
				]
			})
		})]
	});
}
//#endregion
export { TokenPage as component };
