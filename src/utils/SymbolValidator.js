// Map of internal symbols to standard format (typically TradingView/Finnhub compatible)
const SYMBOL_MAP = {
  // Forex
  'EUR/USD': 'EURUSD',
  'GBP/USD': 'GBPUSD',
  'USD/JPY': 'USDJPY',
  'USD/CHF': 'USDCHF',
  'AUD/USD': 'AUDUSD',
  'USD/CAD': 'USDCAD',
  'NZD/USD': 'NZDUSD',
  'USD/MXN': 'USDMXN',
  'GBP/JPY': 'GBPJPY',
  
  // Crypto (Commonly used suffixes like USDT or USD on various exchanges)
  'BTC/USD': 'BTCUSDT', // Using Binance symbol as default for better data availability
  'ETH/USD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
  'XRP/USD': 'XRPUSDT',
  'ADA/USD': 'ADAUSDT',
  
  // Commodities
  'XAU/USD': 'XAUUSD', // Gold
  'XAG/USD': 'XAGUSD', // Silver
  'WTI/USD': 'USOIL',  // Oil (often USOIL or CL1!)
  
  // Indices (Often differ by provider)
  'US30': 'US30',
  'SPX500': 'SPX500',
  'NAS100': 'NAS100',
  'GER40': 'DE40',
};

const SUPPORTED_SYMBOLS = Object.keys(SYMBOL_MAP);

/**
 * Validates and normalizes an asset symbol.
 * @param {string} symbol - The symbol to validate (e.g., 'EUR/USD').
 * @returns {string} - The normalized symbol (e.g., 'EURUSD') or throws error.
 */
export const normalizeSymbol = (symbol) => {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  // Check if it's already in the normalized format in our values
  const isAlreadyNormalized = Object.values(SYMBOL_MAP).includes(symbol);
  if (isAlreadyNormalized) {
    return symbol;
  }

  // Check map
  const normalized = SYMBOL_MAP[symbol];
  if (normalized) {
    return normalized;
  }

  // Fallback: If it looks valid but isn't in map, try removing slash
  const simpleFormat = symbol.replace('/', '').toUpperCase();
  // Basic validation regex: 3-6 chars usually for pairs
  if (/^[A-Z0-9]{3,10}$/.test(simpleFormat)) {
      return simpleFormat;
  }

  throw new Error(`Symbol '${symbol}' is not supported or invalid format.`);
};

/**
 * Checks if a symbol is supported by the platform.
 * @param {string} symbol 
 * @returns {boolean}
 */
export const isSymbolSupported = (symbol) => {
  try {
    normalizeSymbol(symbol);
    return true;
  } catch (e) {
    return false;
  }
};

export default {
  normalizeSymbol,
  isSymbolSupported,
  SYMBOL_MAP
};