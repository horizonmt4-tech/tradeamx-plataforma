import { supabase } from '@/lib/customSupabaseClient';
import { calculateProfitLoss } from '@/lib/tradeUtils';

/**
 * Calculate the final P/L for a trade, respecting admin overrides.
 */
export const calculateFinalPL = (trade, asset, closePrice) => {
  if (!trade || !asset) {
    return { calculatedPL: 0, isOverride: false, finalPL: 0 };
  }

  if (trade.pl_adjustment_is_override) {
    const finalPL = Number(trade.pl_adjustment) || 0;
    return {
      calculatedPL: finalPL,
      isOverride: true,
      finalPL,
    };
  }

  // FIX CRÍTICO — BUG $185 → $1:
  // Antes se pasaba SOLO asset.contract_size. Pero calculateProfitLoss,
  // al recibir también trade.symbol, ignoraba ese valor y usaba
  // getContractSizeBySymbol() en su lugar — una función de patrones que
  // puede no coincidir con el contract_size real configurado en la BD.
  //
  // Ahora priorizamos trade.contract_size (el valor CONGELADO al momento
  // de abrir la operación) — es la misma fuente que usa useRealTimePL()
  // para mostrar el P/L en tiempo real, y la misma que usa close_trade_final
  // en el backend. Si por algún motivo no está congelado en el trade,
  // caemos a asset.contract_size (el configurado actualmente en la BD).
  const contractSize = Number(trade.contract_size) > 0
    ? Number(trade.contract_size)
    : Number(asset.contract_size);

  const calculatedPL = calculateProfitLoss(
    trade.type,
    Number(trade.open_price),
    closePrice,
    Number(trade.lot_size),
    contractSize,
    trade.symbol
  );

  if (calculatedPL === null) {
    console.error('[calculateFinalPL] calculateProfitLoss returned null. Check inputs:', {
      symbol: trade.symbol,
      type: trade.type,
      open_price: trade.open_price,
      closePrice,
      lot_size: trade.lot_size,
      trade_contract_size: trade.contract_size,
      asset_contract_size: asset.contract_size,
    });
    return { calculatedPL: null, isOverride: false, finalPL: null, error: true };
  }

  return {
    calculatedPL,
    isOverride: false,
    finalPL: calculatedPL,
  };
};

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

export const validateTradeClose = (trade) => {
  if (!trade) return { canClose: false, reason: 'Trade not found' };
  if (trade.status !== 'OPEN') return { canClose: false, reason: 'Trade is already closed' };
  if (!trade.symbol || !trade.type) return { canClose: false, reason: 'Invalid trade data' };
  return { canClose: true, reason: '' };
};

export const formatPLDisplay = (finalPL) => {
  return `$${Number(finalPL).toFixed(2)}`;
};