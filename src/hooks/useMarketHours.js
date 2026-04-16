// src/hooks/useMarketHours.js
// Detecta si el mercado está abierto o cerrado según el tipo de activo
// Horarios en UTC

import { useState, useEffect } from 'react';

/**
 * Clasificación de activos por tipo de mercado
 */
const ASSET_TYPES = {
  // Forex — 24/5, cierra viernes 21:00 UTC, abre domingo 21:00 UTC
  FOREX: [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD',
    'CHF/USD', 'USD/CHF', 'GBP/JPY', 'EUR/GBP', 'EUR/JPY', 'AUD/CAD',
    'NZD/CAD', 'NZD/CHF', 'NZD/USD', 'USD/ILS', 'USD/MXN', 'USD/HKD',
    'EUR/NZD', 'GBP/CAD', 'AUD/JPY', 'CHF/JPY', 'XAU/USD', 'XAG/USD',
    'WTI/USD', 'BRENT', 'NATGAS', 'COPPER', 'PALLADIUM',
  ],

  // Acciones US — Lunes a Viernes 13:30–20:00 UTC (9:30am–4pm ET)
  STOCKS_US: [
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
    'AMD', 'INTC', 'NFLX', 'SBUX', 'CL', 'BMY', 'MMM', 'MELI',
    'PEP', 'PFE', 'UAL', 'MET', 'MA', 'MCD', 'AXP', 'UNH', 'JNJ',
    'PM', 'CVX', 'XOM', 'BAC', 'VZ', 'V', 'PG', 'KO', 'KMB',
    'BLK', 'GM', 'MS', 'TSM', 'GFNORTEO',
  ],

  // Acciones MX (BMV) — Lunes a Viernes 14:30–21:00 UTC (9:30am–4pm CST)
  STOCKS_MX: [
    'CEMEXCPO.MX', 'GFNORTEO',
  ],

  // Índices US — futuros 24/5 con pausa 21:00–22:00 UTC
  INDICES_US: ['US30', 'NAS100', 'US500'],

  // Índices EU — Lunes-Viernes 07:00–21:00 UTC
  INDICES_EU: ['GER40'],

  // Índices JP — Lunes-Viernes 00:00–06:00 UTC y 07:00–09:30 UTC
  INDICES_JP: ['NIKKEI'],

  // Índices BR — Lunes-Viernes 13:00–21:00 UTC
  INDICES_BR: ['BOVESPA'],

  // Crypto — 24/7, nunca cierra
  CRYPTO: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
};

/**
 * Retorna el tipo de mercado para un símbolo dado
 */
function getMarketType(symbol) {
  if (!symbol) return 'UNKNOWN';
  const s = symbol.toUpperCase();

  if (ASSET_TYPES.CRYPTO.includes(s))     return 'CRYPTO';
  if (ASSET_TYPES.FOREX.includes(s))      return 'FOREX';
  if (ASSET_TYPES.STOCKS_MX.includes(s))  return 'STOCKS_MX';
  if (ASSET_TYPES.STOCKS_US.includes(s))  return 'STOCKS_US';
  if (ASSET_TYPES.INDICES_US.includes(s)) return 'INDICES_US';
  if (ASSET_TYPES.INDICES_EU.includes(s)) return 'INDICES_EU';
  if (ASSET_TYPES.INDICES_JP.includes(s)) return 'INDICES_JP';
  if (ASSET_TYPES.INDICES_BR.includes(s)) return 'INDICES_BR';

  // Si contiene / probablemente es Forex
  if (s.includes('/')) return 'FOREX';

  return 'STOCKS_US'; // Default para acciones no listadas
}

/**
 * Verifica si el mercado está abierto para un tipo de activo
 * @param {string} marketType
 * @returns {{ isOpen: boolean, reason: string, nextOpen: string, schedule: string }}
 */
