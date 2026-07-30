// multiWallet.js
// Conexión genérica a wallets inyectadas en el navegador (MetaMask, Trust Wallet)
// usando el estándar EIP-6963 (descubrimiento moderno, múltiples wallets a la vez)
// con fallback al método legacy (window.ethereum) para extensiones más viejas.

import { NETWORK, TAMX_TOKEN_ADDRESS } from '@/lib/coinbaseWallet';

// Links directos a la Chrome Web Store para instalar cada wallet.
export const WALLET_INSTALL_URLS = {
  metamask: 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
  trustwallet: 'https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph',
};

const WALLET_NAMES = { metamask: 'MetaMask', trustwallet: 'Trust Wallet' };

// rdns oficiales que cada wallet anuncia vía EIP-6963
const WALLET_RDNS = {
  metamask: 'io.metamask',
  trustwallet: 'com.trustwallet.app',
};

// Recolecta providers anunciados vía EIP-6963 (esperando un instante breve,
// ya que el evento se dispara de forma asíncrona al cargar la página).
function discoverProviders() {
  return new Promise((resolve) => {
    const found = [];
    const handler = (event) => found.push(event.detail);
    window.addEventListener('eip6963:announceProvider', handler);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', handler);
      resolve(found);
    }, 150);
  });
}

async function getInjectedProvider(walletId) {
  const rdns = WALLET_RDNS[walletId];

  // 1. Intenta descubrimiento moderno (EIP-6963) — soporta varias wallets instaladas a la vez.
  const providers = await discoverProviders();
  const match = providers.find((p) => p.info?.rdns === rdns);
  if (match) return match.provider;

  // 2. Fallback legacy: window.ethereum (o window.ethereum.providers[] si hay varias extensiones).
  const candidates = window.ethereum?.providers?.length
    ? window.ethereum.providers
    : window.ethereum
    ? [window.ethereum]
    : [];

  if (walletId === 'metamask') {
    const mm = candidates.find((p) => p.isMetaMask && !p.isTrust);
    if (mm) return mm;
  }
  if (walletId === 'trustwallet') {
    const tw = candidates.find((p) => p.isTrust || p.isTrustWallet);
    if (tw) return tw;
  }

  return null;
}

/**
 * Conecta con MetaMask o Trust Wallet (extensión de escritorio, o el
 * provider inyectado dentro del navegador de su app móvil), cambia a la
 * red Base, y devuelve la dirección conectada + el provider crudo.
 */
export async function connectInjectedWallet(walletId) {
  const provider = await getInjectedProvider(walletId);
  if (!provider) {
    const err = new Error(
      `No se detectó ${WALLET_NAMES[walletId]}. Instálala y vuelve a intentar.`
    );
    err.notInstalled = walletId; // la UI usa esto para ofrecer el link de instalación
    throw err;
  }

  const accounts = await provider.request({ method: 'eth_requestAccounts' });

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainIdHex }],
    });
  } catch (switchError) {
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

  return { address: accounts[0], provider };
}

/** Agrega TAMX a cualquier provider EIP-1193 ya conectado (MetaMask, Trust Wallet). */
export async function addTamxToInjectedWallet(provider, {
  tokenAddress = TAMX_TOKEN_ADDRESS,
  symbol = 'TAMX',
  decimals = 18,
  image = '',
} = {}) {
  return provider.request({
    method: 'wallet_watchAsset',
    params: { type: 'ERC20', options: { address: tokenAddress, symbol, decimals, image } },
  });
}