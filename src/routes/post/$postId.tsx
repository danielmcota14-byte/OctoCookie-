import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPost, listComments, createComment, vote } from "@/lib/social";
import type { Post, Comment } from "@/lib/social-types";
import { AuthModal } from "@/components/social/auth-modal";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { CryptoTicker } from "@/components/crypto-ticker";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/post/$postId")({
  head: () => ({
    meta: [{ title: "Post — OctoCommunity" }],
  }),
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  const { user, profile, signOut } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await getPost(postId);
        setPost(p);
        if (p) setScore(p.score);
        const c = await listComments(postId);
        setComments(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  async function handleVote(value: 1 | -1) {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    const prev = myVote;
    await vote(user.uid, postId, "post", value);
    if (prev === value) {
      setMyVote(0);
      setScore((s) => s - value);
    } else if (prev === 0) {
      setMyVote(value);
      setScore((s) => s + value);
    } else {
      setMyVote(value);
      setScore((s) => s + value * 2);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) {
      setAuthOpen(true);
      return;
    }
    if (!body.trim()) return;
    const c = await createComment({
      postId,
      authorId: user.uid,
      authorName: profile.displayName,
      authorUsername: profile.username,
      authorPhoto: profile.photoURL,
      body: body.trim(),
    });
    setComments((prev) => [...prev, c]);
    setBody("");
    if (post) setPost({ ...post, commentCount: post.commentCount + 1 });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">Post não encontrado.</p>
        <Link to="/community" className="text-sm text-primary underline">
          Voltar às comunidades
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-4 px-4">
          <Link
            to="/community/$communityId"
            params={{ communityId: post.communityId }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← c/{post.communityId}
          </Link>
          {user && profile ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sair
            </Button>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true)}>
              Entrar
            </Button>
          )}
        </div>
      </header>

      <CryptoTicker />

      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <article className="flex gap-3 rounded-lg border bg-card p-4">
          <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleVote(1)}
              className={cn("rounded p-0.5 hover:bg-muted", myVote === 1 && "text-orange-500")}
            >
              <ArrowBigUp className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold tabular-nums">{score}</span>
            <button
              type="button"
              onClick={() => handleVote(-1)}
              className={cn("rounded p-0.5 hover:bg-muted", myVote === -1 && "text-blue-500")}
            >
              <ArrowBigDown className="h-5 w-5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 text-xs text-muted-foreground">
              <Link
                to="/community/$communityId"
                params={{ communityId: post.communityId }}
                className="font-semibold text-foreground hover:underline"
              >
                c/{post.communityId}
              </Link>
              {" · "}
              u/{post.authorUsername}
              {" · "}
              {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ptBR })}
            </div>
            <h1 className="text-xl font-bold">{post.title}</h1>
            {post.body && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
            )}
            {post.type === "link" && post.linkUrl && (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {post.linkUrl}
              </a>
            )}
            {post.type === "share_app_data" && post.appData && (
              <div className="mt-3 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-sm">
                <p className="font-medium text-primary">
                  📊 {post.appData.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fonte: {post.appData.source}
                </p>
                <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted/50 p-2 text-xs">
                  {JSON.stringify(post.appData.payload, null, 2)}
                </pre>
              </div>
            )}
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.commentCount} comentários
            </p>
          </div>
        </article>

        {/* Novo comentário */}
        <form onSubmit={handleComment} className="mt-4 space-y-2">
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={user ? "Escreva um comentário..." : "Faça login para comentar"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!user}
          />
          <Button type="submit" size="sm" disabled={!user || !body.trim()}>
            Comentar
          </Button>
        </form>

        {/* Lista de comentários */}
        <div className="mt-6 space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border bg-card p-3"
              style={{ marginLeft: Math.min(c.depth, 4) * 16 }}
            >
              <div className="mb-1 text-xs text-muted-foreground">
                u/{c.authorUsername} ·{" "}
                {formatDistanceToNow(c.createdAt, { addSuffix: true, locale: ptBR })}
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-medium">{c.score}</span> pontos
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
