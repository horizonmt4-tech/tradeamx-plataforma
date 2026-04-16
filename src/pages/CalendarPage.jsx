import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';

const CalendarPage = () => {
  const containerRef = useRef(null);
  const navigate     = useNavigate();

  useEffect(() => {
    // Limpiar widget anterior si existe
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src   = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme:       'dark',
      isTransparent:    true,
      width:            '100%',
      height:           '100%',
      locale:           'es',
      importanceFilter: '-1,0,1',       // todos los niveles de impacto
      countryFilter:    'us,eu,gb,jp,ca,au,cn,mx', // principales economías + México
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-12">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Calendar className="w-5 h-5 text-green-400" />
        <h1 className="font-bold text-lg">Calendario Económico</h1>
        <p className="text-gray-400 text-sm hidden sm:block">— Eventos macroeconómicos que impactan los mercados</p>
      </div>

      {/* Leyenda de impacto */}
      <div className="px-4 py-2 flex items-center gap-4 text-xs text-gray-400 border-b border-slate-800 bg-slate-900/80">
        <span className="font-semibold text-white">Impacto:</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Alto</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Medio</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500 inline-block" /> Bajo</span>
      </div>

      {/* Widget TradingView */}
      <div className="p-0 md:p-4 h-[calc(100vh-120px)]">
        <div className="tradingview-widget-container h-full" ref={containerRef}>
          <div className="tradingview-widget-container__widget h-full" />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;