// Conexão de carteira (EIP-1193 / MetaMask etc.) com ethers.js. Só chama funções que existem no ABI informado.
import { BrowserProvider, Contract, formatUnits, type Eip1193Provider } from "ethers";

export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function mint(address _to, uint256 _value)",
];

export type OnChain = {
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  totalSupply: bigint;
};

export const getEthereum = (): Eip1193Provider | null =>
  typeof window !== "undefined"
    ? ((window as unknown as { ethereum?: Eip1193Provider }).ethereum ?? null)
    : null;

export function walletError(e: unknown): string {
  const err = e as {
    code?: number | string;
    shortMessage?: string;
    message?: string;
    info?: { error?: { message?: string } };
  };
  if (err?.code === 4001 || err?.code === "ACTION_REJECTED")
    return "Operação cancelada na carteira.";
  if (err?.code === -32002)
    return "Já existe uma solicitação pendente na carteira. Abra-a para continuar.";
  return (
    err?.info?.error?.message ||
    err?.shortMessage ||
    err?.message ||
    "Erro desconhecido na carteira."
  );
}

export async function connectWallet() {
  const eth = getEthereum();
  if (!eth)
    throw new Error("Nenhuma carteira Web3 encontrada. Instale a MetaMask (ou outra compatível).");
  const provider = new BrowserProvider(eth);
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  if (!accounts?.length) throw new Error("Nenhuma conta autorizada na carteira.");
  const net = await provider.getNetwork();
  return { provider, account: accounts[0], chainId: Number(net.chainId) };
}

export async function switchChain(chainId: number) {
  const eth = getEthereum();
  if (!eth) throw new Error("Carteira não encontrada.");
  await eth.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x" + chainId.toString(16) }],
  });
}

/** Lê o token DIRETAMENTE do contrato (nome, símbolo, decimals, saldo, oferta). */
export async function readToken(
  provider: BrowserProvider,
  contract: string,
  account: string,
): Promise<OnChain> {
  const c = new Contract(contract, TOKEN_ABI, provider);
  const [name, symbol, decimals, balance, totalSupply] = await Promise.all([
    c.name(),
    c.symbol(),
    c.decimals(),
    c.balanceOf(account),
    c.totalSupply(),
  ]);
  return { name, symbol, decimals: Number(decimals), balance, totalSupply };
}

/** Pagamento direto: transfer(tesouraria, valor). O usuário confirma na própria carteira. Retorna o hash. */
export async function sendTransfer(
  provider: BrowserProvider,
  contract: string,
  treasury: string,
  amountUnits: bigint,
): Promise<string> {
  const signer = await provider.getSigner();
  const c = new Contract(contract, TOKEN_ABI, signer);
  const tx = await c.transfer(treasury, amountUnits);
  return tx.hash as string;
}

/**
 * Emissão (mint) pela carteira do OWNER, no navegador do admin: nenhuma chave privada passa pelo servidor.
 * Simula antes (staticCall) para não gastar gás numa chamada que seria recusada. Retorna o hash.
 */
export async function mintWithOwnerWallet(
  provider: BrowserProvider,
  contract: string,
  to: string,
  amountUnits: bigint,
): Promise<string> {
  const signer = await provider.getSigner();
  const c = new Contract(contract, TOKEN_ABI, signer);
  await c.mint.staticCall(to, amountUnits);
  const tx = await c.mint(to, amountUnits);
  return tx.hash as string;
}

export async function signMessage(provider: BrowserProvider, message: string): Promise<string> {
  return (await provider.getSigner()).signMessage(message);
}

export const fmtUnits = (v: bigint | string, decimals: number, maxFrac = 4): string => {
  const [i, f = ""] = formatUnits(v, decimals).split(".");
  const frac = f.slice(0, maxFrac).replace(/0+$/, "");
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (frac ? "," + frac : "");
};
export const short = (a: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
