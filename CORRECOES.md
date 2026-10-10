# Correções + Bot 24/7 automático

## Bugs corrigidos
1. **Firestore `photoURL` undefined** — `src/lib/social.ts` + `auth-context.tsx` (stripUndefined)
2. **404 `/octo-app/status`** — validação de URL em `modo247.js` e `bot-24x7.tsx` (rejeita URL do site React)
3. **URL automática** — `public/octocookie-app/bot-config.js` + `VITE_BOT_24X7_URL`

## Como deixar automático
1. Deploy do **bot-server** no Render (Blueprint com `render.yaml` → serviço `octocookie-bot-24x7`)
2. Preencha no painel: `OWNER_TOKEN` (≥24 chars), `RPC_URL_ETHEREUM`
3. Copie a URL pública do bot (ex. `https://octocookie-bot-24x7-xxxx.onrender.com`)
4. Em `public/octocookie-app/bot-config.js`:
   ```js
   window.OCTO_BOT_CONFIG = { url: "https://octocookie-bot-24x7-xxxx.onrender.com" };
   ```
   e/ou no build do site: `VITE_BOT_24X7_URL=https://...`
5. Redeploy do **site**. O card 24/7 e a página `/bot-24x7` usam essa URL sozinhos.

## Importante
- `https://octocookie.onrender.com` é só o site React — **não** tem `/247` nem `/status` JSON.
- O bot precisa do serviço Docker separado (Chromium + RAM).
