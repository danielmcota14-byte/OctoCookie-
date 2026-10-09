import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Server,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/bot-24x7")({
  head: () => ({
    meta: [
      { title: "Bot 24/7 — OctoCookie" },
      {
        name: "description",
        content: "Controle do bot de paper trading 24/7 hospedado no Render.",
      },
    ],
  }),
  component: Bot24Page,
});

const STORAGE_KEY = "octocookie_bot24_url";

type BotStatus = {
  status?: string;
  running?: boolean;
  symbol?: string;
  price?: number;
  position?: string | number;
  equity?: number;
  signal?: number;
  lastAction?: string;
  lastError?: string | null;
  wins?: number;
  losses?: number;
  uptimeSec?: number;
  logs?: { ts: number; level: string; msg: string }[];
  trades?: {
    ts: number;
    side: string;
    entry: number;
    exit: number;
    pnlPct: number;
    reason: string;
  }[];
};

function Bot24Page() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    const saved = localStorage.getItem(STORAGE_KEY) || "";
    setUrl(saved);
  }, []);

  const base = url.replace(/\/$/, "");

  const refresh = useCallback(async () => {
    if (!base) {
      setError("Cole a URL do Render e salve.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${base}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BotStatus;
      setStatus(data);
    } catch (e: unknown) {
      setStatus(null);
      setError(
        e instanceof Error
          ? e.message + " — confira a URL e se o serviço acordou (plano free pode dormir)."
          : "Falha ao conectar"
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

  function saveUrl() {
    const u = url.trim().replace(/\/$/, "");
    setUrl(u);
    localStorage.setItem(STORAGE_KEY, u);
    setTimeout(refresh, 100);
  }

  async function call(path: string) {
    if (!base) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}${path}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  const online =
    status?.status === "online" || status?.running === true;
  const pos =
    status?.position === 1
      ? "LONG"
      : status?.position === 0
        ? "CASH"
        : String(status?.position ?? "—");

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex flex-1 flex-col overflow-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b py-3 pl-14 pr-4 md:px-6">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <h1 className="text-sm font-medium">Bot 24/7 (servidor)</h1>
          </div>
          <Link
            to="/octo-app"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Bot Trading (navegador)
          </Link>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Conecte a URL do seu serviço no Render. O bot roda paper trading
              24/7 com preços reais da Binance, mesmo com o PC desligado.
            </p>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://octocookie-bot-24x7.onrender.com"
              />
              <Button onClick={saveUrl} disabled={loading}>
                Salvar
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`text-sm font-semibold ${online ? "text-green-500" : "text-muted-foreground"}`}
              >
                {online ? "● ONLINE 24/7" : "○ Offline / pausado"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading || !base}
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Atualizar
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {status && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Par</span>
                  <p className="font-medium">{status.symbol}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço</span>
                  <p className="font-medium">
                    ${Number(status.price || 0).toLocaleString("en-US", {
                      maximumFractionDigits: 4,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Posição</span>
                  <p className="font-medium">{pos}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Equity</span>
                  <p className="font-medium">
                    ${Number(status.equity || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sinal</span>
                  <p className="font-medium">{status.signal ?? "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">W / L</span>
                  <p className="font-medium">
                    {status.wins ?? 0} / {status.losses ?? 0}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Última ação</span>
                  <p className="font-medium">{status.lastAction || "—"}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => call("/start")}
                disabled={loading || !base}
              >
                <Play className="mr-1 h-3.5 w-3.5" /> Start
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => call("/stop")}
                disabled={loading || !base}
              >
                <Square className="mr-1 h-3.5 w-3.5" /> Stop
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("Zerar saldo paper?")) call("/reset");
                }}
                disabled={loading || !base}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
              </Button>
              {base && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={base} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" /> API
                  </a>
                </Button>
              )}
            </div>
          </div>

          {status?.trades && status.trades.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Últimos trades</h3>
              <ul className="space-y-1 text-xs">
                {status.trades.slice(0, 10).map((t, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>
                      {t.side} · {t.reason}
                    </span>
                    <span
                      className={
                        t.pnlPct >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {t.pnlPct >= 0 ? "+" : ""}
                      {t.pnlPct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status?.logs && status.logs.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Logs</h3>
              <div className="max-h-40 space-y-0.5 overflow-auto font-mono text-[10px] text-muted-foreground">
                {status.logs.slice(0, 20).map((l, i) => (
                  <div key={i}>
                    [{new Date(l.ts).toLocaleTimeString()}] {l.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
