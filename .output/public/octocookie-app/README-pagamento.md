# Verificação de pagamento (Mercado Pago) — Octocookie

## O que foi implementado

- **`netlify/functions/verificar-pagamento.js`**: Netlify Function (backend) que recebe um CPF,
  consulta `GET /v1/payments/search` na API do Mercado Pago usando o `MP_ACCESS_TOKEN` (que fica
  só no servidor) e retorna se existe um pagamento **aprovado** com esse CPF nos últimos 30 dias.
- **`octocookie1.html`**: a seção "Controle do Bot" agora tem um campo de CPF + botão
  "Verificar pagamento". Ao confirmar, o controle manual do bot (BUY/SELL/reset) é liberado.

## Por que não usamos "extrato bancário"

Não existe uma API legítima que permita consultar o extrato bancário de um CPF qualquer só de
posse do número — isso exigiria acesso à conta via Open Finance Brasil, com consentimento
explícito do titular, não é algo que se "puxa" no backend de um site. Por isso a confirmação usa
o **histórico de transações da própria conta Mercado Pago** (a mesma que recebe o pagamento),
que já é a fonte de verdade sobre se o link de pagamento foi pago.

## Configuração

1. Copie `.env.example` para `.env` (uso local) **ou** cadastre as variáveis em
   **Netlify → Site configuration → Environment variables**:
   - `MP_ACCESS_TOKEN` (nunca no frontend)
   - `MP_PUBLIC_KEY` (pode ir no frontend, se um dia precisar do Checkout Bricks)
2. Deploy no Netlify normalmente — a function fica disponível em
   `/.netlify/functions/verificar-pagamento`.
3. Para rodar localmente com as functions: `netlify dev` (Netlify CLI).

## Limitações importantes (leia antes de ir pra produção)

- **Confiabilidade do CPF**: qualquer pessoa pode digitar qualquer CPF no campo. Isso só confirma
  que *algum* pagamento aprovado existe com aquele CPF — não confirma que é a mesma pessoa
  usando o site agora. Para produção, o ideal é gerar o link de pagamento com
  `external_reference` único por usuário (ex: o ID de sessão/login dele) e conferir esse
  `external_reference` em vez do CPF — muito mais seguro que confiar em CPF digitado livremente.
- **Paginação/volume**: a busca varre até 300 pagamentos recentes (6 páginas de 50). Com alto
  volume de vendas, prefira um **webhook (IPN)** do Mercado Pago que salva o pagamento (CPF,
  status, `external_reference`) num banco de dados no momento da aprovação — mais rápido,
  mais confiável e sem depender de varredura.
- **Credenciais de teste**: as credenciais no `.env.example` são de sandbox (`TEST-...`). Troque
  por credenciais de produção antes de cobrar de verdade, mantendo o padrão de variável de
  ambiente (nunca hardcoded no HTML/JS).
