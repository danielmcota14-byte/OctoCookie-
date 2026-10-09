# Bot 24/7 no Render

## Por que o bot do navegador “para”?

O bot em `octocookie.html` roda com `setInterval` **no browser**.  
Quando a aba fecha, o celular dorme ou o Render free hiberna a página, o bot **para**.

## Solução: worker Node separado

O arquivo `bot/worker.mjs` é um processo Node que:

1. Busca preço na Binance a cada 8s
2. Usa SMA rápida/lenta + stop móvel
3. Modo `paper` (simulação) por padrão
4. Expõe:
   - `GET /health` — healthcheck do Render
   - `GET /status` — preço, posição, últimos trades
   - `POST /start` / `POST /stop`

## Deploy rápido (plano free — Web Service)

1. Render → **New → Web Service**
2. Conecte o repositório
3. Settings:
   - **Build Command:** `echo bot-ready`
   - **Start Command:** `node bot/worker.mjs`
   - **Instance type:** Free
4. Environment:
   ```
   BOT_SYMBOL=BTCUSDT
   BOT_MODE=paper
   BOT_INTERVAL_MS=8000
   BOT_STOP_PCT=2
   PUBLIC_URL=https://SEU-SERVICO.onrender.com
   ```
5. Deploy

Depois abra:
- `https://SEU-SERVICO.onrender.com/health`
- `https://SEU-SERVICO.onrender.com/status`

> No plano **Free**, o serviço ainda pode hibernar após ~15 min sem tráfego.  
> `PUBLIC_URL` faz o próprio bot se pingar a cada 5 min.  
> Para 24/7 de verdade (sem hibernar), use plano **Starter** ou tipo **Background Worker**.

## Deploy com Blueprint

Na raiz do repo existe `render.yaml`.  
Render → New → Blueprint → selecione o repo.

## Comunidade / Firebase (erros do console)

1. **MaxListenersExceeded / ObjectMultiplex** → extensão **MetaMask**, ignore.
2. **Missing or insufficient permissions** → publique as regras:
   ```bash
   firebase deploy --only firestore:rules
   ```
   (projeto `octo-10d4f`)
3. **Query requires an index** → clique no link do erro no console e crie o índice.
4. **OAuth domain** → Authentication → Settings → Authorized domains → `octocookie.onrender.com`
5. **signUp 400** → habilite Email/Password em Authentication → Sign-in method.

## Aba Social do Cryptex

Removida de `public/octocookie-app/cryptex.html` (nav + página inteira).
