import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Edit, User, Mail, BarChart, CircleDollarSign, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminUserTradesPage = () => {
  const { userId }  = useParams();
  const { toast }   = useToast();
  const [user, setUser]             = useState(null);
  const [trades, setTrades]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingTrade, setEditingTrade] = useState(null);

  const fetchUserData = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) toast({ title: 'Error', description: 'No se pudo cargar el usuario.', variant: 'destructive' });
    else setUser(data);
  }, [userId, toast]);

  const fetchTrades = useCallback(async () => {
    const { data, error } = await supabase
      .from('trades').select('*').eq('user_id', userId).order('open_time', { ascending: false });
    if (error) toast({ title: 'Error', description: 'No se pudieron cargar las operaciones.', variant: 'destructive' });
    else setTrades(data || []);
  }, [userId, toast]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUserData(), fetchTrades()]).finally(() => setLoading(false));
  }, [fetchUserData, fetchTrades]);

  useEffect(() => {
    const t = supabase.channel(`trades_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${userId}` }, fetchTrades)
      .subscribe();
    const p = supabase.channel(`profiles_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, fetchUserData)
      .subscribe();
    return () => { supabase.removeChannel(t); supabase.removeChannel(p); };
  }, [userId, fetchTrades, fetchUserData]);

  const handleEditClick = (trade) => {
    // ✅ FIX: El valor que mostramos para editar es el NETO real (profit_loss + pl_adjustment)
    // Para trades OPEN: mostramos el neto actual
    // Para trades CLOSED: si pl_adjustment ya es 0 (ya fue corregido), mostramos profit_loss directo
    const currentNet =
      trade.status === 'OPEN'
        ? (Number(trade.profit_loss) || 0) + (Number(trade.pl_adjustment) || 0)
        : Number(trade.profit_loss) || 0;

    setEditingTrade({
      id: trade.id,
      status: trade.status,
      symbol: trade.symbol,
      type: trade.type,
      profit_loss: trade.profit_loss,
      pl_adjustment: trade.pl_adjustment,
      newProfitLoss: String(currentNet),
    });
  };

  const handleSave = async () => {
    if (!editingTrade) return;
    const newPL = parseFloat(editingTrade.newProfitLoss);
    if (isNaN(newPL)) {
      toast({ title: 'Error', description: 'Introduce un número válido.', variant: 'destructive' });
      return;
    }
    try {
      if (editingTrade.status === 'OPEN') {
        const { error } = await supabase.rpc('admin_update_open_trade_pl', {
          p_trade_id: editingTrade.id,
          p_new_profit_loss: newPL,
        });
        if (error) throw error;
      } else {
        // ✅ La RPC ahora resetea pl_adjustment a 0 internamente
        const { error } = await supabase.rpc('admin_update_closed_trade', {
          p_trade_id: editingTrade.id,
          p_new_profit_loss: newPL,
          p_new_close_price: null,
        });
        if (error) throw error;
      }
      toast({
        title: '✅ Actualizado',
        description: `P/L actualizado a $${newPL.toFixed(2)}`,
        className: 'bg-green-600 text-white',
      });
      setEditingTrade(null);
      await fetchTrades();
    } catch (err) {
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
    }
  };

  const openTrades   = useMemo(() => trades.filter(t => t.status === 'OPEN'),   [trades]);
  const closedTrades = useMemo(() => trades.filter(t => t.status === 'CLOSED'), [trades]);

  // ✅ FIX: Para CLOSED solo usamos profit_loss (pl_adjustment ya es 0 tras la corrección)
  // Para OPEN sumamos ambos porque el ajuste aún está activo
  const totalPL = useMemo(() =>
    closedTrades.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0),
  [closedTrades]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <Loader2 className="h-12 w-12 animate-spin text-green-400" />
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Nav */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link to="/admin">
                  <Button variant="outline" size="icon" className="border-gray-600 hover:bg-slate-800 h-9 w-9">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-white">Operaciones del Usuario</h1>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
              <Link to={`/admin/users/${userId}/edit-trades`}>
                <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-400/10 h-9">
                  <Edit className="w-4 h-4 mr-2" /> Editar P/L
                </Button>
              </Link>
            </div>

            {/* User info + stats */}
            {user && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Balance',     value: `$${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: CircleDollarSign, color: 'text-green-400' },
                  { label: 'P/L Total',   value: `${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}`,                              icon: totalPL >= 0 ? TrendingUp : TrendingDown, color: totalPL >= 0 ? 'text-green-400' : 'text-red-400' },
                  { label: 'Abiertas',    value: openTrades.length,                                                               icon: BarChart,         color: 'text-blue-400' },
                  { label: 'Tipo Cuenta', value: user.account_type || 'N/A',                                                      icon: ShieldCheck,      color: 'text-purple-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <Card key={label} className="bg-slate-800/60 border-slate-700/50">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className={`font-bold font-mono text-sm ${color}`}>{value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Trades table */}
            <Card className="glass-effect border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Historial Completo</CardTitle>
                <CardDescription className="text-gray-400">
                  {trades.length} operaciones · {openTrades.length} abiertas · {closedTrades.length} cerradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-700">
                        <TableHead className="text-gray-400">Símbolo</TableHead>
                        <TableHead className="text-gray-400">Tipo</TableHead>
                        <TableHead className="text-gray-400">Estado</TableHead>
                        <TableHead className="text-gray-400">Lotes</TableHead>
                        <TableHead className="text-gray-400">SL</TableHead>
                        <TableHead className="text-gray-400">TP</TableHead>
                        <TableHead className="text-gray-400">Ajuste</TableHead>
                        <TableHead className="text-right text-gray-400">P/L</TableHead>
                        <TableHead className="text-right text-gray-400">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.length > 0 ? trades.map(trade => {
                        // ✅ FIX: OPEN = profit_loss + pl_adjustment (ajuste activo)
                        //         CLOSED = solo profit_loss (pl_adjustment ya es 0)
                        const pl = trade.status === 'OPEN'
                          ? (Number(trade.profit_loss) || 0) + (Number(trade.pl_adjustment) || 0)
                          : (Number(trade.profit_loss) || 0);

                        return (
                          <TableRow key={trade.id} className="border-gray-800 hover:bg-slate-800/50">
                            <TableCell className="font-mono font-bold text-white">{trade.symbol}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                {trade.type}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${trade.status === 'OPEN' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                {trade.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-gray-300 text-xs">{trade.lot_size}</TableCell>
                            <TableCell className="font-mono text-xs text-red-400/70">
                              {trade.stop_loss ? Number(trade.stop_loss).toFixed(5) : '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-green-400/70">
                              {trade.take_profit ? Number(trade.take_profit).toFixed(5) : '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {/* ✅ Para CLOSED el ajuste ya es 0, solo mostramos en OPEN */}
                              {trade.status === 'OPEN' && Number(trade.pl_adjustment) !== 0
                                ? <span className={Number(trade.pl_adjustment) >= 0 ? 'text-blue-400' : 'text-orange-400'}>
                                    {Number(trade.pl_adjustment) >= 0 ? '+' : ''}${Number(trade.pl_adjustment).toFixed(2)}
                                  </span>
                                : <span className="text-gray-600">—</span>}
                            </TableCell>
                            <TableCell className={`text-right font-mono font-bold text-sm ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.profit_loss !== null
                                ? `${pl >= 0 ? '+' : ''}$${Math.abs(pl).toFixed(2)}`
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-white hover:bg-slate-700"
                                onClick={() => handleEditClick(trade)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                            Sin operaciones registradas.
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

      {/* Edit P/L dialog */}
      {editingTrade && (
        <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
          <DialogContent className="bg-slate-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Editar P/L — {editingTrade.symbol} {editingTrade.type}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Estado:{' '}
                <span className={editingTrade.status === 'OPEN' ? 'text-blue-300' : 'text-gray-300'}>
                  {editingTrade.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              {/* ✅ Muestra el neto real actual (lo que ve el cliente) */}
              <div className="bg-slate-800 rounded-lg p-3 text-sm flex justify-between">
                <span className="text-gray-400">P/L neto actual (lo que ve el cliente):</span>
                <span className={`font-mono font-bold ${
                  (editingTrade.status === 'OPEN'
                    ? (Number(editingTrade.profit_loss) || 0) + (Number(editingTrade.pl_adjustment) || 0)
                    : Number(editingTrade.profit_loss) || 0) >= 0
                  ? 'text-green-400' : 'text-red-400'}`}>
                  ${(editingTrade.status === 'OPEN'
                    ? (Number(editingTrade.profit_loss) || 0) + (Number(editingTrade.pl_adjustment) || 0)
                    : Number(editingTrade.profit_loss) || 0
                  ).toFixed(2)}
                </span>
              </div>

              {/* Nota informativa */}
              <div className={`rounded-lg p-2.5 text-xs ${
                editingTrade.status === 'OPEN'
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
              }`}>
                {editingTrade.status === 'OPEN'
                  ? '⚡ Trade abierto: el nuevo valor se guardará como P/L objetivo. El ajuste se calculará automáticamente.'
                  : '🔒 Trade cerrado: se actualizará el P/L final, el ajuste quedará en $0.00 y el balance del cliente se corregirá.'}
              </div>

              {/* Input nuevo P/L */}
              <div>
                <label className="text-gray-300 text-sm mb-1.5 block">Nuevo P/L neto ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingTrade.newProfitLoss}
                  onChange={(e) => setEditingTrade({ ...editingTrade, newProfitLoss: e.target.value })}
                  className="bg-slate-800 border-gray-600 text-white"
                  placeholder="Ej: 30.00 o -200.50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTrade(null)} className="border-gray-600 text-gray-300">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminUserTradesPage;