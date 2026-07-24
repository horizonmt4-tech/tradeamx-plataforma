// src/hooks/useRealTimePL.js
import { useMemo } from 'react';
import { useAssets } from '@/contexts/AssetContext';

// Conversión a USD — misma lógica que la función SQL fx_to_usd
function quoteToUsd(symbol, amount, currentPrice, assets, prices) {
  if (!symbol?.includes('/')) return amount;
  const [base, quote] = symbol.toUpperCase().split('/');
  if (quote === 'USD') return amount;
  if (base === 'USD' && currentPrice) return amount / currentPrice;

  const priceOf = (sym) => {
    const p = prices?.[sym];
    if (p?.mid != null) return Number(p.mid);
    if (p?.bid != null && p?.ask != null) return (Number(p.bid) + Number(p.ask)) / 2;
    const a = assets?.find(x => x.symbol === sym);
    return a?.price != null ? Number(a.price) : null;
  };
  const usdQuote = priceOf(`USD/${quote}`);
  if (usdQuote) return amount / usdQuote;
  const quoteUsd = priceOf(`${quote}/USD`);
  if (quoteUsd) return amount * quoteUsd;
  return amount;
}

// P/L real — alineado 1:1 con close_trade_final
function computePL(trade, prices, assets) {
  if (!trade || trade.status === 'CLOSED') return Number(trade?.profit_loss) || 0;

  // FIX BUG: si el admin fijó un P/L exacto (override), mostramos ese valor
  // SIN oscilación simulada. La oscilación artificial causaba que todos los
  // FloatingPLCell se re-renderizaran al mismo tiempo (mismo Date.now()),
  // haciendo que el admin creyera que todas las trades se habían modificado.
  if (trade.pl_adjustment_is_override) {
    return Number(trade.pl_adjustment) || 0;
  }

  const priceData = trade.symbol ? prices?.[trade.symbol] : null;
  if (!priceData) return null;

  // BUY cierra en bid, SELL en ask
  const exit = (priceData.bid != null && priceData.ask != null)
    ? (trade.type === 'BUY' ? Number(priceData.bid) : Number(priceData.ask))
    : Number(priceData.mid ?? priceData.price);
  if (!exit || Number.isNaN(exit)) return null;

  const open = Number(trade.open_price) || 0;
  const lot  = Number(trade.lot_size)   || 0;
  if (!open || !lot) return null;

  const asset    = assets?.find(a => a.symbol === trade.symbol);
  const contract = Number(trade.contract_size) || Number(asset?.contract_size) || 1;

  const diff = trade.type === 'BUY' ? (exit - open) : (open - exit);
  let pl = diff * lot * contract;
  pl = quoteToUsd(trade.symbol, pl, exit, assets, prices);
  return Math.round(pl * 100) / 100;
}

// ── Hook principal ────────────────────────────────────────────
export const useRealTimePL = (trade) => {
  const { prices, assets } = useAssets();

  // FIX: eliminado el forceTick/setInterval que causaba re-renders
  // en cascada de todos los FloatingPLCell cuando una trade tenía override.
  // Ahora el valor fijo del admin se muestra estático (sin oscilación).
  // Las trades sin override siguen actualizándose en tiempo real
  // porque dependen de 'prices' que cambia cada minuto via sync-prices.

  const pl = useMemo(
    () => computePL(trade, prices, assets),
    [trade, prices, assets]
  );

  return {
    realTimePL:   pl,
    isProfit:     (pl ?? 0) >= 0,
    volatility:   0,
    isLivePrice:  !trade?.pl_adjustment_is_override,
  };
};

// ── P/L total (equity flotante) ───────────────────────────────
export const useTotalPL = (trades = []) => {
  const { prices, assets } = useAssets();
  return useMemo(() => {
    if (!trades?.length) return 0;
    return trades.reduce((total, t) => {
      if (t.status === 'CLOSED') return total;
      const pl = computePL(t, prices, assets);
      return total + (pl ?? 0);
    }, 0);
  }, [trades, prices, assets]);
};

export default useRealTimePL;