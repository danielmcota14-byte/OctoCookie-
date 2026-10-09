# OctoCookie Bot 24/7 (Render)

Bot educacional em **paper trading** que roda 24 horas no Render.

- Preços reais da **Binance**
- Estratégia tendência + RSI + stop -3% / take +8%
- API HTTP para status, start, stop, reset
- **Não** envia transações on-chain (para isso use `octocookie.html` + MetaMask)

## Deploy no Render (passo a passo)

1. Suba o projeto no **GitHub**
2. Acesse [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
3. Conecte o repositório
4. Configure:
   - **Root Directory:** `bot-server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
5. Environment (opcional):
   - `BOT_SYMBOL` = `ETHUSDT` (ou `BTCUSDT`, `SOLUSDT`…)
   - `BOT_TICK_MS` = `10000`
   - `BOT_START_BALANCE` = `1000`
6. **Create Web Service** → aguarde o deploy
7. Abra a URL: `https://SEU-SERVICO.onrender.com/`

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Status resumido |
| GET | `/health` | Health check (Render) |
| GET | `/status` | Estado completo + logs + trades |
| POST | `/start` | Liga o loop |
| POST | `/stop` | Pausa o loop |
| POST | `/reset` | Zera paper balance |

### Teste local

```bash
cd bot-server
npm install
npm start
# http://localhost:3000/
```

### Importante sobre o plano Free do Render

- O serviço **dorme** após ~15 min sem requisições.
- Para manter “quase 24/7” no free: use um ping externo (cron-job.org) a cada 10 min em `/health`.
- No plano **Starter** ($7/mês) o serviço não dorme.

### On-chain de verdade

O bot do navegador (`octocookie.html`) executa swaps com a **sua** MetaMask.
O servidor no Render **não** guarda chave privada — isso seria inseguro.
