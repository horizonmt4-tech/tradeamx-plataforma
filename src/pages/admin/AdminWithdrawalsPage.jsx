import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Check, X, Search, Filter, DollarSign, ArrowLeft, Clock, Download, Mail } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
    pending:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };
  const labels = { approved: 'Aprobado', rejected: 'Rechazado', pending: 'Pendiente' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-max ${map[status] || map.pending}`}>
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {labels[status] || status}
    </span>
  );
};

const AdminWithdrawalsPage = () => {
  const { toast }     = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected]       = useState(null);
  const [actionType, setActionType]   = useState(null);
  const [adminNotes, setAdminNotes]   = useState('');
  const [processing, setProcessing]   = useState(false);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('withdrawals')
        .select('*, profiles:user_id(email, full_name, balance)')
        .order('created_at', { ascending: false });
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchWithdrawals();
    const ch = supabase.channel('admin-withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchWithdrawals)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchWithdrawals]);

  // ✅ Enviar notificación por email — busca email directamente si no está en el objeto
  const sendWithdrawalEmail = async (withdrawal, status, notes) => {
    try {
      let userEmail = withdrawal.profiles?.email;
      let userName  = withdrawal.profiles?.full_name;

      // Si el email no está disponible en el objeto, buscarlo en profiles
      if (!userEmail && withdrawal.user_id) {
        const { data } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', withdrawal.user_id)
          .single();
        userEmail = data?.email;
        userName  = data?.full_name;
      }

      if (!userEmail) {
        console.warn('[AdminWithdrawalsPage] No email found for withdrawal:', withdrawal.id);
        return;
      }

      await supabase.functions.invoke('send-withdrawal-notification', {
        body: {
          user_email:     userEmail,
          user_name:      userName || undefined,
          amount:         Number(withdrawal.amount),
          payment_method: withdrawal.payment_method || 'N/A',
          status,
          admin_notes:    notes || undefined,
        },
      });
    } catch (err) {
      console.warn('[AdminWithdrawalsPage] Email notification failed:', err);
    }
  };

  const handleProcess = async () => {
    if (!selected || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === 'approve') {
        const { data: profile, error: pErr } = await supabase
          .from('profiles').select('balance').eq('id', selected.user_id).single();
        if (pErr) throw new Error(pErr.message);
        const { error: bErr } = await supabase.from('profiles')
          .update({ balance: Number(profile.balance) - Number(selected.amount) })
          .eq('id', selected.user_id);
        if (bErr) throw new Error(bErr.message);
      }

      const { error } = await supabase.from('withdrawals').update({
        status:       actionType === 'approve' ? 'approved' : 'rejected',
        admin_notes:  adminNotes,
        processed_at: new Date().toISOString(),
      }).eq('id', selected.id);
      if (error) throw new Error(error.message);

      // ✅ Enviar email de notificación
      await sendWithdrawalEmail(
        selected,
        actionType === 'approve' ? 'approved' : 'rejected',
        adminNotes
      );

      toast({
        title: actionType === 'approve' ? '✅ Retiro aprobado' : '❌ Retiro rechazado',
        description: `Email enviado a ${selected.profiles?.email}`,
        className: actionType === 'approve' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      });
      setSelected(null); setActionType(null); setAdminNotes('');
      fetchWithdrawals();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return withdrawals;
    const q = searchTerm.toLowerCase();
    return withdrawals.filter(w =>
      w.profiles?.email?.toLowerCase().includes(q) ||
      w.profiles?.full_name?.toLowerCase().includes(q)
    );
  }, [withdrawals, searchTerm]);

  const pendingCount  = useMemo(() => withdrawals.filter(w => w.status === 'pending').length, [withdrawals]);
  const pendingAmount = useMemo(() => withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + Number(w.amount), 0), [withdrawals]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3">
              <Link to="/admin">
                <Button variant="outline" size="icon" className="border-gray-600 hover:bg-slate-800 h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-400" /> Solicitudes de Retiro
                </h1>
                <p className="text-sm text-gray-400">
                  {pendingCount} pendientes · ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} en espera
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Buscar usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-800 border-gray-600 text-white h-9 w-52" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-slate-800 border-gray-600 text-white h-9">
                  <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-gray-700 text-white">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Card className="glass-effect border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-800/50 border-gray-700">
                      <TableHead className="text-gray-400 py-4">Usuario</TableHead>
                      <TableHead className="text-gray-400 py-4">Monto</TableHead>
                      <TableHead className="text-gray-400 py-4">Método</TableHead>
                      <TableHead className="text-gray-400 py-4">Estado</TableHead>
                      <TableHead className="text-gray-400 py-4">Fecha</TableHead>
                      <TableHead className="text-gray-400 py-4 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                          <p className="text-gray-400">Cargando retiros...</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400">No se encontraron solicitudes</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map(w => (
                      <TableRow key={w.id} className="border-gray-800 hover:bg-slate-800/50 transition-colors">
                        <TableCell>
                          <p className="text-white font-medium text-sm">{w.profiles?.email || 'Desconocido'}</p>
                          <p className="text-gray-500 text-xs">{w.profiles?.full_name || '—'}</p>
                        </TableCell>
                        <TableCell className="text-white font-mono font-bold">${Number(w.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="text-gray-300 bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                            {w.payment_method || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell><StatusBadge status={w.status} /></TableCell>
                        <TableCell>
                          <p className="text-gray-300 text-sm">{w.created_at ? format(new Date(w.created_at), 'dd MMM yyyy', { locale: es }) : '—'}</p>
                          <p className="text-gray-500 text-xs">{w.created_at ? formatDistanceToNow(new Date(w.created_at), { addSuffix: true, locale: es }) : ''}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          {w.status === 'pending' ? (
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8"
                                onClick={() => { setSelected(w); setActionType('approve'); }}>
                                <Check className="w-3.5 h-3.5 mr-1" /> Aprobar
                              </Button>
                              <Button size="sm" variant="destructive" className="h-8"
                                onClick={() => { setSelected(w); setActionType('reject'); }}>
                                <X className="w-3.5 h-3.5 mr-1" /> Rechazar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs italic">Procesado</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Confirm dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open && !processing) { setSelected(null); setActionType(null); setAdminNotes(''); } }}>
        <DialogContent className="bg-slate-900 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center text-xl ${actionType === 'approve' ? 'text-green-400' : 'text-red-400'}`}>
              {actionType === 'approve' ? <><Check className="mr-2 h-5 w-5" />Aprobar Retiro</> : <><X className="mr-2 h-5 w-5" />Rechazar Retiro</>}
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Se enviará un email de notificación al usuario automáticamente.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500 text-xs uppercase block mb-1">Usuario</span><p className="text-white font-medium truncate">{selected.profiles?.email}</p></div>
                <div><span className="text-gray-500 text-xs uppercase block mb-1">Monto</span><p className="text-green-400 font-bold text-lg">${Number(selected.amount).toFixed(2)}</p></div>
                <div><span className="text-gray-500 text-xs uppercase block mb-1">Método</span><p className="text-white capitalize">{selected.payment_method}</p></div>
                <div><span className="text-gray-500 text-xs uppercase block mb-1">Balance actual</span><p className="text-white font-mono">${Number(selected.profiles?.balance || 0).toFixed(2)}</p></div>
                {selected.payment_details && (
                  <div className="col-span-2">
                    <span className="text-gray-500 text-xs uppercase block mb-1">Detalles de pago</span>
                    <pre className="text-gray-300 text-xs bg-slate-900 p-2 rounded border border-slate-700 whitespace-pre-wrap font-mono">
                      {typeof selected.payment_details === 'object' ? JSON.stringify(selected.payment_details, null, 2) : selected.payment_details}
                    </pre>
                  </div>
                )}
              </div>
              {actionType === 'reject' && (
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Motivo del rechazo <span className="text-red-400">*</span></Label>
                  <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Explica por qué se rechaza esta solicitud..."
                    className="w-full min-h-[90px] bg-slate-800 border border-gray-600 rounded-md p-3 text-white text-sm resize-none focus:border-red-500 outline-none" />
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Este motivo se incluirá en el email al usuario.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => { setSelected(null); setActionType(null); setAdminNotes(''); }} disabled={processing} className="border-gray-600 text-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleProcess} disabled={processing || (actionType === 'reject' && !adminNotes.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              {processing
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                : actionType === 'approve' ? 'Confirmar y Notificar' : 'Rechazar y Notificar'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawalsPage;