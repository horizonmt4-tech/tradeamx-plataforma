import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CreditCard, BarChart, Globe, Settings, ShieldCheck, Landmark, Coins,
  Users, DollarSign, TrendingUp, UserCheck, Briefcase, RefreshCw,
  AlertTriangle, Mail,
} from 'lucide-react';
import UserAnalytics from '@/components/admin/UserAnalytics';
import RecoveryEmailPanel from '@/components/admin/RecoveryEmailPanel';

const ConfigCard = ({ title, description, icon: Icon, onClick, color }) => (
  <Card className="bg-slate-800/60 border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer group" onClick={onClick}>
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <Card className="bg-slate-800/60 border-slate-700/50">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{title}</p>
        <p className="text-xl font-bold text-white font-mono">{value}</p>
        {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const SuperAdminDashboardPage = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const [users, setUsers]           = useState([]);
  const [trades, setTrades]         = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'recovery' | 'analytics'

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: usersData }, { data: tradesData }, { data: wData }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('trades').select('id, status').eq('status', 'OPEN'),
        supabase.from('withdrawals').select('id, status, amount').eq('status', 'pending'),
      ]);
      setUsers(usersData || []);
      setTrades(tradesData || []);
      setWithdrawals(wData || []);
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel('super-admin-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchData]);

  const stats = useMemo(() => ({
    totalUsers:    users.length,
    propFirm:      users.filter(u => u.rules_profile === 'prop_firm').length,
    withPlan:      users.filter(u => u.has_purchased_plan).length,
    withoutPlan:   users.filter(u => !u.has_purchased_plan).length,
    totalBalance:  users.reduce((s, u) => s + (Number(u.balance) || 0), 0),
    openTrades:    trades.length,
    pendingWithdrawals: withdrawals.length,
    pendingAmount: withdrawals.reduce((s, w) => s + Number(w.amount), 0),
  }), [users, trades, withdrawals]);

  const configOptions = [
    { title: 'Planes de Fondeo',   description: 'Precios, capital y reglas.',      icon: CreditCard,  path: '/admin/plan-settings',  color: 'bg-blue-500/20' },
    { title: 'Gestión de Activos', description: 'Símbolos y apalancamiento.',      icon: BarChart,    path: '/admin/asset-settings', color: 'bg-green-500/20' },
    { title: 'Datos Bancarios',    description: 'Info para depósitos bancarios.',  icon: Landmark,    path: '/admin/bank-details',   color: 'bg-yellow-500/20' },
    { title: 'Tipo de Cambio',     description: 'Tasa USD/MXN manual.',            icon: Coins,       path: '/admin/exchange-rate',  color: 'bg-purple-500/20' },
    { title: 'Regulación',         description: 'Textos legales y registros.',     icon: ShieldCheck, path: '/admin/regulation',     color: 'bg-red-500/20' },
  ];

  const navTabs = [
    { key: 'overview',  label: 'Resumen',    icon: Globe },
    { key: 'recovery',  label: 'Recuperación de Carritos', icon: Mail },
    { key: 'analytics', label: 'Analytics',  icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Manager</h1>
              <p className="text-gray-400 text-sm mt-0.5">Control total de la plataforma</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="border-gray-600 h-9">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatCard title="Usuarios"        value={stats.totalUsers}    icon={Users}        color="bg-blue-500/20" />
            <StatCard title="Fondeo"          value={stats.propFirm}      icon={UserCheck}    color="bg-cyan-500/20" />
            <StatCard title="Con Plan"        value={stats.withPlan}      icon={ShieldCheck}  color="bg-green-500/20" />
            <StatCard title="Sin Plan"        value={stats.withoutPlan}   icon={Mail}         color="bg-orange-500/20" sub="carritos abandonados" />
            <StatCard title="Ops Abiertas"    value={stats.openTrades}    icon={Briefcase}    color="bg-yellow-500/20" />
            <StatCard title="Ret. Pendientes" value={stats.pendingWithdrawals} icon={AlertTriangle} color="bg-red-500/20"
              sub={`$${stats.pendingAmount.toFixed(0)}`} />
            <StatCard title="Balance Total"   value={`$${(stats.totalBalance / 1000).toFixed(0)}k`} icon={DollarSign} color="bg-emerald-500/20" />
            <Card className="bg-orange-500/10 border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors"
              onClick={() => navigate('/admin/withdrawals')}>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="w-5 h-5 text-orange-400 mb-1" />
                <p className="text-xs font-bold text-orange-300">Ver Retiros</p>
                <p className="text-[10px] text-orange-400/70">{stats.pendingWithdrawals} pendientes</p>
              </CardContent>
            </Card>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-1 border-b border-slate-700 pb-0">
            {navTabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t transition-colors ${
                  activeSection === tab.key
                    ? 'text-white border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'recovery' && stats.withoutPlan > 0 && (
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                    {stats.withoutPlan}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sección: Resumen */}
          {activeSection === 'overview' && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configuración del Sistema
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {configOptions.map((opt) => (
                  <ConfigCard key={opt.path} {...opt} onClick={() => navigate(opt.path)} />
                ))}
              </div>
            </section>
          )}

          {/* Sección: Recuperación de carritos */}
          {activeSection === 'recovery' && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-400" /> Recuperación de Carritos Abandonados
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {stats.withoutPlan} usuarios registrados sin plan activo
                  </p>
                </div>
              </div>
              <RecoveryEmailPanel />
            </section>
          )}

          {/* Sección: Analytics */}
          {activeSection === 'analytics' && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Análisis de Usuarios
              </h2>
              <UserAnalytics users={users} />
            </section>
          )}

        </motion.div>
      </main>
    </div>
  );
};

export default SuperAdminDashboardPage;