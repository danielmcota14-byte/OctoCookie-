# OctoCookie — sistema unificado (1 comando, 1 serviço)

```bash
node start.mjs        # ou: npm run tudo
```
Instala o que faltar, compila o site e sobe **tudo** numa porta só (`PORT`, padrão 3000):

| Endereço | O que é |
|---|---|
| `/` e demais páginas | Site (Cryptex, Bot Trading, Comunidade, Simulador, Analisador, Adm…) |
| `/finance` `/start` | Chats de educação financeira e empreendedorismo (antigos sites Finance e Start) |
| `/universo.html` | Landing do ecossistema |
| `/cookiescript` | CookieScript dentro do menu (IDE, Cookie AI, Documentação) |
| `/cookiescript-app/` | Servidor Python do CookieScript |
| `/bot/…` | Bot 24/7 (Playwright/Chromium) |
| `/healthz` | Saúde dos três serviços |

Por dentro, 3 programas rodam em portas internas e um proxy (`start.mjs`) distribui. Se um cair, é reiniciado.
Requisitos locais: Node 22+, Python 3. (O bot precisa do Chromium: `npx playwright install chromium` na pasta `bot-server`.)

## Render (um serviço só)
1. Suba esta pasta num repositório Git.
2. Render → **New → Blueprint** → escolha o repositório (usa `render.yaml` + `Dockerfile` da raiz).
3. Preencha no painel: `GROQ_API_KEYS`, `GROQ_API_KEY`, `OWNER_TOKEN` (e, se usar, `RPC_URL_ETHEREUM`, `ADMIN_UIDS`, `ADSTERRA_TOKEN`).
4. Alternativa sem Blueprint: Web Service → Docker → **Start Command:** `node start.mjs`.
Plano `standard` ou maior (Chromium + Python + site não cabem em 512 MB). O disco `/data` guarda o cofre do bot.

## O que foi unido
- `OctoCookie--main` → base. `octocookie-finance` + `octocookie-start` → rotas `/finance` e `/start` (um componente só, `src/components/edu-chat.tsx`; API `src/routes/api/edu-chat.ts` com o rodízio de chaves Groq do sistema).
- `deploy/index.html` → `/universo.html`. `cookiescript-main` → pasta `cookiescript/`.
- Removidos: `.env` com chaves reais, funções do Netlify, `OllamaSetup.exe`, `__pycache__`, `netlify.toml` duplicado, `bot-server/render.yaml` antigo.
- Ajustes para rodar na mesma origem: caminhos relativos nas páginas do CookieScript, `bot-config.js` apontando para `/bot`.

## ATENÇÃO — segurança
- `/cookiescript-app/api/execute` **executa Python/JS/Lua de quem acessar**. Com o site público, qualquer pessoa roda código no seu servidor. Coloque login na frente ou não exponha publicamente.
- O `OWNER_TOKEN` do bot está escrito em `public/octocookie-app/bot-config.js` (qualquer visitante lê). Troque por um novo e revogue as chaves Groq que estavam em `.env` e no repositório do CookieScript.
