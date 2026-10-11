import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/bot-24x7")({
  head: () => ({
    meta: [
      { title: "Bot 24/7 — OctoCookie" },
      {
        name: "description",
        content: "Status do bot 24/7 que roda o octocookie.html no seu servidor.",
      },
    ],
  }),
  component: Bot24Page,
});

// Mesma chave que o card "Bot 24/7 no servidor" do Bot Trading usa (octocookie.247.v2 → url)
const CARD_KEY = "octocookie.247.v2";

type BotStatus = {
  ok?: boolean;
  running?: boolean;
  armed?: boolean;
  symbol?: string;
  price?: number | null;
  lastError?: string | null;
};

function envBotUrl(): string {
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_BOT_24X7_URL;
    return typeof v === "string" ? v.trim().replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

function savedUrl(): string {
  try {
    const c = JSON.parse(localStorage.getItem(CARD_KEY) || "{}");
    if (typeof c.url === "string" && c.url.trim()) return c.url.trim().replace(/\/+$/, "");
  } catch {
    /* ignore */
  }
  return envBotUrl();
}

function Bot24Page() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    setUrl(savedUrl());
  }, []);

  const base = url.trim().replace(/\/+$/, "");

  const refresh = useCallback(async () => {
    if (!base) {
      setError("Informe a URL do seu servidor 24/7 (ou defina VITE_BOT_24X7_URL no deploy).");
      return;
    }
    if (!/^https:\/\/[^\s/]+/i.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(base)) {
      setError("URL inválida. Use a URL do serviço bot-server (ex.: https://seu-bot.onrender.com), não a rota /octo-app do site.");
      setStatus(null);
      return;
    }
    if (/\/octo-app\/?$/i.test(base) || /\/bot-24x7\/?$/i.test(base)) {
      setError("Essa URL é do site React, não do bot-server. Deploy o bot-server à parte e use a URL dele (sem /octo-app).");
      setStatus(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${base}/status`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("HTTP 404 — endpoint /status não existe nessa URL. Confira se é o serviço bot-server (não o site principal).");
        }
        throw new Error(`HTTP ${res.status}`);
      }
      setStatus((await res.json()) as BotStatus);
    } catch (e: unknown) {
      setStatus(null);
      setError(
        e instanceof Error
          ? e.message + " — confira a URL e se o serviço está de pé (plano free dorme)."
          : "Falha ao conectar",
      );
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    if (!base) return;
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [base, refresh]);

  const label = status?.running
    ? "● RODANDO 24/7"
    : status?.armed
      ? "◐ ARMADO (aguardando a página iniciar)"
      : status
        ? "🔒 TRANCADO / PARADO"
        : "○ Sem resposta";

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex flex-1 flex-col overflow-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b py-3 pl-14 pr-4 md:px-6">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <h1 className="text-sm font-medium">Bot 24/7 (servidor)</h1>
          </div>
          <Link to="/octo-app" className="text-xs text-muted-foreground hover:text-foreground">
            Bot Trading →
          </Link>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Aqui você só acompanha o status. Para parear a carteira, ligar e parar o bot, use o card{" "}
              <b>“Bot 24/7 no servidor”</b> em <Link to="/octo-app" className="underline">Bot Trading</Link>: a
              chave viaja por Diffie-Hellman + AES-256 e a chave K que abre a carteira volta para você.
            </p>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-bot.onrender.com"
              />
              <Button onClick={refresh} disabled={loading || !base}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Atualizar
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-card p-4">
            <div
              className={`text-sm font-semibold ${status?.running ? "text-green-500" : "text-muted-foreground"}`}
            >
              {label}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {status && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Par</span>
                  <div>{status.symbol ?? "—"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço</span>
                  <div>{status.price ? `$${status.price.toFixed(2)}` : "—"}</div>
                </div>
                {status.lastError && (
                  <div className="col-span-2 text-xs text-destructive">Último erro: {status.lastError}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
