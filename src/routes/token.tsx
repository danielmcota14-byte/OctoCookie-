import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TokenPanel } from "@/components/token/token-panel";
import { loadThreads, type Thread } from "@/lib/threads";
import mascot from "@/assets/octocookie-mascot.png";

export const Route = createFileRoute("/token")({
  head: () => ({
    meta: [
      { title: "OctoCookie Token — recursos premium e recompensas" },
      {
        name: "description",
        content:
          "Use o token do OctoCookie para desbloquear funcionalidades, participar de desafios e acompanhar recompensas, com pagamentos verificados na blockchain.",
      },
    ],
  }),
  component: TokenPage,
});

function TokenPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);
  return (
    <div className="flex h-full w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-16 md:px-6 md:pt-10">
          <div className="mb-6 flex items-center gap-3">
            <img src={mascot} alt="" width={28} height={28} className="h-7 w-7" />
            <div>
              <h1 className="text-2xl font-semibold">OctoCookie Token</h1>
              <p className="text-sm text-muted-foreground">
                Moeda de utilidade do laboratório: desbloqueie recursos, participe de desafios e
                acompanhe recompensas.
              </p>
            </div>
          </div>
          <TokenPanel />
          <p className="mt-8 text-xs text-muted-foreground">
            Conteúdo educacional e de utilidade da plataforma. Não é recomendação de investimento.
          </p>
        </div>
      </main>
    </div>
  );
}
