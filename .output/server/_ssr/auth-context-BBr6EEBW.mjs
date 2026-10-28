import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as getApps, l as initializeApp, n as isSupported, s as getApp, t as getAnalytics } from "../_libs/@firebase/analytics+[...].mjs";
import { a as signInWithEmailAndPassword, c as updateProfile, i as onAuthStateChanged, n as createUserWithEmailAndPassword, o as signInWithPopup, r as getAuth, s as signOut, t as GoogleAuthProvider } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { a as getDocs, c as limit, d as setDoc, f as startAfter, i as getDoc, l as orderBy, m as where, n as deleteDoc, o as getFirestore, p as updateDoc, r as doc, s as increment, t as collection, u as query } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getStorage } from "../_libs/firebase__storage.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-BBr6EEBW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	return (await getDocs(query(collection(db, "communities"), orderBy("memberCount", "desc"), limit(max)))).docs.map((d) => d.data());
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
	await deleteDoc(doc(db, "memberships", `${userId}_${communityId}`));
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
	if (opts.communityId) if (opts.sort === "new") q = query(collection(db, "posts"), where("communityId", "==", opts.communityId), orderBy("createdAt", "desc"), limit(max));
	else q = query(collection(db, "posts"), where("communityId", "==", opts.communityId), orderBy("score", "desc"), limit(max));
	else if (opts.sort === "new") q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(max));
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
	return (await getDocs(query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc")))).docs.map((d) => d.data());
}
var COMMUNITY_GROUPS = [
	"Início",
	"Pesquisa",
	"Ferramentas",
	"Aprender",
	"Ações"
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
			"acoes"
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
		name: "Carteira de Ações",
		group: "Ferramentas",
		description: "Carteira de ações: portfólios, rebalanceamento, custos e uso no dia a dia.",
		topics: [
			"carteira",
			"portfolio",
			"rebalanceamento"
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
		description: "Para quem está começando em ações e investimentos: perguntas simples são bem-vindas.",
		topics: [
			"start",
			"iniciante",
			"básico"
		]
	},
	{
		id: "tech-stocks",
		name: "Tech (AAPL, MSFT, NVDA)",
		group: "Ações",
		description: "Ações de tecnologia: Apple, Microsoft, NVIDIA, Meta, Google e o setor de IA.",
		topics: [
			"aapl",
			"msft",
			"nvda",
			"tech"
		]
	},
	{
		id: "growth",
		name: "Growth (TSLA, AMZN)",
		group: "Ações",
		description: "Empresas de crescimento: Tesla, Amazon e narrativas de longo prazo.",
		topics: [
			"tsla",
			"amzn",
			"growth"
		]
	},
	{
		id: "value",
		name: "Value & Dividendos",
		group: "Ações",
		description: "Ações de valor, dividendos, blue chips e investimentos de longo prazo.",
		topics: [
			"value",
			"dividendos",
			"blue-chips"
		]
	},
	{
		id: "etfs",
		name: "ETFs e Índices",
		group: "Ações",
		description: "ETFs, S&P 500, Nasdaq e diversificação via fundos de índice.",
		topics: [
			"etf",
			"sp500",
			"nasdaq"
		]
	},
	{
		id: "analise-acoes",
		name: "Análise de Ações",
		group: "Ações",
		description: "Fundamentalista, técnica e discussões de valuation (não é conselho financeiro).",
		topics: [
			"análise",
			"valuation",
			"ta"
		]
	},
	{
		id: "trading-acoes",
		name: "Trading de Ações",
		group: "Ações",
		description: "Setups, risco, paper trading e discussões de mercado acionário.",
		topics: [
			"trading",
			"risco",
			"mercado"
		]
	},
	{
		id: "news-acoes",
		name: "News do Mercado",
		group: "Ações",
		description: "Notícias, balanços, Fed, inflação e acontecimentos do mercado acionário.",
		topics: [
			"news",
			"fed",
			"balanço"
		]
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
				setProfile(await getOrCreateUserProfile(u.uid, {
					displayName: u.displayName,
					email: u.email,
					photoURL: u.photoURL
				}));
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
		await signInWithPopup(auth, new GoogleAuthProvider());
	}
	async function signOut$1() {
		await signOut(auth);
	}
	async function refreshProfile() {
		if (!user) return;
		setProfile(await getOrCreateUserProfile(user.uid, {
			displayName: user.displayName,
			email: user.email,
			photoURL: user.photoURL
		}));
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
//#endregion
export { createCommunity as a, getPost as c, leaveCommunity as d, listComments as f, vote as g, useAuth as h, createComment as i, isMember as l, listPosts as m, COMMUNITY_GROUPS as n, createPost as o, listCommunities as p, DEFAULT_COMMUNITIES as r, getCommunity as s, AuthProvider as t, joinCommunity as u };
