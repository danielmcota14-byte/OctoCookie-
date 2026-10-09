import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import mascot from "@/assets/octocookie-mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cryptex — Carteira educacional OctoCookie" },
      {
        name: "description",
        content:
          "Cryptex é a carteira cripto educacional do OctoCookie: aprenda sobre wallets, redes EVM, tokens, gas e portfolio de forma didática.",
      },
      { property: "og:title", content: "Cryptex — Carteira educacional OctoCookie" },
      {
        property: "og:description",
        content: "Carteira cripto educacional integrada ao OctoCookie.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b py-3 pl-14 pr-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <img src={mascot} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
            <h1 className="truncate text-sm font-medium">Cryptex — Carteira</h1>
          </div>
          <a
            href="/octocookie-app/cryptex.html"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Abrir em nova aba
          </a>
        </div>
        <iframe
          src="/octocookie-app/cryptex.html"
          title="Cryptex"
          className="h-full w-full flex-1 border-0 bg-background"
        />
      </main>
    </div>
  );
}
