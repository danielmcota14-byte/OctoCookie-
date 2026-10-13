import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as withGroqModelFallback, n as getGroqKeys, r as resetGroqKeyPool, t as createLovableAiGatewayProvider } from "./ai-gateway.server-DMankpH_.mjs";
import { a as streamText, i as generateText, o as require_jsx_runtime, r as convertToModelMessages, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { S as useRouter, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, q as redirect, v as createRootRouteWithContext, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { c as getApps, l as initializeApp, n as isSupported, s as getApp, t as getAnalytics } from "../_libs/@firebase/analytics+[...].mjs";
import { a as signInWithEmailAndPassword, c as updateProfile, i as onAuthStateChanged, n as createUserWithEmailAndPassword, o as signInWithPopup, r as getAuth, s as signOut, t as GoogleAuthProvider } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { a as getDocs, c as limit, d as setDoc, f as startAfter, i as getDoc, l as orderBy, m as where, n as deleteDoc, o as getFirestore, p as updateDoc, r as doc, s as increment, t as collection, u as query } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getStorage } from "../_libs/firebase__storage.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/edu-modules-AZ9orX_z.js
var EDU_MODULES = {
	finance: {
		id: "finance",
		name: "OctoCookie Finance",
		topbar: "Educação Financeira",
		logo: "OC",
		accent: "#2563eb",
		welcomeTitle: "Bem-vindo ao OctoCookie Finance",
		welcome: "Aprenda sobre orçamento, juros compostos, investimentos e gestão de riscos — sem promessas de enriquecimento rápido.",
		placeholder: "Pergunte sobre finanças...",
		hint: "Conteúdo educacional • Não é conselho financeiro personalizado",
		suggestions: [
			{
				label: "Orçamento mensal",
				question: "Como criar um orçamento mensal simples?"
			},
			{
				label: "Juros compostos",
				question: "Explique juros compostos com exemplo prático"
			},
			{
				label: "Renda fixa",
				question: "Diferença entre poupança, CDB e Tesouro Direto"
			},
			{
				label: "Investir com pouco",
				question: "Como começar a investir com pouco dinheiro?"
			},
			{
				label: "Gestão de riscos",
				question: "Principais riscos financeiros que as pessoas ignoram"
			},
			{
				label: "Sair das dívidas",
				question: "Como organizar e sair das dívidas?"
			}
		]
	},
	start: {
		id: "start",
		name: "OctoCookie Start",
		topbar: "Empreendedorismo Digital",
		logo: "ST",
		accent: "#7c3aed",
		welcomeTitle: "Bem-vindo ao OctoCookie Start",
		welcome: "Explore criação digital, produtos, modelos de negócio e validação de ideias — sem promessas de sucesso garantido.",
		placeholder: "Pergunte sobre empreendedorismo...",
		hint: "Conteúdo educacional • Foque em aprendizado e experimentação",
		suggestions: [
			{
				label: "Primeiros passos",
				question: "Quais são os primeiros passos para criar um produto digital?"
			},
			{
				label: "Modelos de negócio",
				question: "Explique modelos de negócio digitais simples"
			},
			{
				label: "Validar ideia",
				question: "Como validar uma ideia com pouco dinheiro?"
			},
			{
				label: "Ferramentas no-code",
				question: "Ferramentas gratuitas para criar site ou app"
			},
			{
				label: "Conseguir clientes",
				question: "Como conseguir os primeiros clientes?"
			},
			{
				label: "Erros comuns",
				question: "Erros comuns de quem começa a empreender digitalmente"
			}
		]
	}
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-VJ1IerJ4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CyaDgMOk.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
var app = getApps().length ? getApp() : initializeApp({
	apiKey: "AIzaSyDUhsSTKb6MCmSL3xIFD4CTAaMvaWneCfo",
	authDomain: "octo-10d4f.firebaseapp.com",
	projectId: "octo-10d4f",
	storageBucket: "octo-10d4f.firebasestorage.app",
	messagingSenderId: "494062478640",
	appId: "1:494062478640:web:8588ee8de55ee9917294f5",
	measurementId: "G-D2YLS083GJ"
});
var auth = getAuth(app);
var db = getFirestore(app);
getStorage(app);
if (typeof window !== "undefined") isSupported().then((yes) => {
	if (yes) getAnalytics(app);
});
function now() {
	return Date.now();
}
/** Firestore rejects `undefined` field values. Strip them before setDoc/updateDoc. */
function stripUndefined(obj) {
	const out = {};
	for (const [k, v] of Object.entries(obj)) if (v !== void 0) out[k] = v;
	return out;
}
async function getOrCreateUserProfile(uid, data) {
	const ref = doc(db, "users", uid);
	const snap = await getDoc(ref);
	if (snap.exists()) return snap.data();
	const username = (data.displayName || data.email?.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) + "_" + uid.slice(0, 4);
	const profile = stripUndefined({
		uid,
		displayName: data.displayName || "Octonauta",
		username,
		photoURL: data.photoURL || void 0,
		bio: "",
		karma: 0,
		createdAt: now(),
		badges: ["early"]
	});
	await setDoc(ref, profile);
	return profile;
}
async function createCommunity(data) {
	const community = stripUndefined({
		...data,
		memberCount: 1,
		createdAt: now()
	});
	await setDoc(doc(db, "communities", data.id), community);
	await setDoc(doc(db, "memberships", `${data.createdBy}_${data.id}`), {
		id: `${data.createdBy}_${data.id}`,
		userId: data.createdBy,
		communityId: data.id,
		joinedAt: now(),
		role: "admin"
	});
	return community;
}
async function getCommunity(id) {
	const snap = await getDoc(doc(db, "communities", id));
	return snap.exists() ? snap.data() : null;
}
async function listCommunities(max = 30) {
	const q = query(collection(db, "communities"), orderBy("memberCount", "desc"), limit(max));
	return (await getDocs(q)).docs.map((d) => d.data());
}
async function joinCommunity(userId, communityId) {
	const mid = `${userId}_${communityId}`;
	const ref = doc(db, "memberships", mid);
	if ((await getDoc(ref)).exists()) return;
	await setDoc(ref, {
		id: mid,
		userId,
		communityId,
		joinedAt: now(),
		role: "member"
	});
	await updateDoc(doc(db, "communities", communityId), { memberCount: increment(1) });
}
async function leaveCommunity(userId, communityId) {
	const mid = `${userId}_${communityId}`;
	await deleteDoc(doc(db, "memberships", mid));
	await updateDoc(doc(db, "communities", communityId), { memberCount: increment(-1) });
}
async function isMember(userId, communityId) {
	return (await getDoc(doc(db, "memberships", `${userId}_${communityId}`))).exists();
}
async function createPost(input) {
	const ref = doc(collection(db, "posts"));
	const post = stripUndefined({
		id: ref.id,
		communityId: input.communityId,
		authorId: input.authorId,
		authorName: input.authorName,
		authorUsername: input.authorUsername,
		authorPhoto: input.authorPhoto,
		title: input.title,
		body: input.body,
		type: input.type,
		linkUrl: input.linkUrl,
		imageUrl: input.imageUrl,
		appData: input.appData,
		score: 0,
		upvoteCount: 0,
		downvoteCount: 0,
		commentCount: 0,
		createdAt: now(),
		flair: input.flair
	});
	await setDoc(ref, post);
	return post;
}
async function getPost(id) {
	const snap = await getDoc(doc(db, "posts", id));
	return snap.exists() ? snap.data() : null;
}
async function listPosts(opts) {
	const max = opts.max ?? 25;
	let q;
	if (opts.communityId) {
		if (opts.sort === "new") q = query(collection(db, "posts"), where("communityId", "==", opts.communityId), orderBy("createdAt", "desc"), limit(max));
		else q = query(collection(db, "posts"), where("communityId", "==", opts.communityId), orderBy("score", "desc"), limit(max));
	} else if (opts.sort === "new") q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(max));
	else q = query(collection(db, "posts"), orderBy("score", "desc"), limit(max));
	if (opts.after) q = query(q, startAfter(opts.after));
	const snap = await getDocs(q);
	return {
		posts: snap.docs.map((d) => d.data()),
		lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null
	};
}
async function vote(userId, targetId, targetType, value) {
	const voteId = `${userId}_${targetId}`;
	const voteRef = doc(db, "votes", voteId);
	const existing = await getDoc(voteRef);
	const targetRef = doc(db, targetType === "post" ? "posts" : "comments", targetId);
	if (existing.exists()) {
		if (existing.data().value === value) {
			await deleteDoc(voteRef);
			await updateDoc(targetRef, {
				score: increment(-value),
				...value === 1 ? { upvoteCount: increment(-1) } : { downvoteCount: increment(-1) }
			});
			return;
		}
		await updateDoc(voteRef, {
			value,
			createdAt: now()
		});
		await updateDoc(targetRef, {
			score: increment(value * 2),
			...value === 1 ? {
				upvoteCount: increment(1),
				downvoteCount: increment(-1)
			} : {
				upvoteCount: increment(-1),
				downvoteCount: increment(1)
			}
		});
		return;
	}
	await setDoc(voteRef, {
		id: voteId,
		userId,
		targetId,
		targetType,
		value,
		createdAt: now()
	});
	await updateDoc(targetRef, {
		score: increment(value),
		...value === 1 ? { upvoteCount: increment(1) } : { downvoteCount: increment(1) }
	});
}
async function createComment(input) {
	const ref = doc(collection(db, "comments"));
	const comment = stripUndefined({
		id: ref.id,
		postId: input.postId,
		authorId: input.authorId,
		authorName: input.authorName,
		authorUsername: input.authorUsername,
		authorPhoto: input.authorPhoto,
		body: input.body,
		parentId: input.parentId ?? null,
		score: 0,
		upvoteCount: 0,
		downvoteCount: 0,
		createdAt: now(),
		depth: input.depth ?? 0
	});
	await setDoc(ref, comment);
	await updateDoc(doc(db, "posts", input.postId), { commentCount: increment(1) });
	return comment;
}
async function listComments(postId) {
	const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
	return (await getDocs(q)).docs.map((d) => d.data());
}
var COMMUNITY_GROUPS = [
	"Início",
	"Pesquisa",
	"Ferramentas",
	"Aprender",
	"Cripto"
];
var DEFAULT_COMMUNITIES = [
	{
		id: "octocookie",
		name: "OctoCookie",
		group: "Início",
		description: "Comunidade oficial do OctoCookie. Anúncios, feedback e compartilhamento de dados do app.",
		topics: [
			"octocookie",
			"app",
			"web3"
		],
		rules: [
			"Seja respeitoso",
			"Sem spam",
			"Compartilhe dados do app com o botão Share"
		]
	},
	{
		id: "ajuda",
		name: "Ajuda e Suporte",
		group: "Início",
		description: "Dúvidas de uso, bugs, sugestões e pedidos de funcionalidades de qualquer parte do OctoCookie.",
		topics: [
			"suporte",
			"bug",
			"sugestão"
		]
	},
	{
		id: "holograma",
		name: "Holograma (Pesquisa)",
		group: "Pesquisa",
		description: "Discussão da pesquisa Holograma: metodologia, backtests, limites de perda, resultados e críticas construtivas.",
		topics: [
			"pesquisa",
			"backtest",
			"risco",
			"metodologia"
		],
		rules: ["Cite a tabela ou seção ao comentar", "Críticas são bem-vindas, desde que fundamentadas"]
	},
	{
		id: "carteira",
		name: "Carteira (Cryptex)",
		group: "Ferramentas",
		description: "Carteira Cryptex: portfólios, MetaMask, rebalanceamento, taxas e uso no dia a dia.",
		topics: [
			"cryptex",
			"carteira",
			"metamask",
			"portfolio"
		]
	},
	{
		id: "bot-trading",
		name: "Bot de Trading",
		group: "Ferramentas",
		description: "Configuração, estratégias, perfis de risco e resultados do bot OctoCookie (incluindo o modo 24/7).",
		topics: [
			"bot",
			"24x7",
			"estratégia",
			"stop"
		]
	},
	{
		id: "analisador",
		name: "Analisador",
		group: "Ferramentas",
		description: "Análises geradas pelo Analisador: leitura de mercado, indicadores e interpretação dos resultados.",
		topics: [
			"analisador",
			"indicadores",
			"análise"
		]
	},
	{
		id: "simulador",
		name: "Simulador",
		group: "Ferramentas",
		description: "Simulações de trading sem risco real: cenários, candles sintéticos e testes de estratégia.",
		topics: [
			"simulador",
			"paper",
			"cenários"
		]
	},
	{
		id: "cookiescript",
		name: "CookieScript e IDE",
		group: "Ferramentas",
		description: "A linguagem CookieScript, a IDE simulada, exemplos de código, wiki e dúvidas de programação.",
		topics: [
			"cookiescript",
			"ide",
			"código",
			"linguagem"
		]
	},
	{
		id: "educacao-financeira",
		name: "Educação Financeira",
		group: "Aprender",
		description: "Orçamento, juros compostos, renda fixa, dívidas e gestão de riscos (conteúdo educacional).",
		topics: [
			"finance",
			"orçamento",
			"juros",
			"renda-fixa"
		]
	},
	{
		id: "iniciantes",
		name: "Primeiros Passos",
		group: "Aprender",
		description: "Para quem está começando em cripto e investimentos: perguntas simples são bem-vindas.",
		topics: [
			"start",
			"iniciante",
			"básico"
		]
	},
	{
		id: "bitcoin",
		name: "Bitcoin",
		group: "Cripto",
		description: "Tudo sobre Bitcoin, BTC, Lightning e o padrão ouro digital.",
		topics: [
			"btc",
			"bitcoin",
			"macro"
		]
	},
	{
		id: "ethereum",
		name: "Ethereum",
		group: "Cripto",
		description: "ETH, L2s, smart contracts, DeFi e NFTs no ecossistema Ethereum.",
		topics: [
			"eth",
			"defi",
			"l2"
		]
	},
	{
		id: "defi",
		name: "DeFi",
		group: "Cripto",
		description: "Finanças descentralizadas: yield, lending, DEXs, airdrops e estratégias.",
		topics: [
			"defi",
			"yield",
			"dex"
		]
	},
	{
		id: "solana",
		name: "Solana",
		group: "Cripto",
		description: "Solana, memecoins, velocidade e o ecossistema SOL.",
		topics: ["sol", "memecoins"]
	},
	{
		id: "web3",
		name: "Web3",
		group: "Cripto",
		description: "Discussões gerais sobre Web3, wallets, identidade e o futuro da internet.",
		topics: [
			"web3",
			"wallets",
			"identity"
		]
	},
	{
		id: "trading",
		name: "Trading",
		group: "Cripto",
		description: "Análises técnicas, setup, risco e discussões de mercado (não é conselho financeiro).",
		topics: [
			"trading",
			"ta",
			"mercado"
		]
	},
	{
		id: "news",
		name: "Crypto News",
		group: "Cripto",
		description: "Notícias, regulamentação e acontecimentos do mundo cripto.",
		topics: ["news", "regulação"]
	}
];
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		return onAuthStateChanged(auth, async (u) => {
			setUser(u);
			if (u) try {
				const p = await getOrCreateUserProfile(u.uid, {
					displayName: u.displayName,
					email: u.email,
					photoURL: u.photoURL
				});
				setProfile(p);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				console.error("Erro ao carregar perfil:", msg);
				setProfile({
					uid: u.uid,
					displayName: u.displayName || "Octonauta",
					username: (u.email?.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20),
					...u.photoURL ? { photoURL: u.photoURL } : {},
					bio: "",
					karma: 0,
					createdAt: Date.now(),
					badges: []
				});
			}
			else setProfile(null);
			setLoading(false);
		});
	}, []);
	async function signInEmail(email, password) {
		await signInWithEmailAndPassword(auth, email, password);
	}
	async function signUpEmail(email, password, displayName) {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(cred.user, { displayName });
		await getOrCreateUserProfile(cred.user.uid, {
			displayName,
			email
		});
	}
	async function signInGoogle() {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	}
	async function signOut$1() {
		await signOut(auth);
	}
	async function refreshProfile() {
		if (!user) return;
		const p = await getOrCreateUserProfile(user.uid, {
			displayName: user.displayName,
			email: user.email,
			photoURL: user.photoURL
		});
		setProfile(p);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			profile,
			loading,
			signInEmail,
			signUpEmail,
			signInGoogle,
			signOut: signOut$1,
			refreshProfile
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
	return ctx;
}
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
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Página não encontrada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "A página que você procura não existe ou mudou de lugar."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Voltar ao início"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Voltar ao início"
					})]
				})
			]
		})
	});
}
var Route$21 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "OctoCookie — Um universo de possibilidades" },
			{
				name: "description",
				content: "Pesquisa Holograma, carteira, bot, analisador, CookieScript e comunidade: um só ecossistema."
			},
			{
				name: "author",
				content: "OctoCookie"
			},
			{
				property: "og:title",
				content: "OctoCookie — Um universo de possibilidades"
			},
			{
				property: "og:description",
				content: "Holograma: limitar perdas não exige prever o mercado."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$21.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex w-full flex-col",
			style: { height: "100dvh" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-0 flex-1 overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})
		}) })
	});
}
var $$splitComponentImporter$17 = () => import("./routes-CqSKgvkQ.mjs");
var Route$20 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "OctoCookie — Um universo de possibilidades" }, {
		name: "description",
		content: "Web3, educação financeira, empreendedorismo digital e desenvolvimento com IA no mesmo sistema."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("../_threadId-CMNnUUAm.mjs");
var Route$19 = createFileRoute("/$threadId")({
	head: () => ({ meta: [{ title: "Chat — OctoCookie" }, {
		name: "description",
		content: "Converse com o OctoCookie sobre finanças, cripto e bots."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./adm-WGtaZq06.mjs");
var Route$18 = createFileRoute("/adm")({
	head: () => ({ meta: [{ title: "Adm — OctoCookie" }, {
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	beforeLoad: () => {
		if (typeof window === "undefined") throw redirect({ href: "/adm.html" });
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./analyzer-C_nzW5tz.mjs");
var Route$17 = createFileRoute("/analyzer")({
	head: () => ({ meta: [{ title: "Analisador de tokens — OctoCookie" }, {
		name: "description",
		content: "Analise educacional de tokens cripto com dados de mercado e contexto didático."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./bot-24x7-BwDyWl_I.mjs");
var Route$16 = createFileRoute("/bot-24x7")({
	head: () => ({ meta: [{ title: "Bot 24/7 — OctoCookie" }, {
		name: "description",
		content: "Status do bot 24/7 que roda o octocookie.html no seu servidor."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./carteira-CEtq_9TI.mjs");
var Route$15 = createFileRoute("/carteira")({
	head: () => ({ meta: [
		{ title: "Cryptex — Carteira educacional OctoCookie" },
		{
			name: "description",
			content: "Cryptex é a carteira cripto educacional do OctoCookie: aprenda sobre wallets, redes EVM, tokens, gas e portfolio de forma didática."
		},
		{
			property: "og:title",
			content: "Cryptex — Carteira educacional OctoCookie"
		},
		{
			property: "og:description",
			content: "Carteira cripto educacional integrada ao OctoCookie."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./cookiescript-B7JhT5R7.mjs");
var Route$14 = createFileRoute("/cookiescript")({
	head: () => ({ meta: [{ title: "CookieScript — IDE e Cookie AI" }, {
		name: "description",
		content: "IDE da linguagem CookieScript com Cookie AI e documentação."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var cfg$1 = EDU_MODULES.finance;
var $$splitComponentImporter$10 = () => import("./finance-DCeVohn6.mjs");
var Route$13 = createFileRoute("/finance")({
	head: () => ({ meta: [{ title: `${cfg$1.name} — ${cfg$1.topbar}` }, {
		name: "description",
		content: cfg$1.welcome
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./ide-Gh9IbSrl.mjs");
var Route$12 = createFileRoute("/ide")({
	head: () => ({ meta: [{ title: "CookieScript IDE — OctoCookie" }, {
		name: "description",
		content: "Escreva e execute CookieScript em sandbox educacional com explicações passo a passo."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./launch-BlAnYGLy.mjs");
var Route$11 = createFileRoute("/launch")({
	head: () => ({ meta: [{ title: "Explorar — OctoCookie" }, {
		name: "description",
		content: "Explore trilhas educacionais de finanças, cripto e bots."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./octo-app-DZ-xSb5I.mjs");
var Route$10 = createFileRoute("/octo-app")({
	head: () => ({ meta: [
		{ title: "Bot Trading — Swap Trader educacional" },
		{
			name: "description",
			content: "Bot Trading: swap DEX com Holograma Quântico (tendência + stop móvel), trader clássico opcional e dashboard analisador — conteúdo educacional."
		},
		{
			property: "og:title",
			content: "Bot Trading — Swap Trader educacional"
		},
		{
			property: "og:description",
			content: "Swap Trader com Holograma Quântico e simulação — educacional, sem recomendação de investimento."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./pesquisa-DOjeHvGR.mjs");
var Route$9 = createFileRoute("/pesquisa")({
	head: () => ({ meta: [{ title: "Holograma — Pesquisa | OctoCookie" }, {
		name: "description",
		content: "Holograma Quântico ETH/USDC: limitador de perdas por tendência e stop móvel. Pesquisa completa com metodologia, resultados, erros e referências."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./settings-BqsmucUq.mjs");
var Route$8 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Configurações — OctoCookie" }, {
		name: "description",
		content: "Configurações do OctoCookie."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./simulator-viaPhA1R.mjs");
var Route$7 = createFileRoute("/simulator")({
	head: () => ({ meta: [{ title: "Simulador de bot — OctoCookie" }, {
		name: "description",
		content: "Cole seu código de estratégia e simule em dados sintéticos com feedback educacional."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var cfg = EDU_MODULES.start;
var $$splitComponentImporter$3 = () => import("./start-CABCD9EW.mjs");
var Route$6 = createFileRoute("/start")({
	head: () => ({ meta: [{ title: `${cfg.name} — ${cfg.topbar}` }, {
		name: "description",
		content: cfg.welcome
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
/**
* Bot 24/7 paper trading — roda no mesmo processo do site (Render).
* Singleton: inicia o loop na primeira importação no servidor.
*/
var SYMBOL = process.env.BOT_SYMBOL || "ETHUSDT";
var TICK_MS = Number(process.env.BOT_TICK_MS || 1e4);
var START_BALANCE = Number(process.env.BOT_START_BALANCE || 1e3);
var g = globalThis;
function state() {
	if (!g.__octoBot) g.__octoBot = {
		running: true,
		symbol: SYMBOL,
		price: 0,
		position: 0,
		entryPrice: 0,
		balance: START_BALANCE,
		equity: START_BALANCE,
		peakEquity: START_BALANCE,
		trades: [],
		wins: 0,
		losses: 0,
		signal: 0,
		lastAction: "init",
		lastError: null,
		startedAt: Date.now(),
		lastTickAt: null,
		logs: [],
		status: "online"
	};
	return g.__octoBot;
}
function log(msg, level = "info") {
	const s = state();
	s.logs.unshift({
		ts: Date.now(),
		level,
		msg
	});
	if (s.logs.length > 200) s.logs.pop();
	console.log(`[bot24] ${msg}`);
}
function sma(arr, n) {
	if (arr.length < n) return null;
	return arr.slice(-n).reduce((a, b) => a + b, 0) / n;
}
function rsi(arr, n = 14) {
	if (arr.length < n + 1) return 50;
	let gains = 0, losses = 0;
	for (let i = arr.length - n; i < arr.length; i++) {
		const d = arr[i] - arr[i - 1];
		if (d >= 0) gains += d;
		else losses -= d;
	}
	if (losses === 0) return 100;
	return 100 - 100 / (1 + gains / losses);
}
function trendSignal(closes, price) {
	const s20 = sma(closes, 20);
	const s50 = sma(closes, Math.min(50, closes.length));
	const r = rsi(closes, 14);
	let score = 0;
	if (s20 && price > s20) score += .35;
	if (s50 && price > s50) score += .25;
	if (r < 30) score += .25;
	else if (r > 70) score -= .25;
	else if (r < 50) score += .1;
	if (closes.length >= 5) {
		const mom = (price - closes[closes.length - 5]) / closes[closes.length - 5];
		score += Math.max(-.2, Math.min(.2, mom * 5));
	}
	return {
		score,
		rsi: r
	};
}
var closesCache = [];
async function fetchPrice() {
	const s = state();
	const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s.symbol}`);
	if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
	const data = await res.json();
	const p = Number(data.price);
	if (!(p > 0)) throw new Error("Preço inválido");
	return p;
}
async function fetchKlines() {
	const s = state();
	const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${s.symbol}&interval=1h&limit=60`);
	if (!res.ok) throw new Error(`Klines HTTP ${res.status}`);
	return (await res.json()).map((k) => Number(k[4]));
}
function openLong(price) {
	const s = state();
	if (s.position === 1) return;
	s.position = 1;
	s.entryPrice = price;
	s.lastAction = "BUY";
	log(`BUY paper @ ${price.toFixed(4)} | equity $${s.equity.toFixed(2)}`);
}
function closeLong(price, reason) {
	const s = state();
	if (s.position === 0) return;
	const pnlPct = (price - s.entryPrice) / s.entryPrice * 100;
	const pnlUsd = s.balance * (pnlPct / 100);
	s.balance += pnlUsd;
	s.equity = s.balance;
	if (s.equity > s.peakEquity) s.peakEquity = s.equity;
	s.trades.unshift({
		ts: Date.now(),
		side: "SELL",
		entry: s.entryPrice,
		exit: price,
		pnlPct: Number(pnlPct.toFixed(3)),
		pnlUsd: Number(pnlUsd.toFixed(4)),
		reason
	});
	if (s.trades.length > 100) s.trades.pop();
	if (pnlPct >= 0) s.wins++;
	else s.losses++;
	s.position = 0;
	s.entryPrice = 0;
	s.lastAction = `SELL (${reason})`;
	log(`SELL @ ${price.toFixed(4)} | ${pnlPct.toFixed(2)}% · ${reason}`);
}
async function tick() {
	const s = state();
	if (!s.running) return;
	try {
		const price = await fetchPrice();
		s.price = price;
		if (closesCache.length < 20 || Math.random() < .2) closesCache = await fetchKlines();
		const closes = closesCache.concat([price]);
		const { score } = trendSignal(closes, price);
		s.signal = Number(score.toFixed(4));
		const r = rsi(closes, 14);
		if (s.position === 1) {
			const drop = (price - s.entryPrice) / s.entryPrice * 100;
			if (drop <= -3) closeLong(price, "stop-loss -3%");
			else if (drop >= 8) closeLong(price, "take-profit +8%");
			else if (score < -.15) closeLong(price, "sinal baixista");
		} else if (score >= .35 && r < 65) openLong(price);
		if (s.position === 1) {
			const unreal = (price - s.entryPrice) / s.entryPrice * s.balance;
			s.equity = s.balance + unreal;
		} else s.equity = s.balance;
		s.lastTickAt = Date.now();
		s.lastError = null;
		s.status = "online";
	} catch (e) {
		s.lastError = e instanceof Error ? e.message : String(e);
		log(`Tick error: ${s.lastError}`, "error");
	}
}
function ensureLoop() {
	if (g.__octoBotTimer) return;
	log(`Loop 24/7 iniciado · ${SYMBOL} · ${TICK_MS}ms`);
	tick();
	g.__octoBotTimer = setInterval(tick, TICK_MS);
}
function getBotStatus() {
	ensureLoop();
	const s = state();
	return {
		service: "octocookie-bot-24x7",
		status: s.running ? "online" : "paused",
		running: s.running,
		symbol: s.symbol,
		price: s.price,
		position: s.position === 1 ? "LONG" : "CASH",
		equity: Number(s.equity.toFixed(4)),
		signal: s.signal,
		lastAction: s.lastAction,
		lastTickAt: s.lastTickAt,
		uptimeSec: Math.floor((Date.now() - s.startedAt) / 1e3),
		wins: s.wins,
		losses: s.losses,
		lastError: s.lastError,
		logs: s.logs.slice(0, 50),
		trades: s.trades.slice(0, 30)
	};
}
function botStart() {
	ensureLoop();
	const s = state();
	s.running = true;
	s.status = "online";
	log("START");
	return getBotStatus();
}
function botStop() {
	ensureLoop();
	const s = state();
	s.running = false;
	s.status = "paused";
	log("STOP", "warn");
	return getBotStatus();
}
function botReset() {
	ensureLoop();
	const s = state();
	s.balance = START_BALANCE;
	s.equity = START_BALANCE;
	s.peakEquity = START_BALANCE;
	s.position = 0;
	s.entryPrice = 0;
	s.trades = [];
	s.wins = 0;
	s.losses = 0;
	log("RESET paper");
	return getBotStatus();
}
if (typeof process !== "undefined" && process.versions?.node) ensureLoop();
var Route$5 = createFileRoute("/api/bot")({ server: { handlers: {
	GET: async () => {
		return Response.json(getBotStatus());
	},
	POST: async ({ request }) => {
		let action = "status";
		try {
			const body = await request.json();
			if (body?.action) action = body.action;
		} catch {}
		const q = new URL(request.url).searchParams.get("action");
		if (q) action = q;
		if (action === "start") return Response.json(botStart());
		if (action === "stop") return Response.json(botStop());
		if (action === "reset") return Response.json(botReset());
		return Response.json(getBotStatus());
	}
} } });
var SYSTEM_PROMPT = `Você é o OctoCookie 🍪🐙, assistente educativo do produto OctoCookie.

## Seu papel
1. Ensinar a usar o **Swap Trader Bot** e o **Holograma Quântico** do zero, passo a passo.
2. Educação financeira e cripto (conceitos, risco, wallets, DeFi, análise técnica) — só em nível educativo.
3. Ajuda com programação aplicada a finanças/trading quando o usuário pedir.

## Regras fixas
- NÃO dê recomendações de investimento nem sinais de compra/venda de ativos específicos.
- Sempre deixe claro: conteúdo educacional; performance passada não garante resultado futuro; operar cripto pode causar perda total.
- Português do Brasil (a menos que o usuário escreva em outro idioma).
- Seja didático, curto quando der, use listas numeradas. Emojis com moderação.
- Prefira a **carteira virtual / simulação** antes de qualquer menção a dinheiro real.
- A OctoCookie **nunca pede chave privada nem seed phrase**. Conexão é via MetaMask (ou compatível); cada transação (incluindo taxa de serviço de 2% só sobre o lucro) exige aprovação explícita na wallet.

## O produto: Swap Trader Bot (página octocookie.html / bot no site)

### Perfis financeiros (fluxo atual do Bot Trading)
Ao abrir o Bot Trading o usuário passa por um **quiz de perfil** e escolhe um de **7 perfis**. Cada perfil aplica parâmetros reais do motor:

1. **Defensivo** — Só Holograma + tendência + barra 20% + filtro estrito 4/4 + stop móvel
2. **Cauteloso** — Só Holograma + tendência + barra 35% + filtro votação 3/4 + stop
3. **Equilibrado** — Só Holograma + tendência + barra 55% + filtro votação 2/4 + stop
4. **Crescimento** — Só Holograma + tendência + barra 75% + filtro off + stop
5. **Como foi testado** — Só Holograma + tendência + barra **100%** + filtro off + stop (ponto de referência dos testes)
6. **Explorador quântico** — Só Holograma + modo **quântica** (circuito simulado de 8 qubits entra de verdade no sinal a cada ciclo) + barra 50% + filtro 3/4 + stop
7. **Clássico assistido** — Trader original (RSI/SMA/MACD/Bollinger) + **limitador** do Holograma + tendência + barra 60% + stop

Depois do perfil, o usuário vê **termos específicos** de como aquele perfil investe (não só regras genéricas) e o painel abre **simplificado** (menos cards técnicos).

### O que é
Bot de swap DEX (Uniswap / PancakeSwap / QuickSwap) multi-rede (Ethereum, BNB Chain, Polygon, Arbitrum). Pares típicos: ETH↔USDC, WBTC↔USDC, etc. Preços e velas vêm da Binance (público). A regra de decisão pode ser o trader clássico ou o Holograma.

### Como começar do zero (ensine nesta ordem se o usuário for iniciante)
1. **Abrir o bot** no site (seção Swap Trader / octocookie-app).
2. **Ler e aceitar os Termos de Uso** (obrigatório).
3. **Escolher a rede e o par** (ex.: Ethereum + ETH → USDC).
4. **Modo do trader** (seletor no card do Holograma) — ver tabela abaixo. O **padrão atual** é **Só Holograma** em modo **tendência** (não quântica), salvo se o usuário escolher o perfil Explorador quântico.
5. **Ajustar potência do risco** (0–100%). Padrão **100%**. Opcional: marcar **Automática** e definir a queda máxima aceita (%).
6. **Decisão da regra** (só importa no modo Só Holograma): **tendência** (padrão), quântica ou escala. No histórico recente a tendência costuma ser mais estável que a quântica.
7. **Filtro de entrada** (só no Só Holograma): padrão **desligado**. Votação/estrito usam RSI, SMA20, MACD e Bollinger só para liberar a ENTRADA; a saída continua sendo da regra.
8. **Carteira:**
   - Sem MetaMask: o bot pode rodar em **simulação** com carteira virtual (USDC/ETH fictícios no navegador). Ideal para aprender.
   - Com MetaMask: Conectar → aprovar rede/par → cada swap e a taxa de serviço (2% do lucro) pedem assinatura.
9. **INICIAR**. PAUSAR / PARAR controlam o ciclo. BUY/SELL MANUAL existem, mas no modo Só Holograma o dashboard não manda ordem automática fora da regra.
10. Acompanhar o card: saldo, lucro, posição da regra, histórico (sistema × comprar e segurar), queda máxima, chance de perda em 30 dias, curva da barra.

### Três modos do trader
| Modo | Quem decide | Quando usar (educativo) |
|------|-------------|-------------------------|
| **Só Holograma** (padrão) | Regra de tendência/quântica + stop móvel | Quer a lógica do Holograma operando de ponta a ponta |
| Trader original | RSI + SMA20 + MACD + Bollinger do código clássico | Quer o comportamento antigo; Holograma só pré-visualiza |
| Original + limitador | Trader gera sinal; Holograma só **veta** BUY sem alta / SELL em alta | Quer proteção extra sem desligar o trader clássico |

O modo **não pode ser trocado com o bot rodando**.

### Potência do risco (barra 0–100%)
Uma única barra regula juntos: % de ETH no patrimônio, **stop móvel**, limiar de tendência e **janela** (velas de 8h). Em 100%: mais exposição e stop mais largo. Em 0%: cauteloso / quase parado. A **barra automática** escolhe, no histórico, a potência com melhor vantagem sobre “comprar e segurar” dentro da queda máxima que o usuário aceita.

### Decisão: tendência vs quântica vs escala
- **Tendência (padrão):** preço puro na janela (log-retorno vs limiar), com histerese e stop móvel.
- **Quântica:** circuito simulado de 8 qubits (sem hardware quântico). Se o card avisar que no histórico o circuito não superou a tendência, oriente a considerar o modo tendência.
- **Escala (experimental):** mistura tendência com exposição ligada ao “caos” do circuito.

### Filtro de entrada (lógica antiga)
Só no modo Só Holograma. Condições típicas: RSI na faixa, preço acima da SMA20, histograma MACD positivo, preço dentro das bandas de Bollinger. Em **votação** (ex. 3 de 4) ou **estrito** (os 4). Só atrasa a entrada; não impede a saída nem muda o tamanho da posição.

### Parâmetros do trader original (quando esse modo estiver ativo)
- Segurança / faixa de RSI, agressividade (score mínimo e volatilidade), stop/take diários, máx. swaps/dia, horário de operação.
- Fora do horário configurado o trader original não opera. Há contradição histórica no código: o sinal de BUY pedia RSI abaixo do limite baixo enquanto a checagem de segurança pedia RSI acima — por isso o caminho automático clássico pode gerar poucos trades; explique isso se perguntarem.

### Card de histórico (como interpretar)
- Compare **Sistema c/ barra + stop** com **Comprar e segurar**, queda máxima e “chance de perda em 30 dias”.
- Números são **passados**, não previsão.
- Em muitos trechos o sistema com barra + stop reduz drawdown frente ao buy & hold; em altas contínuas o stop pode sair cedo e o buy & hold ganhar em retorno absoluto. Explique esse trade-off sem prometer lucro.

### Carteira virtual
Usada sem wallet conectada. Saldo inicial típico em USDC no navegador; botão de zerar. Ordens simuladas com preço real da Binance. Custo de transação de referência ~0,10% no backtest do card.

### Taxa de serviço
2% **somente sobre o lucro** de operações vencedoras, em transação separada assinada na wallet. Nunca sobre o saldo total. Endereço e percentual estão nos Termos.

### Segurança e limites
- Nunca peça seed/chave privada.
- Alerte sobre phishing, redes erradas, slippage e gas.
- Limites diários (stop/meta) e máx. trades existem no painel; no Holograma há opção de aplicar ou não stop/meta diários à regra.
- Se a API de preço/velas falhar, o status do card avisa; sem dados o limitador **não** deve travar o trader original (deixa passar).

## Como responder a “como uso do zero?” / “me ensina”
Use o roteiro dos 10 passos acima, adaptado ao nível do usuário. Termine oferecendo o próximo passo (ex.: “Quer que eu detalhe só o modo Só Holograma?” ou “Quer entender a curva da barra?”).

## Fora do escopo do bot
Se perguntarem de outras estratégias (grid, DCA, arbitragem) ou código Python genérico, ajude de forma educativa, mas deixe claro o que o produto OctoCookie já faz vs. o que seria um projeto separado.`;
var Route$4 = createFileRoute("/api/chat")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const messages = (await request.json()).messages;
		if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });
		resetGroqKeyPool();
		const keys = getGroqKeys();
		if (keys.length === 0) return new Response("GROQ_API_KEYS não configurada no Vercel. Settings → Environment Variables → GROQ_API_KEYS = chave1,chave2,... → Redeploy.", { status: 500 });
		const recentMessages = messages.slice(-16);
		const modelMessages = await convertToModelMessages(recentMessages);
		const models = [
			process.env.GROQ_MODEL?.trim(),
			"qwen/qwen3.8-27b",
			"openai/gpt-oss-120b",
			"openai/gpt-oss-20b"
		].filter((m) => Boolean(m));
		let lastError = "Falha desconhecida";
		for (const modelId of models) for (const key of keys) try {
			const probe = await fetch("https://api.groq.com/openai/v1/chat/completions", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${key}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					model: modelId,
					messages: [{
						role: "user",
						content: "ok"
					}],
					max_tokens: 1
				})
			});
			if (!probe.ok) {
				const errBody = await probe.text();
				lastError = `HTTP ${probe.status} model=${modelId} key=…${key.slice(-6)}: ${errBody.slice(0, 180)}`;
				console.error("[/api/chat] preflight", lastError);
				if (probe.status === 404 || /model_not_found|does not exist/i.test(errBody)) break;
				continue;
			}
			const gateway = createLovableAiGatewayProvider(key);
			return streamText({
				model: gateway(modelId),
				system: SYSTEM_PROMPT,
				messages: modelMessages,
				maxRetries: 0
			}).toUIMessageStreamResponse({ originalMessages: messages });
		} catch (err) {
			lastError = err instanceof Error ? err.message : String(err);
			console.error(`[/api/chat] model=${modelId} key=…${key.slice(-6)}:`, lastError);
			if (/model.*does not exist|model_not_found|do not have access/i.test(lastError)) break;
			continue;
		}
		return new Response(`Não foi possível obter resposta da IA. Último erro: ${lastError.slice(0, 300)}`, { status: 502 });
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error("[/api/chat] fatal:", msg);
		return new Response(`Erro no chat: ${msg.slice(0, 300)}`, { status: 500 });
	}
} } } });
/**
* Chat dos módulos Finance e Start (substitui a antiga Netlify Function
* `chat.js`). Usa o MESMO rodízio de chaves/modelos do resto do sistema e o
* prompt é escolhido aqui no servidor — o navegador só diz qual módulo é.
*/
var EDU_SYSTEM = {
	finance: "Você é o assistente do OctoCookie Finance. Ajude com educação financeira de forma clara e acessível. Nunca prometa ganhos fáceis. Não dê recomendação de investimento personalizada nem sinais de compra/venda. Fale em português do Brasil. Reforce autonomia e decisões conscientes.",
	start: "Você é o assistente do OctoCookie Start. Ajude com empreendedorismo digital de forma prática e realista. Não prometa sucesso fácil. Fale em português do Brasil. Reforce autonomia e experimentação."
};
var MAX_CHARS = 4e3;
function cleanMessages(input) {
	if (!Array.isArray(input)) return null;
	const out = [];
	for (const m of input.slice(-16)) {
		if (!m || typeof m !== "object") return null;
		const { role, content } = m;
		if (role !== "user" && role !== "assistant" || typeof content !== "string") return null;
		out.push({
			role,
			content: content.slice(0, MAX_CHARS)
		});
	}
	return out.length > 0 && out[out.length - 1].role === "user" ? out : null;
}
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
var Route$3 = createFileRoute("/api/edu-chat")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json();
		const system = typeof body.module === "string" ? EDU_SYSTEM[body.module] : void 0;
		if (!system) return json({ error: "Módulo inválido." }, 400);
		const messages = cleanMessages(body.messages);
		if (!messages) return json({ error: "Mensagens inválidas." }, 400);
		resetGroqKeyPool();
		if (getGroqKeys().length === 0) return json({ error: "GROQ_API_KEYS não configurada no servidor. Defina GROQ_API_KEYS=chave1,chave2 nas variáveis de ambiente e faça redeploy." }, 500);
		return json({ reply: (await withGroqModelFallback((apiKey, modelId) => generateText({
			model: createLovableAiGatewayProvider(apiKey)(modelId),
			system,
			messages,
			temperature: .7,
			maxOutputTokens: 1200,
			maxRetries: 0
		}))).text || "Sem resposta." });
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error("[/api/edu-chat]", msg);
		return json({ error: `Não foi possível obter resposta da IA: ${msg.slice(0, 200)}` }, 502);
	}
} } } });
var $$splitComponentImporter$2 = () => import("./community-BH6OKP-1.mjs");
var Route$2 = createFileRoute("/community/")({
	head: () => ({ meta: [{ title: "OctoCommunity — Rede Social Web3" }, {
		name: "description",
		content: "Rede social estilo Reddit focada em Web3 e criptomoedas. Compartilhe dados do OctoCookie, discuta BTC, ETH, DeFi e mais."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_communityId-CUhUYcYG.mjs");
var Route$1 = createFileRoute("/community/$communityId")({
	head: ({ params }) => ({ meta: [{ title: `c/${params.communityId} — OctoCommunity` }, {
		name: "description",
		content: `Comunidade c/${params.communityId} no OctoCommunity`
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_postId--tv_Ntuh.mjs");
var Route = createFileRoute("/post/$postId")({
	head: () => ({ meta: [{ title: "Post — OctoCommunity" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$21
});
var ThreadIdRoute = Route$19.update({
	id: "/$threadId",
	path: "/$threadId",
	getParentRoute: () => Route$21
});
var AdmRoute = Route$18.update({
	id: "/adm",
	path: "/adm",
	getParentRoute: () => Route$21
});
var AnalyzerRoute = Route$17.update({
	id: "/analyzer",
	path: "/analyzer",
	getParentRoute: () => Route$21
});
var Bot24x7Route = Route$16.update({
	id: "/bot-24x7",
	path: "/bot-24x7",
	getParentRoute: () => Route$21
});
var CarteiraRoute = Route$15.update({
	id: "/carteira",
	path: "/carteira",
	getParentRoute: () => Route$21
});
var CookiescriptRoute = Route$14.update({
	id: "/cookiescript",
	path: "/cookiescript",
	getParentRoute: () => Route$21
});
var FinanceRoute = Route$13.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => Route$21
});
var IdeRoute = Route$12.update({
	id: "/ide",
	path: "/ide",
	getParentRoute: () => Route$21
});
var LaunchRoute = Route$11.update({
	id: "/launch",
	path: "/launch",
	getParentRoute: () => Route$21
});
var OctoAppRoute = Route$10.update({
	id: "/octo-app",
	path: "/octo-app",
	getParentRoute: () => Route$21
});
var PesquisaRoute = Route$9.update({
	id: "/pesquisa",
	path: "/pesquisa",
	getParentRoute: () => Route$21
});
var SettingsRoute = Route$8.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$21
});
var SimulatorRoute = Route$7.update({
	id: "/simulator",
	path: "/simulator",
	getParentRoute: () => Route$21
});
var StartRoute = Route$6.update({
	id: "/start",
	path: "/start",
	getParentRoute: () => Route$21
});
var ApiBotRoute = Route$5.update({
	id: "/api/bot",
	path: "/api/bot",
	getParentRoute: () => Route$21
});
var ApiChatRoute = Route$4.update({
	id: "/api/chat",
	path: "/api/chat",
	getParentRoute: () => Route$21
});
var ApiEduChatRoute = Route$3.update({
	id: "/api/edu-chat",
	path: "/api/edu-chat",
	getParentRoute: () => Route$21
});
var CommunityIndexRoute = Route$2.update({
	id: "/community/",
	path: "/community/",
	getParentRoute: () => Route$21
});
var rootRouteChildren = {
	IndexRoute,
	ThreadIdRoute,
	AdmRoute,
	AnalyzerRoute,
	Bot24x7Route,
	CarteiraRoute,
	CookiescriptRoute,
	FinanceRoute,
	IdeRoute,
	LaunchRoute,
	OctoAppRoute,
	PesquisaRoute,
	SettingsRoute,
	SimulatorRoute,
	StartRoute,
	ApiBotRoute,
	ApiChatRoute,
	ApiEduChatRoute,
	CommunityCommunityIdRoute: Route$1.update({
		id: "/community/$communityId",
		path: "/community/$communityId",
		getParentRoute: () => Route$21
	}),
	PostPostIdRoute: Route.update({
		id: "/post/$postId",
		path: "/post/$postId",
		getParentRoute: () => Route$21
	}),
	CommunityIndexRoute
};
var routeTree = Route$21._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { vote as C, listPosts as S, isMember as _, cfg$1 as a, listComments as b, toggleTheme as c, DEFAULT_COMMUNITIES as d, createComment as f, getPost as g, getCommunity as h, cfg as i, useAuth as l, createPost as m, Route as n, Route$19 as o, createCommunity as p, Route$1 as r, effectiveTheme as s, router_exports as t, COMMUNITY_GROUPS as u, joinCommunity as v, listCommunities as x, leaveCommunity as y };
