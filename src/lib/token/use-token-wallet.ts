import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserProvider } from "ethers";
import { connectWallet, getEthereum, readToken, walletError, type OnChain } from "./wallet";

/** Estado da carteira conectada + dados do token lidos do contrato. Reage a troca de conta/rede. */
export function useTokenWallet(
  contract: string | null,
  ready: boolean,
  expectedChainId: number | null,
) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [onChain, setOnChain] = useState<OnChain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const providerRef = useRef<BrowserProvider | null>(null);

  const refresh = useCallback(
    async (acc = account) => {
      if (!acc || !contract || !ready || !providerRef.current || chainId !== expectedChainId)
        return;
      setLoading(true);
      setError("");
      try {
        setOnChain(await readToken(providerRef.current, contract, acc));
      } catch (e) {
        setOnChain(null);
        setError("Não foi possível ler o contrato nesta rede: " + walletError(e));
      } finally {
        setLoading(false);
      }
    },
    [account, contract, ready, chainId, expectedChainId],
  );

  const connect = useCallback(async () => {
    setError("");
    try {
      const c = await connectWallet();
      providerRef.current = c.provider;
      setAccount(c.account);
      setChainId(c.chainId);
    } catch (e) {
      setError(walletError(e));
    }
  }, []);

  const disconnect = useCallback(() => {
    providerRef.current = null;
    setAccount(null);
    setChainId(null);
    setOnChain(null);
  }, []);

  useEffect(() => {
    const eth = getEthereum() as unknown as {
      on?: (e: string, f: (...a: unknown[]) => void) => void;
      removeListener?: (e: string, f: (...a: unknown[]) => void) => void;
    } | null;
    if (!eth?.on) return;
    const onAccounts = (accs: unknown) => {
      const list = Array.isArray(accs) ? (accs as string[]) : [];
      if (list.length) setAccount(list[0]);
      else disconnect();
    };
    const onChain = () => connect(); // recria o provider na nova rede
    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (account && chainId) void refresh(account);
  }, [account, chainId, contract, ready, refresh]);

  return {
    account,
    chainId,
    onChain,
    loading,
    error,
    provider: providerRef.current,
    connect,
    disconnect,
    refresh,
  };
}
