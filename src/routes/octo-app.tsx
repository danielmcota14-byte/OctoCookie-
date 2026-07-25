import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/octo-app")({
  head: () => ({
    meta: [
      { title: "Bot Trading — Swap Trader educacional" },
      {
        name: "description",
        content:
          "Bot Trading: painel educacional de swap trading em DEX com dashboard analisador integrado, dentro do OctoCookie.",
      },
      { property: "og:title", content: "Bot Trading — Swap Trader educacional" },
      {
        property: "og:description",
        content: "Painel educacional de swap trading integrado ao OctoCookie.",
      },
    ],
  }),
  component: BotTrading,
});

function BotTrading() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-6 py-3">
          <h1 className="text-sm font-medium">Bot Trading</h1>
          <a
            href="/octocookie-app/octocookie.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Abrir em nova aba
          </a>
        </div>
        <iframe
          src="/octocookie-app/octocookie.html"
          title="Bot Trading"
          className="h-full w-full flex-1 border-0 bg-background"
        />
      </main>
    </div>
  );
}
