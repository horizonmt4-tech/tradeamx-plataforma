// coinbaseWallet.js
// Utilidad de conexión con Coinbase Wallet + agregar token TAMX.
// Usa la API v4 de @coinbase/wallet-sdk (createCoinbaseWalletSDK),
// que es la que instala `npm install @coinbase/wallet-sdk` hoy en día.
// La v3 usaba `new CoinbaseWalletSDK(...)` — esa clase ya no existe en v4.

import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { BrowserProvider } from 'ethers';

const APP_NAME = 'TradeAMX';
const APP_LOGO_URL = 'https://tradeamx.com/logo.png'; // ajustar a tu logo real

// --- Config de red: cambia esto cuando pases de Sepolia a Polygon mainnet ---
export const NETWORK = {
  chainIdHex: '0xaa36a7', // Sepolia = 11155111. Polygon mainnet = 0x89 (137)
  chainId: 11155111,
  chainName: 'Sepolia',
  rpcUrls: ['https://sepolia.infura.io/v3/TU_API_KEY'], // reemplazar
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const TAMX_TOKEN_ADDRESS = '0xbC2356eD4c21fb3c6d76AF2B30B1D693775D4043';

let sdk;
let cbProvider;

function getProvider() {
  if (!sdk) {
    sdk = createCoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
      appChainIds: [NETWORK.chainId],
      preference: { options: 'all' }, // 'all' | 'smartWalletOnly' | 'eoaOnly'
    });
    cbProvider = sdk.getProvider();
  }
  return cbProvider;
}

export async function connectCoinbaseWallet() {
  const provider = getProvider();
  const accounts = await provider.request({ method: 'eth_requestAccounts' });

  // Asegura que la wallet esté en la red correcta
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainIdHex }],
    });
  } catch (switchError) {
    // 4902 = la red no existe en la wallet todavía, hay que agregarla
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: NETWORK.chainIdHex,
          chainName: NETWORK.chainName,
          rpcUrls: NETWORK.rpcUrls,
          nativeCurrency: NETWORK.nativeCurrency,
          blockExplorerUrls: NETWORK.blockExplorerUrls,
        }],
      });
    } else {
      throw switchError;
    }
  }

  const ethersProvider = new BrowserProvider(provider);
  return { address: accounts[0], ethersProvider, rawProvider: provider };
}

export async function addTamxToWallet({
  tokenAddress = TAMX_TOKEN_ADDRESS,
  symbol = 'TAMX',
  decimals = 18,
  image = '',
} = {}) {
  const provider = getProvider();
  return provider.request({
    method: 'wallet_watchAsset',
    params: { type: 'ERC20', options: { address: tokenAddress, symbol, decimals, image } },
  });
}

export function disconnectCoinbaseWallet() {
  sdk = null;
  cbProvider = null;
}