# OctoCookie Token — integração (pagamentos premium, recompensas e transparência)

## 1. Contrato oficial (OctoToken, Sepolia)
- Endereço: `0x2f5f737D15ec5C79995f2d72dD0A0DaA1b75a44D`
- Rede: Sepolia, chainId `11155111`, explorer `https://sepolia.etherscan.io`
- ABI: `bot-server/token/abi.js` (igual a `bot-server/token/octotoken.abi.json`)
- Bytecode de runtime esperado: `bot-server/token/octotoken.runtime-bytecode.txt`

Funções: `name, symbol, decimals, totalSupply, balanceOf, allowance, owner, tokenPrice` (leitura);
`transfer, approve, transferFrom, mint (só owner), burn, buy (payable), setPrice, withdrawETH, recoverTokens`.
Eventos: `Transfer, Approval, TokensPurchased`. **Não existem** `MAX_SUPPLY`, `burnFrom`, `transferOwnership` nem `renounceOwnership`:
o owner é fixo e não há teto de oferta no contrato.

`buy()` entrega tokens do saldo do owner (não cria tokens): `tokens = msg.value * 10**decimals / tokenPrice`.

### Verificação antes de habilitar qualquer coisa
O servidor confere, na rede configurada: (1) chainId do RPC = `TOKEN_CHAIN_ID`; (2) há bytecode no endereço; (3) o bytecode contém
os seletores das funções obrigatórias do ABI; (4) `name/symbol/decimals/totalSupply` respondem. Além disso informa se o bytecode é
**idêntico** ao OctoToken oficial (`bytecodeIdentico` em `/token/info` e na aba Transparência). Se algo falhar, `/token/config`
devolve `ready:false` com o motivo e compras/recompensas ficam bloqueadas (HTTP 503).

## 2. Decisões de projeto
| Tema | Decisão |
|---|---|
| Recebimento | `transfer(tesouraria, valor)` direto do usuário. `approve`/`transferFrom` **não** são usados nos pagamentos. |
| Identidade | A carteira é vinculada à conta Firebase por **assinatura de mensagem** (nonce de uso único, 10 min). Uma carteira só serve a uma conta. |
| Prova de pagamento | Somente o servidor decide, lendo a blockchain (ver §4). Saldo ou aprovação nunca liberam nada. |
| Preços | Em tokens inteiros (`"12.5"`), editáveis em **Token › Admin** (ou `PUT /adm/token/catalog/:id`). Convertidos com `decimals()` lido do contrato. |
| Recompensas | Registradas como `pending` → admin `approved` → emitidas. **Nunca automáticas.** |
| Emissão (`mint`) | Padrão: manual (admin registra o hash). Opcional: `TOKEN_MINTER_PRIVATE_KEY` — só funciona se a chave for o `owner()` do contrato; simula antes de enviar e exige confirmação explícita. O contrato não tem teto de oferta. |
| Queima | **Não há queima automática.** `burn` não é chamado pelo sistema. |
| Funções administrativas | O servidor **nunca** chama `buy`, `setPrice`, `withdrawETH` nem `recoverTokens`. O contrato não tem troca de dono. |
| Simulação × real | Cada item do catálogo tem `scope`: `simulation` ou `live`. Comprar um item `live` só libera o acesso; operar de verdade continua exigindo a carteira dedicada e o consentimento no Bot 24/7. |

## 3. Arquivos
**Backend (`bot-server/`)**: `token/abi.js`, `token/config.js`, `token/catalog.js`, `token/store.js`, `token/chain.js`, `token/router.js`; integração em `server.js`; testes em `test/token.test.mjs`.
**Site (`src/`)**: `lib/token/{api,wallet,use-token-wallet}.ts`, `components/token/{token-panel,purchase-dialog,token-history,token-transparency,token-admin}.tsx`, `routes/token.tsx` (+ item “OctoCookie Token” no menu, `routeTree.gen.ts` regenerado pelo build), dependência `ethers`.
**Config**: `render.yaml`, `bot-server/render.yaml`, `.env.example`, `.gitignore`.

