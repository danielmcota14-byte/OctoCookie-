# OCTOCOOKIE — Deploy Guide

## Estrutura do Projeto

```
octocookie/
├── netlify.toml                    ← redirects, publish dir, bundler
├── package.json                    ← express + serverless-http + @netlify/blobs
├── .env.example                    ← modelo de variáveis de ambiente
├── .gitignore
├── netlify/
│   └── functions/
│       └── api.js                  ← BACKEND UNIFICADO (server.js + backend.js)
└── public/
    ├── octocookie.html             ← Trader Bot (index-5 / octocookie)
    ├── index.html                  ← Landing page
    ├── cryptex.html                ← Carteira Digital (MoonPay integrado)
    └── dashboard.html              ← Dashboard Analisador
```

---

## O que o `api.js` faz (tudo em um)

| Origem | Rota | Descrição |
|--------|------|-----------|
| server.js | `GET /health` | Health check legado |
| server.js | `GET /api/moonpay/url` | Gera URL assinada do widget |
| server.js | `GET /api/moonpay/open` | Redireciona direto ao widget |
| server.js | `GET /api/moonpay/config` | Retorna chave pública + URL |
| server.js | `POST /api/moonpay-webhook` | Recebe eventos MoonPay |
| backend.js | `POST /api/data` | Recebe snapshot do analize.py |
| backend.js | `GET /api/latest` | Último snapshot |
| backend.js | `GET /api/history` | Histórico de snapshots |
| backend.js | `POST /api/command` | Enfileira CALL ou PUT |
| backend.js | `GET /api/command` | bot.html busca próximo comando |
| backend.js | `GET /api/health` | Status completo da API |
| backend.js | `GET /api/dashboard` | Dados completos do dashboard |
| backend.js | `POST /api/repair` | Reseta circuit breaker |

---

## Deploy na Netlify

### 1. Subir para GitHub

```bash
git init
git add .
git commit -m "OCTOCOOKIE unified deploy"
git branch -M main
git remote add origin https://github.com/SEU_USER/octocookie.git
git push -u origin main
```

### 2. Conectar na Netlify

1. https://app.netlify.com → **Add new site → Import an existing project**
2. Selecione o repositório
3. Build settings (o `netlify.toml` já configura tudo):
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. **Deploy site**

### 3. Variáveis de Ambiente

Em **Site settings → Environment variables**, adicione:

```
MOONPAY_PUBLIC_KEY   = pk_test_RvIA92DwVnZKEHmVVQ3nmkZuHwLn1ImT
MOONPAY_SECRET_KEY   = sk_test_2NHAV2nC7zRxdOE0N8FbDyhrNlA2Nb
MOONPAY_WEBHOOK_KEY  = wk_test_oiV3MYedURlJ24cC3gJEG3FUyvNVx
MOONPAY_WIDGET_URL   = https://buy-sandbox.moonpay.com
```

### 4. Habilitar Netlify Blobs

**Site configuration → Netlify Blobs** — confirme que está ativado (automático em planos com Functions).

---

## Diagrama do sistema

```
analize.py (PC local)
    │  POST /api/data       → envia preços/indicadores
    │  POST /api/command    → envia CALL ou PUT
    ▼
api.js (Netlify Function)
    │  armazena em Netlify Blobs (circuit breaker + watchdog)
    ▼
octocookie.html             dashboard.html          cryptex.html
GET /api/command            GET /api/latest         GET /api/moonpay/url
executa trade               exibe análise           abre widget MoonPay
```

---

## Diagnóstico de erros

| Erro | Causa | Solução |
|------|-------|---------|
| "API Netlify inacessível" | Function não deployada | Checar aba **Functions** no painel |
| 404 em `/api/health` | `netlify.toml` ausente | Confirmar arquivo na raiz |
| `Cannot find module '@netlify/blobs'` | `package.json` sem a dep ou build errado | Confirmar `node_bundler = "esbuild"` no `netlify.toml` |
| MoonPay sem chave | `MOONPAY_PUBLIC_KEY` não configurada | Adicionar em Environment variables |
| Circuit Breaker OPEN | 5+ erros consecutivos | `POST /api/repair` |
