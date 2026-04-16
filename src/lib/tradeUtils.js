import { getContractSizeBySymbol, getAssetType, AssetTypes } from '@/utils/marketDataValidator';

/**
 * FIX: SANITY_CAP dinámico por tipo de activo.
 * El cap estático de 500% bloqueaba cálculos válidos en crypto e índices,
 * retornando null y causando que el P/L apareciera como $0.00 al cerrar.
 */
const getSanityCap = (symbol) => {
  if (!symbol) return 500;
  const type = getAssetType(symbol);
  if (type === AssetTypes.CRYPTO)    return 5000;
  if (type === AssetTypes.INDEX)     return 1000;
  if (type === AssetTypes.COMMODITY) return 1000;
  return 500;
};

/**
 * Utility for logging price deviations
 */
export const logPriceDeviation = (symbol, oldPrice, newPrice, threshold = 20) => {
  if (!oldPrice || !newPrice || oldPrice <= 0 || newPrice <= 0) return;
  
  const deviation = Math.abs((newPrice - oldPrice) / oldPrice * 100);
  
  if (deviation > threshold) {
    console.warn(
      `[Price Monitor] High deviation for ${symbol}: ${deviation.toFixed(2)}%`,
      `Old: ${oldPrice}, New: ${newPrice}, Threshold: ${threshold}%`
    );
  }
  
  return deviation;
};

/**
 * Validates numeric inputs to prevent calculation errors
 */
const validateNumber = (value, name, min = 0) => {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    console.error(`Invalid ${name}: ${value}`);
    return null;
  }
  
  if (min > -Infinity && num <= min) {
    if (name.includes('Price') && num <= 0) return null;
    if (name.includes('lot') && num <= 0) return null;
  }
  
  return num;
};

/**
 * Validates price deviation to catch data errors.
 */
const isPriceReasonable = (openPrice, currentPrice, maxDeviationPercent = 50) => {
  if (openPrice <= 0 || currentPrice <= 0) return false;
  
  const deviation = Math.abs((currentPrice - openPrice) / openPrice * 100);
  
  if (deviation > 20) {
    console.warn(`Price deviation > 20% detected: ${deviation.toFixed(2)}%. Open: ${openPrice}, Current: ${currentPrice}`);
  }

  return deviation <= maxDeviationPercent;
};

/**
 * Calculates the Opening Price required to achieve a specific P/L at the Current Price.
 */
export const calculateOpeningPrice = (type, currentPrice, pnl, lotSize, contractSize = null, symbol = null) => {
  // Determine correct contract size if not provided
  let finalContractSize = contractSize;
  if (!finalContractSize && symbol) {
      finalContractSize = getContractSizeBySymbol(symbol);
  }
  // Default fallback if still null (though caller should ideally provide symbol or size)
  if (!finalContractSize) finalContractSize = 100000;

  // Validate inputs
  const cPrice = validateNumber(currentPrice, 'currentPrice', 0);
  const targetPnL = Number(pnl); 
  const lots = validateNumber(lotSize, 'lotSize', 0);
  const cSize = validateNumber(finalContractSize, 'contractSize', 0);
  
  if (cPrice === null || lots === null || cSize === null || isNaN(targetPnL)) {
    return null;
  }

  const volumeFactor = lots * cSize;
  
  if (!volumeFactor || volumeFactor === 0) {
    return cPrice;
  }

  let openPrice;
  
  if (type === 'BUY') {
    openPrice = cPrice - (targetPnL / volumeFactor);
  } else if (type === 'SELL') {
    openPrice = cPrice + (targetPnL / volumeFactor);
  } else {
    return null;
  }

  if (openPrice <= 0) return null;

  if (!isPriceReasonable(openPrice, cPrice, 100)) {
     console.warn(`Calculated opening price has high deviation: Open: ${openPrice}, Current: ${cPrice}`);
  }

  return openPrice;
};

/**
 * Calculates the P/L given Open and Current prices.
 * Updated to support symbol-based contract size detection.
 */
export const calculateProfitLoss = (type, openPrice, currentPrice, lotSize, contractSize = null, symbol = null) => {
  // Determine correct contract size
  let finalContractSize = contractSize;
  
  if ((!finalContractSize || finalContractSize === 0) && symbol) {
      finalContractSize = getContractSizeBySymbol(symbol);
  }
  
  // Default fallback
  if (!finalContractSize) finalContractSize = 100000;

  // Validate all inputs
  const oPrice = validateNumber(openPrice, 'openPrice', 0);
  const cPrice = validateNumber(currentPrice, 'currentPrice', 0);
  const lots = validateNumber(lotSize, 'lotSize', 0);
  const cSize = validateNumber(finalContractSize, 'contractSize', 0);
  
  if (oPrice === null || cPrice === null || lots === null || cSize === null) {
    return null;
  }

  if (type !== 'BUY' && type !== 'SELL') {
    return null;
  }

  // FIX: cap dinámico por tipo de activo — el cap estático de 500% bloqueaba
  // cálculos legítimos en crypto (puede moverse >500% desde apertura) e índices.
  const SANITY_CAP = getSanityCap(symbol);

  const deviation = Math.abs((cPrice - oPrice) / oPrice * 100);
  if (deviation > 20) {
    logPriceDeviation('TradeCalc', oPrice, cPrice, 20);
  }

  if (deviation > SANITY_CAP) {
    console.error(`Extreme price deviation (${deviation.toFixed(2)}%) blocked for ${symbol || 'unknown'}. Open: ${oPrice}, Current: ${cPrice}, Cap: ${SANITY_CAP}%`);
    return null;
  }

  const volumeFactor = lots * cSize;
  const MAX_SAFE_VOLUME = Number.MAX_SAFE_INTEGER / Math.max(Math.abs(oPrice), Math.abs(cPrice));
  
  if (volumeFactor > MAX_SAFE_VOLUME) {
    return null;
  }

  let pnl;
  if (type === 'BUY') {
    pnl = (cPrice - oPrice) * volumeFactor;
  } else {
    pnl = (oPrice - cPrice) * volumeFactor;
  }

  if (!isFinite(pnl)) return null;

  const notionalValue = lots * cSize * oPrice;
  const maxReasonablePL = notionalValue * 50;

  if (Math.abs(pnl) > maxReasonablePL) {
     console.warn(`P/L very high, but allowed: ${pnl.toFixed(2)}`);
  }

  return pnl;
};

/**
 * Safe version
 */
export const calculateProfitLossSafe = (type, openPrice, currentPrice, lotSize, contractSize = null, symbol = null) => {
  const result = calculateProfitLoss(type, openPrice, currentPrice, lotSize, contractSize, symbol);
  return result !== null ? result : 0;
};

/**
 * Calculates P/L with custom deviation tolerance.
 */
export const calculateProfitLossWithTolerance = (
  type, 
  openPrice, 
  currentPrice, 
  lotSize, 
  contractSize = null,
  maxDeviationPercent = 50,
  symbol = null
) => {
  const deviation = Math.abs((currentPrice - openPrice) / openPrice * 100);
  if (deviation > maxDeviationPercent) {
    console.warn(`Deviation (${deviation.toFixed(2)}%) exceeds requested tolerance (${maxDeviationPercent}%), but calculation proceeds.`);
  }

  return calculateProfitLoss(type, openPrice, currentPrice, lotSize, contractSize, symbol);
};