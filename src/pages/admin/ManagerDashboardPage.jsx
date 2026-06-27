// src/pages/admin/ManagerDashboardPage.jsx
// Panel exclusivo para manager@tradeamx.net
// Ve métricas globales y puede filtrar por oficina

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, DollarSign, Building2, RefreshCw,
  Loader2, ChevronRight, BarChart2, UserCheck, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
const fmtNum = (n) => Number(n || 0).toLocaleString('es-MX');

const OFFICE_COLORS = {
  TAURUXFX:   { bg: 'from-blue-600 to-blue-800',  badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  BURSATRADE: { bg: 'from-green-600 to-green-800', badge: 'bg-green-500/20 text-green-300 border-green-500/30' },
};

const ManagerDashboardPage = () => {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [loading, setLoading]         = useState(true);
  const [officeFilter, setOfficeFilter] = useState('all'); // 'all' | office_id
  const [offices, setOffices]         = useState([]);
  const [stats, setStats]             = useState({});
  const [recentUsers, setRecentUsers] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Oficinas
      const { data: ofs } = await supabase.from('offices').select('*').eq('active', true);
      setOffices(ofs || []);

      // Stats por oficina
      const officeStats = {};
      for (const of_ of (ofs || [])) {
        const [
          { count: total },
          { count: conPlan },
          { data: balanceData },
          { count: nuevos30d },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true })
            .eq('office_id', of_.id).eq('role', 'client'),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
            .eq('office_id', of_.id).eq('role', 'client').eq('has_purchased_plan', true),
          supabase.from('profiles').select('balance')
            .eq('office_id', of_.id).eq('role', 'client'),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
            .eq('office_id', of_.id).eq('role', 'client')
            .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
        ]);

        const balanceTotal = (balanceData || []).reduce((s, r) => s + Number(r.balance || 0), 0);
        officeStats[of_.id] = { total, conPlan, balanceTotal, nuevos30d };
      }
      setStats(officeStats);

      // Usuarios recientes (últimos 20, filtrado por oficina si aplica)
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, phone_number, created_at, has_purchased_plan, balance, offices(name, code)')
        .eq('role', 'client')
        .order('created_at', { ascending: false })
        .limit(20);

      if (officeFilter !== 'all') {
        query = query.eq('office_id', officeFilter);
      }

      const { data: recents } = await query;
      setRecentUsers(recents || []);
    } finally {
      setLoading(false);
    }
  }, [officeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Totales globales
  const totalGlobal = Object.values(stats).reduce((s, o) => s + (o.total || 0), 0);
  const planGlobal  = Object.values(stats).reduce((s, o) => s + (o.conPlan || 0), 0);
  const balGlobal   = Object.values(stats).reduce((s, o) => s + (o.balanceTotal || 0), 0);
  const nuevosGlobal = Object.values(stats).reduce((s, o) => s + (o.nuevos30d || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Manager</h1>
            <p className="text-slate-400 text-sm mt-0.5">Control total de la plataforma — todas las oficinas</p>
          </div>
          <Button onClick={fetchData} variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Clientes totales',  value: fmtNum(totalGlobal),  icon: Users,       color: 'text-sky-400' },
            { label: 'Con plan activo',   value: fmtNum(planGlobal),   icon: UserCheck,   color: 'text-green-400' },
            { label: 'Nuevos 30d',        value: fmtNum(nuevosGlobal), icon: TrendingUp,  color: 'text-yellow-400' },
            { label: 'Balance total',     value: fmt(balGlobal),       icon: DollarSign,  color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tarjetas por oficina */}
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-400" /> Por oficina
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {offices.map(of_ => {
            const s = stats[of_.id] || {};
            const colors = OFFICE_COLORS[of_.code] || OFFICE_COLORS.TAURUXFX;
            return (
              <div key={of_.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${colors.bg} px-5 py-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-white font-bold text-lg">{of_.name}</p>
                    <p className="text-white/60 text-xs">{of_.code}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colors.badge}`}>
                    Activa
                  </span>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Clientes</p>
                    <p className="text-white font-bold text-xl">{fmtNum(s.total)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Con plan</p>
                    <p className="text-green-400 font-bold text-xl">{fmtNum(s.conPlan)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Nuevos 30d</p>
                    <p className="text-yellow-400 font-bold text-xl">{fmtNum(s.nuevos30d)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Balance total</p>
                    <p className="text-cyan-400 font-bold text-xl">{fmt(s.balanceTotal)}</p>
                  </div>
                </div>
                <div className="px-5 pb-4 flex gap-2">
                  <button
                    onClick={() => { setOfficeFilter(of_.id); }}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BarChart2 className="w-3.5 h-3.5" /> Ver clientes
                  </button>
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" /> Panel retención
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuración del sistema (accesos directos) */}
        <h2 className="text-lg font-semibold text-white mb-4">Configuración del sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Planes de Fondeo',    desc: 'Precios, capital y reglas',     path: '/admin/plan-settings' },
            { label: 'Gestión de Activos',  desc: 'Símbolos y apalancamiento',     path: '/admin/asset-settings' },
            { label: 'Datos Bancarios',     desc: 'Info para depósitos',           path: '/admin/bank-details' },
            { label: 'Tipo de Cambio',      desc: 'Tasa USD/MXN manual',           path: '/admin/exchange-rate' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-600 transition-all group">
              <p className="text-white font-medium text-sm group-hover:text-sky-400 transition-colors">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Filtro de oficina para lista de usuarios */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Registros recientes</h2>
          <div className="flex gap-2">
            <button onClick={() => setOfficeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                officeFilter === 'all'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
              Todas
            </button>
            {offices.map(of_ => (
              <button key={of_.id} onClick={() => setOfficeFilter(of_.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  officeFilter === of_.id
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                {of_.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {recentUsers.map(r => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">{r.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{r.full_name || 'Sin nombre'}</p>
                  <p className="text-slate-400 text-xs truncate">{r.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    r.has_purchased_plan
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}>
                    {r.has_purchased_plan ? 'Con plan' : 'Sin plan'}
                  </span>
                  <p className="text-slate-500 text-xs mt-1">{r.offices?.name || 'TaurusFX'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagerDashboardPage;