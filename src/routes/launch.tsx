import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";
import { loadThreads, type Thread } from "@/lib/threads";
import { BookOpen, Bot, LineChart, Coins } from "lucide-react";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Explorar — OctoCookie" },
      { name: "description", content: "Explore trilhas educacionais de finanças, cripto e bots." },
    ],
  }),
  component: Launch,
});

const topics = [
  { icon: BookOpen, title: "Educação financeira", desc: "Orçamento, juros compostos, gestão de risco e planejamento." },
  { icon: Coins, title: "Fundamentos de cripto", desc: "Blockchain, tokens, wallets, DeFi — sem hype." },
  { icon: LineChart, title: "Análise & indicadores", desc: "Aprenda RSI, MACD, médias móveis e backtesting." },
  { icon: Bot, title: "Bots de investimento", desc: "Arquitetura, estratégias (DCA, grid), APIs de exchanges." },
];

function Launch() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="text-2xl font-semibold">Explorar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Trilhas de aprendizado. Escolha um tema e comece uma conversa com o OctoCookie.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {topics.map((t) => (
              <div key={t.title} className="rounded-xl border p-5 hover:bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <t.icon className="h-4 w-4" /> {t.title}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