## 4. Como um pagamento é validado
1. O servidor cria um **pedido** (preço em unidades do token, carteira do usuário, tesouraria, validade).
2. O usuário assina `transfer()` na carteira e o navegador envia só o **hash** ao servidor.
3. O servidor reserva o hash (sem `await`, então envios simultâneos não duplicam) e confere: rede; recibo existe e `status = 1`; destino da tx = contrato; remetente = carteira vinculada; calldata = `transfer(tesouraria, valor exato)`; evento `Transfer` coerente; bloco **posterior à criação** e **anterior à expiração** do pedido; confirmações ≥ `TOKEN_MIN_CONFIRMATIONS`.
4. Só então grava a compra e libera o recurso. Pendente (sem recibo/poucas confirmações) → `202` e o hash não é consumido. Rejeitado → `422` com o motivo.
5. Hash confirmado nunca é aceito de novo (nem em outro pedido, nem por outro usuário). Preço alterado pelo admin invalida pedidos abertos.

Limitação consciente: pagamentos feitos por carteiras de contrato (multisig, smart accounts) são recusados, pois a tx não chama o token diretamente.

## 5. Variáveis de ambiente (somente no servidor)
| Variável | Obrigatória | Descrição |
|---|---|---|
| `TOKEN_CONTRACT_ADDRESS` | não (padrão: OctoToken) | Endereço do ERC-20 |
| `TOKEN_CHAIN_ID` | não (padrão `11155111`) | Sepolia |
| `TOKEN_RPC_URL` | não (padrão: RPC público da Sepolia) | RPC https da rede. Obrigatório fora da Sepolia |
| `TOKEN_TREASURY_ADDRESS` | não (padrão: `owner()` do contrato) | Carteira que recebe os pagamentos. Recomendado: uma carteira só para isso |
| `TOKEN_MIN_CONFIRMATIONS` | não (3) | Confirmações exigidas |
| `TOKEN_ORDER_TTL_MIN` | não (30) | Validade do pedido |
| `TOKEN_EXPLORER_URL` | não (padrão Sepolia Etherscan) | Links de transação |
| `TOKEN_HISTORY_BLOCKS` | não (5000) | Janela do histórico on-chain |
| `TOKEN_SKIP_SELECTOR_CHECK` | não | `1` só para contratos proxy |
| `TOKEN_MINTER_PRIVATE_KEY` | **não, sensível** | Só para emissão pelo servidor (ver §2) |

Já existentes e usados: `ADMIN_EMAILS` / `ADMIN_UIDS`, `FIREBASE_PROJECT_ID`, `DATA_DIR`. No site, `VITE_BOT_24X7_URL` (padrão `/bot`).

## 6. Passo a passo para ativar (recomendado: Sepolia primeiro)
1. Abra o contrato no Etherscan da Sepolia, confira a aba *Contract* e o `owner()`. O owner precisa ter saldo de tokens se for usar `buy()`.
2. Crie uma carteira **só para a tesouraria** (não use a do owner).
3. No Render não é preciso definir nada para começar: endereço, rede, explorer e RPC público da Sepolia já são padrão, e a tesouraria é o `owner()`. Para produção, defina `TOKEN_RPC_URL` (RPC seu) e `TOKEN_TREASURY_ADDRESS`. Faça o deploy (o build do site já inclui o `ethers`).
4. Abra o log do serviço: deve aparecer `🪙 Token verificado: SIMBOLO (N casas)`. Se aparecer `Token DESABILITADO`, o motivo vem na mesma linha.
5. Entre em **OctoCookie Token**, conecte a carteira, vincule-a à conta, compre um item barato e confira: desbloqueio, histórico, aba Transparência.
6. Como admin (e-mail verificado em `ADMIN_EMAILS`), use a aba **Admin** para ajustar preços e testar uma recompensa.
7. Só depois, troque para a mainnet (`TOKEN_CHAIN_ID`, `TOKEN_RPC_URL`, endereço) e repita os passos 4–6 com valores pequenos.

