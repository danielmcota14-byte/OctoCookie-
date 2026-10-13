import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";

export const Route = createFileRoute("/cookiescript")({
  head: () => ({
    meta: [
      { title: "CookieScript — IDE e Cookie AI" },
      { name: "description", content: "IDE da linguagem CookieScript com Cookie AI e documentação." },
    ],
  }),
  component: CookieScriptPage,
});

function serviceUrl(): string {
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_COOKIESCRIPT_URL;
    return typeof v === "string" ? v.trim().replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

const TABS = [
  { label: "IDE", path: "/index.html" },
  { label: "Cookie AI", path: "/" },
  { label: "Documentação", path: "/index2.html" },
];

function CookieScriptPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [tab, setTab] = useState(0);
  const base = serviceUrl();
  useEffect(() => setThreads(loadThreads()), []);

  return (
    <div className="flex h-full w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b py-3 pl-14 pr-4 md:px-6">
          <h1 className="text-sm font-medium">CookieScript</h1>
          <div className="flex gap-1">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setTab(i)}
                className={`rounded-md px-2.5 py-1 text-xs ${i === tab ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {base && (
            <a href={base + TABS[tab].path} target="_blank" rel="noreferrer" className="ml-auto text-xs text-muted-foreground hover:text-foreground">
              Abrir em nova aba
            </a>
          )}
        </div>
        {base ? (
          <iframe key={tab} src={base + TABS[tab].path} title="CookieScript" className="h-full w-full flex-1 border-0 bg-background" />
        ) : (
          <div className="mx-auto max-w-xl p-8 text-sm">
            <h2 className="text-base font-semibold">Serviço do CookieScript não configurado</h2>
            <p className="mt-2 text-muted-foreground">
              O CookieScript é um servidor Python (pasta <code>cookiescript/</code>). Publique-o no Render (serviço{" "}
              <code>octocookie-cookiescript</code> do <code>render.yaml</code>) e defina no site a variável{" "}
              <code>VITE_COOKIESCRIPT_URL=https://seu-cookiescript.onrender.com</code>, depois faça redeploy.
            </p>
            <p className="mt-2 text-muted-foreground">Local: <code>cd cookiescript &amp;&amp; python cookie_ide_app.py</code> e use <code>http://localhost:8080</code>.</p>
          </div>
        )}
      </main>
    </div>
  );
}
