import React, { useMemo, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Clock, X, Shield, Target } from 'lucide-react';
import { useAssets } from '@/contexts/AssetContext';
import { useRealTimePL } from '@/hooks/useRealTimePL';
import CloseTradeDialog from './CloseTradeDialog';
import { closeTrade, validateTradeClose } from '@/utils/tradeClosingUtils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const formatMoney = (val) => {
  if (val == null) return 'N/A';
  const n = Number(val) || 0;
  return `${n < 0 ? '-' : '+'}$${Math.abs(n).toFixed(2)}`;
};
const formatPrice = (val, precision = 5) => {
  if (val == null) return '—';
  return Number(val).toFixed(precision);
};
const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ── P/L Display ───────────────────────────────────────────────
const ProfitLossDisplay = memo(({ trade, variant = 'desktop' }) => {
  const { realTimePL, isProfit } = useRealTimePL(trade);
  const available = realTimePL != null;
  const num       = Number(realTimePL) || 0;
  const color     = available ? (isProfit ? 'text-green-400' : 'text-red-400') : 'text-gray-400';
  const Icon      = isProfit ? TrendingUp : TrendingDown;

  if (variant === 'mobile') {
    return (
      <span className={cn('font-mono font-bold text-sm', color)}
        style={{ display: 'inline-block', minWidth: '72px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {available ? formatMoney(num) : <Loader2 className="w-3 h-3 animate-spin inline" />}
      </span>
    );
  }
  return (
    <div className={cn('font-bold font-mono text-right flex items-center justify-end gap-1', color)}
      style={{ fontVariantNumeric: 'tabular-nums' }}>
      {available ? (
        <>
          <Icon className="w-3 h-3 shrink-0" />
          <span style={{ display: 'inline-block', minWidth: '72px', textAlign: 'right' }}>{formatMoney(num)}</span>
        </>
      ) : <Loader2 className="w-3 h-3 animate-spin" />}
    </div>
  );
});
ProfitLossDisplay.displayName = 'ProfitLossDisplay';

// ── Current Price ─────────────────────────────────────────────
const CurrentPriceDisplay = memo(({ trade }) => {
  const { prices, assets } = useAssets();
  const priceData = prices[trade.symbol];
  if (!priceData) return <span className="text-gray-500">—</span>;
  const price = trade.type === 'BUY' ? priceData.bid : priceData.ask;
  const asset = assets.find(a => a.symbol === trade.symbol);
  const precision = asset?.precision ?? 5;
  return <span className="font-mono text-white text-xs">{formatPrice(price, precision)}</span>;
});
CurrentPriceDisplay.displayName = 'CurrentPriceDisplay';

// ── SL/TP Badge ───────────────────────────────────────────────
const SLTPBadge = ({ value, type, precision }) => {
  if (!value) return <span className="text-gray-600 text-[10px]">—</span>;
  const isTP = type === 'tp';
  return (
    <div className={cn('flex items-center gap-0.5 text-[10px] font-mono',
      isTP ? 'text-green-400' : 'text-red-400')}>
      {isTP
        ? <Target className="w-2.5 h-2.5 shrink-0" />
        : <Shield className="w-2.5 h-2.5 shrink-0" />
      }
      {Number(value).toFixed(precision ?? 5)}
    </div>
  );
};

// ── Trade Row (open) ──────────────────────────────────────────
const TradeRow = memo(({ trade, onClose, isMarketOpen }) => {
  const { assets } = useAssets();
  const asset     = useMemo(() => assets.find(a => a.symbol === trade.symbol), [assets, trade.symbol]);
  const precision  = asset?.precision ?? 5;
  const isClosed   = trade.status === 'CLOSED';
  const leverage   = asset?.leverage || 100;
  const margin     = Number(trade.margin) || 0;
  const hasSL      = trade.stop_loss   != null;
  const hasTP      = trade.take_profit != null;

  return (
    <motion.div layout variants={itemVariants}
      className="bg-slate-800/50 rounded-lg text-sm transition-colors hover:bg-slate-700/50">

      {/* Mobile */}
      <div className="md:hidden p-3 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono font-bold text-white">{trade.symbol}</span>
            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />{formatDate(trade.open_time)}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
              {trade.type}
            </span>
            <div className="text-[10px] text-gray-400 mt-1">{trade.lot_size} lotes · 1:{leverage}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-xs py-2 border-t border-slate-700/50">
          <div><span className="block text-gray-500">Apertura</span><span className="font-mono text-white">{formatPrice(trade.open_price, precision)}</span></div>
          <div><span className="block text-gray-500">Actual</span><CurrentPriceDisplay trade={trade} /></div>
          <div className="text-right"><span className="block text-gray-500">P/L</span><ProfitLossDisplay trade={trade} variant="mobile" /></div>
        </div>

        {(hasSL || hasTP) && (
          <div className="flex gap-3 py-1.5 border-t border-slate-700/50">
            {hasSL && (
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-400 shrink-0" />
                <span className="text-[10px] text-gray-500">SL:</span>
                <span className="text-[10px] font-mono text-red-400">{Number(trade.stop_loss).toFixed(precision)}</span>
              </div>
            )}
            {hasTP && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-green-400 shrink-0" />
                <span className="text-[10px] text-gray-500">TP:</span>
                <span className="text-[10px] font-mono text-green-400">{Number(trade.take_profit).toFixed(precision)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Margen: <span className="text-gray-300">${margin.toFixed(2)}</span></span>
        </div>

        {!isClosed && onClose && (
          <Button size="sm" variant="destructive" onClick={() => onClose(trade)} disabled={!isMarketOpen}
            className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 h-8 text-xs">
            <X className="w-3 h-3 mr-1" /> Cerrar
          </Button>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-0 p-3 text-xs">
        <div className="w-[90px] shrink-0 font-mono font-bold text-white flex items-center gap-1 overflow-hidden">
          <span className="truncate">{trade.symbol}</span>
        </div>
        <div className="w-[50px] shrink-0">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {trade.type}
          </span>
        </div>
        <div className="w-[45px] shrink-0 font-mono text-gray-300 text-center">{trade.lot_size}</div>
        <div className="w-[45px] shrink-0 text-center text-gray-400">1:{leverage}</div>
        <div className="w-[80px] shrink-0 font-mono text-gray-300 text-right">{formatPrice(trade.open_price, precision)}</div>
        <div className="w-[80px] shrink-0 font-mono text-right"><CurrentPriceDisplay trade={trade} /></div>
        <div className="w-[85px] shrink-0 text-right">
          <SLTPBadge value={trade.stop_loss} type="sl" precision={precision} />
        </div>
        <div className="w-[85px] shrink-0 text-right">
          <SLTPBadge value={trade.take_profit} type="tp" precision={precision} />
        </div>
        <div className="w-[65px] shrink-0 font-mono text-gray-400 text-right">${margin.toFixed(2)}</div>
        <div className="flex-1 text-right"><ProfitLossDisplay trade={trade} variant="desktop" /></div>
        <div className="w-[65px] shrink-0 flex justify-end">
          {!isClosed && onClose && (
            <Button size="sm" variant="destructive" onClick={() => onClose(trade)} disabled={!isMarketOpen}
              className="bg-transparent hover:bg-red-500/10 text-red-500 hover:text-red-400 disabled:text-gray-600 h-7 px-2 border border-transparent hover:border-red-500/20 transition-all">
              <X className="w-3 h-3 mr-1" /><span className="hidden lg:inline">Cerrar</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
});
TradeRow.displayName = 'TradeRow';

// ── Closed Trade Row ──────────────────────────────────────────
const ClosedTradeRow = memo(({ trade }) => {
  const { assets } = useAssets();
  const asset     = useMemo(() => assets.find(a => a.symbol === trade.symbol), [assets, trade.symbol]);
  const precision  = asset?.precision ?? 5;
  const leverage   = asset?.leverage || 100;
  const finalPL    = Number(trade.profit_loss) || 0;
  const isProfit   = finalPL >= 0;

  return (
    <motion.div layout variants={itemVariants}
      className="bg-slate-800/50 rounded-lg text-sm transition-colors hover:bg-slate-700/50">
      <div className="hidden md:flex items-center gap-0 p-3 text-xs">
        <div className="w-[90px] shrink-0 font-mono font-bold text-white truncate">{trade.symbol}</div>
        <div className="w-[50px] shrink-0">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>{trade.type}</span>
        </div>
        <div className="w-[45px] shrink-0 font-mono text-gray-300 text-center">{trade.lot_size}</div>
        <div className="w-[45px] shrink-0 text-center text-gray-400">1:{leverage}</div>
        <div className="w-[80px] shrink-0 font-mono text-gray-300 text-right">{formatPrice(trade.open_price, precision)}</div>
        <div className="w-[80px] shrink-0 font-mono text-gray-400 text-right">{formatPrice(trade.close_price, precision)}</div>
        <div className="w-[85px] shrink-0 text-right text-[10px] text-gray-500">
          {trade.stop_loss ? <SLTPBadge value={trade.stop_loss} type="sl" precision={precision} /> : '—'}
        </div>
        <div className="w-[85px] shrink-0 text-right text-[10px] text-gray-500">
          {trade.take_profit ? <SLTPBadge value={trade.take_profit} type="tp" precision={precision} /> : '—'}
        </div>
        <div className="w-[65px] shrink-0 text-right text-[10px] text-gray-500">{formatDate(trade.close_time)}</div>
        <div className="flex-1 text-right">
          <span className={cn('font-bold font-mono', isProfit ? 'text-green-400' : 'text-red-400')}
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(finalPL)}
          </span>
        </div>
      </div>
      {/* Mobile closed */}
      <div className="md:hidden p-3 space-y-1">
        <div className="flex justify-between">
          <div>
            <span className="font-mono font-bold text-white">{trade.symbol}</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>{trade.type}</span>
          </div>
          <span className={cn('font-bold font-mono text-sm', isProfit ? 'text-green-400' : 'text-red-400')}>{formatMoney(finalPL)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>{formatDate(trade.open_time)}</span>
          <span>→ {formatDate(trade.close_time)}</span>
        </div>
      </div>
    </motion.div>
  );
});
ClosedTradeRow.displayName = 'ClosedTradeRow';

// ── Activity Row ──────────────────────────────────────────────
const ActivityRow = memo(({ trade }) => {
  const isOpen  = trade.status === 'OPEN';
  const finalPL = isOpen ? null : Number(trade.profit_loss) || 0;
  return (
    <motion.div layout variants={itemVariants}
      className="bg-slate-800/30 rounded-lg p-3 text-xs flex items-center gap-3 hover:bg-slate-700/30 transition-colors">
      <div className={cn('w-2 h-2 rounded-full shrink-0', isOpen ? 'bg-green-400' : 'bg-gray-500')} />
      <div className="flex-1">
        <span className="font-mono font-bold text-white">{trade.symbol}</span>
        <span className={`ml-2 text-[10px] font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{trade.type}</span>
        <span className="ml-2 text-gray-500">{trade.lot_size} lotes</span>
        {(trade.stop_loss || trade.take_profit) && (
          <span className="ml-2 text-gray-600">
            {trade.stop_loss   && <span className="text-red-400/60">SL </span>}
            {trade.take_profit && <span className="text-green-400/60">TP</span>}
          </span>
        )}
      </div>
      <div className="text-gray-400 text-[10px]">{formatDate(trade.open_time)}</div>
      <div className={cn('font-mono font-bold', isOpen ? 'text-blue-400' : (finalPL >= 0 ? 'text-green-400' : 'text-red-400'))}>
        {isOpen ? 'ABIERTA' : formatMoney(finalPL)}
      </div>
    </motion.div>
  );
});
ActivityRow.displayName = 'ActivityRow';

// ── TABS ──────────────────────────────────────────────────────
const TABS = [
  { id: 'open',     label: 'Abiertas' },
  { id: 'closed',   label: 'Cerradas' },
  { id: 'history',  label: 'Historial' },
  { id: 'activity', label: 'Actividades' },
];

// ── Desktop headers ───────────────────────────────────────────
const OPEN_HEADERS = [
  { label: 'Símbolo',    className: 'w-[90px] shrink-0' },
  { label: 'Tipo',       className: 'w-[50px] shrink-0' },
  { label: 'Lotes',      className: 'w-[45px] shrink-0 text-center' },
  { label: 'Apal.',      className: 'w-[45px] shrink-0 text-center' },
  { label: 'Apertura',   className: 'w-[80px] shrink-0 text-right' },
  { label: 'Actual',     className: 'w-[80px] shrink-0 text-right' },
  { label: 'Stop Loss',  className: 'w-[85px] shrink-0 text-right' },
  { label: 'Take Profit',className: 'w-[85px] shrink-0 text-right' },
  { label: 'Margen',     className: 'w-[65px] shrink-0 text-right' },
  { label: 'P/L',        className: 'flex-1 text-right' },
  { label: 'Acción',     className: 'w-[65px] shrink-0 text-right' },
];

const CLOSED_HEADERS = [
  { label: 'Símbolo',    className: 'w-[90px] shrink-0' },
  { label: 'Tipo',       className: 'w-[50px] shrink-0' },
  { label: 'Lotes',      className: 'w-[45px] shrink-0 text-center' },
  { label: 'Apal.',      className: 'w-[45px] shrink-0 text-center' },
  { label: 'Apertura',   className: 'w-[80px] shrink-0 text-right' },
  { label: 'Cierre',     className: 'w-[80px] shrink-0 text-right' },
  { label: 'SL',         className: 'w-[85px] shrink-0 text-right' },
  { label: 'TP',         className: 'w-[85px] shrink-0 text-right' },
  { label: 'Fecha',      className: 'w-[65px] shrink-0 text-right' },
  { label: 'P/L Final',  className: 'flex-1 text-right' },
];

// ── TradesList ────────────────────────────────────────────────
const TradesList = memo(({ title, icon: Icon, iconColor, trades = [], allTrades = [], loading, isHistory, hasPlan, isMarketOpen }) => {
  const [activeTab, setActiveTab]               = useState('open');
  const [closeDialogTrade, setCloseDialogTrade] = useState(null);
  const [isClosing, setIsClosing]               = useState(false);
  const { toast } = useToast();

  const source       = allTrades.length ? allTrades : trades;
  const openTrades   = useMemo(() => source.filter(t => t.status === 'OPEN'),   [source]);
  const closedTrades = useMemo(() => source.filter(t => t.status === 'CLOSED'), [source]);

  const handleCloseClick = (trade) => {
    const validation = validateTradeClose(trade);
    if (!validation.canClose) {
      toast({ title: 'No se puede cerrar', description: validation.reason, variant: 'destructive' }); return;
    }
    setCloseDialogTrade(trade);
  };

  const handleConfirmClose = async (trade, closePrice) => {
    setIsClosing(true);
    try {
      const result = await closeTrade(trade.id, closePrice);
      if (result.success) {
        const finalPl = Number(result.data.final_pl) || 0;
        toast({
          title: '✅ Operación Cerrada',
          description: (
            <div className="space-y-1 text-sm">
              <div>P/L Final: <span className={`font-bold ${finalPl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(finalPl)}</span></div>
            </div>
          ),
          className: 'bg-green-600 text-white'
        });
        setCloseDialogTrade(null);
      } else {
        toast({ title: 'Error al cerrar', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsClosing(false);
    }
  };

  const renderEmpty = (msg) => (
    <div className="text-center py-10 flex flex-col items-center px-4">
      {Icon && <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-gray-600" /></div>}
      <p className="text-gray-400 text-sm">{msg}</p>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>;
    if (!hasPlan && !openTrades.length && !closedTrades.length) return renderEmpty('Adquiere un plan para ver tus operaciones.');

    if (activeTab === 'open') {
      if (!openTrades.length) return renderEmpty('No hay posiciones abiertas.');
      return (
        <>
          <div className="hidden md:flex items-center gap-0 text-xs text-gray-500 font-bold px-3 pb-3 border-b border-gray-800 mb-2">
            {OPEN_HEADERS.map(h => <span key={h.label} className={h.className}>{h.label}</span>)}
          </div>
          <motion.div className="space-y-1" variants={containerVariants} initial="hidden" animate="visible">
            {openTrades.map(trade => <TradeRow key={trade.id} trade={trade} onClose={handleCloseClick} isMarketOpen={isMarketOpen} />)}
          </motion.div>
        </>
      );
    }

    if (activeTab === 'closed') {
      if (!closedTrades.length) return renderEmpty('No hay operaciones cerradas.');
      return (
        <>
          <div className="hidden md:flex items-center gap-0 text-xs text-gray-500 font-bold px-3 pb-3 border-b border-gray-800 mb-2">
            {CLOSED_HEADERS.map(h => <span key={h.label} className={h.className}>{h.label}</span>)}
          </div>
          <motion.div className="space-y-1" variants={containerVariants} initial="hidden" animate="visible">
            {closedTrades.map(trade => <ClosedTradeRow key={trade.id} trade={trade} />)}
          </motion.div>
        </>
      );
    }

    if (activeTab === 'history') {
      const all = [...openTrades, ...closedTrades].sort((a, b) => new Date(b.open_time) - new Date(a.open_time));
      if (!all.length) return renderEmpty('No hay historial de operaciones.');
      return (
        <>
          <div className="hidden md:flex items-center gap-0 text-xs text-gray-500 font-bold px-3 pb-3 border-b border-gray-800 mb-2">
            {OPEN_HEADERS.map(h => <span key={h.label} className={h.className}>{h.label}</span>)}
          </div>
          <motion.div className="space-y-1" variants={containerVariants} initial="hidden" animate="visible">
            {all.map(trade =>
              trade.status === 'OPEN'
                ? <TradeRow key={trade.id} trade={trade} onClose={null} isMarketOpen={false} />
                : <ClosedTradeRow key={trade.id} trade={trade} />
            )}
          </motion.div>
        </>
      );
    }

    if (activeTab === 'activity') {
      const all = [...openTrades, ...closedTrades].sort((a, b) => new Date(b.open_time) - new Date(a.open_time));
      if (!all.length) return renderEmpty('No hay actividad registrada.');
      return (
        <motion.div className="space-y-1" variants={containerVariants} initial="hidden" animate="visible">
          {all.map(trade => <ActivityRow key={trade.id} trade={trade} />)}
        </motion.div>
      );
    }
  };

  return (
    <>
      <Card className="glass-effect border-gray-700 h-full flex flex-col bg-slate-900/50 w-full border-0 md:border">
        <CardHeader className="pb-2 md:pb-3 pt-3 md:pt-4 px-4">
          {title && (
            <CardTitle className="text-white flex items-center text-base md:text-lg">
              {Icon && <Icon className={`mr-2 h-4 w-4 md:h-5 md:w-5 ${iconColor || ''}`} />}
              {title}
            </CardTitle>
          )}

          <div className="flex gap-1 mt-1 border-b border-slate-700 pb-0">
            {TABS.map(tab => {
              const count = tab.id === 'open' ? openTrades.length
                : tab.id === 'closed' ? closedTrades.length
                : openTrades.length + closedTrades.length;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn('px-3 py-1.5 text-xs font-semibold rounded-t transition-colors relative',
                    activeTab === tab.id ? 'text-white border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300')}>
                  {tab.label}
                  {count > 0 && (
                    <span className={cn('ml-1 text-[10px] px-1.5 py-0.5 rounded-full',
                      activeTab === tab.id ? 'bg-green-400/20 text-green-400' : 'bg-slate-700 text-gray-400')}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto px-3 md:px-4 pb-4">
          {renderContent()}
        </CardContent>
      </Card>

      <CloseTradeDialog
        trade={closeDialogTrade}
        isOpen={!!closeDialogTrade && !isClosing}
        onClose={() => setCloseDialogTrade(null)}
        onConfirm={handleConfirmClose}
        isMarketOpen={isMarketOpen}
      />
    </>
  );
});
TradesList.displayName = 'TradesList';

export default TradesList;