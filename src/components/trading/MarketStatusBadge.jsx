// src/components/trading/MarketStatusBadge.jsx
// Badge que muestra si el mercado está abierto o cerrado
import React from 'react';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MARKET_LABELS = {
  FOREX:       'Forex',
  STOCKS_US:   'Acciones US',
  STOCKS_MX:   'Acciones MX',
  INDICES_US:  'Índices US',
  INDICES_EU:  'Índices EU',
  INDICES_BR:  'Índices BR',
  CRYPTO:      'Crypto',
  UNKNOWN:     'Mercado',
};

/**
 * Badge compacto para usar en el header del TradingPanel
 */
export const MarketStatusBadge = ({ isOpen, marketType, schedule, className }) => {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
      isOpen
        ? 'bg-green-500/10 border-green-500/30 text-green-400'
        : 'bg-red-500/10 border-red-500/30 text-red-400',
      className
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full shrink-0',
        isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
      )} />
      <span>{MARKET_LABELS[marketType] || 'Mercado'}</span>
      <span className="opacity-60">{isOpen ? 'Abierto' : 'Cerrado'}</span>
    </div>
  );
};

/**
 * Banner de mercado cerrado para mostrar encima de los botones de trading
 */
export const MarketClosedBanner = ({ reason, nextOpen, schedule, symbol }) => {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
      {/* Icono + título */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-300">Mercado Cerrado</p>
          {symbol && <p className="text-xs text-red-400/70">{symbol}</p>}
        </div>
      </div>

      {/* Razón */}
      {reason && (
        <p className="text-xs text-slate-400 leading-relaxed">{reason}</p>
      )}

      {/* Horario y próxima apertura */}
      <div className="flex flex-col gap-1.5">
        {schedule && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>Horario: <span className="text-slate-400">{schedule}</span></span>
          </div>
        )}
        {nextOpen && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Próxima apertura: <span className="text-amber-400 font-medium">{nextOpen}</span></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketStatusBadge;