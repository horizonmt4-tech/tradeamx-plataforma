import { useMemo, useRef, useEffect, useState } from 'react';
import { useAssets } from '@/contexts/AssetContext';
import { calculateProfitLossWithTolerance } from '@/lib/tradeUtils';
import { getContractSizeBySymbol, getAssetType, AssetTypes } from '@/utils/marketDataValidator';

// ── Compute real P/L ──────────────────────────────────────────

const computeRawPL = (trade, prices) => {
  if (!trade || trade.status === 'CLOSED') return Number(trade?.profit_loss) || 0;
  if (!trade.symbol || !prices) return Number(trade?.profit_loss) || 0;

  const priceData = prices[trade.symbol];
  if (!priceData) return Number(trade?.profit_loss) || 0;

  let exitPrice = null;
  if (priceData.bid && priceData.ask) {
    exitPrice = trade.type === 'BUY' ? priceData.bid : priceData.ask;
  } else {
    exitPrice = priceData.mid || priceData.price || null;
  }
  if (exitPrice === null) return Number(trade?.profit_loss) || 0;

  const currentExitPrice = Number(exitPrice);
  const openPrice        = Number(trade.open_price);
  const lotSize          = Number(trade.lot_size);
  const contractSize     = getContractSizeBySymbol(trade.symbol);

  if (
    isNaN(currentExitPrice) || currentExitPrice <= 0 ||
    isNaN(openPrice)        || openPrice <= 0 ||
    isNaN(lotSize)          || lotSize <= 0
  ) return Number(trade.profit_loss) || 0;

  const assetType    = getAssetType(trade.symbol);
  const maxDeviation = assetType === AssetTypes.CRYPTO ? 60 : 50;

  const calculatedPL = calculateProfitLossWithTolerance(
    trade.type, openPrice, currentExitPrice,
    lotSize, contractSize, maxDeviation, trade.symbol
  );

  if (calculatedPL === null) return Number(trade.profit_loss) || 0;

  return calculatedPL + (Number(trade.pl_adjustment) || 0);
};

// ── Hook principal ────────────────────────────────────────────

export const useRealTimePL = (trade) => {
  const { prices } = useAssets();

  // P/L real del mercado — solo cambia cuando assets_prices emite nuevo precio (~1 min)
  const realPL = useMemo(() => computeRawPL(trade, prices), [trade, prices]);

  const [displayPL, setDisplayPL] = useState(() => parseFloat(realPL.toFixed(2)));

  // ✅ COLOR: basado en el P/L REAL, nunca en el animado
  // Verde si ganancia, rojo si pérdida — solo cambia con precio real nuevo
  const [isProfit, setIsProfit] = useState(() => realPL >= 0);

  const displayPLRef    = useRef(realPL);
  const realPLRef       = useRef(realPL);
  const directionRef    = useRef(Math.random() > 0.5 ? 1 : -1);
  const tickCountRef    = useRef(0);
  const lastRenderedRef = useRef(parseFloat(realPL.toFixed(2)));
  const intervalRef     = useRef(null);

  // Snap cuando llega precio real nuevo desde assets_prices
  useEffect(() => {
    const rounded = parseFloat(realPL.toFixed(2));
    realPLRef.current       = realPL;
    displayPLRef.current    = realPL;
    lastRenderedRef.current = rounded;

    setDisplayPL(rounded);
    // Color solo se actualiza aquí — con precio real, no con animación
    setIsProfit(realPL >= 0);
  }, [realPL]);

  // ✅ INTERVALO: depende solo de trade.id y trade.status
  // Si dependiera del objeto trade completo se destruiría en cada re-render
  // del padre causando el parpadeo
  useEffect(() => {
    if (!trade || trade.status === 'CLOSED') return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const current = displayPLRef.current;
      const target  = realPLRef.current;

      tickCountRef.current += 1;

      if (tickCountRef.current >= 4 + Math.floor(Math.random() * 4)) {
        directionRef.current = -directionRef.current;
        tickCountRef.current = 0;
      }

      const diff = target - current;
      let step;

      if (Math.abs(diff) > 0.05) {
        step = diff * 0.3;
      } else {
        step = directionRef.current * (0.01 + Math.random() * 0.02);
      }

      const nextPL = current + step;
      displayPLRef.current = nextPL;

      // Solo re-renderizar si el centavo visible cambió
      const rounded = parseFloat(nextPL.toFixed(2));
      if (rounded !== lastRenderedRef.current) {
        lastRenderedRef.current = rounded;
        setDisplayPL(rounded);
        // ✅ NO tocamos isProfit aquí — el color lo manda solo el precio real
      }
    }, 320);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trade?.id, trade?.status]);

  return {
    realTimePL:  displayPL,  // animado, redondeado a 2 decimales
    isProfit,                 // estable — verde = ganancia, rojo = pérdida
    volatility:  0,
    isLivePrice: true,
  };
};

// ── Hook de P/L total ─────────────────────────────────────────

export const useTotalPL = (trades = []) => {
  const { prices } = useAssets();

  return useMemo(() => {
    if (!trades || trades.length === 0) return 0;

    return trades.reduce((total, trade) => {
      if (trade.status === 'CLOSED') return total;

      const priceData = prices[trade.symbol];
      if (!priceData) return total + (Number(trade.profit_loss) || 0);

      const exitPrice = priceData.bid && priceData.ask
        ? (trade.type === 'BUY' ? priceData.bid : priceData.ask)
        : (priceData.mid || priceData.price);

      const currentExitPrice = Number(exitPrice);
      const openPrice        = Number(trade.open_price);
      const lotSize          = Number(trade.lot_size);
      const contractSize     = getContractSizeBySymbol(trade.symbol);

      if (!currentExitPrice || !openPrice || !lotSize) {
        return total + (Number(trade.profit_loss) || 0);
      }

      const pl = calculateProfitLossWithTolerance(
        trade.type, openPrice, currentExitPrice,
        lotSize, contractSize, 100, trade.symbol
      );

      if (pl === null) return total + (Number(trade.profit_loss) || 0);

      return total + pl + (Number(trade.pl_adjustment) || 0);
    }, 0);
  }, [trades, prices]);
};

export default useRealTimePL;