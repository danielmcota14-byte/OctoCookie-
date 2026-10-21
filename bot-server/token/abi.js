// ABI do OctoToken (contrato implantado na Sepolia). Fonte completa: octotoken.abi.json (mesma interface).
// O servidor só chama as funções de leitura, transfer() (validação) e, opcionalmente, mint() com a chave do owner.
import { ethers } from 'ethers';

export const TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function owner() view returns (address)',
  'function tokenPrice() view returns (uint256)',
  'function transfer(address _to, uint256 _value) returns (bool)',
  'function approve(address _spender, uint256 _value) returns (bool)',
  'function transferFrom(address _from, address _to, uint256 _value) returns (bool)',
  'function mint(address _to, uint256 _value)',
  'function burn(uint256 _value)',
  'function buy() payable',
  'function setPrice(uint256 _newPrice)',
  'function withdrawETH()',
  'function recoverTokens(address _token, uint256 _amount)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event TokensPurchased(address indexed buyer, uint256 ethSpent, uint256 tokensReceived)',
];

export const iface = new ethers.Interface(TOKEN_ABI);

// Funções sem as quais o token não serve para pagamentos; as demais são "capacidades" opcionais.
export const REQUIRED_FUNCTIONS = ['name', 'symbol', 'decimals', 'totalSupply', 'balanceOf', 'transfer', 'approve', 'allowance', 'transferFrom'];
export const OPTIONAL_FUNCTIONS = ['mint', 'burn', 'owner', 'tokenPrice', 'buy', 'setPrice', 'withdrawETH', 'recoverTokens'];
export const selector = (fn) => iface.getFunction(fn).selector;
