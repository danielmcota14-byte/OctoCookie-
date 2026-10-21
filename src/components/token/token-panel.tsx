import { useCallback, useEffect, useState } from "react";
import { Coins, Link2, Lock, LockOpen, ShieldAlert, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthModal } from "@/components/social/auth-modal";
import { useAuth } from "@/lib/auth-context";
import {
  adminApi,
  api,
  ApiError,
  pendingKey,
  type Feature,
  type Me,
  type TokenConfig,
} from "@/lib/token/api";
import { useTokenWallet } from "@/lib/token/use-token-wallet";
import {
  fmtUnits,
  getEthereum,
  short,
  signMessage,
  switchChain,
  walletError,
} from "@/lib/token/wallet";
import { parseUnits } from "ethers";
import { PurchaseDialog } from "./purchase-dialog";
import { TokenHistory } from "./token-history";
import { TokenTransparency } from "./token-transparency";
import { TokenAdmin } from "./token-admin";

const day = (t: number) => new Date(t).toLocaleDateString("pt-BR");

export function TokenPanel() {
  const { user, loading: authLoading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [cfg, setCfg] = useState<TokenConfig | null>(null);
  const [features, setFeatures] = useState<Feature[] | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [notice, setNotice] = useState("");
  const [linking, setLinking] = useState(false);
  const [buying, setBuying] = useState<Feature | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const w = useTokenWallet(cfg?.contract ?? null, !!cfg?.ready, cfg?.chainId ?? null);
  const wrongNetwork = !!(w.account && cfg && w.chainId !== cfg.chainId);

  useEffect(() => {
    Promise.all([api.config(), api.catalog()])
      .then(([c, f]) => {
        setCfg(c);
        setFeatures(f.features);
      })
      .catch((e) => setLoadErr(e instanceof ApiError ? e.message : "Falha ao carregar o token."));
  }, []);

  const refreshMe = useCallback(async () => {
    if (!user) return setMe(null);
    try {
      setMe(await api.me());
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Falha ao carregar sua conta.");
    }
  }, [user]);
  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);
  // A aba Admin só aparece se o SERVIDOR confirmar que a conta é administradora (a decisão nunca é do navegador).
  useEffect(() => {
    setIsAdmin(false);
    if (user)
      adminApi
        .status()
        .then(() => setIsAdmin(true))
        .catch(() => {});
  }, [user]);

  // Retoma pagamentos já enviados (hash guardado no navegador) cuja verificação não terminou.
  useEffect(() => {
    if (!me) return;
    for (const o of me.orders.filter((x) => x.status === "awaiting_payment")) {
      const hash = localStorage.getItem(pendingKey(o.id));
      if (!hash) continue;
      api
        .submit(o.id, hash)
        .then((r) => {
          if (r.status === "confirmed") {
            localStorage.removeItem(pendingKey(o.id));
            void refreshMe();
          } else if (r.status === "rejected") {
            localStorage.removeItem(pendingKey(o.id));
            setNotice(r.motivo || "Um pagamento enviado foi rejeitado.");
          }
        })
        .catch(() => {});
    }
  }, [me?.orders.length]); // eslint-disable-line react-hooks/exhaustive-deps

  async function linkWallet() {
    if (!w.account || !w.provider) return;
    setLinking(true);
    setNotice("");
    try {
      const { message } = await api.nonce(w.account);
      await api.link(message, await signMessage(w.provider, message));
      await refreshMe();
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : walletError(e));
    } finally {
      setLinking(false);
    }
  }

  async function fixNetwork() {
    if (!cfg) return;
    try {
      await switchChain(cfg.chainId);
    } catch (e) {
      setNotice(
        walletError(e) + " Troque a rede manualmente na carteira (chainId " + cfg.chainId + ").",
      );
    }
  }

  if (loadErr)
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Token indisponível</AlertTitle>
        <AlertDescription>{loadErr}</AlertDescription>
      </Alert>
    );
  if (!cfg || !features)
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );

  const symbol = w.onChain?.symbol ?? cfg.token?.symbol ?? "OCTO";
  const decimals = w.onChain?.decimals ?? cfg.token?.decimals ?? null;
  const walletLinked =
    !!me?.wallet && !!w.account && me.wallet.address.toLowerCase() === w.account.toLowerCase();
  const walletMismatch = !!me?.wallet && !!w.account && !walletLinked;

  function blocker(f: Feature): string | null {
    if (!cfg!.ready) return "Pagamentos desabilitados até o contrato ser verificado.";
    if (!user) return "Entre na sua conta para comprar.";
    if (!w.account) return "Conecte sua carteira.";
    if (wrongNetwork) return "Troque para a rede correta.";
    if (!me?.wallet) return "Vincule sua carteira à conta.";
    if (walletMismatch) return "A carteira conectada não é a vinculada.";
    if (!w.onChain) return "Carregando saldo…";
    try {
      if (w.onChain.balance < parseUnits(f.priceTokens, w.onChain.decimals))
        return "Saldo insuficiente.";
    } catch {
      return "Preço incompatível com as casas decimais do token.";
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {!cfg.ready && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Token ainda não habilitado</AlertTitle>
          <AlertDescription>
            O servidor não conseguiu verificar o contrato na rede configurada, então compras e
            recompensas estão desligadas por segurança. {cfg.issues.join(" ")}
          </AlertDescription>
        </Alert>
      )}
      {wrongNetwork && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Rede incorreta</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            Sua carteira está na rede {w.chainId}; o token usa a rede {cfg.chainId}.
            <Button size="sm" variant="outline" onClick={fixNetwork}>
              Trocar de rede
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {(notice || w.error) && (
        <Alert>
          <AlertDescription>{notice || w.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4" /> Carteira
          </h2>
          {!w.account ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                Conecte uma carteira compatível (MetaMask, etc.) para ver seu saldo e pagar com o
                token.
              </p>
              <Button onClick={w.connect} disabled={!getEthereum()}>
                {getEthereum() ? "Conectar carteira" : "Carteira não encontrada"}
              </Button>
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <p className="break-all font-mono text-xs">{w.account}</p>
              <div className="flex flex-wrap items-center gap-2">
                {walletLinked && (
                  <Badge>
                    <Link2 className="mr-1 h-3 w-3" /> Vinculada à sua conta
                  </Badge>
                )}
                {walletMismatch && (
                  <Badge variant="destructive">
                    Diferente da vinculada ({short(me!.wallet!.address)})
                  </Badge>
                )}
                {!authLoading && !user && (
                  <Button size="sm" onClick={() => setAuthOpen(true)}>
                    Entrar para vincular
                  </Button>
                )}
                {user && me && !me.wallet && (
                  <Button size="sm" onClick={linkWallet} disabled={linking || wrongNetwork}>
                    {linking ? "Assine na carteira…" : "Vincular à minha conta"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={w.disconnect}>
                  Desconectar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A vinculação é uma assinatura de mensagem (sem gás, sem custo).
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Coins className="h-4 w-4" /> {w.onChain ? `${w.onChain.name} (${symbol})` : "Saldo"}
          </h2>
          {w.loading ? (
            <Skeleton className="mt-3 h-12 w-full" />
          ) : w.onChain ? (
            <div className="mt-3">
              <p className="text-3xl font-semibold tabular-nums">
                {fmtUnits(w.onChain.balance, w.onChain.decimals)}{" "}
                <span className="text-base font-normal text-muted-foreground">{symbol}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Oferta total: {fmtUnits(w.onChain.totalSupply, w.onChain.decimals)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                O saldo sozinho não libera nada: só pagamentos verificados desbloqueiam recursos.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {cfg.token
                ? `${cfg.token.name} (${cfg.token.symbol})`
                : "Conecte a carteira para ver seu saldo."}
            </p>
          )}
        </section>
      </div>

      <Tabs defaultValue="catalogo">
        <TabsList>
          <TabsTrigger value="catalogo">Funcionalidades</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="transparencia">Transparência</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="catalogo" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((f) => {
              const ent = me?.entitlements.find((e) => e.featureId === f.id && e.active);
              const why = blocker(f);
              return (
                <article key={f.id} className="flex flex-col rounded-xl border p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{f.name}</h3>
                    <Badge variant={f.scope === "live" ? "destructive" : "secondary"}>
                      {f.scope === "live" ? "Operação real" : "Simulação"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                  {f.requirements.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Requisitos: {f.requirements.join(" · ")}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    <div>
                      <p className="text-lg font-semibold tabular-nums">
                        {f.priceTokens} {symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {f.durationDays ? `${f.durationDays} dias de acesso` : "Acesso permanente"}
                      </p>
                    </div>
                    {ent ? (
                      <Badge>
                        <LockOpen className="mr-1 h-3 w-3" />{" "}
                        {ent.expiresAt ? `Liberado até ${day(ent.expiresAt)}` : "Liberado"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="mr-1 h-3 w-3" /> Bloqueado
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" disabled={!!why} onClick={() => setBuying(f)}>
                      {ent ? "Renovar" : "Desbloquear"}
                    </Button>
                    {why && <span className="text-xs text-muted-foreground">{why}</span>}
                  </div>
                  {f.scope === "live" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      O pagamento libera o acesso, mas não autoriza operações reais: elas continuam
                      exigindo a carteira dedicada e a sua confirmação no Bot 24/7.
                    </p>
                  )}
                </article>
              );
            })}
            {features.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma funcionalidade disponível no momento.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          {!user ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Entre na sua conta para ver compras, recompensas e transações.</p>
              <Button size="sm" onClick={() => setAuthOpen(true)}>
                Entrar
              </Button>
            </div>
          ) : me ? (
            <TokenHistory me={me} cfg={cfg} decimals={decimals} symbol={symbol} />
          ) : (
            <Skeleton className="h-32 w-full" />
          )}
        </TabsContent>

        <TabsContent value="transparencia" className="mt-4">
          <TokenTransparency />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="admin" className="mt-4">
            <TokenAdmin />
          </TabsContent>
        )}
      </Tabs>

      {w.provider && w.onChain && cfg.ready && (
        <PurchaseDialog
          feature={buying}
          cfg={cfg}
          provider={w.provider}
          onChain={w.onChain}
          onClose={() => {
            setBuying(null);
            void refreshMe();
          }}
          onDone={() => {
            void refreshMe();
            void w.refresh();
          }}
        />
      )}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
