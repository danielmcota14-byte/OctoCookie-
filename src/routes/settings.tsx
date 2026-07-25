import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";
import { loadThreads, saveThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — OctoCookie" },
      { name: "description", content: "Configurações do OctoCookie." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);

  function clearAll() {
    if (!confirm("Apagar todo o histórico de chats?")) return;
    saveThreads([]);
    setThreads([]);
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-16 md:pt-12">
          <h1 className="text-2xl font-semibold">Configurações</h1>
          <div className="mt-8 space-y-6">
            <section className="rounded-xl border p-5">
              <h2 className="text-sm font-medium">Sobre o OctoCookie</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                O OctoCookie é uma IA puramente educacional. Não oferecemos recomendações
                de investimento nem sinais de compra/venda. Todo o conteúdo é para fins
                de aprendizado sobre finanças, criptomoedas e desenvolvimento de bots.
              </p>
            </section>
            <section className="rounded-xl border p-5">
              <h2 className="text-sm font-medium">Histórico</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Suas conversas ficam salvas apenas neste navegador (localStorage).
              </p>
              <button
                onClick={clearAll}
                className="mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Apagar todo o histórico
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
