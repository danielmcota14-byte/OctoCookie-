// Configuração do módulo do token. TUDO vem de variáveis de ambiente (nenhum segredo no código ou no navegador).
import { ethers } from 'ethers';

// Contrato oficial do OctoToken na Sepolia (chain 11155111). Pode ser sobrescrito por TOKEN_CONTRACT_ADDRESS.
export const DEFAULT_CONTRACT_ADDRESS = '0x2f5f737D15ec5C79995f2d72dD0A0DaA1b75a44D';
export const DEFAULT_CHAIN_ID = 11155111;
export const DEFAULT_EXPLORER_URL = 'https://sepolia.etherscan.io';
// RPC público da Sepolia, usado só se TOKEN_RPC_URL não for definido. Serve para começar; em produção prefira o seu (Alchemy/Infura).
export const DEFAULT_SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

const num = (v, d) => (Number.isFinite(Number(v)) && String(v ?? '').trim() !== '' ? Number(v) : d);

export function loadTokenConfig(env = process.env) {
  const issues = [];
  const addr = (name, v, required) => {
    if (!v) { if (required) issues.push(`${name} não definido.`); return null; }
    if (!ethers.isAddress(v)) { issues.push(`${name} inválido.`); return null; }
    return ethers.getAddress(v);
  };
  const contract = addr('TOKEN_CONTRACT_ADDRESS', env.TOKEN_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS, true);
  // Sem TOKEN_TREASURY_ADDRESS, a tesouraria passa a ser o owner() do contrato (resolvido na rede pelo ChainService).
  const treasury = addr('TOKEN_TREASURY_ADDRESS', env.TOKEN_TREASURY_ADDRESS, false);
  const chainId = num(env.TOKEN_CHAIN_ID, DEFAULT_CHAIN_ID);
  if (!chainId) issues.push('TOKEN_CHAIN_ID não definido (ex.: 11155111 para Sepolia).');
  const rpcUrl = String(env.TOKEN_RPC_URL || '').trim() || (chainId === DEFAULT_CHAIN_ID ? DEFAULT_SEPOLIA_RPC_URL : '');
  if (!rpcUrl) issues.push('TOKEN_RPC_URL não definido (obrigatório fora da Sepolia).');
  if (contract && treasury && contract === treasury) issues.push('A tesouraria não pode ser o endereço do contrato.');
  return {
    contract, treasury, chainId,
    rpcUrl, rpcIsDefault: !String(env.TOKEN_RPC_URL || '').trim(), treasuryIsDefault: !treasury,
    explorerUrl: (env.TOKEN_EXPLORER_URL || DEFAULT_EXPLORER_URL).replace(/\/$/, ''), // ex.: https://sepolia.etherscan.io
    minConfirmations: Math.max(1, Math.floor(num(env.TOKEN_MIN_CONFIRMATIONS, 3))),
    orderTtlMs: Math.max(5, num(env.TOKEN_ORDER_TTL_MIN, 30)) * 60_000,
    historyBlocks: Math.min(20_000, Math.max(100, Math.floor(num(env.TOKEN_HISTORY_BLOCKS, 5000)))),
    skipSelectorCheck: env.TOKEN_SKIP_SELECTOR_CHECK === '1', // só para contratos proxy (o bytecode não traz os seletores)
    minterKey: env.TOKEN_MINTER_PRIVATE_KEY || '',             // OPCIONAL. Sem ele, recompensas ficam para aprovação/emissão manual.
    issues,
  };
}
