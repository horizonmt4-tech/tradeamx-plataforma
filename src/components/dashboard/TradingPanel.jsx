import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2, WifiOff, ChevronDown, Shield, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAssets } from '@/contexts/AssetContext';
import { validatePriceBySymbol, getContractSizeBySymbol, getAssetType, AssetTypes } from '@/utils/marketDataValidator';
import { cn } from '@/lib/utils';
import { useMarketHours } from '@/hooks/useMarketHours';
import { MarketStatusBadge, MarketClosedBanner } from '@/components/trading/MarketStatusBadge';

const TradingPanel = ({ assets = [], onOpenTrade, selectedSymbol, setSelectedSymbol, accountBalance }) => {
  const { prices, assetStatus } = useAssets();
  const [lotSize, setLotSize]   = useState(0.01);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stopLoss, setStopLoss]   = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const { toast } = useToast();

  // ── Market hours hook ──
  const { isOpen, isClosed, marketType, reason, nextOpen, schedule } = useMarketHours(selectedSymbol);

  useEffect(() => {
    if (assets.length > 0 && !selectedSymbol && typeof setSelectedSymbol === 'function') {
      setSelectedSymbol(assets[0].symbol);
    }
  }, [assets, selectedSymbol, setSelectedSymbol]);

  // Reset SL/TP al cambiar activo
  useEffect(() => {
    setStopLoss('');
    setTakeProfit('');
  }, [selectedSymbol]);

  const selectedAsset = assets.find(a => a.symbol === selectedSymbol);
  const priceData     = selectedSymbol ? prices[selectedSymbol] : null;

  const bidPrice = priceData?.bid ?? 0;
  const askPrice = priceData?.ask ?? 0;
  const midPrice = priceData?.mid ?? selectedAsset?.price ?? 0;
  const spread   = askPrice > 0 && bidPrice > 0 ? (askPrice - bidPrice) : 0;

  const isSimulated  = !priceData?.mid || priceData.mid <= 0;
  const isSupported  = !!selectedAsset;

  const basePrice     = Number(selectedAsset?.price) || 0;
  const changePercent = basePrice > 0 && midPrice > 0 ? ((midPrice - basePrice) / basePrice) * 100 : 0;
  const isPositive    = changePercent >= 0;

  const contractSize = getContractSizeBySymbol(selectedSymbol);
  const assetType    = selectedSymbol ? getAssetType(selectedSymbol) : AssetTypes.FOREX;
  const isStock      = assetType === AssetTypes.STOCK;
  const minLotSize   = isStock ? 1 : 0.01;
  const stepValue    = isStock ? '1' : '0.01';
  const precision    = selectedAsset?.precision || 5;
  const leverage     = selectedAsset?.leverage || 100;

  useEffect(() => {
    if (lotSize !== '' && Number(lotSize) < minLotSize) setLotSize(minLotSize);
  }, [selectedSymbol, minLotSize]);

  const marginRequired = selectedSymbol && lotSize > 0
    ? (contractSize * (Number(lotSize) || 0) * askPrice) / leverage
    : 0;

  // Calcular P/L estimado para SL/TP
  const calcPL = (price, type) => {
    if (!price || !lotSize || !askPrice) return null;
    const entry = type === 'BUY' ? askPrice : bidPrice;
    const diff  = type === 'BUY' ? (Number(price) - entry) : (entry - Number(price));
    return diff * (Number(lotSize) || 0) * contractSize;
  };

  const slPL = stopLoss   ? calcPL(stopLoss,   'BUY') : null;
  const tpPL = takeProfit ? calcPL(takeProfit, 'BUY') : null;

  const handleTrade = async (type) => {
    if (!onOpenTrade) return;

    // Bloquear si el mercado está cerrado
    if (isClosed) {
      toast({
        title: 'Mercado cerrado',
        description: reason || 'El mercado no está disponible en este momento.',
        variant: 'destructive',
      });
      return;
    }

    if (!isSupported) {
      toast({ title: 'Símbolo no soportado', variant: 'destructive' }); return;
    }
    const currentLotSize = Number(lotSize) || minLotSize;
    if (currentLotSize < minLotSize) {
      toast({ title: 'Volumen inválido', description: `Mínimo: ${minLotSize}`, variant: 'destructive' });
      setLotSize(minLotSize); return;
    }
    const executionPrice = type === 'BUY' ? askPrice : bidPrice;
    const validation = validatePriceBySymbol(executionPrice, selectedSymbol);
    if (!validation.valid) {
      toast({ title: 'Error de precio', description: 'Precio incorrecto. Intenta más tarde.', variant: 'destructive' }); return;
    }
    if (marginRequired > (accountBalance || 0)) {
      toast({ title: 'Balance insuficiente', description: 'No tienes suficiente margen libre.', variant: 'destructive' }); return;
    }

    // Validar SL/TP si están configurados
    if (stopLoss) {
      const sl = Number(stopLoss);
      if (type === 'BUY'  && sl >= executionPrice) { toast({ title: 'SL inválido', description: 'Stop Loss debe ser menor al precio de entrada para BUY.', variant: 'destructive' }); return; }
      if (type === 'SELL' && sl <= executionPrice) { toast({ title: 'SL inválido', description: 'Stop Loss debe ser mayor al precio de entrada para SELL.', variant: 'destructive' }); return; }
    }
    if (takeProfit) {
      const tp = Number(takeProfit);
      if (type === 'BUY'  && tp <= executionPrice) { toast({ title: 'TP inválido', description: 'Take Profit debe ser mayor al precio de entrada para BUY.', variant: 'destructive' }); return; }
      if (type === 'SELL' && tp >= executionPrice) { toast({ title: 'TP inválido', description: 'Take Profit debe ser menor al precio de entrada para SELL.', variant: 'destructive' }); return; }
    }

    setIsLoading(true);
    try {
      await onOpenTrade({
        symbol:      selectedSymbol,
        type,
        lot_size:    currentLotSize,
        open_price:  executionPrice,
        stop_loss:   stopLoss   ? Number(stopLoss)   : null,
        take_profit: takeProfit ? Number(takeProfit) : null,
      });
      // Limpiar SL/TP tras operar
      setStopLoss('');
      setTakeProfit('');
    } catch (err) {
      toast({ title: 'Error de ejecución', description: 'No se pudo ejecutar la orden.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymbolChange  = (v) => { if (typeof setSelectedSymbol === 'function') setSelectedSymbol(v); };
  const handleLotSizeChange = (e) => { const v = e.target.value; setLotSize(v === '' ? '' : parseFloat(v)); };
  const handleLotSizeBlur   = () => { if (lotSize === '' || Number(lotSize) < minLotSize) setLotSize(minLotSize); };

  // Condición unificada de deshabilitado para botones
  const isTradeDisabled = isLoading || !selectedAsset || !isSupported || marginRequired > (accountBalance || 0) || isClosed;

  return (
    <div className="w-full flex flex-col gap-0 text-white select-none">

      {/* ── Header: símbolo + precio ── */}
      <div className="pb-3 border-b border-slate-700/60 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Panel de Trading</span>
          <div className="flex items-center gap-2">
            {/* Badge de estado del mercado */}
            {selectedSymbol && (
              <MarketStatusBadge
                isOpen={isOpen}
                marketType={marketType}
                schedule={schedule}
              />
            )}
            {midPrice > 0 && (
              <span className={cn('text-xs font-bold', isPositive ? 'text-green-400' : 'text-red-400')}>
                {isPositive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {/* Selector de activo */}
        <Select value={selectedSymbol || ''} onValueChange={handleSymbolChange}>
          <SelectTrigger className="w-full bg-slate-800/80 border-slate-600/60 text-white h-9 text-sm font-mono font-bold hover:border-cyan-500/50 focus:border-cyan-500 transition-colors">
            <SelectValue placeholder="Selecciona un activo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
            {assets.map(asset => (
              <SelectItem key={asset.id} value={asset.symbol} className="font-mono text-sm">
                {asset.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isSimulated && (
          <p className="text-amber-500 text-[10px] mt-1 flex items-center gap-1">
            <WifiOff className="w-3 h-3" /> Datos simulados
          </p>
        )}
        {!isSupported && selectedSymbol && (
          <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> No disponible para operar
          </p>
        )}
      </div>

      {/* ── BID / ASK ── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-2.5 text-center">
          <span className="block text-[9px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Venta (Bid)</span>
          <span className="block text-xl font-bold font-mono text-white">
            {bidPrice > 0 ? bidPrice.toFixed(precision) : '—'}
          </span>
        </div>
        <div className="bg-green-950/30 border border-green-500/20 rounded-lg p-2.5 text-center">
          <span className="block text-[9px] font-bold text-green-400 uppercase tracking-widest mb-0.5">Compra (Ask)</span>
          <span className="block text-xl font-bold font-mono text-white">
            {askPrice > 0 ? askPrice.toFixed(precision) : '—'}
          </span>
        </div>
      </div>

      {/* Spread */}
      {spread > 0 && (
        <div className="flex justify-center mb-3">
          <span className="text-[10px] text-gray-500 font-mono">
            Spread: {spread.toFixed(precision)}
          </span>
        </div>
      )}

      {/* ── Volumen ── */}
      <div className="mb-3">
        <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 block">
          Volumen ({isStock ? 'Acciones' : 'Lotes'})
        </Label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLotSize(prev => Math.max(minLotSize, Number(prev) - (isStock ? 1 : 0.01)))}
            className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg flex items-center justify-center transition-colors shrink-0"
          >−</button>
          <Input
            type="number"
            step={stepValue}
            min={stepValue}
            value={lotSize}
            onChange={handleLotSizeChange}
            onBlur={handleLotSizeBlur}
            className="flex-1 bg-slate-800 border-slate-600 text-white text-center font-mono font-bold h-9 text-sm focus:border-cyan-500"
          />
          <button
            onClick={() => setLotSize(prev => Number((Number(prev) + (isStock ? 1 : 0.01)).toFixed(2)))}
            className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg flex items-center justify-center transition-colors shrink-0"
          >+</button>
        </div>
      </div>

      {/* ── Margen requerido + Apalancamiento ── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
          <span className="block text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Margen req.</span>
          <span className="block text-sm font-bold font-mono text-white">${marginRequired.toFixed(2)}</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
          <span className="block text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">Apalancamiento</span>
          <span className="block text-sm font-bold font-mono text-cyan-400">1:{leverage}</span>
        </div>
      </div>

      {/* ── Stop Loss / Take Profit (colapsable) ── */}
      <button
        onClick={() => setShowAdvanced(p => !p)}
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 transition-colors mb-2"
      >
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-cyan-400" />
          Stop Loss / Take Profit
        </span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-500 transition-transform', showAdvanced && 'rotate-180')} />
      </button>

      {showAdvanced && (
        <div className="space-y-2 mb-3 px-1">

          {/* Stop Loss */}
          <div>
            <Label className="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1 block">
              <AlertTriangle className="w-3 h-3" /> Stop Loss
            </Label>
            <Input
              type="number"
              step={stepValue}
              placeholder={`Ej: ${bidPrice > 0 ? (bidPrice * 0.99).toFixed(precision) : '0.00'}`}
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white font-mono text-sm h-9 focus:border-red-500/60 placeholder:text-gray-600"
            />
            {stopLoss && slPL !== null && (
              <p className={cn('text-[10px] mt-0.5 font-mono', slPL < 0 ? 'text-red-400' : 'text-green-400')}>
                P/L estimado BUY: {slPL >= 0 ? '+' : ''}${slPL.toFixed(2)}
              </p>
            )}
          </div>

          {/* Take Profit */}
          <div>
            <Label className="text-[10px] font-semibold text-green-400 uppercase tracking-widest mb-1 flex items-center gap-1 block">
              <Target className="w-3 h-3" /> Take Profit
            </Label>
            <Input
              type="number"
              step={stepValue}
              placeholder={`Ej: ${askPrice > 0 ? (askPrice * 1.01).toFixed(precision) : '0.00'}`}
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white font-mono text-sm h-9 focus:border-green-500/60 placeholder:text-gray-600"
            />
            {takeProfit && tpPL !== null && (
              <p className={cn('text-[10px] mt-0.5 font-mono', tpPL > 0 ? 'text-green-400' : 'text-red-400')}>
                P/L estimado BUY: {tpPL >= 0 ? '+' : ''}${tpPL.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Banner mercado cerrado ── */}
      {isClosed && selectedSymbol && (
        <div className="mb-3">
          <MarketClosedBanner
            reason={reason}
            nextOpen={nextOpen}
            schedule={schedule}
            symbol={selectedSymbol}
          />
        </div>
      )}

      {/* ── Botones VENDER / COMPRAR ── */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={() => handleTrade('SELL')}
          disabled={isTradeDisabled}
          className="
            relative h-14 rounded-xl font-bold text-base tracking-wide
            bg-red-600 hover:bg-red-500 active:bg-red-700
            disabled:opacity-40 disabled:cursor-not-allowed
            border border-red-500/50 hover:border-red-400
            transition-all duration-150
            flex flex-col items-center justify-center gap-0.5
          "
        >
          {isLoading
            ? <Loader2 className="animate-spin w-5 h-5" />
            : isClosed
              ? <><span className="text-[10px] text-red-200 font-normal">🔒 CERRADO</span></>
              : <>
                  <span className="text-[10px] text-red-200 font-normal">VENDER</span>
                  <span className="font-mono text-sm">{bidPrice > 0 ? bidPrice.toFixed(precision) : '—'}</span>
                </>
          }
        </button>
        <button
          onClick={() => handleTrade('BUY')}
          disabled={isTradeDisabled}
          className="
            relative h-14 rounded-xl font-bold text-base tracking-wide
            bg-green-600 hover:bg-green-500 active:bg-green-700
            disabled:opacity-40 disabled:cursor-not-allowed
            border border-green-500/50 hover:border-green-400
            transition-all duration-150
            flex flex-col items-center justify-center gap-0.5
          "
        >
          {isLoading
            ? <Loader2 className="animate-spin w-5 h-5" />
            : isClosed
              ? <><span className="text-[10px] text-green-200 font-normal">🔒 CERRADO</span></>
              : <>
                  <span className="text-[10px] text-green-200 font-normal">COMPRAR</span>
                  <span className="font-mono text-sm">{askPrice > 0 ? askPrice.toFixed(precision) : '—'}</span>
                </>
          }
        </button>
      </div>

      {/* Capital disponible */}
      {accountBalance !== undefined && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Capital disponible</span>
          <span className="text-[11px] font-mono font-semibold text-gray-300">
            ${(accountBalance || 0).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TradingPanel;