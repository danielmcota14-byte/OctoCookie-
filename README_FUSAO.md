# OctoCookie + Holograma Quântico

O limitador de perdas está **dentro do `public/octocookie-app/octocookie.html`** (card "Limitador de Perdas", antes dos gráficos).
Nenhuma página, rota ou item de menu novo foi criado no site: `src/` está idêntico ao original.

## O que o card faz (tudo no navegador, JavaScript puro)
- Barra de risco 0–100% (ETH no patrimônio, stop, limiar de tendência e janela), barra automática por limite de queda, stop móvel ou queda da carteira.
- Carteira virtual de $10.000 de mentira (guardada no navegador, com botão de zerar).
- Histórico: sistema x comprar e segurar, queda máxima, trocas e chance de perda em 30 dias.
- Sistema quântico: simulador de 8 qubits (sem Qiskit), com mapa de qubits e holograma.
- Dados: preço e velas de 8h direto da Binance. A execução de ordens do bot não foi alterada.

## Conferência
O mesmo código foi comparado com o Python na mesma série: circuito com diferença menor que 1e-14, curva da barra e queda da carteira menor que 1e-12.
O card foi testado em DOM simulado (jsdom), com dados sintéticos. Não foi aberto em navegador real.

## Pasta `holograma/`
Python original, `pesquisa.html` e `node/` (as mesmas bibliotecas em TypeScript e a bateria: `node --experimental-strip-types holograma/node/bateria.ts`).

## Não incluído
Execução on-chain do Python (Sepolia) e `--stop-vivo` (nunca testado).

## Segurança
O zip original trazia um `.env` com uma GROQ_API_KEY. Ele não foi copiado: revogue essa chave e crie outra.


## Modos do trader (seletor no topo do card do Holograma)
1. **Trader original:** o seu código de RSI/SMA/MACD/Bollinger decide e opera. `startTradingStrategy`,
   `checkDailyLimits`, indicadores, checagens de segurança, `processSwap` e `handleSwapResult` estão idênticos ao original
   (a única diferença é um despacho de modo e o ponto de veto). O painel do Holograma é só pré-visualização.
2. **Trader original + limitador do Holograma:** o seu trader gera os sinais; o Holograma só VETA: BUY só com tendência de alta
   e sem stop móvel acionado, SELL só com tendência fora/baixa. Não manda ordens. Sem dados do holograma, deixa passar.
3. **Só Holograma:** a regra do holograma_quantico.py decide (o comportamento da versão anterior), com o filtro de entrada opcional abaixo.
O modo não troca com o bot rodando.

## Filtro de entrada (modo "Só Holograma")
Só segura a ENTRADA comprada: a regra precisa mandar comprar E RSI(14) na faixa normal, preço > SMA20, MACD > 0 e preço dentro do Bollinger confirmar.
Modos: votação (mínimo de 1 a 4, padrão 3), estrito (os 4) ou desligado.

## Deploy no Vercel
1. Atualize as dependências TanStack (já com override `>=1.169.39` / `>=1.168.60` para o CVE XSS).
2. Em **Project → Settings → Environment Variables**, crie:
   - `GROQ_API_KEY` = sua chave `gsk_...` (Production, Preview e Development)
3. **Não** use o prefixo `VITE_` na chave da Groq (ficaria pública no bundle).
4. Redeploy após salvar as variáveis.
5. A IA do chat, o analisador e o simulador leem `process.env.GROQ_API_KEY` só no servidor.
