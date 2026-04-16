import React, { useEffect, useRef, memo, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { validateChartContainer, safeRemoveChart } from '@/utils/chartUtils';

const PerformanceChart = ({ initialBalance, trades }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chart initialization
  useEffect(() => {
    // Validate container exists and is mounted
    if (!validateChartContainer(chartContainerRef)) {
      return;
    }

    try {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 256,
        layout: {
          background: { color: 'transparent' },
          textColor: '#D1D5DB',
          fontFamily: 'sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(75, 85, 99, 0.2)' },
          horzLines: { color: 'rgba(75, 85, 99, 0.2)' },
        },
        timeScale: {
          borderColor: '#4B5563',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#4B5563',
        },
        crosshair: {
          mode: 1,
          vertLine: {
              color: '#8B5CF6',
              style: 2, 
              labelBackgroundColor: '#8B5CF6',
          },
          horzLine: {
              color: '#8B5CF6',
              style: 2,
              labelBackgroundColor: '#8B5CF6',
          },
        },
        handleScroll: false,
        handleScale: false,
      });

      seriesRef.current = chartRef.current.addAreaSeries({
        lineColor: '#22C55E',
        topColor: 'rgba(34, 197, 94, 0.4)',
        bottomColor: 'rgba(34, 197, 94, 0)',
        lineWidth: 2,
      });

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        // Safe chart removal
        if (chartRef.current) {
          safeRemoveChart(chartRef.current);
          chartRef.current = null;
          seriesRef.current = null;
        }
      };
    } catch (err) {
      console.error('Chart initialization error:', err);
      setError('No se pudo crear el gráfico');
    }
  }, []); // Only run once on mount

  // Data update effect
  useEffect(() => {
    setError(null);
    if (!seriesRef.current) return;
    
    if (!Array.isArray(trades)) {
        return; 
    }

    try {
        setLoading(true);
        
        const sortedTrades = [...trades].sort((a, b) => {
          const dateA = new Date(a.close_time || a.created_at || 0);
          const dateB = new Date(b.close_time || b.created_at || 0);
          return dateA - dateB;
        });
        
        let firstTradeTime = new Date().getTime();
        if (sortedTrades.length > 0) {
            const firstTrade = sortedTrades[0];
            const startDate = new Date(firstTrade.open_time || firstTrade.created_at || firstTrade.close_time || Date.now());
            if (!isNaN(startDate.getTime())) {
                firstTradeTime = startDate.getTime();
            }
        }

        let runningBalance = Number(initialBalance) || 0;
        const initialTime = Math.floor(firstTradeTime / 1000) - 86400;
        
        const rawData = [{
          time: isNaN(initialTime) ? Math.floor(Date.now() / 1000) - 86400 : initialTime,
          value: runningBalance
        }];

        sortedTrades.forEach(trade => {
          if (trade.status === 'CLOSED' && trade.close_time) {
             const closeTime = Math.floor(new Date(trade.close_time).getTime() / 1000);
             const pl = Number(trade.profit_loss);
             
             if (!isNaN(closeTime) && !isNaN(pl)) {
                runningBalance += pl;
                rawData.push({
                  time: closeTime,
                  value: runningBalance,
                });
             }
          }
        });

        const uniqueMap = new Map();
        rawData.forEach(item => {
            uniqueMap.set(item.time, item.value);
        });

        const equityCurve = Array.from(uniqueMap.entries())
            .map(([time, value]) => ({ time, value }))
            .sort((a, b) => a.time - b.time);
        
        if (equityCurve.length === 1) {
            const now = Math.floor(Date.now() / 1000);
            if (now > equityCurve[0].time) {
                equityCurve.push({
                    time: now,
                    value: runningBalance
                });
            }
        }

        seriesRef.current.setData(equityCurve);
        if(chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    } catch (err) {
        console.error("Chart Data Error:", err);
        setError("No se pudieron renderizar los datos del gráfico.");
    } finally {
        setLoading(false);
    }

  }, [initialBalance, trades]);

  return (
    <div className="relative w-full h-64">
        {loading && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
                 <Loader2 className="w-8 h-8 animate-spin text-green-500" />
             </div>
        )}
        {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
                 <div className="text-center text-red-400 flex flex-col items-center">
                    <AlertTriangle className="w-8 h-8 mb-2" />
                    <span className="text-sm">{error}</span>
                 </div>
             </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default memo(PerformanceChart);