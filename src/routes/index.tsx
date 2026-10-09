import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCommunities, listPosts, DEFAULT_COMMUNITIES, createCommunity } from "@/lib/social";
import type { Community, Post } from "@/lib/social-types";
import { PostCard } from "@/components/social/post-card";
import { AuthModal } from "@/components/social/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Users, Flame, Clock, Trophy } from "lucide-react";
import { CryptoTicker } from "@/components/crypto-ticker";

export const Route = createFileRoute("/community/")({
  head: () => ({
    meta: [
      { title: "OctoCommunity — Rede Social Web3" },
      {
        name: "description",
        content:
          "Rede social estilo Reddit focada em Web3 e criptomoedas. Compartilhe dados do OctoCookie, discuta BTC, ETH, DeFi e mais.",
      },
    ],
  }),
  component: CommunityHome,
});

function CommunityHome() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot");
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let list = await listCommunities();
        if (list.length === 0 && user) {
          for (const c of DEFAULT_COMMUNITIES) {
            try {
              await createCommunity({
                ...c,
                createdBy: user.uid,
                id: c.id,
              });
            } catch {
              /* já existe */
            }
          }
          list = await listCommunities();
        }
        setCommunities(list);
        const { posts: p } = await listPosts({ sort, max: 30 });
        setPosts(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sort, user?.uid]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← OctoCookie
            </Link>
            <span className="text-sm font-bold">🐙 OctoCommunity</span>
          </div>
          <div className="flex items-center gap-2">
            {!authLoading &&
              (user && profile ? (
                <>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    u/{profile.username} · {profile.karma} karma
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Sair
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setAuthOpen(true)}>
                  Entrar
                </Button>
              ))}
          </div>
        </div>
      </header>

      <CryptoTicker />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-4">
        <main className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant={sort === "hot" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSort("hot")}
            >
              <Flame className="mr-1 h-3.5 w-3.5" /> Hot
            </Button>
            <Button
              variant={sort === "new" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSort("new")}
            >
              <Clock className="mr-1 h-3.5 w-3.5" /> New
            </Button>
            <Button
              variant={sort === "top" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSort("top")}
            >
              <Trophy className="mr-1 h-3.5 w-3.5" /> Top
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando feed...</p>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhum post ainda. Entre em uma comunidade e publique o primeiro!
            </div>
          ) : (
            posts.map((p) => (
              <PostCard key={p.id} post={p} onNeedAuth={() => setAuthOpen(true)} />
            ))
          )}
        </main>

        <aside className="hidden w-64 shrink-0 space-y-3 lg:block">
          <div className="rounded-lg border bg-card p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Users className="h-4 w-4" /> Comunidades
            </h3>
            <ul className="space-y-1">
              {communities.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/community/$communityId"
                    params={{ communityId: c.id }}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span className="font-medium">c/{c.id}</span>
                    <span className="text-xs text-muted-foreground">{c.memberCount}</span>
                  </Link>
                </li>
              ))}
              {communities.length === 0 && (
                <li className="text-xs text-muted-foreground">
                  Faça login para inicializar as comunidades padrão.
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Sobre o OctoCommunity</p>
            <p className="mt-1">
              Rede social estilo Reddit focada em Web3. Compartilhe portfolios do Cryptex,
              análises e discuta cripto com a comunidade.
            </p>
          </div>
        </aside>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
