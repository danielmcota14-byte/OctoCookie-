import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  PanelLeft,
  SquarePen,
  Rocket,
  Settings as SettingsIcon,
  Trash2,
  TerminalSquare,
  Code2,
  LineChart,
  LayoutDashboard,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import mascot from "@/assets/octocookie-mascot.png";
import { loadThreads, newThread, saveThreads, type Thread } from "@/lib/threads";
import { cn } from "@/lib/utils";

type Props = {
  threads: Thread[];
  onThreadsChange: (t: Thread[]) => void;
};

export function AppSidebar({ threads, onThreadsChange }: Props) {
  // No desktop, "collapsed" encolhe a sidebar. No mobile, ela some totalmente
  // e vira um drawer que abre por cima do conteúdo (evita empurrar/espremer as abas).
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  // Fecha o drawer mobile automaticamente ao navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [activeId]);

  function handleNew() {
    const t = newThread();
    const next = [t, ...threads];
    onThreadsChange(next);
    saveThreads(next);
    navigate({ to: "/$threadId", params: { threadId: t.id } });
    setMobileOpen(false);
  }

  function handleDelete(id: string) {
    const next = threads.filter((t) => t.id !== id);
    onThreadsChange(next);
    saveThreads(next);
    if (activeId === id) navigate({ to: "/" });
  }

  return (
    <>
      {/* Botão flutuante para abrir a sidebar no mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-md border bg-background/90 shadow-sm backdrop-blur md:hidden"
        aria-label="Abrir menu"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Overlay escuro atrás do drawer no mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex h-screen shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200",
          // Mobile: drawer fixo, fora da tela quando fechado
          "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full",
          mobileOpen && "translate-x-0",
          // Desktop: volta a fazer parte do fluxo normal, sem drawer
          "md:static md:z-auto md:translate-x-0",
          collapsed ? "md:w-14" : "md:w-64",
        )}
      >
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-sidebar-accent md:grid"
            aria-label="Recolher menu"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-sidebar-accent md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
          {!collapsed && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <img src={mascot} alt="" width={20} height={20} className="h-5 w-5" />
              <span>OctoCookie</span>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-0.5 px-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <Wallet className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Carteira</span>}
          </Link>
          <button
            onClick={handleNew}
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <SquarePen className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Novo chat</span>}
          </button>
          <Link
            to="/launch"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <Rocket className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Explorar</span>}
          </Link>
          <Link
            to="/simulator"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <TerminalSquare className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Simulador</span>}
          </Link>
          <Link
            to="/ide"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <Code2 className="h-4 w-4 shrink-0" />
            {!collapsed && <span>CookieScript IDE</span>}
          </Link>
          <Link
            to="/analyzer"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <LineChart className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Analisador</span>}
          </Link>
          <Link
            to="/octo-app"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Bot Trading</span>}
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
          >
            <SettingsIcon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Configurações</span>}
          </Link>
        </nav>

        {!collapsed && threads.length > 0 && (
          <div className="mt-4 flex min-h-0 flex-1 flex-col px-2">
            <div className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">Recentes</div>
            <div className="flex-1 overflow-y-auto pr-0.5">
              {threads.map((t) => {
                const active = t.id === activeId;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-md pr-1",
                      active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent",
                    )}
                  >
                    <Link
                      to="/$threadId"
                      params={{ threadId: t.id }}
                      className={cn(
                        "min-w-0 flex-1 truncate rounded-md px-2.5 py-2 text-sm",
                        active ? "text-[var(--link)]" : "text-sidebar-foreground",
                      )}
                      title={t.title}
                    >
                      {t.title}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(t.id);
                      }}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-background hover:text-foreground group-hover:opacity-100"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
