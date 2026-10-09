import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getCommunity,
  listPosts,
  joinCommunity,
  leaveCommunity,
  isMember,
} from "@/lib/social";
import type { Community, Post } from "@/lib/social-types";
import { PostCard } from "@/components/social/post-card";
import { CreatePostForm } from "@/components/social/create-post-form";
import { AuthModal } from "@/components/social/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { CryptoTicker } from "@/components/crypto-ticker";
import { Users, Flame, Clock } from "lucide-react";

export const Route = createFileRoute("/community/$communityId")({
  head: ({ params }) => ({
    meta: [
      { title: `c/${params.communityId} — OctoCommunity` },
      { name: "description", content: `Comunidade c/${params.communityId} no OctoCommunity` },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { communityId } = Route.useParams();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<"hot" | "new">("hot");
  const [member, setMember] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const c = await getCommunity(communityId);
        setCommunity(c);
        const { posts: p } = await listPosts({
          communityId,
          sort,
          max: 40,
        });
        setPosts(p);
        if (user) {
          setMember(await isMember(user.uid, communityId));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [communityId, sort, user?.uid]);

  async function handleJoin() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    await joinCommunity(user.uid, communityId);
    setMember(true);
    setCommunity((prev) =>
      prev ? { ...prev, memberCount: prev.memberCount + 1 } : prev
    );
  }

  async function handleLeave() {
    if (!user) return;
    await leaveCommunity(user.uid, communityId);
    setMember(false);
    setCommunity((prev) =>
      prev ? { ...prev, memberCount: Math.max(0, prev.memberCount - 1) } : prev
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link
              to="/community"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Comunidades
            </Link>
            <span className="text-sm font-bold">c/{communityId}</span>
          </div>
          <div className="flex items-center gap-2">
            {!authLoading &&
              (user && profile ? (
                <>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    u/{profile.username}
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

      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        {/* Banner comunidade */}
        <div className="mb-4 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">c/{communityId}</h1>
              {community && (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {community.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {community.memberCount} membros
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {member ? (
                <Button variant="outline" size="sm" onClick={handleLeave}>
                  Sair da comunidade
                </Button>
              ) : (
                <Button size="sm" onClick={handleJoin}>
                  Entrar
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (!user) setAuthOpen(true);
                  else setShowCreate((v) => !v);
                }}
              >
                Criar post
              </Button>
            </div>
          </div>
          {community?.rules && community.rules.length > 0 && (
            <ul className="mt-3 list-inside list-disc text-xs text-muted-foreground">
              {community.rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>

        {showCreate && (
          <div className="mb-4">
            <CreatePostForm
              communityId={communityId}
              onCreated={(p) => {
                setPosts((prev) => [p, ...prev]);
                setShowCreate(false);
              }}
              onNeedAuth={() => setAuthOpen(true)}
            />
          </div>
        )}

        <div className="mb-3 flex gap-2">
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
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum post nesta comunidade ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} onNeedAuth={() => setAuthOpen(true)} />
            ))}
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
