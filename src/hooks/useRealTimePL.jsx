// src/hooks/useRealTimePL.js
import { useMemo } from 'react';
import { useAssets } from '@/contexts/AssetContext';

// Conversión a USD — misma lógica que la función SQL fx_to_usd
function quoteToUsd(symbol, amount, currentPrice, assets, prices) {
  if (!symbol?.includes('/')) return amount;            // acciones/índices/commodities en USD
  const [base, quote] = symbol.toUpperCase().split('/');
  if (quote === 'USD') return amount;                    // ya en USD
  if (base === 'USD' && currentPrice) return amount / currentPrice; // USD/XXX

  const priceOf = (sym) => {
    const p = prices?.[sym];
    if (p?.mid != null) return Number(p.mid);
    if (p?.bid != null && p?.ask != null) return (Number(p.bid) + Number(p.ask)) / 2;
    const a = assets?.find(x => x.symbol === sym);
    return a?.price != null ? Number(a.price) : null;
  };
  const usdQuote = priceOf(`USD/${quote}`);   // 1 quote = 1 / precio
  if (usdQuote) return amount / usdQuote;
  const quoteUsd = priceOf(`${quote}/USD`);   // 1 quote = precio
  if (quoteUsd) return amount * quoteUsd;
  return amount;                              // sin tasa: no convertir
}

// P/L real — alineado 1:1 con close_trade_final
function computePL(trade, prices, assets) {
  if (!trade || trade.status === 'CLOSED') return Number(trade?.profit_loss) || 0;

  const priceData = trade.symbol ? prices?.[trade.symbol] : null;
  if (!priceData) return null;   // sin precio → null (el componente muestra spinner, NO 0)

  // BUY cierra en bid, SELL en ask
  const exit = (priceData.bid != null && priceData.ask != null)
    ? (trade.type === 'BUY' ? Number(priceData.bid) : Number(priceData.ask))
    : Number(priceData.mid ?? priceData.price);
  if (!exit || Number.isNaN(exit)) return null;

  const open = Number(trade.open_price) || 0;
  const lot  = Number(trade.lot_size)   || 0;
  if (!open || !lot) return null;

  // contract_size CONGELADO en el trade; fallback a assets
  const asset    = assets?.find(a => a.symbol === trade.symbol);
  const contract = Number(trade.contract_size) || Number(asset?.contract_size) || 1;

  // Signo según tipo (idéntico al SQL)
  const diff = trade.type === 'BUY' ? (exit - open) : (open - exit);

  let pl = diff * lot * contract;
  pl = quoteToUsd(trade.symbol, pl, exit, assets, prices);  // → USD
  pl += Number(trade.pl_adjustment) || 0;
  return Math.round(pl * 100) / 100;
}

// ── Hook principal ────────────────────────────────────────────
export const useRealTimePL = (trade) => {
  const { prices, assets } = useAssets();
  const pl = useMemo(() => computePL(trade, prices, assets), [trade, prices, assets]);

  return {
    realTimePL: pl,               // null si no hay precio
    isProfit:   (pl ?? 0) >= 0,   // ✅ color del MISMO número: nunca más verde con negativo
    volatility: 0,
    isLivePrice: true,
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