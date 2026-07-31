import { getContractSizeBySymbol, getAssetType, AssetTypes } from '@/utils/marketDataValidator';

/**
 * FIX: SANITY_CAP dinámico por tipo de activo.
 */
const getSanityCap = (symbol) => {
  if (!symbol) return 500;
  const type = getAssetType(symbol);
  if (type === AssetTypes.CRYPTO)    return 5000;
  if (type === AssetTypes.INDEX)     return 1000;
  if (type === AssetTypes.COMMODITY) return 1000;
  return 500;
};

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

const isPriceReasonable = (openPrice, currentPrice, maxDeviationPercent = 50) => {
  if (openPrice <= 0 || currentPrice <= 0) return false;
  const deviation = Math.abs((currentPrice - openPrice) / openPrice * 100);
  if (deviation > 20) {
    console.warn(`Price deviation > 20% detected: ${deviation.toFixed(2)}%. Open: ${openPrice}, Current: ${currentPrice}`);
  }
  return deviation <= maxDeviationPercent;
};

/**
 * FIX CRÍTICO — BUG DEL $185 → $1:
 *
 * ANTES: si había 'symbol', SIEMPRE se usaba getContractSizeBySymbol(symbol),
 * ignorando por completo el contractSize real que se pasaba como argumento
 * (el congelado en el trade o el configurado en la tabla `assets`).
 *
 * Esto causaba que el diálogo de cierre (CloseTradeDialog) calculara un P/L
 * hasta 100x distinto al que mostraba la posición en tiempo real
 * (useRealTimePL) y al que realmente aplicaba el backend (close_trade_final),
 * porque esos dos SÍ usan el contract_size real/congelado.
 *
 * AHORA: se prioriza el contractSize real (>1, es decir, un valor configurado
 * y no un placeholder). getContractSizeBySymbol() queda SOLO como fallback
 * de última instancia, cuando no tenemos ningún valor real disponible.
 * Esto alinea las 3 fuentes: useRealTimePL, close_trade_final RPC, y
 * calculateProfitLoss — todas confían primero en el dato real de la BD.
 */
const resolveContractSize = (contractSize, symbol) => {
  const provided = Number(contractSize);
  if (provided && provided > 1) {
    return provided; // ✅ Fuente de verdad: valor real (congelado en trade o de assets)
  }
  if (symbol) {
    return getContractSizeBySymbol(symbol); // Fallback: adivinar por patrón
  }
  return 100000; // Último recurso
};

export const calculateOpeningPrice = (type, currentPrice, pnl, lotSize, contractSize = null, symbol = null) => {
  const finalContractSize = resolveContractSize(contractSize, symbol);

  const cPrice = validateNumber(currentPrice, 'currentPrice', 0);
  const targetPnL = Number(pnl);
  const lots = validateNumber(lotSize, 'lotSize', 0);
  const cSize = validateNumber(finalContractSize, 'contractSize', 0);

  if (cPrice === null || lots === null || cSize === null || isNaN(targetPnL)) {
    return null;
  }

  const volumeFactor = lots * cSize;
  if (!volumeFactor || volumeFactor === 0) return cPrice;

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

export const calculateProfitLoss = (type, openPrice, currentPrice, lotSize, contractSize = null, symbol = null) => {
  const finalContractSize = resolveContractSize(contractSize, symbol);

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

export const calculateProfitLossSafe = (type, openPrice, currentPrice, lotSize, contractSize = null, symbol = null) => {
  const result = calculateProfitLoss(type, openPrice, currentPrice, lotSize, contractSize, symbol);
  return result !== null ? result : 0;
};

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