// src/hooks/useRealTimePL.js
import { useMemo, useState, useEffect } from 'react';
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

// Oscilación simulada alrededor de un valor fijo (override del admin).
// Determinística por tiempo + id del trade, así no "salta" entre renders
// y cada trade tiene su propio patrón (no todos se mueven igual a la vez).
function simulateOscillation(baseValue, tradeId) {
  const amplitude = Math.max(0.2, Math.abs(baseValue) * 0.02); // ~2% o mínimo $0.20
  let seed = 0;
  for (let i = 0; i < (tradeId || '').length; i++) {
    seed = (seed * 31 + tradeId.charCodeAt(i)) % 100000;
  }
  const t = Date.now() / 1500; // ciclo de ~9-10s
  const wave = Math.sin(t + seed) * 0.6 + Math.sin(t * 2.3 + seed * 0.7) * 0.4;
  const offset = wave * amplitude;
  return Math.round((baseValue + offset) * 100) / 100;
}

// P/L real — alineado 1:1 con close_trade_final
function computePL(trade, prices, assets) {
  if (!trade || trade.status === 'CLOSED') return Number(trade?.profit_loss) || 0;

  // ✅ FIX: si el admin fijó un P/L exacto (override), mostramos ese valor
  // pero con una leve oscilación simulada para que se vea "vivo" como antes,
  // sin que el cierre real se vea afectado (close_trade_final sigue usando
  // el valor fijo exacto en pl_adjustment, esto es solo visual).
  if (trade.pl_adjustment_is_override) {
    const fixedValue = Number(trade.pl_adjustment) || 0;
    return simulateOscillation(fixedValue, trade.id);
  }

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
  // ✅ FIX: ya NO se suma pl_adjustment aquí. Sin override, el ajuste no aplica
  // (pl_adjustment solo tiene efecto cuando pl_adjustment_is_override = true,
  // y en ese caso ya retornamos arriba con el valor fijo).
  return Math.round(pl * 100) / 100;
}

// ── Hook principal ────────────────────────────────────────────
export const useRealTimePL = (trade) => {
  const { prices, assets } = useAssets();

  // ✅ FIX: cuando hay override, necesitamos un "tick" periódico para que
  // la oscilación simulada se siga moviendo (si no, solo se recalcula
  // cuando llegan precios nuevos del mercado, que el override ignora).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!trade?.pl_adjustment_is_override) return;
    const id = setInterval(() => forceTick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [trade?.pl_adjustment_is_override]);

  const pl = useMemo(() => computePL(trade, prices, assets), [trade, prices, assets]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    realTimePL: pl,               // null si no hay precio
    isProfit:   (pl ?? 0) >= 0,   // ✅ color del MISMO número: nunca más verde con negativo
    volatility: 0,
    isLivePrice: !trade?.pl_adjustment_is_override, // false si está congelado por el admin
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