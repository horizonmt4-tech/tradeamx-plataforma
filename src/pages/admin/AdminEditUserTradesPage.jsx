import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAssets } from '@/contexts/AssetContext';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRealTimePL } from '@/hooks/useRealTimePL';
import { calculateProfitLoss } from '@/lib/tradeUtils';

const EditTradeDialog = ({ trade, onClose, onSave, currentPL }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trade) {
      setFormData({
        lot_size: trade.lot_size || 0,
        close_price: trade.close_price || 0,
        profit_loss: trade.profit_loss || 0,
      });
    }
  }, [trade]);

  if (!trade) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const parsedData = {
        lot_size: parseFloat(formData.lot_size) || 0,
        close_price: parseFloat(formData.close_price) || 0,
        profit_loss: parseFloat(formData.profit_loss) || 0,
      };
      await onSave(trade, parsedData);
    } catch (error) {
      console.error('Error in EditTradeDialog handleSave:', error);
    } finally {
      setLoading(false);
    }
  };

  const isClosed = trade.status === 'CLOSED';
  const parsedPL = parseFloat(formData.profit_loss) || 0;
  const numCurrentPL = Number(currentPL) || 0;
  const plDifference = parsedPL - numCurrentPL;
  const showAdjustmentWarning = !isClosed && Math.abs(plDifference) > 0.01;

  return (
    <Dialog open={!!trade} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Operación #{trade.id?.substring(0, 8)}</DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            {trade.symbol} {trade.type} | Estado: {trade.status}
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Info Card */}
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Margen:</span>
                <span className="ml-2 text-white font-mono">${(Number(trade.margin) || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Usuario:</span>
                <span className="ml-2 text-white font-mono">{trade.user_id?.substring(0, 8)}...</span>
              </div>
              <div>
                <span className="text-gray-400">Precio Apertura:</span>
                <span className="ml-2 text-white font-mono">${(Number(trade.open_price) || 0).toFixed(5)}</span>
              </div>
              <div>
                <span className="text-gray-400">P/L Actual:</span>
                <span className={`ml-2 font-mono font-bold ${numCurrentPL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  ${numCurrentPL.toFixed(2)}
                </span>
              </div>
            </div>

            {!isClosed && showAdjustmentWarning && (
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs space-y-1">
                <div className="flex items-center gap-2 text-blue-300">
                  <RefreshCw className="w-3 h-3" />
                  <span>Se aplicará un ajuste de P/L usando la función del sistema</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  {plDifference >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={plDifference >= 0 ? 'text-green-400' : 'text-red-400'}>
                    Ajuste proyectado: {plDifference >= 0 ? '+' : ''}${(Number(plDifference) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {!isClosed && !showAdjustmentWarning && (
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-gray-400">
                El P/L continuará calculándose en tiempo real con los precios actuales del mercado.
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lot_size" className="text-right">Lote</Label>
              <Input
                id="lot_size"
                type="number"
                step="0.01"
                value={formData.lot_size}
                onChange={handleChange}
                disabled={isClosed}
                className="col-span-3 bg-slate-800 border-gray-600 disabled:opacity-70"
              />
            </div>

            {isClosed && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="close_price" className="text-right">Precio Cierre</Label>
                <Input
                  id="close_price"
                  type="number"
                  step="0.00001"
                  value={formData.close_price}
                  onChange={handleChange}
                  className="col-span-3 bg-slate-800 border-gray-600"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profit_loss" className="text-right">P/L ($)</Label>
              <div className="col-span-3 relative">
                <Input
                  id="profit_loss"
                  type="number"
                  step="0.01"
                  value={formData.profit_loss}
                  onChange={handleChange}
                  className="bg-slate-800 border-gray-600 w-full"
                  placeholder={`Actual: ${numCurrentPL.toFixed(2)}`}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ✅ FIX: Destructurar correctamente el hook useRealTimePL
const FloatingPLCell = ({ trade }) => {
  const { realTimePL: displayProfitLoss } = useRealTimePL(trade);

  const safePL = Number(displayProfitLoss) || 0;

  const plColor = displayProfitLoss === null
    ? 'text-gray-400'
    : safePL >= 0
      ? 'text-green-400'
      : 'text-red-400';

  return (
    <TableCell className={`${plColor} font-mono font-semibold`}>
      {displayProfitLoss !== null
        ? `$${safePL.toFixed(2)}`
        : <Loader2 className="w-4 h-4 animate-spin" />
      }
    </TableCell>
  );
};

const AdminEditUserTradesPage = () => {
  const { userId } = useParams();
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState(null);
  const [currentPLForEdit, setCurrentPLForEdit] = useState(null);
  const { assets, prices } = useAssets();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userPromise = supabase.from('profiles').select('*').eq('id', userId).single();
      const tradesPromise = supabase.from('trades').select('*').eq('user_id', userId).order('open_time', { ascending: false });

      const [{ data: userData, error: userError }, { data: tradesData, error: tradesError }] = await Promise.all([userPromise, tradesPromise]);

      if (userError) throw userError;
      setUser(userData);

      if (tradesError) throw tradesError;
      setTrades(tradesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const channel = supabase.channel(`admin-edit-trades-for-user-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${userId}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchData]);

  const handleEditClick = (trade) => {
    try {
      if (trade.status === 'OPEN') {
        const asset = assets?.find(a => a.symbol === trade.symbol);
        const priceData = prices?.[trade.symbol];

        if (asset && priceData) {
          const currentExitPrice = trade.type === 'BUY' ? priceData.bid : priceData.ask;
          const naturalPL = calculateProfitLoss(
            trade.type,
            Number(trade.open_price),
            currentExitPrice,
            Number(trade.lot_size),
            asset.contract_size
          );
          const adjustment = Number(trade.pl_adjustment) || 0;
          setCurrentPLForEdit(naturalPL + adjustment);
        } else {
          setCurrentPLForEdit(Number(trade.profit_loss) || 0);
        }
      } else {
        setCurrentPLForEdit(Number(trade.profit_loss) || 0);
      }

      setEditingTrade(trade);
    } catch (err) {
      console.error("Error opening edit dialog:", err);
      toast({ title: "Error", description: "No se pudo preparar la edición de la operación.", variant: "destructive" });
    }
  };

  const handleSaveTrade = async (trade, formData) => {
    try {
      if (!adminUser?.isAdmin && !adminUser?.is_super_admin) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador para realizar esta acción.",
          variant: "destructive"
        });
        return;
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!trade?.id || !uuidRegex.test(trade.id)) {
        throw new Error("ID de operación no válido");
      }

      const finalLotSize = Number(formData.lot_size);
      const manualPL = Number(formData.profit_loss);

      if (isNaN(manualPL)) {
        throw new Error("El valor de P/L ingresado no es un número válido.");
      }

      if (trade.status === 'OPEN') {
        if (isNaN(finalLotSize) || finalLotSize <= 0) {
          throw new Error("El lote ingresado no es válido.");
        }

        const { data, error } = await supabase.rpc('admin_update_open_trade_pl', {
          p_trade_id: trade.id,
          p_new_profit_loss: manualPL
        });

        if (error) throw new Error(error.message || "Error al actualizar la operación abierta.");

        // Actualizar lote si cambió
        if (finalLotSize !== Number(trade.lot_size)) {
          const { error: lotError } = await supabase
            .from('trades')
            .update({ lot_size: finalLotSize })
            .eq('id', trade.id);
          if (lotError) console.error('Failed to update lot size:', lotError);
        }

      } else {
        const { data, error } = await supabase.rpc('admin_update_closed_trade', {
          p_trade_id: trade.id,
          p_new_profit_loss: manualPL,
          p_new_close_price: Number(formData.close_price) || trade.close_price,
        });

        if (error) throw new Error(error.message || "Error al actualizar operación cerrada.");
      }

      toast({
        title: "✅ Éxito",
        description: "Operación actualizada correctamente.",
        className: "bg-green-600 text-white"
      });

      setEditingTrade(null);
      setCurrentPLForEdit(null);
      await fetchData();

    } catch (error) {
      console.error('P/L update failed:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive"
      });
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white">
        <AdminHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="outline" size="icon" className="border-gray-600 hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Editar Operaciones</h1>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            <Card className="glass-effect border-gray-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle>Todas las Operaciones</CardTitle>
                <CardDescription>
                  Haz clic en ✏️ para editar. El P/L se actualiza en tiempo real.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-slate-800/50 border-b-gray-700">
                        <TableHead className="text-white">Símbolo</TableHead>
                        <TableHead className="text-white">Tipo</TableHead>
                        <TableHead className="text-white">Estado</TableHead>
                        <TableHead className="text-white">Lote</TableHead>
                        <TableHead className="text-white">P. Apertura</TableHead>
                        <TableHead className="text-white">P. Cierre</TableHead>
                        <TableHead className="text-white">Ajuste P/L</TableHead>
                        <TableHead className="text-white">P/L (Tiempo Real)</TableHead>
                        <TableHead className="text-white text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-500" />
                          </TableCell>
                        </TableRow>
                      ) : trades.length > 0 ? (
                        trades.map((trade) => (
                          <TableRow
                            key={trade.id}
                            className="border-gray-800 hover:bg-slate-800/50"
                          >
                            <TableCell className="font-semibold">{trade.symbol}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.type === 'BUY'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                                }`}>
                                {trade.type}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${trade.status === 'OPEN'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-gray-500/20 text-gray-300'
                                }`}>
                                {trade.status}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono">{trade.lot_size}</TableCell>
                            <TableCell className="font-mono text-sm">
                              ${(Number(trade.open_price) || 0).toFixed(5)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {trade.close_price ? `$${(Number(trade.close_price) || 0).toFixed(5)}` : '-'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {trade.pl_adjustment != null && trade.pl_adjustment !== 0 ? (
                                <span className={trade.pl_adjustment >= 0 ? 'text-blue-400' : 'text-orange-400'}>
                                  {trade.pl_adjustment >= 0 ? '+' : ''}${(Number(trade.pl_adjustment) || 0).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </TableCell>
                            <FloatingPLCell trade={trade} />
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(trade)}
                                className="hover:bg-slate-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-gray-400 py-8">
                            No hay operaciones para este usuario.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {editingTrade && (
        <EditTradeDialog
          trade={editingTrade}
          currentPL={currentPLForEdit}
          onClose={() => {
            setEditingTrade(null);
            setCurrentPLForEdit(null);
          }}
          onSave={handleSaveTrade}
        />
      )}
    </>
  );
};

export default AdminEditUserTradesPage;