import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Fragment, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp } from "lucide-react";
import mascot from "@/assets/octocookie-mascot.png";
import { deriveTitle, loadThreads, saveThreads, type Thread } from "@/lib/threads";
import { cn } from "@/lib/utils";
import { AdSlot } from "@/components/ad-slot";

type Props = {
  thread: Thread;
  onUpdate: (t: Thread) => void;
};

export function ChatWindow({ thread, onUpdate }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSavedSig = useRef<string>("");
  const threadRef = useRef(thread);
  threadRef.current = thread;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const persist = useCallback((msgs: UIMessage[]) => {
    const sig = msgs.map((m) => m.id).join("|") + "#" + msgs.length;
    if (sig === lastSavedSig.current) return;
    lastSavedSig.current = sig;
    const t = threadRef.current;
    const updated: Thread = {
      ...t,
      messages: msgs,
      title: deriveTitle(msgs) || t.title,
      updatedAt: Date.now(),
    };
    onUpdateRef.current(updated);
    const all = loadThreads();
    const next = all.some((x) => x.id === t.id)
      ? all.map((x) => (x.id === t.id ? updated : x))
      : [updated, ...all];
    saveThreads(next);
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => console.error(e),
    onFinish: ({ messages: finalMsgs }) => {
      // Só persiste quando a resposta termina — evita loop (React #185)
      persist(finalMsgs as UIMessage[]);
    },
  });

  // Persiste também mensagens do usuário assim que entram (antes do stream)
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    if (messages.length === 0) return;
    persist(messages as UIMessage[]);
  }, [messages, status, persist]);

  // Autoscroll (sem setState)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Focus composer
  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;
  // 1º anúncio logo depois da 1ª resposta da IA (ou do fim, enquanto ela não chegou); o 2º fica no fim da conversa.
  const firstReply = messages.findIndex((m) => m.role !== "user");
  const adAfter = firstReply >= 0 ? firstReply : messages.length - 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || isLoading) return;
    void sendMessage({ text });
    if (inputRef.current) inputRef.current.value = "";
  }

  function sendPreset(text: string) {
    if (isLoading) return;
    void sendMessage({ text });
  }

  const starters = [
    "Me ensina a usar o bot do zero",
    "O que é o modo Só Holograma?",
    "Como funciona a carteira virtual?",
    "Qual a diferença entre tendência e quântica?",
  ];

  const composer = (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-3xl bg-muted/80 p-2 shadow-sm ring-1 ring-border/60 backdrop-blur"
    >
      <textarea
        ref={inputRef}
        rows={1}
        placeholder="Ex.: me ensina a usar o bot do zero"
        className="block max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
      />
      <div className="flex items-center justify-between gap-2 px-1">
        <div />
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
  );

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-8">
            <img
              src={mascot}
              alt="OctoCookie"
              width={96}
              height={96}
              className="h-24 w-24 opacity-90"
            />
            <div className="max-w-md text-center">
              <p className="text-sm font-medium text-foreground">
                Olá! Eu ensino o OctoCookie do zero.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Escolha um atalho ou digite sua dúvida. Conteúdo educacional — sem recomendação de
                investimento.
              </p>
            </div>
            <div className="flex max-w-lg flex-wrap justify-center gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendPreset(s)}
                  className="rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-foreground shadow-sm hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
            {/* anúncios "abraçam" o campo de digitação: um acima, outro abaixo */}
            <AdSlot slot={1} className="mt-2" />
            <div className="flex w-full justify-center sm:px-6">{composer}</div>
            <AdSlot slot={2} />
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-40 pt-16 sm:px-6 md:pt-8">
            {messages.map((m, i) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const node =
                m.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground sm:max-w-[80%]">
                      {text}
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-sm text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                );
              return (
                <Fragment key={m.id}>
                  {node}
                  {i === adAfter && <AdSlot slot={1} />}
                </Fragment>
              );
            })}
            {status === "submitted" && (
              <div className="text-sm text-muted-foreground">Pensando…</div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {(() => {
                  const m = error.message ?? "";
                  if (/rate.?limit|429|quota|too many/i.test(m)) {
                    return "Muitas mensagens em pouco tempo — o limite de uso da IA foi atingido. Espere um minuto e tente de novo.";
                  }
                  if (
                    /invalid.?api.?key|incorrect.?api.?key|401|unauthorized|GROQ_API_KEY inválida/i.test(
                      m,
                    )
                  ) {
                    return "Chave da IA inválida ou revogada. Gere uma nova em https://console.groq.com, coloque em GROQ_API_KEY (.env local ou variáveis do Vercel) e reinicie o servidor / faça redeploy.";
                  }
                  if (/GROQ_API_KEY não configurada|não configurada/i.test(m)) {
                    return "GROQ_API_KEY não configurada. Crie uma chave em https://console.groq.com e defina no .env (local) ou nas Environment Variables do Vercel, depois reinicie / redeploy.";
                  }
                  // Se a API devolveu texto legível (nosso handler), mostra direto
                  if (m.length > 0 && m.length < 400 && !/fetch|network|failed to/i.test(m)) {
                    return m;
                  }
                  return "Não foi possível obter uma resposta agora. Verifique a GROQ_API_KEY e tente novamente em instantes.";
                })()}
              </div>
            )}
            <AdSlot slot={2} />
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-3 pb-6 sm:px-6 sm:pb-8">
          {composer}
        </div>
      )}
    </div>
  );
}
