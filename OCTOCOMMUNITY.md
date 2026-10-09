# OctoCommunity — Rede Social Web3 do OctoCookie

Rede social estilo **Reddit** integrada ao OctoCookie, focada em criptomoedas e Web3.

## O que foi implementado

- **Firebase Auth** (e-mail/senha + Google) com o projeto `octo-10d4f`
- **Firestore** para posts, comentários, votos, comunidades e perfis
- **Feed** estilo Reddit: Hot / New / Top
- **Comunidades** (c/bitcoin, c/ethereum, c/defi, c/octocookie, etc.)
- **Posts**: texto, link e **compartilhamento de dados do app** (portfolio, análises…)
- **Votos** (upvote/downvote) e **comentários**
- **Barra de ticker** de criptos (BTC, ETH, SOL, BNB, XRP, ADA, DOGE, AVAX, DOT, LINK) com mini-gráfico sparkline, entre o header e o conteúdo
- Link **Comunidade** na sidebar do app

## Rotas

| Rota | Descrição |
|------|-----------|
| `/community` | Feed geral + lista de comunidades |
| `/community/$communityId` | Página da comunidade + criar post |
| `/post/$postId` | Post individual + comentários |

## Setup Firebase (obrigatório)

1. No [Firebase Console](https://console.firebase.google.com/) → projeto **octo-10d4f**:
   - **Authentication** → ative **Email/Password** e **Google**
   - **Firestore Database** → crie o banco (modo produção)
   - Cole as regras do arquivo `firestore.rules` em **Firestore → Rules → Publish**
2. (Opcional) **Storage** se for permitir upload de imagens nos posts
3. No app:
   ```bash
   npm install
   npm run dev
   ```

## Regras de segurança (resumo)

Arquivo: `firestore.rules`

- Leitura pública de posts, comentários e comunidades
- Só usuário autenticado cria post/comentário/voto
- Autor só edita o próprio conteúdo
- Username único no formato `^[a-z0-9_]+$`
- Score e contadores só mudam via increment (votos)

## Compartilhar dados do app

```ts
import { shareToCommunity } from "@/lib/share-to-community";
import { useAuth } from "@/lib/auth-context";

const { user, profile } = useAuth();

await shareToCommunity({
  communityId: "octocookie",
  source: "cryptex",
  label: "Portfolio Cryptex",
  payload: { totalUsd: 1500, assets: [...] },
  title: "Meu portfolio de estudos 🐙",
  body: "Aprendendo diversificação.",
  author: {
    uid: user!.uid,
    displayName: profile!.displayName,
    username: profile!.username,
    photoURL: profile?.photoURL,
  },
});
```

## Ticker de preços

Componente: `src/components/crypto-ticker.tsx`  
API: CoinGecko (pública, sem chave). Atualiza a cada 60s. Mini-sparkline dos últimos pontos do gráfico de 7 dias.

## Estrutura de coleções Firestore

```
users/{uid}
communities/{slug}
memberships/{uid_communityId}
posts/{postId}
comments/{commentId}
votes/{uid_targetId}
```

## Próximos passos sugeridos

- Cloud Functions para recalcular karma de forma segura
- Moderação (roles admin/mod)
- Upload de imagens no Storage
- Notificações
- Busca full-text
- Dark mode já suportado pelo tema do app
