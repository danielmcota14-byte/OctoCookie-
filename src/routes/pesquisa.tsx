import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisa | OctoCookie" },
      {
        name: "description",
        content:
          "OctoCookie: um laboratório financeiro digital para testar, automatizar e validar estratégias. Proposta, metodologia de testes, evolução do projeto e o Holograma Quântico como correção do drawdown do bot da tarde.",
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
          <h1 className="truncate text-sm font-medium">OctoCookie — Pesquisa</h1>
          <a
            href="/pesquisa.html"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Abrir em nova aba
          </a>
        </div>
        <iframe src="/pesquisa.html" title="OctoCookie — Pesquisa" className="h-full w-full flex-1 border-0 bg-background" />
      </main>
    </div>
  );
}
