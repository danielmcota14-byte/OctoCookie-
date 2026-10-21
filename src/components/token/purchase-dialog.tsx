import { useEffect, useRef, useState } from "react";
import { parseUnits } from "ethers";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError, pendingKey, type Feature, type TokenConfig } from "@/lib/token/api";
import { fmtUnits, sendTransfer, short, walletError, type OnChain } from "@/lib/token/wallet";
import type { BrowserProvider } from "ethers";

type Step = "review" | "order" | "wallet" | "verifying" | "done" | "error";

type Props = {
  feature: Feature | null;
  cfg: TokenConfig;
  provider: BrowserProvider;
  onChain: OnChain;
  onClose: () => void;
  onDone: () => void;
};

/** Fluxo: revisar preço/destino → pedido no servidor → transfer() assinado na carteira → servidor verifica na blockchain → libera. */
export function PurchaseDialog({ feature, cfg, provider, onChain, onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>("review");
  const [msg, setMsg] = useState("");
  const [tx, setTx] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    setStep("review");
    setMsg("");
    setTx("");
    return () => {
      alive.current = false;
    };
  }, [feature?.id]);

  if (!feature) return null;
  let price: bigint | null = null;
  try {
    price = parseUnits(feature.priceTokens, onChain.decimals);
  } catch {
    price = null; // preço com mais casas que o token permite
  }
  const insufficient = price !== null && onChain.balance < price;
  const busy = step === "order" || step === "wallet"; // durante "verifying" o usuário pode fechar: a verificação é retomada ao reabrir a página

  async function verifyLoop(orderId: string, hash: string) {
    setStep("verifying");
    for (let i = 0; i < 90 && alive.current; i++) {
      try {
        const r = await api.submit(orderId, hash);
        if (r.status === "confirmed") {
          localStorage.removeItem(pendingKey(orderId));
          setStep("done");
          onDone();
          return;
        }
        if (r.status === "rejected") {
          localStorage.removeItem(pendingKey(orderId));
          setMsg(r.motivo || "Pagamento rejeitado pelo servidor.");
          setStep("error");
          return;
        }
        setMsg(r.motivo || "Aguardando confirmações na rede…");
      } catch (e) {
        if (e instanceof ApiError && e.status !== 0 && e.status < 500) {
          setMsg(e.message);
          setStep("error");
          return;
        }
        setMsg("Servidor ocupado, tentando de novo…");
      }
      await new Promise((r) => setTimeout(r, 7000));
    }
    if (alive.current) {
      setMsg(
        "A confirmação está demorando. Seu pagamento fica registrado: reabra esta página mais tarde e ele será verificado automaticamente.",
      );
      setStep("error");
    }
  }

  async function pay() {
    if (!feature || price === null) return;
    setMsg("");
    try {
      setStep("order");
      const { order } = await api.order(feature.id);
      if (order.treasury?.toLowerCase() !== cfg.treasury?.toLowerCase() || !order.amountUnits)
        throw new Error("O pedido não confere com a configuração pública. Pagamento abortado.");
      setStep("wallet");
      const hash = await sendTransfer(
        provider,
        cfg.contract!,
        order.treasury!,
        BigInt(order.amountUnits),
      );
      localStorage.setItem(pendingKey(order.id), hash);
      setTx(hash);
      await verifyLoop(order.id, hash);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : walletError(e));
      setStep("error");
    }
  }

  return (
    <Dialog open={!!feature} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desbloquear: {feature.name}</DialogTitle>
          <DialogDescription>{feature.description}</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Preço</dt>
          <dd className="font-medium">
            {feature.priceTokens} {onChain.symbol}
          </dd>
          <dt className="text-muted-foreground">Enviar para (tesouraria)</dt>
          <dd className="break-all font-mono text-xs">{cfg.treasury}</dd>
          <dt className="text-muted-foreground">Seu saldo</dt>
          <dd>
            {fmtUnits(onChain.balance, onChain.decimals)} {onChain.symbol}
          </dd>
          <dt className="text-muted-foreground">Método</dt>
          <dd>transfer() direto — você confirma na sua carteira</dd>
          <dt className="text-muted-foreground">Acesso</dt>
          <dd>{feature.durationDays ? `${feature.durationDays} dias` : "Permanente"}</dd>
        </dl>

        {price === null && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Preço incompatível</AlertTitle>
            <AlertDescription>
              O preço tem mais casas decimais do que o token permite. Avise o administrador.
            </AlertDescription>
          </Alert>
        )}
        {insufficient && step === "review" && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Saldo insuficiente</AlertTitle>
            <AlertDescription>
              Você precisa de pelo menos {feature.priceTokens} {onChain.symbol} nesta carteira.
            </AlertDescription>
          </Alert>
        )}
        {step === "wallet" && (
          <p className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Confirme a transação na sua carteira…
          </p>
        )}
        {step === "order" && (
          <p className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Criando o pedido…
          </p>
        )}
        {step === "verifying" && (
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Transação enviada. O servidor está
              verificando na blockchain…
            </p>
            {msg && <p className="text-muted-foreground">{msg}</p>}
            {tx && <p className="font-mono text-xs text-muted-foreground">{short(tx)}</p>}
          </div>
        )}
        {step === "done" && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Pagamento confirmado</AlertTitle>
            <AlertDescription>
              “{feature.name}” foi liberado na sua conta. Veja o recibo no Histórico.
            </AlertDescription>
          </Alert>
        )}
        {step === "error" && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Não foi possível concluir</AlertTitle>
            <AlertDescription>{msg}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {(step === "review" || step === "error") && (
            <Button onClick={pay} disabled={price === null || insufficient}>
              {step === "error" ? "Tentar de novo" : "Pagar com a carteira"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {step === "done" || step === "verifying" ? "Fechar" : "Cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
