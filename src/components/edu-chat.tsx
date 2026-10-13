import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import type { EduModuleConfig } from "@/lib/edu-modules";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

/** Chat educativo simples (Finance / Start). Histórico só na memória da página. */
export function EduChat({ module: cfg }: { module: EduModuleConfig }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => setThreads(loadThreads()), []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const history = [...msgs.filter((m) => !m.error), { role: "user" as const, content: q }];
    setMsgs(history);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/edu-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: cfg.id,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await r.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!r.ok) throw new Error(data.error || `Erro ${r.status}`);
      setMsgs([...history, { role: "assistant", content: data.reply || "Sem resposta." }]);
    } catch (e) {
      setMsgs([
        ...history,
        { role: "assistant", content: e instanceof Error ? e.message : String(e), error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b py-3 pl-14 pr-4 md:px-6">
          <div
            className="grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold text-white"
            style={{ background: cfg.accent }}
          >
            {cfg.logo}
          </div>
          <h1 className="truncate text-sm font-medium">{cfg.topbar}</h1>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ color: cfg.accent, background: `${cfg.accent}1a` }}
          >
            {cfg.name}
          </span>
          {msgs.length > 0 && (
            <button
              onClick={() => setMsgs([])}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {msgs.length === 0 && (
              <div
                className="rounded-xl border p-4 text-sm"
                style={{ borderColor: `${cfg.accent}40`, background: `${cfg.accent}0d` }}
              >
                <strong>{cfg.welcomeTitle}</strong>
                <p className="mt-2 text-muted-foreground">{cfg.welcome}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cfg.suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.question)}
                      className="rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-muted px-4 py-2 text-sm">
                  {m.content}
                </div>
              ) : (
                <div
                  key={i}
                  className={
                    m.error
                      ? "rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                      : "max-w-none space-y-3 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
                  }
                >
                  {m.error ? m.content : <ReactMarkdown>{m.content}</ReactMarkdown>}
                </div>
              ),
            )}
            {loading && <div className="text-sm text-muted-foreground">Pensando...</div>}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-end gap-2 rounded-2xl border bg-background p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder={cfg.placeholder}
                className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                aria-label="Enviar"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
                style={{ background: cfg.accent }}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">{cfg.hint}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
