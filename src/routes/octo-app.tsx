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
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b py-3 pl-14 pr-4 md:px-6">
          <h1 className="truncate text-sm font-medium">Bot Trading</h1>
          <a
            href="/octocookie-app/octocookie1.html"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
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
