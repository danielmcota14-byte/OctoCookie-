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
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-2">
            <img src={mascot} alt="" width={20} height={20} className="h-5 w-5" />
            <h1 className="text-sm font-medium">Cryptex — Carteira</h1>
          </div>
          <a
            href="/octocookie-app/cryptex.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
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
