# Bot 24/7 — o `octocookie.html` rodando sozinho no servidor

O servidor abre **o próprio `octocookie.html`** num Chromium sem tela e o deixa operando **on-chain** (Uniswap V3, Ethereum)
com uma carteira dedicada, mesmo com o site fechado. A lógica de trading é a do HTML; nada foi reescrito.

## Como a chave circula (Diffie-Hellman + AES-256)
1. **Pareamento:** seu navegador pede ao servidor uma chave pública ECDH de uso único e faz Diffie-Hellman (P-256 → HKDF-SHA256 → AES-256-GCM).
   Por esse canal vai a chave da carteira. O servidor decifra, gera uma chave **AES-256 aleatória (K)**, cifra a carteira com ela e
   **devolve K a você** pelo mesmo canal. O servidor não guarda K.
2. **K fica com você:** o site guarda K neste navegador e oferece "EXPORTAR K" (arquivo). Sem K o servidor não abre a carteira.
3. **Ligar:** o site envia K ao servidor (de novo por Diffie-Hellman). O servidor abre a carteira **só na memória**, e a página do bot assina as ordens.
4. **Se o servidor reiniciar,** o bot fica **trancado** até receber K de novo. O site reenvia sozinho quando está aberto (vigia a cada 5 min).
   Para reiniciar sem ninguém, marque "Reiniciar sozinho": aí o servidor guarda K cifrada com `SERVER_MASTER_KEY` (menos seguro).

Só a chave privada da conta escolhida viaja (o site deriva da seed no seu navegador); a seed inteira não sobe.

## Deploy no Render
1. Copie `bot-server/render.yaml` para a raiz do repositório (já copiado) e crie um **Blueprint** no Render. O build usa Docker (Chromium).
2. Preencha no painel: `OWNER_TOKEN` (mín. 24 caracteres), `RPC_URL_ETHEREUM` (seu RPC https), e opcional `SERVER_MASTER_KEY` (`openssl rand -base64 32`).
3. Plano: o `render.yaml` usa **standard** (2 GB). O Chromium + a página costumam estourar 512 MB; o plano free ainda dorme após 15 min.
   Mantenha o disco `/data` (guarda o cofre cifrado; sem ele o cofre some a cada deploy). Uma VPS Linux com Docker também serve.
4. No site: **Bot Trading → card "Bot 24/7 no servidor"** → URL do serviço + `OWNER_TOKEN` + seed/chave da carteira DEDICADA → **ATIVAR 24/7**.

## Segurança
- Rotas `/247/*` exigem `Authorization: Bearer OWNER_TOKEN` e têm limite de tentativas. `/status` público só mostra preço/estado, nunca endereço, saldo ou logs.
- A página no servidor só carrega o app local, `ethers` e `chart.js` servidos do próprio servidor (não da CDN), Binance, seu RPC e Firebase. O resto é bloqueado.
- Enquanto o bot roda, quem invadir o servidor consegue gastar o saldo da carteira do bot. Use uma carteira só para isso, com pouco dinheiro.
- A taxa de serviço (2% do lucro) só é enviada se você marcar a autorização no card.

## Testes (sem rede, sem blockchain, sem Chromium)
`npm install && npm test` — API + criptografia (usa o mesmo código do navegador), o `octocookie.html` real em jsdom e o runner com Chromium simulado.

## Aba Adm (`/adm.html`)
Painel para o dono: define a **carteira que recebe os 2%** e mostra a **receita do Adsterra**.
1. No Render, crie `ADMIN_TOKEN` (mín. 24 caracteres, **diferente** do `OWNER_TOKEN`, que o site publica em `bot-config.js`) e `ADSTERRA_TOKEN` (token da Publisher API do Adsterra). Nunca ponha esses tokens em arquivos públicos.
2. Abra `https://SEU-SITE/adm.html` (ou `/adm`), informe a URL do servidor e o `ADMIN_TOKEN`, conecte a carteira (MetaMask) e clique em **Definir como destino dos 2%** (você assina uma mensagem; não gasta gás).
3. O site lê o destino em `GET /fee-recipient` ao abrir; os bots 24/7 recebem o novo destino em até 30 s. Se o servidor estiver fora do ar, vale o endereço padrão do código.
