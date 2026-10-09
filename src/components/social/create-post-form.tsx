import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createPost } from "@/lib/social";
import type { Post, PostType } from "@/lib/social-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  communityId: string;
  onCreated: (post: Post) => void;
  onNeedAuth: () => void;
  /** Pré-preenche com dados do app (share) */
  initialAppData?: Post["appData"];
};

export function CreatePostForm({
  communityId,
  onCreated,
  onNeedAuth,
  initialAppData,
}: Props) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState(
    initialAppData ? `Compartilhei: ${initialAppData.label}` : ""
  );
  const [body, setBody] = useState("");
  const [type, setType] = useState<PostType>(
    initialAppData ? "share_app_data" : "text"
  );
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) {
      onNeedAuth();
      return;
    }
    if (!title.trim()) {
      setError("Título obrigatório");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const post = await createPost({
        communityId,
        authorId: user.uid,
        authorName: profile.displayName,
        authorUsername: profile.username,
        authorPhoto: profile.photoURL,
        title: title.trim(),
        body: body.trim() || undefined,
        type,
        linkUrl: type === "link" ? linkUrl : undefined,
        appData: type === "share_app_data" ? initialAppData : undefined,
      });
      onCreated(post);
      setTitle("");
      setBody("");
      setLinkUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Criar post em c/{communityId}</h3>

      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as PostType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="share_app_data">Dados do App</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Título</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Um título chamativo..."
          maxLength={300}
          required
        />
      </div>

      {type === "link" && (
        <div className="space-y-1.5">
          <Label>URL</Label>
          <Input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>
      )}

      {(type === "text" || type === "share_app_data") && (
        <div className="space-y-1.5">
          <Label>Corpo (opcional)</Label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Conte mais detalhes..."
          />
        </div>
      )}

      {type === "share_app_data" && initialAppData && (
        <div className="rounded border border-dashed border-primary/40 bg-primary/5 p-2 text-xs text-primary">
          📊 Anexando: {initialAppData.label} ({initialAppData.source})
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Publicando..." : "Publicar"}
      </Button>
    </form>
  );
}
