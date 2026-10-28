import { o as __toESM } from "../_runtime.mjs";
import { a as streamText, i as generateText, o as require_jsx_runtime, r as convertToModelMessages, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as AuthProvider } from "./auth-context-BBr6EEBW.mjs";
import { c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, j as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$19 } from "../_communityId-CanR2Tjp.mjs";
import { t as Route$20 } from "../_postId-Dn4AXAZ_.mjs";
import { t as Route$21 } from "../_threadId-c4PYogNI.mjs";
import { t as THEME_BOOT } from "./theme-B0G8mDzO.mjs";
import { i as withGroqModelFallback, n as getGroqKeys, r as resetGroqKeyPool, t as createLovableAiGatewayProvider } from "./ai-gateway.server-ks9zSEkA.mjs";
import { t as cfg } from "./finance-CfTUMrqh.mjs";
import { t as cfg$1 } from "./start-C3Ci4Ow4.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-EsJdXLwB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-TpymljAf.css";
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
var Route$18 = createRootRouteWithContext()({
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
				content: "Pesquisa, carteira, bot, analisador, CookieScript e comunidade: um só ecossistema."
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
	const { queryClient } = Route$18.useRouteContext();
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
var $$splitComponentImporter$14 = () => import("./start-CDHVV1cp.mjs");
var Route$17 = createFileRoute("/start")({
	head: () => ({ meta: [{ title: `${cfg$1.name} — ${cfg$1.topbar}` }, {
		name: "description",
		content: cfg$1.welcome
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./simulator-DhbeQ6HD.mjs");
var Route$16 = createFileRoute("/simulator")({
	head: () => ({ meta: [{ title: "Simulador de bot — OctoCookie" }, {
		name: "description",
		content: "Cole seu código de estratégia e simule em dados sintéticos com feedback educacional."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./settings-GegVK-MJ.mjs");
var Route$15 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Configurações — OctoCookie" }, {
		name: "description",
		content: "Configurações do OctoCookie."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./pesquisa-DI2BYsDK.mjs");
var Route$14 = createFileRoute("/pesquisa")({
	head: () => ({ meta: [{ title: "Pesquisa | OctoCookie — Ações e estratégias" }, {
		name: "description",
		content: "OctoCookie: laboratório financeiro digital para testar e automatizar estratégias em ações. Metodologia de testes, evolução do projeto e Holograma Quântico AAPL/USDC."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./octo-app-DeN1d0FQ.mjs");
var Route$13 = createFileRoute("/octo-app")({
	head: () => ({ meta: [
		{ title: "Trader de Ações — Trader de Ações educacional" },
		{
			name: "description",
			content: "Trader de Ações: trading de ações com Holograma Quântico (tendência + stop móvel), trader clássico opcional e dashboard analisador — conteúdo educacional."
		},
		{
			property: "og:title",
			content: "Trader de Ações — Trader de Ações educacional"
		},
		{
			property: "og:description",
			content: "Trader de Ações com Holograma Quântico e simulação — educacional, sem recomendação de investimento."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./launch-DXnsLcYQ.mjs");
var Route$12 = createFileRoute("/launch")({
	head: () => ({ meta: [{ title: "Explorar — OctoCookie" }, {
		name: "description",
		content: "Explore trilhas educacionais de finanças, ações e bots."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./ide-BLuM-7_0.mjs");
var Route$11 = createFileRoute("/ide")({
	head: () => ({ meta: [{ title: "CookieScript IDE — OctoCookie" }, {
		name: "description",
		content: "Escreva e execute CookieScript em sandbox educacional com explicações passo a passo."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./finance-D8zWcfDs.mjs");
var Route$10 = createFileRoute("/finance")({
	head: () => ({ meta: [{ title: `${cfg.name} — ${cfg.topbar}` }, {
		name: "description",
		content: cfg.welcome
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./cookiescript-DGNa7O1Z.mjs");
var Route$9 = createFileRoute("/cookiescript")({
	head: () => ({ meta: [{ title: "CookieScript — IDE e Cookie AI" }, {
		name: "description",
		content: "IDE da linguagem CookieScript com Cookie AI e documentação."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./carteira-CggvkD90.mjs");
var Route$8 = createFileRoute("/carteira")({
	head: () => ({ meta: [
		{ title: "Cryptex — Ações Tokenizadas" },
		{
			name: "description",
			content: "Cryptex é a carteira de ações tokenizadas educacional do OctoCookie: aprenda sobre carteiras, ações tokenizadas, portfolio e mercado acionário de forma didática."
		},
		{
			property: "og:title",
			content: "Cryptex — Ações Tokenizadas"
		},
		{
			property: "og:description",
			content: "Carteira de ações tokenizadas integrada ao OctoCookie."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./bot-24x7-C9kJ7c3C.mjs");
var Route$7 = createFileRoute("/bot-24x7")({
	head: () => ({ meta: [{ title: "Bot 24/7 — OctoCookie" }, {
		name: "description",
		content: "Status do bot 24/7 que roda o octocookie.html no seu servidor."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./analyzer-6Ai_AvyA.mjs");
var Route$6 = createFileRoute("/analyzer")({
	head: () => ({ meta: [{ title: "Analisador de Ações — OctoCookie" }, {
		name: "description",
		content: "Análise educacional de ações com dados de mercado e contexto didático."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./adm-WGtaZq06.mjs");
var Route$5 = createFileRoute("/adm")({
	head: () => ({ meta: [{ title: "Adm — OctoCookie" }, {
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	beforeLoad: () => {
		if (typeof window === "undefined") throw redirect({ href: "/adm.html" });
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./routes-DDcUvaEq.mjs");
var Route$4 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "OctoCookie — Um universo de possibilidades" }, {
		name: "description",
		content: "Ações, educação financeira, empreendedorismo digital e desenvolvimento com IA no mesmo sistema."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./community-DR18FLlI.mjs");
var Route$3 = createFileRoute("/community/")({
	head: () => ({ meta: [{ title: "OctoCommunity — Rede Social de Ações" }, {
		name: "description",
		content: "Rede social estilo Reddit focada em ações e mercado financeiro. Compartilhe dados do OctoCookie, discuta AAPL, MSFT, NVDA e mais."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
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
var Route$2 = createFileRoute("/api/edu-chat")({ server: { handlers: { POST: async ({ request }) => {
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
var SYSTEM_PROMPT = `Você é o OctoCookie 🍪🐙, assistente educativo do produto OctoCookie.

## Seu papel
1. Ensinar a usar o **Swap Trader Bot** e o **Holograma Quântico** do zero, passo a passo.
2. Educação financeira e ações (conceitos, risco, carteiras, análise técnica) — só em nível educativo.
3. Ajuda com programação aplicada a finanças/trading quando o usuário pedir.

## Regras fixas
- NÃO dê recomendações de investimento nem sinais de compra/venda de ativos específicos.
- Sempre deixe claro: conteúdo educacional; performance passada não garante resultado futuro; operar ações pode causar perda total.
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
Trader de ações tokenizadas / simulação de mercado acionário. Pares típicos: AAPL↔USDC, MSFT↔USDC, NVDA↔USDC, etc. Preços de ações do mercado. A regra de decisão pode ser o trader clássico ou o Holograma.

### Como começar do zero (ensine nesta ordem se o usuário for iniciante)
1. **Abrir o bot** no site (seção Swap Trader / octocookie-app).
2. **Ler e aceitar os Termos de Uso** (obrigatório).
3. **Escolher o par** (ex.: AAPL → USDC).
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
var Route$1 = createFileRoute("/api/chat")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const messages = (await request.json()).messages;
		if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });
		resetGroqKeyPool();
		const keys = getGroqKeys();
		if (keys.length === 0) return new Response("GROQ_API_KEYS não configurada no Vercel. Settings → Environment Variables → GROQ_API_KEYS = chave1,chave2,... → Redeploy.", { status: 500 });
		const modelMessages = await convertToModelMessages(messages.slice(-16));
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
			return streamText({
				model: createLovableAiGatewayProvider(key)(modelId),
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
* Bot 24/7 paper trading — roda no mesmo processo do site (Render).
* Singleton: inicia o loop na primeira importação no servidor.
*/
var SYMBOL = process.env.BOT_SYMBOL || "AAPL";
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
var Route = createFileRoute("/api/bot")({ server: { handlers: {
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
var StartRoute = Route$17.update({
	id: "/start",
	path: "/start",
	getParentRoute: () => Route$18
});
var SimulatorRoute = Route$16.update({
	id: "/simulator",
	path: "/simulator",
	getParentRoute: () => Route$18
});
var SettingsRoute = Route$15.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$18
});
var PesquisaRoute = Route$14.update({
	id: "/pesquisa",
	path: "/pesquisa",
	getParentRoute: () => Route$18
});
var OctoAppRoute = Route$13.update({
	id: "/octo-app",
	path: "/octo-app",
	getParentRoute: () => Route$18
});
var LaunchRoute = Route$12.update({
	id: "/launch",
	path: "/launch",
	getParentRoute: () => Route$18
});
var IdeRoute = Route$11.update({
	id: "/ide",
	path: "/ide",
	getParentRoute: () => Route$18
});
var FinanceRoute = Route$10.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => Route$18
});
var CookiescriptRoute = Route$9.update({
	id: "/cookiescript",
	path: "/cookiescript",
	getParentRoute: () => Route$18
});
var CarteiraRoute = Route$8.update({
	id: "/carteira",
	path: "/carteira",
	getParentRoute: () => Route$18
});
var Bot24x7Route = Route$7.update({
	id: "/bot-24x7",
	path: "/bot-24x7",
	getParentRoute: () => Route$18
});
var AnalyzerRoute = Route$6.update({
	id: "/analyzer",
	path: "/analyzer",
	getParentRoute: () => Route$18
});
var AdmRoute = Route$5.update({
	id: "/adm",
	path: "/adm",
	getParentRoute: () => Route$18
});
var ThreadIdRoute = Route$21.update({
	id: "/$threadId",
	path: "/$threadId",
	getParentRoute: () => Route$18
});
var IndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var CommunityIndexRoute = Route$3.update({
	id: "/community/",
	path: "/community/",
	getParentRoute: () => Route$18
});
var PostPostIdRoute = Route$20.update({
	id: "/post/$postId",
	path: "/post/$postId",
	getParentRoute: () => Route$18
});
var CommunityCommunityIdRoute = Route$19.update({
	id: "/community/$communityId",
	path: "/community/$communityId",
	getParentRoute: () => Route$18
});
var ApiEduChatRoute = Route$2.update({
	id: "/api/edu-chat",
	path: "/api/edu-chat",
	getParentRoute: () => Route$18
});
var ApiChatRoute = Route$1.update({
	id: "/api/chat",
	path: "/api/chat",
	getParentRoute: () => Route$18
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
	ApiBotRoute: Route.update({
		id: "/api/bot",
		path: "/api/bot",
		getParentRoute: () => Route$18
	}),
	ApiChatRoute,
	ApiEduChatRoute,
	CommunityCommunityIdRoute,
	PostPostIdRoute,
	CommunityIndexRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
