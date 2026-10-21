import { useEffect, useState } from "react";
import { fmtUnits } from "@/lib/token/wallet";
import { api, type Transparency } from "@/lib/token/api";

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="grid gap-1 py-2 sm:grid-cols-[200px_1fr]">
    <dt className="text-sm text-muted-foreground">{k}</dt>
    <dd className="break-words text-sm">{v}</dd>
  </div>
);

export function TokenTransparency() {
  const [t, setT] = useState<Transparency | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api
      .transparency()
      .then(setT)
      .catch(() => setErr("Não foi possível carregar a página de transparência agora."));
  }, []);
  if (err) return <p className="text-sm text-destructive">{err}</p>;
  if (!t) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  const dec = t.contrato.decimals;
  const u = (v: string | null) => (v == null ? "—" : dec != null ? fmtUnits(v, dec, 6) : v);
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-1 text-sm font-medium">Contrato</h3>
        <dl className="divide-y rounded-xl border px-4">
          <Row k="Endereço" v={<span className="font-mono text-xs">{t.contrato.endereco}</span>} />
          <Row k="Rede (chainId)" v={t.contrato.chainId} />
          <Row
            k="Verificado na rede"
            v={t.contrato.verificado ? "Sim" : "Não — " + (t.contrato.avisos || []).join(" ")}
          />
          <Row k="Oferta atual" v={u(t.contrato.supply)} />
          <Row
            k="Bytecode igual ao OctoToken oficial"
            v={
              t.contrato.bytecodeIdentico == null
                ? "—"
                : t.contrato.bytecodeIdentico
                  ? "Sim"
                  : "Não"
            }
          />
          <Row
            k="Owner (administrador)"
            v={<span className="font-mono text-xs">{t.contrato.owner ?? "—"}</span>}
          />
        </dl>
      </section>
      <section>
        <h3 className="mb-1 text-sm font-medium">Pagamentos</h3>
        <dl className="divide-y rounded-xl border px-4">
          <Row k="Método" v={t.pagamentos.metodo} />
          <Row
            k="Tesouraria"
            v={<span className="font-mono text-xs">{t.pagamentos.tesouraria}</span>}
          />
          <Row k="Confirmações mínimas" v={t.pagamentos.confirmacoesMinimas} />
          <Row
            k="Total recebido / compras"
            v={`${t.pagamentos.totalRecebido ?? "—"} (${t.pagamentos.compras})`}
          />
        </dl>
      </section>
      <section>
        <h3 className="mb-1 text-sm font-medium">Emissão e recompensas</h3>
        <dl className="divide-y rounded-xl border px-4">
          <Row k="Política de emissão" v={t.emissao.politica} />
          <Row
            k="Emitido em recompensas"
            v={`${t.emissao.totalEmitidoEmRecompensas ?? "—"} (${t.emissao.recompensas} recompensas)`}
          />
          <Row k="Regras de recompensa" v={t.recompensas.regras} />
        </dl>
      </section>
      <section>
        <h3 className="mb-1 text-sm font-medium">Queima e administração</h3>
        <dl className="divide-y rounded-xl border px-4">
          <Row k="Queima" v={t.queima.politica} />
          <Row k="Administração" v={t.administracao.observacao} />
        </dl>
      </section>
    </div>
  );
}
