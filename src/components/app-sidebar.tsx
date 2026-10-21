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
  Users,
  Server,
  ShieldCheck,
  PiggyBank,
  Sprout,
  Compass,
  Cookie,
  Sun,
  Moon,
  BookOpenText,
  MessageCircle,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import mascot from "@/assets/octocookie-mascot.png";
import { loadThreads, newThread, saveThreads, type Thread } from "@/lib/threads";
import { cn } from "@/lib/utils";
import { toggleTheme, effectiveTheme } from "@/lib/theme";

type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; external?: boolean };
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Início", items: [
    { to: "/", label: "Início", icon: Compass, exact: true },
    { to: "/pesquisa", label: "Pesquisa", icon: BookOpenText },
  ] },
  { title: "Ferramentas", items: [
    { to: "/carteira", label: "Carteira", icon: Wallet },
    { to: "/token", label: "OctoCookie Token", icon: Coins },
    { to: "/octo-app", label: "Bot Trading", icon: LayoutDashboard },
    { to: "/bot-24x7", label: "Bot 24/7", icon: Server },
    { to: "/analyzer", label: "Analisador", icon: LineChart },
    { to: "/simulator", label: "Simulador", icon: TerminalSquare },
  ] },
  { title: "Programar", items: [
    { to: "/cookiescript", label: "CookieScript", icon: Cookie },
    { to: "/ide", label: "IDE simulada", icon: Code2 },
  ] },
  { title: "Aprender", items: [
    { to: "/finance", label: "Finance", icon: PiggyBank },
    { to: "/start", label: "Start", icon: Sprout },
    { to: "/launch", label: "Explorar", icon: Rocket },
  ] },
  { title: "Comunidade", items: [
    { to: "/community", label: "Comunidade", icon: Users },
    { to: "/adm.html", label: "Adm", icon: ShieldCheck, external: true },
  ] },
];

type Props = {
  threads: Thread[];
  onThreadsChange: (t: Thread[]) => void;
};

export function AppSidebar({ threads, onThreadsChange }: Props) {
  // No desktop, "collapsed" encolhe a sidebar. No mobile, ela some totalmente
  // e vira um drawer que abre por cima do conteúdo (evita empurrar/espremer as abas).
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(effectiveTheme() === "dark");
    const on = () => setIsDark(effectiveTheme() === "dark");
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, [themeTick]);
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
          "flex h-full shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200",
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
              <img src={mascot} alt="" width={20} height={20} className="h-5 w-5 dark:invert" />
              <span>OctoCookie</span>
            </div>
          )}
        </div>

        <nav className="flex min-h-0 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
          <button
            onClick={handleNew}
            className="mb-1 flex items-center gap-3 rounded-md border border-sidebar-border px-2.5 py-2 text-sm font-medium hover:bg-sidebar-accent"
          >
            <SquarePen className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Novo chat</span>}
          </button>
          {NAV_GROUPS.map((g) => (
            <div key={g.title} className="mt-2 flex flex-col gap-0.5">
              {!collapsed && (
                <div className="px-2.5 pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {g.title}
                </div>
              )}
              {g.items.map((it) => {
                const Icon = it.icon;
                const cls = "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent";
                const inner = (
                  <>
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{it.label}</span>}
                  </>
                );
                return it.external ? (
                  <a key={it.to} href={it.to} className={cls} title={collapsed ? it.label : undefined}>
                    {inner}
                  </a>
                ) : (
                  <Link
                    key={it.to}
                    to={it.to}
                    activeOptions={{ exact: !!it.exact }}
                    className={cls}
                    activeProps={{ className: "bg-sidebar-accent font-semibold text-sidebar-primary" }}
                    title={collapsed ? it.label : undefined}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          ))}
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
        <div className="mt-auto flex items-center gap-1 border-t border-sidebar-border p-2">
          <Link
            to="/settings"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent"
            title="Configurações"
          >
            <SettingsIcon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Configurações</span>}
          </Link>
          <button
            onClick={() => {
              toggleTheme();
              setThemeTick((n) => n + 1);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-sidebar-accent"
            aria-label="Alternar tema claro/escuro"
            title="Alternar tema"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
