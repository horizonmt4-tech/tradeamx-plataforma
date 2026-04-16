import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Users, Send, Search, RefreshCw, Loader2,
  Clock, CheckCircle2, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STEP_LABELS = {
  0: { label: 'Sin contactar',  color: 'bg-gray-500/20 text-gray-400',    dot: 'bg-gray-500' },
  1: { label: 'Email 1 enviado', color: 'bg-blue-500/20 text-blue-400',   dot: 'bg-blue-500' },
  2: { label: 'Email 2 enviado', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-500' },
  3: { label: 'Secuencia completa', color: 'bg-green-500/20 text-green-400', dot: 'bg-green-500' },
};

const DISCOUNT_BY_STEP = { 1: '10%', 2: '15%', 3: '20%' };

const RecoveryEmailPanel = () => {
  const { toast } = useToast();
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [sendingAll, setSendingAll]     = useState(false);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(new Set());
  const [filterStep, setFilterStep]     = useState('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, recovery_step, last_recovery_email')
      .eq('has_purchased_plan', false)
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else setUsers(data || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q));
    }
    if (filterStep !== 'all') {
      list = list.filter(u => String(u.recovery_step || 0) === filterStep);
    }
    return list;
  }, [users, search, filterStep]);

  const stats = useMemo(() => ({
    total:    users.length,
    step0:    users.filter(u => (u.recovery_step || 0) === 0).length,
    step1:    users.filter(u => u.recovery_step === 1).length,
    step2:    users.filter(u => u.recovery_step === 2).length,
    step3:    users.filter(u => u.recovery_step === 3).length,
    eligible: users.filter(u => (u.recovery_step || 0) < 3).length,
  }), [users]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(u => u.id)));
  };

  // Enviar a seleccionados
  const handleSendSelected = async () => {
    if (selected.size === 0) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-recovery-email', {
        body: {
          mode:     'manual',
          user_ids: Array.from(selected),
        },
      });
      if (error) throw new Error(error.message);
      toast({
        title: `✅ ${data.sent} emails enviados`,
        description: `${data.errors > 0 ? `${data.errors} fallaron.` : 'Todos enviados correctamente.'}`,
        className: 'bg-green-600 text-white',
      });
      setSelected(new Set());
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  // Enviar a todos los elegibles automáticamente
  const handleSendAll = async () => {
    setSendingAll(true);
    try {
      const eligible = users.filter(u => (u.recovery_step || 0) < 3);
      const { data, error } = await supabase.functions.invoke('send-recovery-email', {
        body: {
          mode:     'manual',
          user_ids: eligible.map(u => u.id),
        },
      });
      if (error) throw new Error(error.message);
      toast({
        title: `✅ Campaña enviada — ${data.sent} emails`,
        description: `A ${eligible.length} usuarios elegibles. ${data.errors} fallaron.`,
        className: 'bg-green-600 text-white',
      });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSendingAll(false);
    }
  };

  const getNextStep = (user) => Math.min((user.recovery_step || 0) + 1, 3);

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Sin plan',        value: stats.total,    color: 'text-white',       bg: 'bg-slate-700/50' },
          { label: 'Sin contactar',   value: stats.step0,    color: 'text-gray-400',    bg: 'bg-gray-500/10' },
          { label: 'Email 1 enviado', value: stats.step1,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Email 2 enviado', value: stats.step2,    color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
          { label: 'Completados',     value: stats.step3,    color: 'text-green-400',   bg: 'bg-green-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-3 border border-slate-700/50 text-center`}>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <Card className="glass-effect border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Mail className="w-5 h-5 text-cyan-400" /> Campaña de Recuperación
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm mt-0.5">
                Secuencia automática: 24h → 3 días → 7 días con descuentos 10% → 15% → 20%
              </CardDescription>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}
                className="border-gray-600 text-gray-300 h-9">
                <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              {selected.size > 0 && (
                <Button size="sm" onClick={handleSendSelected} disabled={sending}
                  className="bg-cyan-600 hover:bg-cyan-700 h-9">
                  {sending
                    ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    : <Send className="w-4 h-4 mr-1.5" />
                  }
                  Enviar a {selected.size} seleccionados
                </Button>
              )}
              <Button size="sm" onClick={handleSendAll} disabled={sendingAll || stats.eligible === 0}
                className="bg-green-600 hover:bg-green-700 h-9">
                {sendingAll
                  ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  : <Send className="w-4 h-4 mr-1.5" />
                }
                Enviar a todos ({stats.eligible})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar por email..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-800 border-gray-600 text-white h-9" />
            </div>
            <div className="flex gap-1.5">
              {[
                { key: 'all', label: 'Todos' },
                { key: '0',   label: 'Sin contactar' },
                { key: '1',   label: 'Email 1' },
                { key: '2',   label: 'Email 2' },
                { key: '3',   label: 'Completados' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilterStep(f.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                    filterStep === f.key
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800 text-gray-400 border border-slate-700 hover:text-white'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3 border-b border-gray-700">
              <input type="checkbox"
                checked={filtered.length > 0 && selected.size === filtered.length}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-cyan-500" />
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide flex-1">
                Usuario ({filtered.length})
              </span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide w-32 hidden sm:block">Estado</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide w-36 hidden md:block">Último contacto</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide w-28 text-right hidden sm:block">Próximo email</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filtered.map(user => {
                  const step      = user.recovery_step || 0;
                  const stepInfo  = STEP_LABELS[step];
                  const nextStep  = getNextStep(user);
                  const isComplete = step >= 3;
                  const isChecked  = selected.has(user.id);

                  return (
                    <div key={user.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors ${isChecked ? 'bg-cyan-500/5' : ''}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(user.id)}
                        disabled={isComplete}
                        className="w-4 h-4 rounded accent-cyan-500 disabled:opacity-40" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.full_name || 'Sin nombre'} · Registrado {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                      <div className="w-32 hidden sm:block">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${stepInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stepInfo.dot}`} />
                          {stepInfo.label}
                        </span>
                      </div>
                      <div className="w-36 hidden md:block text-xs text-gray-500">
                        {user.last_recovery_email
                          ? formatDistanceToNow(new Date(user.last_recovery_email), { addSuffix: true, locale: es })
                          : <span className="text-gray-600">—</span>
                        }
                      </div>
                      <div className="w-28 text-right hidden sm:block">
                        {isComplete ? (
                          <span className="text-xs text-gray-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completado
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-400 flex items-center justify-end gap-1">
                            Email {nextStep}
                            <span className="bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">
                              -{DISCOUNT_BY_STEP[nextStep]}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info de secuencia */}
          <div className="mt-4 bg-slate-800/40 rounded-lg border border-slate-700/50 p-3">
            <p className="text-xs text-gray-400 font-semibold mb-2">Secuencia automática:</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {[
                { step: 1, delay: '24 horas',  discount: '10% OFF', code: 'VUELVE10' },
                { step: 2, delay: '3 días',     discount: '15% OFF', code: 'TRADING15' },
                { step: 3, delay: '7 días',     discount: '20% OFF', code: 'ULTIMO20' },
              ].map((s, i) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-lg">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-300">{s.delay}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-amber-400 font-bold">{s.discount}</span>
                    <span className="text-gray-500 font-mono">({s.code})</span>
                  </div>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-gray-600" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoveryEmailPanel;