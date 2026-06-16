import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Info, CheckCircle2 } from 'lucide-react';
import { useAssets } from '@/contexts/AssetContext';
import { calculateFinalPL, closeTrade } from '@/utils/tradeClosingUtils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const CloseTradeDialog = ({ trade, isOpen, onClose, onConfirm, isMarketOpen }) => {
  const { assets, prices } = useAssets();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plBreakdown, setPLBreakdown] = useState(null);
  // FIX: track calculation errors separately so we can show a message instead of $0.00
  const [calcError, setCalcError] = useState(false);

  const asset = useMemo(() => {
    return assets.find(a => a.symbol === trade?.symbol);
  }, [assets, trade]);

  useEffect(() => {
    // Reset state whenever inputs change
    setPLBreakdown(null);
    setCalcError(false);

    if (!trade || !asset || !prices[trade.symbol]) return;

    const priceData = prices[trade.symbol];
    const closePrice = trade.type === 'BUY' ? priceData.bid : priceData.ask;

    if (!closePrice) return;

    const breakdown = calculateFinalPL(trade, asset, closePrice);

    // FIX: if calculateFinalPL signals an error (null P/L), show error state
    // instead of silently displaying $0.00
    if (breakdown.error) {
      setCalcError(true);
      return;
    }

    setPLBreakdown({ ...breakdown, closePrice });
  }, [trade, asset, prices]);

  const handleConfirm = async () => {
    if (!plBreakdown) return;

    setLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(trade, plBreakdown.closePrice);
      } else {
        const res = await closeTrade(trade.id, plBreakdown.closePrice);
        if (!res.success) throw new Error(res.error);
      }

      toast({
        title: 'Operación Cerrada',
        description: `El trade ${trade.symbol} se ha cerrado exitosamente.`,
        className: 'bg-green-600 text-white border-none',
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error al cerrar',
        description: err.message || 'No se pudo cerrar la operación.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if trade is missing or dialog is closed
  if (!trade) return null;

  // Show loading state while prices are loading
  const isLoadingPrices = !plBreakdown && !calcError;
  const isProfitable = plBreakdown ? plBreakdown.finalPL >= 0 : true;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProfitable ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            Confirmar Cierre de Operación
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Revisa los detalles antes de cerrar esta operación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Trade Details — always visible */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Símbolo:</span>
              <span className="font-bold">{trade.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Tipo:</span>
              <span className={cn('font-semibold', trade.type === 'BUY' ? 'text-green-400' : 'text-red-400')}>
                {trade.type}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Lote:</span>
              <span className="font-mono">{trade.lot_size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Precio Apertura:</span>
              <span className="font-mono">${Number(trade.open_price).toFixed(5)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Precio Cierre:</span>
              {plBreakdown ? (
                <span className="font-mono">${plBreakdown.closePrice.toFixed(5)}</span>
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {/* FIX: show error card if calculation failed */}
          {calcError && (
            <Card className="bg-red-900/20 border-red-700/50">
              <CardContent className="p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs">
                  No se pudo calcular el P/L para este activo. Puede deberse a una desviación
                  de precio inusual. Revisa la consola para más detalles o contacta al administrador.
                </p>
              </CardContent>
            </Card>
          )}

          {/* P/L Breakdown — only when calculation succeeded */}
          {plBreakdown && (
            <div className="bg-slate-800 rounded-lg p-4 space-y-3 border border-slate-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-2">
                <Info className="w-4 h-4" />
                Detalle de Ganancia/Pérdida
              </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">P/L Calculado:</span>
                  <span className={cn(
                    'font-mono font-bold',
                    plBreakdown.calculatedPL >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    ${plBreakdown.calculatedPL.toFixed(2)}
                  </span>
                </div>

              <div className="flex justify-between items-center border-t border-slate-600 pt-3 mt-2">
                <span className="text-white font-bold text-lg">P/L FINAL:</span>
                <span className={cn(
                  'font-mono font-bold text-xl',
                  plBreakdown.finalPL >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {plBreakdown.finalPL >= 0 ? '+' : ''}${plBreakdown.finalPL.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Loading state for prices */}
          {isLoadingPrices && !calcError && (
            <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Obteniendo precio de cierre...
            </div>
          )}

          {/* Warnings */}
          <div className="space-y-2">
            {!isMarketOpen && (
              <Card className="bg-yellow-900/20 border-yellow-700/50">
                <CardContent className="p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-yellow-300 text-xs">
                    El mercado está cerrado. Se usará el último precio disponible para el cálculo final.
                  </p>
                </CardContent>
              </Card>
            )}

            {plBreakdown && Math.abs(plBreakdown.finalPL) < 0.01 && (
              <Card className="bg-orange-900/20 border-orange-700/50">
                <CardContent className="p-3 flex items-start gap-2">
                  <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-orange-300 text-xs">
                    La operación se cerrará con un beneficio/pérdida aproximado de $0.00.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-gray-600 hover:bg-slate-800 text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            // FIX: disable if loading, calc error, or breakdown not ready
            disabled={loading || !plBreakdown || calcError}
            className={cn(
              'text-white',
              isProfitable ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Cerrar Operación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseTradeDialog;