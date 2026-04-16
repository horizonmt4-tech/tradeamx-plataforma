/**
 * Utility to detect asset types based on symbol patterns and known lists.
 */

const KNOWN_INDICES = ['US30', 'SPX500', 'NAS100', 'GER30', 'GER40', 'UK100', 'FRA40', 'EU50', 'JP225'];
const KNOWN_STOCKS = ['META', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'NVDA', 'NFLX', 'AMD', 'INTC', 'PG', 'KO', 'PEP', 'WMT', 'JPM', 'V', 'MA'];
const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE', 'SHIB', 'LTC', 'LINK', 'UNI', 'MATIC', 'BNB'];

/**
 * Detects the asset type for a given symbol.
 * @param {string} symbol 
 * @returns {'crypto' | 'forex' | 'stock' | 'index'}
 */
export const detectAssetType = (symbol) => {
  if (!symbol) return 'crypto';
  
  const upperSymbol = symbol.toUpperCase();

  // 1. Check for specific Indices
  if (KNOWN_INDICES.includes(upperSymbol)) {
    return 'index';
  }

  // 2. Check for Forex (Standard format usually contains '/')
  // Or is a known pair without slash (EURUSD, GBPJPY)
  if (upperSymbol.includes('/')) {
    return 'forex';
  }
  
  // Basic forex pair regex (3 chars + 3 chars)
  // Exclude Crypto pairs that might match this (like BTCUSD)
  if (/^[A-Z]{6}$/.test(upperSymbol) && !CRYPTO_CURRENCIES.some(c => upperSymbol.startsWith(c))) {
      // Check if it starts with common forex currencies
      const forexMajors = ['EUR', 'GBP', 'USD', 'AUD', 'NZD', 'CAD', 'CHF', 'JPY'];
      if (forexMajors.some(curr => upperSymbol.startsWith(curr))) {
          return 'forex';
      }
  }

  // 3. Check for Stocks (Known list or single ticker format not matching crypto)
  if (KNOWN_STOCKS.includes(upperSymbol)) {
    return 'stock';
  }

  // 4. Default to Crypto for everything else (Safe fallback for this platform)
  // Or check known crypto list
  if (CRYPTO_CURRENCIES.some(c => upperSymbol.startsWith(c) || upperSymbol.endsWith(c))) {
    return 'crypto';
  }
  
  // If it's a simple ticker like 'PLTR' that isn't in our short list, assume stock if length <= 5
  if (/^[A-Z]{1,5}$/.test(upperSymbol) && !CRYPTO_CURRENCIES.includes(upperSymbol)) {
      return 'stock';
  }

  return 'crypto';
};

export const isStockSymbol = (symbol) => detectAssetType(symbol) === 'stock';
export const isCryptoSymbol = (symbol) => detectAssetType(symbol) === 'crypto';
export const isForexSymbol = (symbol) => detectAssetType(symbol) === 'forex';
export const isIndexSymbol = (symbol) => detectAssetType(symbol) === 'index';

export default {
  detectAssetType,
  isStockSymbol,
  isCryptoSymbol,
  isForexSymbol,
  isIndexSymbol
};