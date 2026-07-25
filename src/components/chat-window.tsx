import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Globe, Plus, ArrowUp } from "lucide-react";
import mascot from "@/assets/octocookie-mascot.png";
import { deriveTitle, loadThreads, saveThreads, type Thread } from "@/lib/threads";
import { cn } from "@/lib/utils";

type Props = {
  thread: Thread;
  onUpdate: (t: Thread) => void;
};

export function ChatWindow({ thread, onUpdate }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => console.error(e),
  });

  // Persist messages back to the thread whenever they change
  useEffect(() => {
    if (messages === thread.messages) return;
    const updated: Thread = {
      ...thread,
      messages: messages as UIMessage[],
      title: deriveTitle(messages as UIMessage[]) || thread.title,
      updatedAt: Date.now(),
    };
    onUpdate(updated);
    // Also update stored threads list
    const all = loadThreads();
    const next = all.some((t) => t.id === thread.id)
      ? all.map((t) => (t.id === thread.id ? updated : t))
      : [updated, ...all];
    saveThreads(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Focus composer
  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id, status]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || isLoading) return;
    void sendMessage({ text });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="relative flex h-screen flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <img src={mascot} alt="OctoCookie" width={96} height={96} className="h-24 w-24 opacity-90" />
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8 pb-40">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="prose prose-sm max-w-none text-sm text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="text-sm text-muted-foreground">Pensando…</div>
            )}
          </div>
        )}
      </div>

      <div className={cn("absolute inset-x-0 bottom-0 flex justify-center px-6 pb-8", isEmpty ? "top-1/2 translate-y-6 items-start" : "")}>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl rounded-3xl bg-muted/80 p-2 shadow-sm ring-1 ring-border/60 backdrop-blur"
        >
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Envie uma mensagem"
            className="block max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1">
              <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-background/70 text-muted-foreground hover:text-foreground" aria-label="Anexar">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-background/70 text-[var(--link)] hover:opacity-80" aria-label="Web">
                <Globe className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                OctoCookie · educacional
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted-foreground/40 text-background hover:bg-foreground disabled:opacity-50"
                aria-label="Enviar"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
