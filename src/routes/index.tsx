import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OctoCookie — Um universo de possibilidades" },
      {
        name: "description",
        content:
          "Ações, educação financeira, empreendedorismo digital e desenvolvimento com IA no mesmo sistema.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => setThreads(loadThreads()), []);

  return (
    <div className="flex h-full w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex min-w-0 flex-1 flex-col">
        <iframe
          src="/universo.html"
          title="OctoCookie"
          className="h-full w-full flex-1 border-0 bg-background"
        />
      </main>
    </div>
  );
}
