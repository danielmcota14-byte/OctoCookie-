import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { loadThreads, type Thread } from "@/lib/threads";
import { runCookieScript } from "@/lib/ide.functions";
import { Play, AlertTriangle, FileCode } from "lucide-react";

export const Route = createFileRoute("/ide")({
  head: () => ({
    meta: [
      { title: "CookieScript IDE — OctoCookie" },
      { name: "description", content: "Escreva e execute CookieScript em sandbox educacional com explicações passo a passo." },
    ],
  }),
  component: IdePage,
});

const DEFAULT_CODE = `// CookieScript — exemplo educacional
mensagem = string.maiusculo("cookiescript")
tamanho = string.comprimento(mensagem)

hash = crypto.hash_sha256(dados=mensagem)

if tamanho > 5 {
    filesystem.escrever_arquivo(caminho="saida.txt", conteudo=mensagem)
} else {
    filesystem.escrever_arquivo(caminho="saida.txt", conteudo="curto")
}`;

const MODULES = [
  { name: "filesystem", fns: ["escrever_arquivo", "ler_arquivo"] },
  { name: "network", fns: ["http_request"] },
  { name: "crypto", fns: ["hash_sha256"] },
  { name: "math", fns: ["seno", "potencia", "numero_aleatorio", "multiplicar"] },
  { name: "time", fns: ["timestamp_atual", "data_hora_atual"] },
  { name: "string", fns: ["maiusculo", "comprimento", "converter_para_string"] },
  { name: "encoding", fns: ["base64_encode", "base64_decode"] },
  { name: "json", fns: ["stringify_json"] },
];

type Result = Awaited<ReturnType<typeof runCookieScript>>;

function IdePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const run = useServerFn(runCookieScript);

  useEffect(() => setThreads(loadThreads()), []);

  async function handleRun() {
    setRunning(true);
    try {
      const r = await run({ data: { code } });
      setResult(r);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar threads={threads} onThreadsChange={setThreads} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">CookieScript IDE</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Escreva scripts em CookieScript e rode em sandbox educacional. A execução é simulada — nenhum arquivo real é criado nem requisição real é feita.
              </p>
            </div>
            <button
              onClick={handleRun}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {running ? "Executando..." : "Executar"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="h-[440px] w-full rounded-lg border bg-muted/40 p-3 font-mono text-xs outline-none focus:border-ring"
              />
            </div>
            <aside className="rounded-lg border p-3 text-sm">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Módulos</div>
              <ul className="space-y-2">
                {MODULES.map((m) => (
                  <li key={m.name}>
                    <div className="font-mono text-xs font-semibold">{m.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{m.fns.join(", ")}</div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          {result && (
            <div className="mt-6 space-y-4">
              {result.errors.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <div className="whitespace-pre-wrap">{result.errors.join("\n")}</div>
                </div>
              )}

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Saída</div>
                <pre className="max-h-64 overflow-auto rounded-lg border bg-background p-3 font-mono text-xs">{result.output || "(vazio)"}</pre>
              </div>

              {Object.keys(result.variables).length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Variáveis</div>
                  <div className="rounded-lg border">
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(result.variables).map(([k, v]) => (
                          <tr key={k} className="border-b last:border-b-0">
                            <td className="w-1/3 border-r bg-muted/30 px-3 py-1.5 font-mono text-xs">{k}</td>
                            <td className="px-3 py-1.5 font-mono text-xs">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.files.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Arquivos simulados</div>
                  <div className="space-y-2">
                    {result.files.map((f) => (
                      <div key={f.path} className="rounded-lg border">
                        <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs">
                          <FileCode className="h-3.5 w-3.5" />
                          <span className="font-mono">{f.path}</span>
                        </div>
                        <pre className="max-h-40 overflow-auto p-3 font-mono text-xs">{f.preview}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.explanation && (
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Explicação</div>
                  <div className="whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed">{result.explanation}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
