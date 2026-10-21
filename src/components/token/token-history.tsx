import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ApiError, type Me, type TokenConfig, type Transfers } from "@/lib/token/api";
import { fmtUnits, short } from "@/lib/token/wallet";

const when = (t: number | string) => new Date(t).toLocaleString("pt-BR");
const ORDER_LABEL: Record<string, string> = {
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  expired: "Expirado",
};
const REWARD_LABEL: Record<string, string> = {
  pending: "Pendente de aprovação",
  approved: "Aprovada (aguardando emissão)",
  minting: "Emissão em andamento",
  minted: "Emitida",
  rejected: "Rejeitada",
};

function TxLink({ hash, cfg }: { hash: string; cfg: TokenConfig }) {
  if (!cfg.explorerUrl) return <span className="font-mono text-xs">{short(hash)}</span>;
  return (
    <a
      href={`${cfg.explorerUrl}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs underline"
    >
      {short(hash)} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function TokenHistory({
  me,
  cfg,
  decimals,
  symbol,
}: {
  me: Me;
  cfg: TokenConfig;
  decimals: number | null;
  symbol: string;
}) {
  const [tr, setTr] = useState<Transfers | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function loadTransfers() {
    setBusy(true);
    setErr("");
    try {
      setTr(await api.transfers());
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Falha ao carregar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 text-sm font-medium">Compras e recursos desbloqueados</h3>
        {me.orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma compra ainda.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {me.orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{o.featureName}</p>
                  <p className="text-xs text-muted-foreground">
                    {when(o.paidAt ?? o.createdAt)} · {o.amountTokens} {symbol}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {o.txHash && <TxLink hash={o.txHash} cfg={cfg} />}
                  <Badge variant={o.status === "paid" ? "default" : "secondary"}>
                    {ORDER_LABEL[o.status] ?? o.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Recompensas</h3>
        {me.rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma recompensa registrada. Recompensas são aprovadas pela administração e nunca
            emitidas automaticamente.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {me.rewards.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{r.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {when(r.createdAt)} · {r.amountTokens} {symbol} · {r.kind}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.txHash && <TxLink hash={r.txHash} cfg={cfg} />}
                  <Badge variant={r.status === "minted" ? "default" : "secondary"}>
                    {REWARD_LABEL[r.status] ?? r.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Transações do token (on-chain, janela recente)</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={loadTransfers}
            disabled={busy || !me.wallet || !cfg.ready}
          >
            {busy ? "Carregando…" : tr ? "Atualizar" : "Carregar"}
          </Button>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        {tr?.warning && <p className="text-sm text-muted-foreground">{tr.warning}</p>}
        {tr && tr.items.length === 0 && !tr.warning && (
          <p className="text-sm text-muted-foreground">
            Nenhuma transferência na janela consultada.
          </p>
        )}
        {tr && tr.items.length > 0 && (
          <ul className="divide-y rounded-xl border">
            {tr.items.map((t) => (
              <li
                key={t.txHash + t.block + t.direction}
                className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <span>
                  {t.direction === "out" ? "Enviou" : "Recebeu"}{" "}
                  {decimals != null ? fmtUnits(t.value, decimals) : t.value} {symbol}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    · {t.direction === "out" ? "para " + short(t.to) : "de " + short(t.from)}
                  </span>
                </span>
                <TxLink hash={t.txHash} cfg={cfg} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
