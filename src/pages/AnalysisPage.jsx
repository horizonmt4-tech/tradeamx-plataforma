import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssets } from '@/contexts/AssetContext';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';
import TradingChart from '@/components/dashboard/TradingChart';
import TradingPanel from '@/components/dashboard/TradingPanel';
import TradesList from '@/components/dashboard/TradesList';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const AnalysisPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { assets, prices, loading: assetsLoading, isMarketOpen } = useAssets();
  const { toast } = useToast();

  const [trades, setTrades] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) setSelectedAsset(assets[0]);
  }, [assets, selectedAsset]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    } catch (err) { }
  }, [user]);

  const fetchTrades = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('trades').select('*')
        .eq('user_id', user.id)
        .order('open_time', { ascending: false });
      if (error) throw error;
      setTrades(data || []);
    } catch (err) { console.error(err); }
  }, [user]);

  const handleRefresh = useCallback(async () => {
    setDataLoading(true);
    await Promise.all([fetchTrades(), fetchProfile()]);
    setDataLoading(false);
  }, [fetchTrades, fetchProfile]);

  const hasPlan = useMemo(() => {
    if (!profile) return false;
    return profile.has_purchased_plan === true ||
      profile.rules_profile === 'standard' ||
      profile.account_type === 'demo';
  }, [profile]);

  const openTrades = useMemo(() => trades.filter(t => t.status === 'OPEN'), [trades]);

  // ✅ FIX: Ahora llama a open_trade via RPC para que descuente el margen correctamente
  const handleOpenTrade = useCallback(async (tradeData) => {
    if (!user || !selectedAsset) return;
    try {
      // FIX CRÍTICO — bug de margen en pares donde USD es la moneda BASE
      // (USD/JPY, USD/CAD, USD/CHF, USD/MXN, USD/HKD, USD/ILS, etc.)
      //
      // La fórmula (contract_size * lot_size * price) / leverage solo es
      // correcta cuando USD es la moneda COTIZADA (ej: EUR/USD, GBP/USD),
      // porque en ese caso el resultado ya está en dólares.
      //
      // Cuando USD es la moneda BASE (USD/XXX), 1 unidad de la posición
      // YA vale exactamente $1 USD — no se debe multiplicar por el precio,
      // porque el precio representa cuántas unidades de la OTRA moneda
      // equivalen a 1 USD, no el valor en USD de la posición.
      //
      // Ejemplo real: USD/JPY a 150 con 0.01 lotes, contract_size 100,000:
      //   INCORRECTO: (100000 * 0.01 * 150) / 100 = $1,500 (¡150x inflado!)
      //   CORRECTO:   (100000 * 0.01 * 1)   / 100 = $10.00
      const symbol = tradeData.symbol || '';
      const [base, quote] = symbol.includes('/') ? symbol.toUpperCase().split('/') : [null, null];
      const isUsdBase = base === 'USD' && quote !== 'USD';

      const priceForMargin = isUsdBase ? 1 : tradeData.open_price;

      const margin = (selectedAsset.contract_size * tradeData.lot_size * priceForMargin) / selectedAsset.leverage;

      const { data, error } = await supabase.rpc('open_trade', {
        p_user_id: user.id,
        p_symbol: tradeData.symbol,
        p_type: tradeData.type,
        p_lot_size: tradeData.lot_size,
        p_open_price: tradeData.open_price,
        p_margin: margin,
        p_stop_loss: tradeData.stop_loss ?? null,
        p_take_profit: tradeData.take_profit ?? null,
      });

      if (error) throw error;

      const extras = [];
      if (tradeData.stop_loss) extras.push(`SL: ${tradeData.stop_loss}`);
      if (tradeData.take_profit) extras.push(`TP: ${tradeData.take_profit}`);

      toast({
        title: 'Operación abierta',
        description: `${tradeData.type} ${tradeData.lot_size} lotes de ${tradeData.symbol}${extras.length ? ` · ${extras.join(' · ')}` : ''}`,
      });

      await handleRefresh();
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'No se pudo abrir la operación', variant: 'destructive' });
    }
  }, [user, selectedAsset, handleRefresh, toast]);

  const handleCloseTrade = useCallback(async (trade) => {
    if (!isMarketOpen) {
      toast({ title: 'Mercado Cerrado', variant: 'destructive' }); return;
    }
    const priceData = prices[trade.symbol];
    if (!priceData) {
      toast({ title: 'Error de Precio', variant: 'destructive' }); return;
    }
    const closePrice = trade.type === 'BUY' ? priceData.bid : priceData.ask;
    try {
      const { data, error } = await supabase.rpc('close_trade_final', {
        p_trade_id: trade.id,
        p_close_price: closePrice,
        p_close_time: new Date().toISOString(),
      });
      if (error) throw error;
      const finalPl = Number(data.final_pl) || 0;
      toast({
        title: 'Operación Cerrada',
        description: `P/L Final: $${finalPl.toFixed(2)}`,
        className: finalPl >= 0 ? 'border-green-500' : 'border-red-500',
      });
      await handleRefresh();
    } catch (err) {
      toast({ title: 'Error al cerrar', description: err.message, variant: 'destructive' });
    }
  }, [isMarketOpen, prices, handleRefresh, toast]);

  useEffect(() => {
    if (user) {
      handleRefresh();
      const ch = supabase.channel('analysis_updates')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` },
          () => handleRefresh()
        ).subscribe();
      return () => supabase.removeChannel(ch);
    }
  }, [user, handleRefresh]);

  if (authLoading || assetsLoading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <Loader2 className="animate-spin text-white" />
    </div>
  );

  const accountBalance = (profile?.balance ?? user?.balance ?? 0) + (profile?.bonus || 0);

  return (
    <div className="h-screen pt-12 bg-[#0a0e1a] text-white flex flex-col overflow-hidden">

      {/* ── MOBILE ── */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden min-h-0">

        <div className="shrink-0 bg-[#0f1629] border-b border-slate-800/60 overflow-y-auto max-h-[42vh]">
          <div className="p-3">
            <TradingPanel
              assets={assets}
              selectedSymbol={selectedAsset?.symbol}
              setSelectedSymbol={(symbol) => {
                const asset = assets.find(a => a.symbol === symbol);
                if (asset) setSelectedAsset(asset);
              }}
              onOpenTrade={handleOpenTrade}
              accountBalance={accountBalance}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-[#0a0e1a]">
          <TradingChart symbol={selectedAsset?.symbol} />
        </div>

        <div className="shrink-0 border-t border-slate-800/60 bg-[#0f1629]">
          <button
            className="w-full flex items-center justify-between px-4 py-2.5"
            onClick={() => setTableOpen(p => !p)}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Mis Operaciones
              {openTrades.length > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-xs px-1.5 py-0.5 rounded-full font-mono">
                  {openTrades.length}
                </span>
              )}
            </span>
            {tableOpen
              ? <ChevronDown className="w-4 h-4 text-gray-500" />
              : <ChevronUp className="w-4 h-4 text-gray-500" />
            }
          </button>
          {tableOpen && (
            <div className="max-h-[50vh] overflow-y-auto border-t border-slate-800/60">
              <TradesList
                title=""
                trades={openTrades}
                allTrades={trades}
                loading={dataLoading}
                hasPlan={hasPlan}
                isMarketOpen={isMarketOpen}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden min-h-0">

        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Panel izquierdo */}
          <div className="w-[300px] lg:w-[320px] xl:w-[340px] shrink-0 flex flex-col bg-[#0f1629] border-r border-slate-800/60">
            <div className="px-4 pt-4 pb-2 border-b border-slate-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Panel de Trading
                </span>
              </div>
              {selectedAsset && (
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white font-mono">{selectedAsset.symbol}</span>
                  {prices[selectedAsset.symbol]?.bid && (
                    <span className="text-sm text-gray-400 font-mono">
                      {prices[selectedAsset.symbol].bid.toFixed(selectedAsset.precision || 5)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 lg:p-4">
              <TradingPanel
                assets={assets}
                selectedSymbol={selectedAsset?.symbol}
                setSelectedSymbol={(symbol) => {
                  const asset = assets.find(a => a.symbol === symbol);
                  if (asset) setSelectedAsset(asset);
                }}
                onOpenTrade={handleOpenTrade}
                accountBalance={accountBalance}
              />
            </div>
          </div>

          {/* Gráfica */}
          <div className="flex-1 min-w-0 flex flex-col bg-[#0a0e1a]">
            <div className="shrink-0 px-4 py-2 border-b border-slate-800/60 bg-[#0d1220] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white font-mono">
                  {selectedAsset?.symbol || '—'}
                </span>
                {prices[selectedAsset?.symbol]?.bid && prices[selectedAsset?.symbol]?.ask && (
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-red-400">
                      B: {prices[selectedAsset.symbol].bid.toFixed(selectedAsset?.precision || 5)}
                    </span>
                    <span className="text-green-400">
                      A: {prices[selectedAsset.symbol].ask.toFixed(selectedAsset?.precision || 5)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', isMarketOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
                <span className={cn('text-[10px] font-semibold uppercase tracking-wide',
                  isMarketOpen ? 'text-green-400' : 'text-red-400')}>
                  {isMarketOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TradingChart symbol={selectedAsset?.symbol} />
            </div>
          </div>
        </div>

        {/* Tabla abajo */}
        <div className="h-[260px] shrink-0 border-t border-slate-800/60 bg-[#0f1629] overflow-y-auto">
          <TradesList
            title="Mis Operaciones"
            trades={openTrades}
            allTrades={trades}
            loading={dataLoading}
            hasPlan={hasPlan}
            isMarketOpen={isMarketOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;