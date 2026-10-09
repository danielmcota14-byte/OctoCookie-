import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { shareToCommunity } from "@/lib/share-to-community";
import { AuthModal } from "./auth-modal";
import type { SharePayload } from "@/lib/share-to-community";

type Props = {
  source: SharePayload["source"];
  label: string;
  payload: Record<string, unknown>;
  title?: string;
  body?: string;
  communityId?: string;
  className?: string;
};

/**
 * Botão genérico para compartilhar qualquer dado do app na comunidade.
 * Coloque em páginas do Cryptex, Analyzer, Simulator, etc.
 */
export function ShareAppDataButton({
  source,
  label,
  payload,
  title,
  body,
  communityId = "octocookie",
  className,
}: Props) {
  const { user, profile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleShare() {
    if (!user || !profile) {
      setAuthOpen(true);
      return;
    }
    setLoading(true);
    try {
      await shareToCommunity({
        communityId,
        source,
        label,
        payload,
        title: title || `Compartilhei: ${label}`,
        body,
        author: {
          uid: user.uid,
          displayName: profile.displayName,
          username: profile.username,
          photoURL: profile.photoURL,
        },
      });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao compartilhar. Verifique se o Firestore está configurado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={handleShare}
        disabled={loading}
      >
        <Share2 className="mr-1.5 h-3.5 w-3.5" />
        {done ? "Compartilhado!" : loading ? "Enviando..." : "Compartilhar na Comunidade"}
      </Button>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
