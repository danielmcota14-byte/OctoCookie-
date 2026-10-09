import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/social-types";
import { vote } from "@/lib/social";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  post: Post;
  onNeedAuth?: () => void;
};

export function PostCard({ post, onNeedAuth }: Props) {
  const { user } = useAuth();
  const [score, setScore] = useState(post.score);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [voting, setVoting] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (!user) {
      onNeedAuth?.();
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const prev = myVote;
      await vote(user.uid, post.id, "post", value);
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
    } catch (e) {
      console.error(e);
    } finally {
      setVoting(false);
    }
  }

  return (
    <article className="flex gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30">
      {/* Votes */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={() => handleVote(1)}
          className={cn(
            "rounded p-0.5 hover:bg-muted",
            myVote === 1 && "text-orange-500"
          )}
          aria-label="Upvote"
        >
          <ArrowBigUp className="h-5 w-5" />
        </button>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            score > 0 && "text-orange-500",
            score < 0 && "text-blue-500"
          )}
        >
          {score}
        </span>
        <button
          type="button"
          onClick={() => handleVote(-1)}
          className={cn(
            "rounded p-0.5 hover:bg-muted",
            myVote === -1 && "text-blue-500"
          )}
          aria-label="Downvote"
        >
          <ArrowBigDown className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <Link
            to="/community/$communityId"
            params={{ communityId: post.communityId }}
            className="font-semibold text-foreground hover:underline"
          >
            c/{post.communityId}
          </Link>
          <span>·</span>
          <span>u/{post.authorUsername}</span>
          <span>·</span>
          <time>
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ptBR })}
          </time>
          {post.flair && (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {post.flair}
            </span>
          )}
        </div>

        <Link
          to="/post/$postId"
          params={{ postId: post.id }}
          className="block"
        >
          <h2 className="text-base font-semibold leading-snug text-foreground hover:text-primary">
            {post.title}
          </h2>
        </Link>

        {post.body && post.type === "text" && (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {post.body}
          </p>
        )}

        {post.type === "link" && post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {new URL(post.linkUrl).hostname}
          </a>
        )}

        {post.type === "share_app_data" && post.appData && (
          <div className="mt-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-2 text-xs">
            <span className="font-medium text-primary">
              📊 Dados do app · {post.appData.label}
            </span>
            <span className="ml-2 text-muted-foreground">
              (fonte: {post.appData.source})
            </span>
          </div>
        )}

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="mt-2 max-h-64 rounded-md object-cover"
          />
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Link
            to="/post/$postId"
            params={{ postId: post.id }}
            className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-muted"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {post.commentCount} comentários
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-muted"
            onClick={() => {
              navigator.clipboard?.writeText(
                `${window.location.origin}/post/${post.id}`
              );
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartilhar
          </button>
        </div>
      </div>
    </article>
  );
}
