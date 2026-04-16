import { detectAssetType } from './assetTypeDetector';

/**
 * Maps internal symbols to API-specific formats.
 * 
 * @param {string} symbol - Internal symbol (e.g. "BTC/USD", "META")
 * @param {string} api - Target API ("BINANCE" or "FINNHUB")
 * @returns {string} - Formatted symbol
 */
export const mapSymbol = (symbol, api = 'BINANCE') => {
  if (!symbol) return '';
  const type = detectAssetType(symbol);
  const upper = symbol.toUpperCase();

  // --- BINANCE MAPPING (Crypto & Forex proxies) ---
  if (api === 'BINANCE') {
    // Remove slashes
    let clean = upper.replace('/', '');
    
    // Crypto: Ensure USDT suffix if not present and not BUSD
    if (type === 'crypto') {
      if (clean === 'BTC') return 'BTCUSDT';
      if (clean === 'ETH') return 'ETHUSDT';
      if (!clean.endsWith('USDT') && !clean.endsWith('BUSD') && !clean.endsWith('BTC')) {
        return `${clean}USDT`;
      }
    }
    
    // Forex: Binance has some pairs like EURUSDT (Tokenized) or just maps directly
    if (type === 'forex') {
      // Binance supports EURUSDT, GBPUSDT etc.
      // If the pair is EUR/USD, we map to EURUSDT
      if (clean === 'EURUSD') return 'EURUSDT';
      if (clean === 'GBPUSD') return 'GBPUSDT';
      // For others, Binance might not have them.
      return `${clean}T`; // Try adding T (USDJPY -> USDJPYT is not valid, but USDJPY doesn't exist on Binance spot usually. Fallback will handle failure)
    }

    return clean;
  }

  // --- FINNHUB MAPPING (Stocks & Indices) ---
  if (api === 'FINNHUB') {
    if (type === 'stock') {
      return upper; // META -> META
    }
    
    if (type === 'index') {
      // Finnhub (and many providers) often use specific tickers for indices
      // OANDA/Forex.com tickers often used by Finnhub for CFDs
      // However, Finnhub stock candles endpoint expects pure tickers.
      // Indices might need specific symbols or might not be available on free tier standard candle endpoint easily.
      // We will map common ones.
      if (upper === 'SPX500' || upper === 'US500') return '^GSPC'; // S&P 500
      if (upper === 'NAS100' || upper === 'US100') return '^NDX';  // Nasdaq 100
      if (upper === 'US30' || upper === 'DJI') return '^DJI';      // Dow Jones
      return upper;
    }

    return upper;
  }

  return upper;
};

export default mapSymbol;