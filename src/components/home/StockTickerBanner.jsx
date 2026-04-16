import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAssets } from '@/contexts/AssetContext';

const StockTickerBanner = () => {
  const { assets, prices: assetPrices, loading } = useAssets();

  // Top-20 corresponds to 5rem (80px), matching the Navbar height
  if (loading || assets.length === 0) {
    return (
      <div className="fixed top-20 w-full z-40 bg-slate-900/90 backdrop-blur-sm border-b border-gray-800 overflow-hidden h-10 flex items-center justify-center">
        <span className="text-xs text-gray-500 animate-pulse">Loading market data...</span>
      </div>
    );
  }
  
  const tickerAssets = assets.slice(0, 15);
  const duplicatedAssets = [...tickerAssets, ...tickerAssets];

  const TickerItem = ({ asset }) => {
    const currentPriceData = assetPrices[asset.symbol];
    const currentPrice = currentPriceData ? currentPriceData.mid : asset.price;
    const previousPrice = asset.price;
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
    const isUp = change >= 0;

    return (
      <div className="flex items-center mx-6 py-1 flex-shrink-0 border-r border-gray-800/50 pr-6 last:border-0">
        <span className="text-xs font-bold text-[#d4af37] mr-2">{asset.symbol}</span>
        <span className={`text-xs mr-2 font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {currentPrice.toFixed(asset.precision)}
        </span>
        <span className={`text-[10px] flex items-center ${isUp ? 'text-green-500/80' : 'text-red-500/80'}`}>
          {isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
          {Math.abs(changePercent).toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="fixed top-20 w-full z-40 bg-[#0a0f1a] border-b border-gray-800 overflow-hidden h-10 flex items-center shadow-lg">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0f1a] to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0f1a] to-transparent z-10"></div>
      
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 60, ease: "linear" } }}
      >
        {duplicatedAssets.map((asset, index) => (
          <TickerItem key={`${asset.symbol}-${index}`} asset={asset} />
        ))}
      </motion.div>
    </div>
  );
};

export default StockTickerBanner;