import { getAssetType, AssetTypes } from './marketDataValidator';

/**
 * Maps asset symbols to volatility tiers to simulate realistic price movements.
 * Returns the min/max tick size for the given asset.
 */
export const getAssetVolatility = (symbol) => {
  const assetClass = getAssetType(symbol);

  switch (assetClass) {
    case AssetTypes.FOREX:
      return { min: 0.00001, max: 0.0001, assetClass }; // Tight spreads, small movements
    case AssetTypes.CRYPTO:
      return { min: 0.5, max: 2.0, assetClass }; // High volatility
    case AssetTypes.COMMODITY:
      return { min: 0.05, max: 0.5, assetClass }; // Medium volatility
    case AssetTypes.INDEX:
      return { min: 0.5, max: 2.0, assetClass }; // Similar to crypto/stocks but scaled
    case AssetTypes.STOCK:
    default:
      return { min: 0.01, max: 0.05, assetClass }; // Standard stock volatility
  }
};