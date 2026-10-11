import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { loadThreads, newThread, saveThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — OctoCookie" },
      { name: "description", content: "Converse com o OctoCookie sobre finanças, cripto e bots." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const all = loadThreads();
    let list = all;
    if (!all.some((t) => t.id === threadId)) {
      const t: Thread = { ...newThread(), id: threadId };
      list = [t, ...all];
      saveThreads(list);
    }
    setThreads(list);
    setReady(true);
  }, [threadId]);

  if (!ready) return null;
  const active = threads.find((t) => t.id === threadId);
  if (!active) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <ChatWindow
        key={active.id}
        thread={active}
        onUpdate={(u) => setThreads((prev) => prev.map((t) => (t.id === u.id ? u : t)))}
      />
    </div>
  );
}
