# Backtest por usuário — regra real do bot (Holograma, modo tendência)

Dados reais ETHUSDT (Binance spot), velas de 8h de 2022-01-01 a 2026-10-10 (5229 velas). Motor: o próprio núcleo do `octocookie.html` (decidir/stop móvel/filtros), uma passada por vela de 8h, com a posição inicial e o rebalanceamento do bot. Um usuário novo começa a cada 2 dias; cada um é seguido por 30, 90, 180 e 365 dias.

**Custos por usuário:** 0.15% por troca (pool 0,05% + spread/slippage), gás US$ 2 (compra, com approve) / 1.5 (venda) / 0.3 (envio da taxa), taxa de serviço 2% do lucro de cada operação vencedora. Capital inicial 100% em USDC.

**Leitura:** p5 = pior 5% dos casos; p95 = melhor 5%. 'Queda máx.' = maior queda do pico ao vale durante a janela. As janelas se sobrepõem (começam a cada 2 dias) e cobrem só ~4,8 anos, então valem como ordem de grandeza, não como promessa. Gás fixo pesa muito em contas pequenas.


## Janela de 30d — conta de US$ 1.000

| Perfil | Pior 5% | Mediana | Melhor 5% | Chance de perda | Queda máx. típica / pior | Comprar e segurar ETH (pior 5% / mediana / melhor 5%) |
|---|---|---|---|---|---|---|
| Defensivo (barra 20) | -3% (US$ -30) | -1% | +4% (US$ +35) | 60% | 2% / 5% | -30% / -0% / +42% |
| Cauteloso (barra 35) | -5% (US$ -49) | -1% | +9% (US$ +88) | 62% | 3% / 9% | -30% / -0% / +42% |
| Equilibrado (barra 55) | -8% (US$ -85) | -1% | +16% (US$ +162) | 60% | 5% / 15% | -30% / -0% / +42% |
| Crescimento (barra 75) | -12% (US$ -120) | -1% | +21% (US$ +206) | 61% | 7% / 22% | -30% / -0% / +42% |
| Como foi testado (barra 100) | -17% (US$ -171) | -3% | +32% (US$ +315) | 60% | 10% / 30% | -30% / -0% / +42% |

## Janela de 90d — conta de US$ 1.000

| Perfil | Pior 5% | Mediana | Melhor 5% | Chance de perda | Queda máx. típica / pior | Comprar e segurar ETH (pior 5% / mediana / melhor 5%) |
|---|---|---|---|---|---|---|
| Defensivo (barra 20) | -5% (US$ -45) | -2% | +4% (US$ +39) | 77% | 3% / 6% | -46% / -0% / +70% |
| Cauteloso (barra 35) | -9% (US$ -86) | -3% | +13% (US$ +131) | 66% | 7% / 13% | -46% / -0% / +70% |
| Equilibrado (barra 55) | -12% (US$ -122) | -3% | +20% (US$ +199) | 61% | 10% / 21% | -46% / -0% / +70% |
| Crescimento (barra 75) | -20% (US$ -203) | -3% | +26% (US$ +264) | 58% | 15% / 30% | -46% / -0% / +70% |
| Como foi testado (barra 100) | -24% (US$ -237) | -4% | +43% (US$ +425) | 58% | 19% / 38% | -46% / -0% / +70% |

## Janela de 180d — conta de US$ 1.000

| Perfil | Pior 5% | Mediana | Melhor 5% | Chance de perda | Queda máx. típica / pior | Comprar e segurar ETH (pior 5% / mediana / melhor 5%) |
|---|---|---|---|---|---|---|
| Defensivo (barra 20) | -7% (US$ -67) | -3% | +6% (US$ +61) | 83% | 5% / 9% | -52% / +4% / +115% |
| Cauteloso (barra 35) | -13% (US$ -133) | -5% | +20% (US$ +200) | 65% | 11% / 19% | -52% / +4% / +115% |
| Equilibrado (barra 55) | -20% (US$ -200) | -5% | +28% (US$ +277) | 59% | 16% / 28% | -52% / +4% / +115% |
| Crescimento (barra 75) | -22% (US$ -221) | -8% | +34% (US$ +343) | 66% | 21% / 35% | -52% / +4% / +115% |
| Como foi testado (barra 100) | -35% (US$ -346) | -1% | +62% (US$ +619) | 52% | 28% / 45% | -52% / +4% / +115% |

