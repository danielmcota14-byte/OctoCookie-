# Design OctoCookie — "tinta + selo holográfico"

Um único sistema visual para todo o projeto.

- **Tokens:** `public/octo.css` (claro "maré" / escuro "fundo do mar"). Fonte única das cores.
- **Tema:** `public/octo.js` (páginas estáticas) e `src/lib/theme.ts` (app React). Mesma chave `octo-theme` no localStorage, então o site e os iframes ficam sincronizados.
- **Fontes (hospedadas em `public/fonts`):** Bricolage Grotesque (interface), Source Serif 4 (texto da pesquisa), JetBrains Mono (dados).
- **Páginas legadas:** `public/octo-legacy.css` só remapeia variáveis (`<html data-octo="bot|analisador|carteira|adm|cookiescript">`). Nenhum JavaScript foi alterado.
- **Entrada:** `public/universo.html`, com números reais da pesquisa (Tabelas 3 e 4).
- **Pesquisa:** `public/pesquisa.html` (pesquisa do OctoCookie, com o Holograma como uma seção; usa `octo.css`/`octo.js`) e rota `/pesquisa`. A pesquisa original do Holograma continua em `holograma/pesquisa.html`.
- **CookieScript** roda em outro servidor: leva cópias de `octo.css`, `octo.js`, `octo-legacy.css` e `fonts/`. O tema nele segue o sistema do navegador (não compartilha localStorage com o site).
