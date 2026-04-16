import React, { useEffect, useRef, useCallback } from 'react';
import { BarChart2, ExternalLink } from 'lucide-react';

// ── Símbolos que requieren cuenta premium de TradingView ──────
// Para estos mostramos un mensaje elegante en lugar del widget
const PREMIUM_ONLY_SYMBOLS = new Set([
  'CEMEXCPO.MX',
  'CEMEXCPO',
]);

// ── Mapeo completo plataforma → TradingView ───────────────────
const SYMBOL_MAP = {
  // Forex
  'EUR/USD':    'FX:EURUSD',
  'GBP/USD':    'FX:GBPUSD',
  'USD/JPY':    'FX:USDJPY',
  'AUD/USD':    'FX:AUDUSD',
  'NZD/USD':    'FX:NZDUSD',
  'USD/CAD':    'FX:USDCAD',
  'USD/MXN':    'FX:USDMXN',
  'USD/HKD':    'FX:USDHKD',
  'USD/ILS':    'FX:USDILS',
  'GBP/JPY':    'FX:GBPJPY',
  'AUD/CAD':    'FX:AUDCAD',
  'NZD/CAD':    'FX:NZDCAD',
  'NZD/CHF':    'FX:NZDCHF',
  'EUR/NZD':    'FX:EURNZD',
  'CHF/USD':    'FX:CHFUSD',

  // Materias primas
  'XAU/USD':    'TVC:GOLD',
  'XAG/USD':    'TVC:SILVER',
  'WTI/USD':    'TVC:USOIL',
  'BRENT':      'TVC:UKOIL',
  'CL':         'TVC:USOIL',
  'NATGAS':     'TVC:NATURALGAS',
  'COPPER':     'TVC:COPPER',
  'PALLADIUM':  'TVC:PALLADIUM',

  // Índices
  'US30':       'FOREXCOM:DJI',
  'US500':      'FOREXCOM:SPXUSD',
  'NAS100':     'FOREXCOM:NSXUSD',
  'GER40':      'FOREXCOM:GER40',
  'NIKKEI':     'TVC:NI225',
  'BOVESPA':    'BMFBOVESPA:IBOV',

  // Crypto
  'BTC/USD':    'BINANCE:BTCUSDT',
  'ETH/USD':    'BINANCE:ETHUSDT',
  'SOL/USD':    'BINANCE:SOLUSDT',

  // Acciones USA — verificadas en TradingView
  'AAPL':       'NASDAQ:AAPL',
  'AMD':        'NASDAQ:AMD',
  'AMZN':       'NASDAQ:AMZN',
  'GOOG':       'NASDAQ:GOOG',
  'GOOGL':      'NASDAQ:GOOGL',
  'INTC':       'NASDAQ:INTC',
  'META':       'NASDAQ:META',
  'MSFT':       'NASDAQ:MSFT',
  'NFLX':       'NASDAQ:NFLX',
  'NVDA':       'NASDAQ:NVDA',
  'TSLA':       'NASDAQ:TSLA',
  'MELI':       'NASDAQ:MELI',
  'PEP':        'NASDAQ:PEP',
  'SBUX':       'NASDAQ:SBUX',
  'UAL':        'NASDAQ:UAL',
  'KMB':        'NASDAQ:KMB',   // ✅ corregido: es NASDAQ no NYSE
  'TSM':        'NYSE:TSM',
  'AXP':        'NYSE:AXP',
  'BAC':        'NYSE:BAC',
  'BLK':        'NYSE:BLK',
  'BMY':        'NYSE:BMY',
  'CVX':        'NYSE:CVX',
  'GM':         'NYSE:GM',
  'JNJ':        'NYSE:JNJ',
  'KO':         'NYSE:KO',
  'MA':         'NYSE:MA',
  'MCD':        'NYSE:MCD',
  'MET':        'NYSE:MET',
  'MMM':        'NYSE:MMM',
  'MS':         'NYSE:MS',
  'PFE':        'NYSE:PFE',
  'PG':         'NYSE:PG',
  'PM':         'NYSE:PM',
  'UNH':        'NYSE:UNH',
  'V':          'NYSE:V',
  'VZ':         'NYSE:VZ',
  'XOM':        'NYSE:XOM',

  // Acciones México — ADR en OTC (disponible gratis en TradingView)
  'GFNORTEO':   'OTC:GBOOY',   // Grupo Financiero Banorte ADR
  'GFNORTEO.MX':'OTC:GBOOY',
};

const toTVSymbol = (symbol) => {
  if (!symbol) return 'FX:EURUSD';
  if (SYMBOL_MAP[symbol]) return SYMBOL_MAP[symbol];
  if (symbol.includes('/')) return `FX:${symbol.replace('/', '')}`;
  return `NASDAQ:${symbol}`;
};

// ── Pantalla para símbolos que requieren premium ──────────────
const PremiumSymbolFallback = ({ symbol }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0e1a] gap-4 p-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
      <BarChart2 className="w-7 h-7 text-cyan-400" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-white font-bold text-lg font-mono">{symbol}</p>
      <p className="text-gray-400 text-sm">
        El gráfico de este activo requiere una cuenta premium de TradingView.
      </p>
    </div>
    <a
      href={`https://www.tradingview.com/chart/?symbol=BMV:${symbol.replace('.MX', '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-colors"
    >
      <ExternalLink className="w-4 h-4" />
      Ver en TradingView
    </a>
  </div>
);

// ── TradingChart ──────────────────────────────────────────────
const TradingChart = ({ symbol }) => {
  const containerRef = useRef(null);

  const loadWidget = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const tvSymbol = toTVSymbol(symbol);

    const script = document.createElement('script');
    script.src   = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type  = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize:            true,
      symbol:              tvSymbol,
      interval:            '60',
      timezone:            'America/Mexico_City',
      theme:               'dark',
      style:               '1',
      locale:              'es',
      backgroundColor:     'rgba(10, 14, 26, 1)',
      gridColor:           'rgba(75, 85, 99, 0.15)',
      allow_symbol_change: false,
      calendar:            false,
      hide_top_toolbar:    false,
      hide_legend:         false,
      save_image:          true,
      hide_volume:         false,
      withdateranges:      true,
      support_host:        'https://www.tradingview.com',
      studies:             ['STD;MA', 'STD;RSI'],
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  useEffect(() => {
    if (PREMIUM_ONLY_SYMBOLS.has(symbol)) return;
    loadWidget();
    return () => { if (containerRef.current) containerRef.current.innerHTML = ''; };
  }, [loadWidget, symbol]);

  // Mostrar fallback elegante para símbolos premium
  if (PREMIUM_ONLY_SYMBOLS.has(symbol)) {
    return <PremiumSymbolFallback symbol={symbol} />;
  }

  return (
    <div className="tradingview-widget-container w-full h-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget w-full h-full" />
    </div>
  );
};

export default TradingChart;