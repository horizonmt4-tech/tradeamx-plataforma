import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { useAssets } from '@/contexts/AssetContext';

// Mapeo de símbolos de la plataforma a símbolos de TradingView
const SYMBOL_MAP = {
  'EUR/USD': 'EURUSD',
  'GBP/USD': 'GBPUSD',
  'USD/JPY': 'USDJPY',
  'XAU/USD': 'XAUUSD',
  'BTC/USD': 'BTCUSD',
  'ETH/USD': 'ETHUSD',
  'META':    'META',
  'GER40':   'DE40',
  'GBP/JPY': 'GBPJPY',
  'WTI/USD': 'USOIL',
};

const NewsPage = () => {
  const containerRef = useRef(null);
  const navigate     = useNavigate();
  const { assets }   = useAssets();

  // Símbolo seleccionado para filtrar noticias
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const tvSymbol = selectedSymbol ? (SYMBOL_MAP[selectedSymbol] || selectedSymbol.replace('/', '')) : null;

    const script = document.createElement('script');
    script.src   = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode:    tvSymbol ? 'symbol' : 'market',
      market:      'forex',
      symbol:      tvSymbol || undefined,
      colorTheme:  'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      width:       '100%',
      height:      '100%',
      locale:      'es',
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [selectedSymbol]);

  // Obtener símbolos únicos de los assets disponibles
  const availableSymbols = ['Todos', ...assets.slice(0, 10).map(a => a.symbol)];

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-12">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Newspaper className="w-5 h-5 text-blue-400" />
        <h1 className="font-bold text-lg">Noticias del Mercado</h1>
      </div>

      {/* Filtro por símbolo */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 overflow-x-auto scrollbar-none">
        <span className="text-xs text-gray-400 shrink-0">Filtrar:</span>
        {availableSymbols.map(sym => (
          <button
            key={sym}
            onClick={() => setSelectedSymbol(sym === 'Todos' ? null : sym)}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              (sym === 'Todos' && !selectedSymbol) || sym === selectedSymbol
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Widget TradingView News */}
      <div className="p-0 md:p-4 h-[calc(100vh-110px)]">
        <div className="tradingview-widget-container h-full" ref={containerRef}>
          <div className="tradingview-widget-container__widget h-full" />
        </div>
      </div>
    </div>
  );
};

export default NewsPage;