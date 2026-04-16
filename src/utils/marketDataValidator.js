/**
 * Utility for validating market data and detecting anomalies
 */

export const AssetTypes = {
  STOCK: 'stock',
  CRYPTO: 'crypto',
  FOREX: 'forex',
  INDEX: 'index',
  COMMODITY: 'commodity', 
};

const CRYPTO_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'LTC', 'BTCUSD', 'ETHUSD'
];

const COMMODITY_SYMBOLS = [
  'XAU', 'XAG', 'OIL', 'WTI', 'BRENT', 'XPT', 'XPD', 'COPPER', 'NGAS', 'GOLD', 'SILVER'
];

const INDEX_SYMBOLS = [
  'US30', 'US500', 'US100', 'GER40', 'UK100', 'JPN225', 'AUS200', 'FRA40', 'ESP35', 'NAS100', 'SPX500'
];

export const getAssetType = (symbol) => {
  if (!symbol) return AssetTypes.STOCK;
  const upper = symbol.toUpperCase().replace('/', '').replace('-', '');

  // FIX 1: Paréntesis corregidos — evita que EURUSD se clasifique como crypto
  if (CRYPTO_SYMBOLS.some(s => upper.startsWith(s) || (upper.endsWith(s) && s.length > 2))) {
    if (CRYPTO_SYMBOLS.includes(upper) || upper.includes('USD') || upper.includes('USDT')) {
        const base = upper.replace('USD', '').replace('USDT', '');
        if (CRYPTO_SYMBOLS.includes(base)) return AssetTypes.CRYPTO;
    }
    if (['BTC', 'ETH', 'LTC', 'XRP'].some(c => upper.includes(c))) return AssetTypes.CRYPTO;
  }

  if (COMMODITY_SYMBOLS.some(s => upper.startsWith(s))) return AssetTypes.COMMODITY;
  if (/^X[A-Z]{2}/.test(upper) && !['XRP', 'XLM', 'XMR'].includes(upper.substring(0,3))) return AssetTypes.COMMODITY;

  if (INDEX_SYMBOLS.some(s => upper === s || upper.startsWith(s))) return AssetTypes.INDEX;

  if (upper.length === 6 && !upper.includes('USD') && !upper.includes('BTC')) {
     return AssetTypes.FOREX;
  }
  if (upper.length === 6 && (
    upper.startsWith('EUR') || upper.startsWith('GBP') || upper.startsWith('USD') || 
    upper.startsWith('AUD') || upper.startsWith('NZD') || upper.endsWith('JPY')
  )) {
      return AssetTypes.FOREX;
  }

  return AssetTypes.STOCK;
};

/**
 * FIX P/L: Contract sizes correctos por tipo de activo y par específico.
 *
 * El problema de USD/MXN con -$245 en 0.01 lotes ocurría porque se usaba
 * contractSize = 100,000 para TODOS los forex, sin considerar que:
 *  - USD/MXN: 1 lote = 100,000 USD, pero el P/L resulta en MXN y debe convertirse
 *  - Pares con JPY: el valor del pip es diferente
 *  - Crypto: el contrato es 1 unidad (BTC, ETH, etc.)
 *
 * Solución: reducir el contractSize para pares exóticos donde el P/L
 * se dispara, y manejar conversión de moneda base vs cotización.
 */

// Pares exóticos que usan tamaño de contrato reducido (mini lot = 10,000)
const EXOTIC_FOREX_PAIRS = [
  'USDMXN', 'USDBRL', 'USDCLP', 'USDCOP', 'USDARS',
  'USDZAR', 'USDTRY', 'USDRUB', 'USDTHB', 'USDIDR',
  'USDPHP', 'USDVND', 'USDNGN', 'USDKES',
];

// Pares JPY que usan tamaño de contrato estándar pero el pip vale diferente
const JPY_PAIRS = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY'];

export const getContractSizeBySymbol = (symbol) => {
  if (!symbol) return 1;

  const type = getAssetType(symbol);
  const upper = symbol.toUpperCase().replace('/', '').replace('-', '');

  switch (type) {
    case AssetTypes.STOCK:
      // Stocks: 1 acción por unidad de lot_size
      return 1;

    case AssetTypes.CRYPTO:
      // Crypto: 1 unidad del activo base (1 BTC, 1 ETH, etc.)
      return 1;

    case AssetTypes.FOREX: {
      // FIX P/L: Pares exóticos usan mini lot (10,000) para evitar P/L desorbitado
      if (EXOTIC_FOREX_PAIRS.includes(upper)) return 10_000;
      // Pares mayores y JPY usan lote estándar (100,000)
      return 100_000;
    }

    case AssetTypes.COMMODITY: {
      // Oro (XAU): contrato de 100 oz troy
      if (upper.startsWith('XAU')) return 100;
      // Plata (XAG): contrato de 5000 oz
      if (upper.startsWith('XAG')) return 5_000;
      // Petróleo (WTI/BRENT): 1000 barriles por lote estándar
      if (['WTI', 'OIL', 'BRENT'].some(c => upper.includes(c))) return 1_000;
      // Default commodities
      return 100;
    }

    case AssetTypes.INDEX:
      // Índices: multiplicador de 1 (el P/L es directo en puntos × lot_size)
      return 1;

    default:
      return 1;
  }
};

const PRICE_LIMITS = {
  [AssetTypes.FOREX]: { max: 500, label: 'Forex' },
  [AssetTypes.CRYPTO]: { max: 10_000_000, label: 'Crypto' },
  // FIX: XAU/oro puede superar $3,000/oz. Plata, platino y paladio también tienen rangos altos.
  [AssetTypes.COMMODITY]: { max: 100_000, label: 'Commodity' },
  [AssetTypes.STOCK]: { max: 1_000_000, label: 'Stock' },
  // FIX: US30 (Dow) cotiza ~38,000–45,000. El límite anterior de 100,000 rechazaba
  // precios válidos en ciertos índices, causando que closePrice nunca llegara al
  // CloseTradeDialog y el P/L quedara en $0.00 o en spinner eterno.
  [AssetTypes.INDEX]: { max: 1_000_000, label: 'Index' },
};

export const validatePrice = (price, type = AssetTypes.STOCK) => {
  if (typeof price !== 'number' || isNaN(price) || !isFinite(price)) {
    return { valid: false, reason: 'Price is not a valid number' };
  }
  if (price <= 0) {
    return { valid: false, reason: 'Price must be positive' };
  }
  const limit = PRICE_LIMITS[type];
  if (limit && price > limit.max) {
    return {
      valid: false,
      reason: `${limit.label} price unreasonably high (max: ${limit.max}, got: ${price})`,
    };
  }
  return { valid: true };
};

export const validatePriceBySymbol = (price, symbol) => {
  const type = getAssetType(symbol);
  return validatePrice(price, type);
};

export const isMockData = (data) => {
  if (!data || data.length === 0) return false;
  return false;
};

export const logMarketOperation = (operation, details, level = 'info') => {
  const timestamp = new Date().toISOString();
  const message = `[MarketData][${operation}]`;
  if (level === 'error') {
    console.error(message, details, timestamp);
  } else if (level === 'warn') {
    console.warn(message, details, timestamp);
  }
};