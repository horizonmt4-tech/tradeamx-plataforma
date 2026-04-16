import { getAssetType } from '@/utils/marketDataValidator';
import { fetchWithDeduplication } from '@/utils/ChartDataCache';
import { supabase } from '@/lib/supabaseClient';
import { logMarketOperation, validatePriceBySymbol } from '@/utils/marketDataValidator';

// Segundos por intervalo
const INTERVAL_STEP_SECONDS = {
  '1m': 60, '5m': 300, '15m': 900, '30m': 1800,
  '1H': 3600, '4H': 14400, '1D': 86400,
};

const generateMockData = (basePrice = 100, count = 100, interval = '1H') => {
  const step = INTERVAL_STEP_SECONDS[interval] || 3600;
  let time = Math.floor(Date.now() / 1000) - (count * step);
  let currentPrice = basePrice;
  const data = [];

  for (let i = 0; i < count; i++) {
    const volatility = currentPrice * 0.002;
    const change = (Math.random() - 0.5) * volatility;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    data.push({ time, open, high, low, close, volume: Math.floor(Math.random() * 1000) });
    currentPrice = close;
    time += step;
  }
  return data;
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchFromEdgeFunction = async (symbol, timeframe, retries = 3) => {
  const type = getAssetType(symbol);

  // ✅ FIX: Mandar el símbolo ORIGINAL a la Edge Function
  // La Edge Function maneja el mapeo internamente con fallbacks
  // Antes se mapeaba aquí y llegaba USDMXNT, XAUUSDT etc. que no existen
  logMarketOperation('fetchStart', { symbol, timeframe, type });

  let attempt = 0;

  while (attempt < retries) {
    try {
      const { data, error } = await supabase.functions.invoke('get-chart-data', {
        body: {
          symbol,      // ✅ símbolo original: 'USD/MXN', 'XAU/USD', 'EUR/USD'
          timeframe,
          type
        }
      });

      if (error) throw new Error(`Edge Function Error: ${error.message}`);
      if (data?.error) throw new Error(`API Error: ${data.error}`);
      if (!data?.data || data.data.length === 0) throw new Error('No data returned from API');

      const lastPrice = data.data[data.data.length - 1].close;
      if (!validatePriceBySymbol(lastPrice, symbol).valid) {
        throw new Error('Received invalid prices from API');
      }

      logMarketOperation('fetchSuccess', { symbol, count: data.data.length, source: data.api });
      return { data: data.data, source: data.api || 'API', isMock: false };

    } catch (error) {
      attempt++;
      logMarketOperation('fetchAttemptFailed', { symbol, attempt, error: error.message }, 'warn');

      if (error.status === 401 || error.message?.includes('401')) {
        throw new Error('Unauthorized API access');
      }

      if (attempt >= retries) {
        logMarketOperation('fetchFailed', { symbol, retries }, 'error');
        throw error;
      }

      await wait(1000 * Math.pow(2, attempt - 1));
    }
  }
};

export const getChartData = async (symbol, timeframe) => {
  return fetchWithDeduplication(symbol, timeframe, async () => {
    try {
      const result = await fetchFromEdgeFunction(symbol, timeframe);
      return result.data;
    } catch (err) {
      logMarketOperation('fallbackToMock', { symbol, reason: err.message }, 'warn');

      let basePrice = 100;
      try {
        const { data } = await supabase.from('assets').select('price').eq('symbol', symbol).single();
        if (data?.price) basePrice = Number(data.price);
      } catch (e) { }

      return generateMockData(basePrice, 100, timeframe);
    }
  });
};

export default { getChartData };