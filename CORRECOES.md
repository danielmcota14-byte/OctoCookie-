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

## Binance HTTP 451 (Render / cloud)

`api.binance.com` bloqueia muitos IPs de datacenter (HTTP 451).  
No `octocookie.html` o feed de preço agora tenta, nesta ordem:

1. `https://data-api.binance.vision/api/v3`  ← funciona no Render
2. `https://api1.binance.com/api/v3`
3. `https://api.binance.com/api/v3`

Se o log do servidor ainda mostrar `[bot24] Tick error: Binance HTTP 451`, o loop 24/7 do **servidor** também precisa usar `data-api.binance.vision` (esse loop não estava neste zip — confira o código deployado no Render).
