import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { validatePriceBySymbol, logMarketOperation, getAssetType } from '@/utils/marketDataValidator';
import { logPriceUpdate, logRealtimeStatus } from '@/utils/realtimeDiagnostics';

const AssetContext = createContext();

export const useAssets = () => useContext(AssetContext);

export const AssetProvider = ({ children }) => {
  const [assets, setAssets]               = useState([]);
  const [assetCategories, setAssetCategories] = useState({});
  const [prices, setPrices]               = useState({});
  const [loading, setLoading]             = useState(true);
  const [isMarketOpen, setIsMarketOpen]   = useState(true);
  const [error, setError]                 = useState(null);
  const [assetStatus, setAssetStatus]     = useState({});

  const pricesRef = useRef({});
  const channelStatusRef = useRef('DISCONNECTED');
  const lastUpdateTimeRef = useRef(null);

  // ── Diagnostic Function ───────────────────────────────────
  useEffect(() => {
    window.debugPriceState = () => {
      console.log(`[AssetContext Debug] Current prices: ${JSON.stringify(pricesRef.current)}, Channel status: ${channelStatusRef.current}, Last update: ${lastUpdateTimeRef.current}`);
    };
    return () => {
      delete window.debugPriceState;
    };
  }, []);

  // ── Market Status ─────────────────────────────────────────
  const checkMarketStatus = useCallback(() => {
    const now     = new Date();
    const utcDay  = now.getUTCDay();
    const utcHour = now.getUTCHours();
    const closed  =
      (utcDay === 5 && utcHour >= 21) ||
      utcDay === 6 ||
      (utcDay === 0 && utcHour < 21);
    setIsMarketOpen(!closed);
  }, []);

  useEffect(() => {
    checkMarketStatus();
    const t = setInterval(checkMarketStatus, 60_000);
    return () => clearInterval(t);
  }, [checkMarketStatus]);

  // ── Initial Asset Load ────────────────────────────────────
  const processAssetData = useCallback((data) => {
    if (!data || !Array.isArray(data)) return;

    const validAssets = data.filter(a => a.symbol && /^[A-Z0-9\/]+$/.test(a.symbol));
    setAssets(validAssets);

    const categories = {};
    const initialStatus = {};

    validAssets.forEach(asset => {
      const type = getAssetType(asset.symbol);
      initialStatus[asset.symbol] = {
        isMock:     true,
        lastUpdate: new Date().toISOString(),
        source:     'DATABASE',
        type,
      };
      if (!categories[asset.category]) categories[asset.category] = [];
      categories[asset.category].push(asset);
    });

    setAssetCategories(categories);
    setAssetStatus(initialStatus);
    setLoading(false);
  }, []);

  const fetchInitialAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) throw error;
      processAssetData(data);
    } catch (err) {
      console.error('[AssetContext] Error fetching assets:', err);
      setError('Failed to load assets.');
      setLoading(false);
    }
  }, [processAssetData]);

  useEffect(() => {
    fetchInitialAssets();

    const channel = supabase
      .channel('assets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, fetchInitialAssets)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchInitialAssets]);

  // ── Realtime Prices Subscription ───────
  const applyPriceUpdates = useCallback((priceRows) => {
    const updates = {};
    const statusUpdates = {};

    priceRows.forEach((row) => {
      const { symbol, bid, ask, mid, spread, source } = row;
      if (!symbol) return;

      console.log(`[AssetContext] Price update received for ${symbol}`);

      const validation = validatePriceBySymbol(Number(mid), symbol);
      if (!validation.valid) {
        logMarketOperation('priceRejected', { symbol, mid, reason: validation.reason }, 'warn');
        return;
      }

      const newPriceData = {
        bid:    Number(bid),
        ask:    Number(ask),
        mid:    Number(mid),
        spread: Number(spread),
      };

      // Diagnostic Logging
      logPriceUpdate(symbol, pricesRef.current[symbol], newPriceData, source || 'REALTIME');

      updates[symbol] = newPriceData;

      statusUpdates[symbol] = {
        isMock:     false,
        lastUpdate: new Date().toISOString(),
        source:     source || 'REALTIME',
        type:       getAssetType(symbol),
      };
    });

    const updateCount = Object.keys(updates).length;
    if (updateCount > 0) {
      console.log(`[AssetContext] Calling setPrices with new updates for ${updateCount} assets`);
      const newPricesState = { ...pricesRef.current, ...updates };
      console.log(`[AssetContext] New prices state: ${JSON.stringify(newPricesState)}`);
      
      pricesRef.current = newPricesState;
      setPrices(newPricesState);
      setAssetStatus(prev => ({ ...prev, ...statusUpdates }));
      lastUpdateTimeRef.current = new Date().toISOString();
    }
  }, []);

  useEffect(() => {
    let priceChannel;

    const loadInitialPrices = async () => {
      const { data, error } = await supabase
        .from('asset_prices')
        .select('*');

      if (error) {
        console.warn('[AssetContext] Could not load asset_prices, will wait for realtime', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('[AssetContext] Initial prices loaded:', data.length);
        applyPriceUpdates(data);
      }
    };

    loadInitialPrices();

    console.log('[AssetContext] Initializing realtime subscription for asset_prices...');
    
    priceChannel = supabase
      .channel('asset-prices-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'asset_prices' },
        (payload) => {
          if (payload.new) {
            applyPriceUpdates([payload.new]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'asset_prices' },
        (payload) => {
          if (payload.new) {
            applyPriceUpdates([payload.new]);
          }
        }
      )
      .subscribe((status, err) => {
        channelStatusRef.current = status;
        logRealtimeStatus('asset-prices-realtime', status, err);
        if (status === 'SUBSCRIBED') {
          logMarketOperation('realtimePricesConnected', {}, 'info');
        }
      });

    return () => {
      console.log('[AssetContext] Unmounting, removing realtime subscription...');
      if (priceChannel) supabase.removeChannel(priceChannel);
    };
  }, [applyPriceUpdates]);

  const updatePriceFromMarket = useCallback((symbol, livePrice) => {
    if (!pricesRef.current[symbol]) return;

    const validation = validatePriceBySymbol(livePrice, symbol);
    if (!validation.valid) return;

    const current = pricesRef.current[symbol];
    const updated = {
      ...current,
      mid: livePrice,
      bid: livePrice - (current.spread / 2),
      ask: livePrice + (current.spread / 2),
    };

    pricesRef.current[symbol] = updated;
    setPrices(prev => ({ ...prev, [symbol]: updated }));
  }, []);

  const value = {
    assets,
    assetCategories,
    prices,
    loading,
    error,
    isMarketOpen,
    assetStatus,
    updatePriceFromMarket,
  };

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};