import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminApi,
  ApiError,
  type AdminFeature,
  type AdminReward,
  type AdminUser,
} from "@/lib/token/api";
import { connectWallet, mintWithOwnerWallet, switchChain, walletError } from "@/lib/token/wallet";

const msgOf = (e: unknown) => (e instanceof ApiError ? e.message : walletError(e));
const sameAddr = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

function FeatureRow({
  f,
  onSaved,
  onError,
}: {
  f: AdminFeature;
  onSaved: () => void;
  onError: (m: string) => void;
}) {
  const [price, setPrice] = useState(f.priceTokens);
  useEffect(() => setPrice(f.priceTokens), [f.priceTokens]);
  const save = (patch: Partial<AdminFeature>) =>
    adminApi
      .saveFeature(f.id, patch)
      .then(onSaved)
      .catch((e) => onError(msgOf(e)));
  return (
    <li className="flex flex-wrap items-center gap-2 p-3 text-sm">
      <span className="min-w-40 flex-1 font-medium">
        {f.name} <span className="font-mono text-xs text-muted-foreground">{f.id}</span>
      </span>
      <Input
        className="h-8 w-28"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        aria-label={`Preço de ${f.name}`}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={price === f.priceTokens}
        onClick={() => save({ priceTokens: price })}
      >
        Salvar preço
      </Button>
      <Button
        size="sm"
        variant={f.active ? "secondary" : "default"}
        onClick={() => save({ active: !f.active })}
      >
        {f.active ? "Desativar" : "Ativar"}
      </Button>
    </li>
  );
}