## 7. Testes
- Backend: `cd bot-server && npm install && node test/token.test.mjs` (34 testes, blockchain simulada, sem rede). `npm test` roda tudo.
- Cobrem: contrato sem código/rede errada/ABI divergente; `decimals` diferente de 18; vinculação de carteira; pagamento válido; valor, destinatário, remetente, contrato, `approve()`, revertida, tx anterior ao pedido e evento divergente; replay e envio simultâneo; pendente→confirmado; permissões de admin; mudança de preço; persistência; recompensas (ref única, aprovação, `confirm`, owner, simulação do mint); transparência sem segredos.
- Site: `npm install && npm run build` e `npx tsc --noEmit`.
- **Ainda é necessário** (não dá para fazer sem rede/fundos): rodar os passos de §6 em uma testnet com o contrato real — incluindo uma transferência real, uma carteira sem saldo e uma troca de rede.
- Observação: `bot-server/test/adm.test.mjs` já falhava **antes** desta integração (o `adm.html` carrega `/octo.js` e o teste exige `./`). Não foi alterado.

## 7b. Como dar recompensas pela aba Admin
1. Em **OctoCookie Token › Admin › Nova recompensa**, escolha o usuário na lista (contas que vincularam carteira) — o destinatário é a carteira vinculada à conta, sem digitar endereço. Informe tipo, motivo, valor e uma referência única. A recompensa fica **pendente**.
2. Clique em **Aprovar** (ou Rejeitar).
3. Clique em **Emitir com minha carteira (owner)**. O navegador conecta a MetaMask, troca para a Sepolia se preciso, exige que a conta conectada seja o `owner()` do contrato, pede confirmação, **reserva** a recompensa (`claim`, evita emissão duplicada), simula e envia `mint(destinatário, valor)`. Se você cancelar na carteira, a reserva é desfeita (`release`).
4. O navegador manda só o **hash** ao servidor. O servidor confere na blockchain: transação com sucesso, enviada ao contrato, remetente = `owner()`, calldata = `mint(destinatário, valor exato)`, evento `Transfer(0x0 → destinatário, valor)`, bloco posterior à criação da recompensa e confirmações mínimas. Só então a recompensa vira **minted** e aparece no histórico do usuário.
   - Poucas confirmações → `202`, fica "minting"; use **Verificar emissão** depois.
   - Qualquer divergência → recusada com o motivo e a recompensa volta a "aprovada".
   - O mesmo hash não vale para duas recompensas.
5. Alternativas: **Registrar hash de mint** (se emitiu por fora, no Etherscan/Remix — também conferido na blockchain) ou `TOKEN_MINTER_PRIVATE_KEY` no servidor (emissão automática pelo botão "Emitir (mint)"; só funciona se a chave for o owner).
Nenhuma chave privada passa pelo servidor no fluxo da carteira. O usuário precisa ter vinculado a carteira para aparecer na lista.

## 8. API
Públicas: `GET /bot/token/{config,info,catalog,transparency}`.
Usuário (Bearer = ID token do Firebase): `GET /me`, `GET /transfers`, `GET /access/:featureId`, `POST /wallet/nonce`, `POST /wallet/link`, `POST /orders`, `POST /orders/:id/submit`.
Admin (`/bot/adm/token/…`): `GET /status`, `GET /users`, `GET|PUT /catalog[/:id]`, `GET /purchases`, `GET|POST /rewards` (aceita `uid` no lugar de `recipient`), `POST /rewards/:id/{approve,reject,claim,release,manual,mint}`. `manual` agora **confere o mint na blockchain** (não aceita mais um hash qualquer).

Para travar uma funcionalidade existente do OctoCookie (ex.: um endpoint do bot), basta o servidor consultar `store.entitlements(uid)` / `GET /token/access/:featureId`. **Esta entrega cria a camada de compra e consulta; ela ainda não bloqueia as telas atuais**, para não remover funcionalidades sem sua decisão.

## 9. Segurança — pendências suas
- O zip enviado contém um `.env` com **chaves Groq reais**. Considere-as expostas: **revogue e gere novas**. O `.gitignore` agora ignora `.env`.
- `public/octocookie-app/bot-config.js` publica o `OWNER_TOKEN` do Bot 24/7 (comportamento já existente e documentado no projeto). Esse token não é usado pelo módulo do token.
- Armazenamento em arquivo JSON (`/data/token.json`) é adequado a um único servidor; para escalar horizontalmente, migre para um banco.
- Faça backup do disco `/data`: ele guarda compras, desbloqueios e recompensas.
- Recompensas automáticas por atividade da comunidade (posts, desafios) dependem de regras suas; hoje o admin registra cada uma com referência única.
