import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getAssetType } from '@/utils/marketDataValidator';
import { getChartData } from '@/services/TradingViewChartService';
import { validatePriceBySymbol } from '@/utils/marketDataValidator';
import { useAssets } from '@/contexts/AssetContext';

// Mapa de símbolos para Binance WebSocket
// Solo crypto y algunos forex están disponibles en Binance WS
const toBinanceWsSymbol = (symbol) => {
  const map = {
    'BTC/USD': 'btcusdt', 'ETH/USD': 'ethusdt', 'SOL/USD': 'solusdt',
    'EUR/USD': 'eurusdt', 'GBP/USD': 'gbpusdt', 'AUD/USD': 'audusdt',
    'NZD/USD': 'nzdusdt', 'USD/JPY': 'usdtjpy', 'GBP/JPY': 'gbpjpy',
    'BNB/USD': 'bnbusdt', 'XRP/USD': 'xrpusdt', 'ADA/USD': 'adausdt',
  };
  return map[symbol] || null; // null = no disponible en Binance WS
};

const useBinanceChart = (symbol, timeframe) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const wsRef = useRef(null);
  const pollingRef = useRef(null);

  const { updatePriceFromMarket } = useAssets();

  // Carga inicial de datos históricos
  // ✅ NO llamar updatePriceFromMarket aquí — datos históricos no deben
  // sobreescribir el precio real de asset_prices
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const chartData = await getChartData(symbol, timeframe);
        if (isMounted) {
          setData(chartData);
          if (chartData.length > 0) {
            const lastClose = chartData[chartData.length - 1].close;
            if (validatePriceBySymbol(lastClose, symbol).valid) {
              setCurrentPrice(lastClose);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    if (symbol) fetchInitialData();
    return () => { isMounted = false; };
  }, [symbol, timeframe]);

  // Conexión en tiempo real
  useEffect(() => {
    const type = getAssetType(symbol);

    if (wsRef.current) wsRef.current.close();
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (type === 'crypto' || type === 'forex') {
      // ✅ FIX: Usar mapa interno en lugar de mapSymbol()
      const binanceWsSymbol = toBinanceWsSymbol(symbol);

      if (binanceWsSymbol) {
        // Binance WebSocket disponible para este símbolo
        const intervalMap = {
          '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
          '1H': '1h', '4H': '4h', '1D': '1d'
        };
        const interval = intervalMap[timeframe] || '1h';
        const wsUrl = `wss://stream.binance.com:9443/ws/${binanceWsSymbol}@kline_${interval}`;

        const ws = new WebSocket(wsUrl);

        ws.onerror = () => {
          // WS falló — no hacer nada, el precio viene de asset_prices via Realtime
          console.warn(`[useBinanceChart] WS unavailable for ${symbol}, using Realtime prices`);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const candle = message.k;
            const newCandle = {
              time: candle.t / 1000,
              open: parseFloat(candle.o),
              high: parseFloat(candle.h),
              low: parseFloat(candle.l),
              close: parseFloat(candle.c),
              volume: parseFloat(candle.v)
            };

            if (validatePriceBySymbol(newCandle.close, symbol).valid) {
              setCurrentPrice(newCandle.close);
              // Solo actualizar precio desde WS en tiempo real
              updatePriceFromMarket(symbol, newCandle.close);

              setData(prev => {
                const last = prev[prev.length - 1];
                if (last && last.time === newCandle.time) {
                  const updated = [...prev];
                  updated[updated.length - 1] = newCandle;
                  return updated;
                }
                return [...prev, newCandle];
              });
            }
          } catch (e) {
            console.error('[useBinanceChart] WS Message Error', e);
          }
        };

        wsRef.current = ws;
      }
      // Si no hay WS disponible, el precio viene de asset_prices via Realtime — no hacer nada
    }

    else if (type === 'stock' || type === 'index' || type === 'commodity') {
      // ✅ FIX: Mandar símbolo original — la Edge Function hace el mapeo
      pollingRef.current = setInterval(async () => {
        try {
          const { data: result } = await supabase.functions.invoke('get-chart-data', {
            body: { symbol, timeframe, type } // símbolo original sin mapear
          });

          if (result?.data?.length > 0) {
            const latest = result.data[result.data.length - 1];
            if (validatePriceBySymbol(latest.close, symbol).valid) {
              setCurrentPrice(latest.close);
              updatePriceFromMarket(symbol, latest.close);

              setData(prev => {
                const last = prev[prev.length - 1];
                if (last && last.time === latest.time) {
                  const updated = [...prev];
                  updated[updated.length - 1] = latest;
                  return updated;
                }
                return [...prev, latest];
              });
            }
          }
        } catch (e) {
          console.warn('[useBinanceChart] Polling error', e);
        }
      }, 30000);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [symbol, timeframe]);

  return { data, loading, error, currentPrice };
};

export default useBinanceChart;