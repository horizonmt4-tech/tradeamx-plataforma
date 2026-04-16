import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { logPriceDeviation } from '@/lib/tradeUtils';
import { validatePriceBySymbol, getAssetType } from '@/utils/marketDataValidator';

const PriceContext = createContext();

export const usePrices = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
};

export const PriceProvider = ({ children }) => {
  const [prices, setPrices] = useState({});
  const [subscribedSymbols, setSubscribedSymbols] = useState(new Set());

  // Function to update a single price
  const updatePrice = useCallback((symbol, price, changePercent = 0) => {
    // Validate price using symbol
    const validation = validatePriceBySymbol(price, symbol);
    if (!validation.valid) {
        console.warn(`Blocked updatePrice for ${symbol}: ${validation.reason}`);
        return;
    }

    if (getAssetType(symbol) === 'stock') {
        // console.log(`[PriceContext] Updating stock price for ${symbol}: ${price}`);
    }

    setPrices(prev => {
      const oldPrice = prev[symbol]?.price;
      
      if (oldPrice) {
          logPriceDeviation(symbol, oldPrice, price, 20);
      }
      
      return {
        ...prev,
        [symbol]: {
          price,
          changePercent,
          lastUpdated: Date.now()
        }
      };
    });
  }, []);

  // Function to get current price data for a symbol
  const getPriceData = useCallback((symbol) => {
    return prices[symbol] || { price: 0, changePercent: 0 };
  }, [prices]);

  // Subscribe to a symbol
  const subscribeToPrice = useCallback((symbol) => {
    setSubscribedSymbols(prev => {
      const newSet = new Set(prev);
      newSet.add(symbol);
      return newSet;
    });
  }, []);

  // Unsubscribe from a symbol
  const unsubscribeFromPrice = useCallback((symbol) => {
    setSubscribedSymbols(prev => {
      const newSet = new Set(prev);
      newSet.delete(symbol);
      return newSet;
    });
  }, []);

  // Effect to simulate price updates for subscribed symbols
  useEffect(() => {
    if (subscribedSymbols.size === 0) return;

    // Initial fetch for base prices
    const fetchBasePrices = async () => {
      const { data: assets } = await supabase
        .from('assets')
        .select('symbol, price')
        .in('symbol', Array.from(subscribedSymbols));
      
      if (assets) {
        assets.forEach(asset => {
          setPrices(prev => {
            if (!prev[asset.symbol]) {
              return {
                ...prev,
                [asset.symbol]: { price: Number(asset.price), changePercent: 0, lastUpdated: Date.now() }
              };
            }
            return prev;
          });
        });
      }
    };

    fetchBasePrices();

    const intervalId = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        subscribedSymbols.forEach(symbol => {
          const currentData = newPrices[symbol];
          if (currentData) {
            const volatility = 0.0005; // 0.05%
            const change = currentData.price * volatility * (Math.random() - 0.5);
            const newPrice = currentData.price + change;
            
            // Validate new simulated price
            const validation = validatePriceBySymbol(newPrice, symbol);
            if (!validation.valid) {
                return; // Skip invalid updates
            }

            const changePercent = ((change / currentData.price) * 100);

            logPriceDeviation(symbol, currentData.price, newPrice, 20);

            newPrices[symbol] = {
              price: newPrice,
              changePercent: (currentData.changePercent || 0) + changePercent,
              lastUpdated: Date.now()
            };
          }
        });
        return newPrices;
      });
    }, 2000); 

    return () => clearInterval(intervalId);
  }, [subscribedSymbols]);

  const value = {
    prices,
    updatePrice,
    getPriceData,
    subscribeToPrice,
    unsubscribeFromPrice
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
};