## Janela de 365d — conta de US$ 1.000

| Perfil | Pior 5% | Mediana | Melhor 5% | Chance de perda | Queda máx. típica / pior | Comprar e segurar ETH (pior 5% / mediana / melhor 5%) |
|---|---|---|---|---|---|---|
| Defensivo (barra 20) | -11% (US$ -110) | -6% | +5% (US$ +48) | 77% | 8% / 13% | -47% / +20% / +94% |
| Cauteloso (barra 35) | -20% (US$ -198) | -1% | +18% (US$ +180) | 51% | 17% / 26% | -47% / +20% / +94% |
| Equilibrado (barra 55) | -24% (US$ -244) | -1% | +16% (US$ +164) | 51% | 23% / 40% | -47% / +20% / +94% |
| Crescimento (barra 75) | -31% (US$ -308) | -6% | +25% (US$ +249) | 59% | 33% / 43% | -47% / +20% / +94% |
| Como foi testado (barra 100) | -34% (US$ -338) | +7% | +61% (US$ +610) | 40% | 38% / 51% | -47% / +20% / +94% |

## Tamanho da conta e taxa de 2% (janela de 365d, mediana)

| Perfil | Conta | Retorno mediano | Pior 5% | Gás pago no ano | Ordens no ano | Taxa de 2% paga (US$) |
|---|---|---|---|---|---|---|
| Defensivo (barra 20) | US$ 200 | -26% | -33% | US$ 47 | 26 | 0.29 |
| Defensivo (barra 20) | US$ 1.000 | -6% | -11% | US$ 47 | 26 | 1.63 |
| Defensivo (barra 20) | US$ 10.000 | -2% | -7% | US$ 47 | 26 | 16.61 |
| Cauteloso (barra 35) | US$ 200 | -27% | -45% | US$ 59 | 33 | 0.84 |
| Cauteloso (barra 35) | US$ 1.000 | -1% | -20% | US$ 59 | 33 | 4.70 |
| Cauteloso (barra 35) | US$ 10.000 | +5% | -14% | US$ 59 | 33 | 48.10 |
| Equilibrado (barra 55) | US$ 200 | -25% | -47% | US$ 58 | 32 | 1.40 |
| Equilibrado (barra 55) | US$ 1.000 | -1% | -24% | US$ 58 | 32 | 7.79 |
| Equilibrado (barra 55) | US$ 10.000 | +5% | -19% | US$ 58 | 32 | 79.71 |
| Crescimento (barra 75) | US$ 200 | -30% | -50% | US$ 54 | 30 | 1.86 |
| Crescimento (barra 75) | US$ 1.000 | -6% | -31% | US$ 54 | 30 | 10.32 |
| Crescimento (barra 75) | US$ 10.000 | -1% | -27% | US$ 54 | 30 | 105.48 |
| Como foi testado (barra 100) | US$ 200 | -20% | -63% | US$ 65 | 36 | 2.75 |
| Como foi testado (barra 100) | US$ 1.000 | +7% | -34% | US$ 65 | 36 | 15.87 |
| Como foi testado (barra 100) | US$ 10.000 | +13% | -28% | US$ 65 | 36 | 163.44 |

Reproduzir: `node holograma/backtest_usuarios.mjs` (usa `holograma/dados/ethusdt_1h_2022-2026.json`, velas da Binance copiadas do repositório público finom/static-klines).
