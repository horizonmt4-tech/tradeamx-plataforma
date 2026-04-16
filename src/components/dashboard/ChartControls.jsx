import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize } from 'lucide-react';

const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D'];

const ChartControls = ({ timeframe, setTimeframe, isFullscreen, toggleFullscreen }) => {
  return (
    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-slate-900/50 backdrop-blur-sm p-1 rounded-md border border-slate-700">
      {timeframes.map((tf) => (
        <Button
          key={tf}
          variant="ghost"
          size="sm"
          onClick={() => setTimeframe(tf)}
          className={`h-7 px-2 text-xs ${
            timeframe === tf
              ? 'bg-slate-700 text-white'
              : 'text-gray-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {tf}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className="h-7 w-7 text-gray-400 hover:bg-slate-800 hover:text-white ml-2"
      >
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
      </Button>
    </div>
  );
};

export default ChartControls;