export function TokenAdmin() {
  const [status, setStatus] = useState<Awaited<ReturnType<typeof adminApi.status>> | null>(null);
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({
    uid: "",
    recipient: "",
    kind: "contribuicao",
    reason: "",
    ref: "",
    amountTokens: "",
  });

  const load = useCallback(async () => {
    try {
      const [s, c, r, u] = await Promise.all([
        adminApi.status(),
        adminApi.catalog(),
        adminApi.rewards(),
        adminApi.users(),
      ]);
      setStatus(s);
      setFeatures(c.features);
      setRewards(r.rewards);
      setUsers(u.users);
    } catch (e) {
      setErr(msgOf(e));
    }
  }, []);
  useEffect(() => void load(), [load]);

  const act = (p: Promise<unknown>) =>
    p
      .then(() => {
        setErr("");
        return load();
      })
      .catch((e) => setErr(msgOf(e)));

  /** Registra/verifica o hash do mint: o servidor confere owner, destinatário, valor e confirmações na blockchain. */
  const verifyMint = async (r: AdminReward, hash: string) => {
    const v = await adminApi.manual(r.id, hash);
    setNote(
      v.status === "pending"
        ? `Transação enviada (${hash.slice(0, 10)}…). ${v.motivo ?? "Aguardando confirmações"} — clique em "Verificar emissão" em instantes.`
        : `Emitido: ${r.amountTokens} tokens para ${r.recipient}.`,
    );
  };

  /** Emite com a carteira do owner (MetaMask): reservar → assinar mint() → servidor confere na blockchain. */
  const issueWithWallet = async (r: AdminReward) => {
    setBusy(r.id);
    setErr("");
    setNote("");
    let claimed = false;
    try {
      const owner = status?.info?.owner;
      if (!status || !owner) throw new Error("Não foi possível ler o owner() do contrato.");
      let w = await connectWallet();
      if (w.chainId !== status.config.chainId) {
        await switchChain(status.config.chainId);
        w = await connectWallet(); // reabre o provider já na rede certa
      }
      if (!sameAddr(w.account, owner))
        throw new Error(
          `Conecte a carteira OWNER do contrato (${owner}) na MetaMask. Conta atual: ${w.account}.`,
        );
      if (
        !confirm(
          `Emitir ${r.amountTokens} tokens para ${r.recipient} com a carteira owner? A emissão é irreversível.`,
        )
      )
        return;
      await adminApi.claim(r.id);
      claimed = true;
      let hash: string;
      try {
        hash = await mintWithOwnerWallet(
          w.provider,
          status.config.contract,
          r.recipient,
          BigInt(r.amountUnits),
        );
      } catch (e) {
        await adminApi.release(r.id).catch(() => undefined); // cancelou na carteira: volta para "aprovada"
        claimed = false;
        throw e;
      }
      await verifyMint(r, hash);
    } catch (e) {
      setErr(msgOf(e));
      if (claimed) setNote("A recompensa ficou reservada. Use Verificar emissão ou Liberar.");
    } finally {
      setBusy(null);
      void load();
    }
  };

  return (
    <div className="space-y-8">
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      {status && (
        <p className="text-sm text-muted-foreground">
          Contrato: {status.ready ? "verificado" : "NÃO verificado — " + status.issues.join(" ")} ·
          Emissão pelo servidor:{" "}
          {status.mint.can ? "disponível" : "indisponível (" + (status.mint.why ?? "") + ")"}
        </p>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}

      <section>
        <h3 className="mb-2 text-sm font-medium">
          Catálogo e preços (em tokens inteiros, ex.: 12.5)
        </h3>
        <ul className="divide-y rounded-xl border">
          {features.map((f) => (
            <FeatureRow key={f.id} f={f} onSaved={load} onError={setErr} />
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Mudanças valem só para novos pedidos; pedidos abertos com o preço antigo são invalidados.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Nova recompensa (fica pendente até aprovação)</h3>
        <form
          className="grid gap-2 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void act(
              adminApi
                .createReward({
                  ...form,
                  uid: form.uid || undefined,
                  recipient: form.recipient || undefined,
                })
                .then(() => setForm({ ...form, reason: "", ref: "", amountTokens: "" })),
            );
          }}
        >
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={form.uid}
            aria-label="Usuário que vai receber"
            onChange={(e) => setForm({ ...form, uid: e.target.value, recipient: "" })}
          >
            <option value="">Outra carteira (digitar endereço)…</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>
                {(u.email ?? u.uid) + " · " + u.address.slice(0, 6) + "…" + u.address.slice(-4)}
              </option>
            ))}
          </select>
          {form.uid ? (
            <p className="self-center text-xs text-muted-foreground">
              Recebe na carteira vinculada à conta (não é preciso digitar endereço).
            </p>
          ) : (
            <Input
              placeholder="Carteira do destinatário (0x…)"
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            />
          )}
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          >
            <option value="contribuicao">Contribuição verificada</option>
            <option value="desafio">Desafio</option>
            <option value="atividade">Atividade elegível</option>
          </select>
          <Input
            placeholder="Motivo"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <Input
            placeholder="Referência única (ex.: post:abc123)"
            value={form.ref}
            onChange={(e) => setForm({ ...form, ref: e.target.value })}
          />
          <Input
            placeholder="Valor em tokens"
            value={form.amountTokens}
            onChange={(e) => setForm({ ...form, amountTokens: e.target.value })}
          />
          <Button type="submit">Registrar recompensa</Button>
          {users.length === 0 && (
            <p className="text-xs text-muted-foreground md:col-span-2">
              Nenhum usuário vinculou carteira ainda. Quem vincular em “OctoCookie Token” aparece
              aqui.
            </p>
          )}
        </form>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Recompensas</h3>
        {rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma recompensa.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {rewards.map((r) => (
              <li key={r.id} className="space-y-2 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-medium">{r.reason}</span> · {r.amountTokens} →{" "}
                    <span className="font-mono text-xs">{r.recipient}</span>
                  </span>
                  <Badge variant={r.status === "minted" ? "default" : "secondary"}>
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  ref {r.ref}
                  {r.txHash ? " · tx " + r.txHash.slice(0, 10) + "…" : ""}
                  {r.error ? " · erro: " + r.error : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.status === "pending" && (
                    <Button size="sm" onClick={() => act(adminApi.approve(r.id))}>
                      Aprovar
                    </Button>
                  )}
                  {["pending", "approved"].includes(r.status) && (
                    <Button size="sm" variant="outline" onClick={() => act(adminApi.reject(r.id))}>
                      Rejeitar
                    </Button>
                  )}
                  {(r.status === "approved" || r.status === "minting") &&
                    r.mintVia !== "wallet" &&
                    status?.mint.can && (
                      <Button
                        size="sm"
                        onClick={() =>
                          confirm(
                            `Emitir ${r.amountTokens} tokens on-chain para ${r.recipient}? Esta ação é irreversível.`,
                          ) && act(adminApi.mint(r.id))
                        }
                      >
                        {r.status === "minting" ? "Reconciliar emissão" : "Emitir (mint)"}
                      </Button>
                    )}
                  {r.status === "approved" && (
                    <Button
                      size="sm"
                      disabled={busy === r.id}
                      onClick={() => void issueWithWallet(r)}
                    >
                      {busy === r.id ? "Aguardando carteira…" : "Emitir com minha carteira (owner)"}
                    </Button>
                  )}
                  {r.status === "minting" && r.mintVia === "wallet" && r.txHash && (
                    <Button
                      size="sm"
                      disabled={busy === r.id}
                      onClick={() => {
                        setBusy(r.id);
                        verifyMint(r, r.txHash as string)
                          .then(() => setErr(""))
                          .catch((e) => setErr(msgOf(e)))
                          .finally(() => {
                            setBusy(null);
                            void load();
                          });
                      }}
                    >
                      Verificar emissão
                    </Button>
                  )}
                  {r.status === "minting" && r.mintVia === "wallet" && !r.txHash && (
                    <Button size="sm" variant="outline" onClick={() => act(adminApi.release(r.id))}>
                      Liberar (cancelar reserva)
                    </Button>
                  )}
                  {r.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const h = prompt(
                          "Já emitiu por fora (Etherscan/Remix)? Cole o hash do mint (0x…). O servidor confere na blockchain:",
                        );
                        if (h) void act(verifyMint(r, h.trim()));
                      }}
                    >
                      Registrar hash de mint
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