function checkMarketOpen(marketType) {
  const now     = new Date();
  const utcDay  = now.getUTCDay();   // 0=Dom, 1=Lun, ..., 5=Vie, 6=Sáb
  const utcHour = now.getUTCHours();
  const utcMin  = now.getUTCMinutes();
  const utcTime = utcHour + utcMin / 60; // hora decimal UTC

  const isFriday  = utcDay === 5;
  const isSunday  = utcDay === 0;

  switch (marketType) {
    case 'CRYPTO':
      return {
        isOpen:   true,
        reason:   '',
        nextOpen: '',
        schedule: '24/7',
      };

    case 'FOREX': {
      // Cierra: Viernes ≥21:00 UTC hasta Domingo 21:00 UTC
      const closedFriday   = isFriday  && utcTime >= 21;
      const closedSaturday = utcDay === 6;
      const closedSunday   = isSunday  && utcTime < 21;
      const isClosed = closedFriday || closedSaturday || closedSunday;

      return {
        isOpen:   !isClosed,
        reason:   isClosed ? 'El mercado Forex cierra los fines de semana (Vie 21:00 UTC – Dom 21:00 UTC)' : '',
        nextOpen: isClosed ? 'Domingo 21:00 UTC' : '',
        schedule: 'Lun–Vie 21:00 UTC continuo',
      };
    }

    case 'STOCKS_US': {
      // Lunes–Viernes 13:30–20:00 UTC (9:30am–4:00pm ET)
      const isWeekday = utcDay >= 1 && utcDay <= 5;
      const inHours   = utcTime >= 13.5 && utcTime < 20;
      const isOpen    = isWeekday && inHours;

      return {
        isOpen,
        reason:   !isOpen ? 'El mercado de acciones US opera de Lun–Vie 9:30am–4:00pm ET (13:30–20:00 UTC)' : '',
        nextOpen: !isOpen ? 'Próximo día hábil a las 13:30 UTC' : '',
        schedule: 'Lun–Vie 13:30–20:00 UTC',
      };
    }

    case 'STOCKS_MX': {
      // Lunes–Viernes 14:30–21:00 UTC (9:30am–4:00pm CST)
      const isWeekday = utcDay >= 1 && utcDay <= 5;
      const inHours   = utcTime >= 14.5 && utcTime < 21;
      const isOpen    = isWeekday && inHours;

      return {
        isOpen,
        reason:   !isOpen ? 'La BMV opera de Lun–Vie 9:30am–4:00pm CST (14:30–21:00 UTC)' : '',
        nextOpen: !isOpen ? 'Próximo día hábil a las 14:30 UTC' : '',
        schedule: 'Lun–Vie 14:30–21:00 UTC',
      };
    }

    case 'INDICES_US': {
      // Futuros US: 24/5 con pausa 21:00–22:00 UTC cada día
      const isWeekday  = utcDay >= 1 && utcDay <= 5;
      const inPause    = utcTime >= 21 && utcTime < 22;
      const sundayOpen = isSunday && utcTime >= 22;
      const isOpen = (isWeekday && !inPause) || sundayOpen;

      return {
        isOpen,
        reason:   !isOpen ? 'Los índices US tienen una pausa diaria de 21:00–22:00 UTC y cierran el fin de semana' : '',
        nextOpen: !isOpen ? 'Domingo 22:00 UTC' : '',
        schedule: '24/5 con pausa 21:00–22:00 UTC',
      };
    }

    case 'INDICES_EU': {
      // GER40: Lunes–Viernes 07:00–21:00 UTC
      const isWeekday = utcDay >= 1 && utcDay <= 5;
      const inHours   = utcTime >= 7 && utcTime < 21;
      const isOpen    = isWeekday && inHours;

      return {
        isOpen,
        reason:   !isOpen ? 'El DAX/GER40 opera de Lun–Vie 07:00–21:00 UTC' : '',
        nextOpen: !isOpen ? 'Próximo día hábil a las 07:00 UTC' : '',
        schedule: 'Lun–Vie 07:00–21:00 UTC',
      };
    }

    case 'INDICES_JP': {
      // NIKKEI: Lunes–Viernes 00:00–06:00 UTC y 07:00–09:30 UTC
      const isWeekday  = utcDay >= 1 && utcDay <= 5;
      const inSession1 = utcTime >= 0  && utcTime < 6;
      const inSession2 = utcTime >= 7  && utcTime < 9.5;
      const isOpen     = isWeekday && (inSession1 || inSession2);

      return {
        isOpen,
        reason:   !isOpen ? 'El NIKKEI opera de Lun–Vie 00:00–06:00 y 07:00–09:30 UTC' : '',
        nextOpen: !isOpen ? 'Próximo día hábil a las 00:00 UTC' : '',
        schedule: 'Lun–Vie 00:00–06:00 y 07:00–09:30 UTC',
      };
    }

    case 'INDICES_BR': {
      // BOVESPA: Lunes–Viernes 13:00–21:00 UTC
      const isWeekday = utcDay >= 1 && utcDay <= 5;
      const inHours   = utcTime >= 13 && utcTime < 21;
      const isOpen    = isWeekday && inHours;

      return {
        isOpen,
        reason:   !isOpen ? 'El BOVESPA opera de Lun–Vie 13:00–21:00 UTC' : '',
        nextOpen: !isOpen ? 'Próximo día hábil a las 13:00 UTC' : '',
        schedule: 'Lun–Vie 13:00–21:00 UTC',
      };
    }

    default:
      return {
        isOpen:   true,
        reason:   '',
        nextOpen: '',
        schedule: '',
      };
  }
}

/**
 * Hook principal
 * @param {string} symbol — símbolo del activo seleccionado
 * @returns {{ isOpen, isClosed, marketType, reason, nextOpen, schedule }}
 */
export function useMarketHours(symbol) {
  const [status, setStatus] = useState(() => {
    const type = getMarketType(symbol);
    return { marketType: type, ...checkMarketOpen(type) };
  });

  useEffect(() => {
    const update = () => {
      const type   = getMarketType(symbol);
      const result = checkMarketOpen(type);
      setStatus({ marketType: type, ...result });
    };

    update();
    // Re-evaluar cada minuto
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [symbol]);

  return {
    isOpen:     status.isOpen,
    isClosed:   !status.isOpen,
    marketType: status.marketType,
    reason:     status.reason,
    nextOpen:   status.nextOpen,
    schedule:   status.schedule,
  };
}

export { getMarketType, checkMarketOpen };