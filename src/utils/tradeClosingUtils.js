import { supabase } from '@/lib/customSupabaseClient';
import { calculateProfitLoss } from '@/lib/tradeUtils';

/**
 * Calculate the final P/L for a trade including admin adjustments
 * @param {Object} trade - The trade object
 * @param {Object} asset - The asset object with contract_size
 * @param {number} closePrice - The closing price
 * @returns {Object} - { calculatedPL, adminAdjustment, finalPL }
 */
export const calculateFinalPL = (trade, asset, closePrice) => {
  if (!trade || !asset) {
    return { calculatedPL: 0, adminAdjustment: 0, finalPL: 0 };
  }

  // FIX: pass trade.symbol so calculateProfitLoss can resolve contract_size
  // if asset.contract_size is null/undefined/0
  const calculatedPL = calculateProfitLoss(
    trade.type,
    Number(trade.open_price),
    closePrice,
    Number(trade.lot_size),
    asset.contract_size,
    trade.symbol  // ← ADDED: allows fallback to getContractSizeBySymbol
  );

  const adminAdjustment = Number(trade.pl_adjustment) || 0;

  // FIX: calculateProfitLoss can return null if validation or sanity checks fail.
  // null + 0 = 0 in JS, which caused the $0.00 bug.
  if (calculatedPL === null) {
    console.error('[calculateFinalPL] calculateProfitLoss returned null. Check inputs:', {
      symbol: trade.symbol,
      type: trade.type,
      open_price: trade.open_price,
      closePrice,
      lot_size: trade.lot_size,
      contract_size: asset.contract_size,
    });
    return { calculatedPL: null, adminAdjustment, finalPL: null, error: true };
  }

  const finalPL = calculatedPL + adminAdjustment;

  return {
    calculatedPL,
    adminAdjustment,
    finalPL,
  };
};

/**
 * Close a trade using the definitive closing function (close_trade_final)
 * Passes exactly 3 parameters to avoid "is not unique" RPC errors.
 * @param {string} tradeId - Trade ID
 * @param {number} closePrice - Closing price
 * @param {Date} closeTime - Closing time (optional, defaults to now)
 * @returns {Promise<Object>} - Result from the database function
 */
export const closeTrade = async (tradeId, closePrice, closeTime = new Date()) => {
  try {
    const { data, error } = await supabase.rpc('close_trade_final', {
      p_trade_id: tradeId,
      p_close_price: closePrice,
      p_close_time: closeTime.toISOString(),
    });

    if (error) {
      console.error('Supabase RPC Error:', error.message);
      throw new Error(error.message || 'Error executing close_trade_final');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error closing trade:', error);
    return {
      success: false,
      error: error.message || 'Ocurrió un error inesperado al cerrar la operación.',
    };
  }
};

/**
 * Validate if a trade can be closed
 * @param {Object} trade - The trade object
 * @returns {Object} - { canClose: boolean, reason: string }
 */
export const validateTradeClose = (trade) => {
  if (!trade) return { canClose: false, reason: 'Trade not found' };
  if (trade.status !== 'OPEN') return { canClose: false, reason: 'Trade is already closed' };
  if (!trade.symbol || !trade.type) return { canClose: false, reason: 'Invalid trade data' };
  return { canClose: true, reason: '' };
};

/**
 * Format P/L display with admin adjustment indicator
 */
export const formatPLDisplay = (calculatedPL, adminAdjustment, finalPL) => {
  const parts = [];

  if (adminAdjustment !== 0) {
    parts.push(`Natural: $${calculatedPL.toFixed(2)}`);
    parts.push(`Ajuste: ${adminAdjustment >= 0 ? '+' : ''}$${adminAdjustment.toFixed(2)}`);
    parts.push(`Final: $${finalPL.toFixed(2)}`);
    return parts.join(' | ');
  }

  return `$${finalPL.toFixed(2)}`;
};