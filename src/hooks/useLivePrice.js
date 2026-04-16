import { useState, useEffect, useRef } from 'react';
import { getAssetVolatility } from '@/utils/getAssetVolatility';

/**
 * Hook to simulate realistic price fluctuations between real data updates.
 * Optimized with requestAnimationFrame and threshold-based re-rendering.
 */
export const useLivePrice = (basePrice, symbol, volatilityOverride = null) => {
  const [renderedPrice, setRenderedPrice] = useState(basePrice);
  const internalPriceRef = useRef(basePrice);
  const basePriceRef = useRef(basePrice);
  const lastUpdateRef = useRef(Date.now());

  const { min, max, assetClass } = getAssetVolatility(symbol);
  const volatility = volatilityOverride || max;

  // Sync when real base price changes
  useEffect(() => {
    if (basePrice !== null && basePrice !== undefined) {
      internalPriceRef.current = basePrice;
      basePriceRef.current = basePrice;
      setRenderedPrice(basePrice);
      lastUpdateRef.current = Date.now();
    }
  }, [basePrice]);

  // Simulate smooth movements using requestAnimationFrame
  useEffect(() => {
    if (basePrice === null || basePrice === undefined) return;

    let animationFrameId;
    let lastTick = performance.now();

    const tick = (now) => {
      // Internal calculation every 500-1000ms
      if (now - lastTick > Math.random() * 500 + 500) {
        const current = internalPriceRef.current;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const movement = (Math.random() * (max - min) + min) * direction;
        
        // Prevent drifting too far from the base price (mean reversion)
        const currentDrift = current - basePriceRef.current;
        const correction = currentDrift > (max * 5) ? -Math.abs(movement) : 
                           currentDrift < -(max * 5) ? Math.abs(movement) : movement;

        let newPrice = current + correction;
        
        // Ensure price doesn't go below 0
        if (newPrice <= 0) newPrice = current;

        internalPriceRef.current = newPrice;
        lastTick = now;

        // Render Threshold: Only update state if price changes by 0.1% or more
        const threshold = basePriceRef.current * 0.001;
        
        setRenderedPrice((prevRendered) => {
          if (Math.abs(newPrice - prevRendered) >= threshold) {
            lastUpdateRef.current = Date.now();
            return newPrice;
          }
          return prevRendered; // Skip re-render
        });
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [basePrice, min, max]);

  return { 
    livePrice: renderedPrice, // State-driven (throttled)
    rawLivePrice: internalPriceRef.current, // Ref-driven (instant)
    volatility, 
    lastUpdate: lastUpdateRef.current, 
    assetClass 
  };
};