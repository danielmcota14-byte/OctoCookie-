import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/pesquisa")({
  head: () => ({
    meta: [
      { title: "Holograma — Pesquisa | OctoCookie" },
      {
        name: "description",
        content:
          "Holograma Quântico ETH/USDC: limitador de perdas por tendência e stop móvel. Pesquisa completa com metodologia, resultados, erros e referências.",
      },
    ],
  }),
  component: Pesquisa,
});

function Pesquisa() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);
  return (
    <div className="flex h-full w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b py-3 pl-14 pr-4 md:px-6">
          <h1 className="truncate text-sm font-medium">Holograma — Pesquisa</h1>
          <a
            href="/pesquisa.html"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Abrir em nova aba
          </a>
        </div>
        <iframe src="/pesquisa.html" title="Holograma — Pesquisa" className="h-full w-full flex-1 border-0 bg-background" />
      </main>
    </div>
  );
}
