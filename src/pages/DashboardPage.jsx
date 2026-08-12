import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssets } from '@/contexts/AssetContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2, UserCog, Activity, TrendingUp, TrendingDown,
  Target, Trophy, AlertTriangle, BarChart2, Clock,
  Zap, History, Download, CreditCard, CheckCircle, XCircle,
  CircleDollarSign, CalendarDays, ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ConnectWallet from '@/components/client/ConnectWallet';
import { useTotalPL } from '@/hooks/useRealTimePL';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => {
  const num = Number(n) || 0;
  return `${num >= 0 ? '+' : ''}$${Math.abs(num).toFixed(2)}`;
};
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// FIX BUG 1: para trades CERRADAS, profit_loss ya es el valor final.
// pl_adjustment solo debe sumarse mientras la trade está ABIERTA (floating P/L,
// ver useTotalPL). En cierres con override, el backend está guardando
// pl_adjustment == profit_loss, así que sumarlos duplicaba el resultado.
// Usar SIEMPRE esta función para P/L de trades cerradas, nunca sumar ambos campos.
const getClosedPL = (t) => Number(t.profit_loss) || 0;

// ── Mini Stat Card ────────────────────────────────────────────
const MiniStat = ({ label, value, sub, color = 'text-white', icon: Icon, iconColor }) => (
  <Card className="bg-slate-800/60 border-slate-700/50">
    <CardContent className="p-4 flex items-center gap-3">
      {Icon && (
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconColor || 'bg-slate-700')}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 truncate">{label}</p>
        <p className={cn('text-lg font-bold font-mono tabular-nums leading-tight', color)}>{value}</p>
        {sub && <p className="text-[10px] text-gray-500 truncate">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

// ── Market Status ─────────────────────────────────────────────
const MarketStatus = ({ isMarketOpen }) => (
  <div className={cn(
    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
    isMarketOpen
      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
      : 'bg-red-500/10 text-red-400 border border-red-500/20'
  )}>
    <span className={cn('w-2 h-2 rounded-full', isMarketOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
    {isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado'}
  </div>
);

// ── Objectives Horizontal ─────────────────────────────────────
const ObjectivesHorizontal = ({ user }) => {
  const [objectives, setObjectives] = useState(null);

  useEffect(() => {
    if (!user?.id || user?.isDemo) {
      setObjectives({ profitGoal: 1000, profitCurrent: 0, minDays: 10, daysTraded: 0, maxDrawdown: 1000, currentDrawdown: 0 });
      return;
    }
    const fetchObj = async () => {
      try {
        const { data } = await supabase
          .from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setObjectives({
            profitGoal:       Number(data.profit_goal)        || 0,
            profitCurrent:    Number(data.profit)             || 0,
            minDays:          Number(data.min_trading_days)   || 10,
            daysTraded:       Number(data.trading_days_count) || 0,
            maxDrawdown:      Number(data.max_drawdown)       || 0,
            currentDrawdown:  Number(data.current_drawdown)   || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching objectives:', err);
      }
    };
    fetchObj();
  }, [user?.id]);

  if (!objectives) return null;

  const items = [
    {
      icon: CircleDollarSign,
      iconBg: 'bg-green-500/15',
      iconColor: 'text-green-400',
      label: 'Objetivo de Ganancia',
      current: fmt(objectives.profitCurrent),
      target: fmt(objectives.profitGoal),
      pct: objectives.profitGoal > 0
        ? Math.min((objectives.profitCurrent / objectives.profitGoal) * 100, 100)
        : 0,
      barColor: objectives.profitCurrent >= 0 ? 'bg-green-500' : 'bg-red-500',
      textColor: objectives.profitCurrent >= 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      icon: CalendarDays,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      label: 'Días de Trading',
      current: `${objectives.daysTraded} días`,
      target: `${objectives.minDays} días`,
      pct: objectives.minDays > 0
        ? Math.min((objectives.daysTraded / objectives.minDays) * 100, 100)
        : 0,
      barColor: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
    {
      icon: ShieldAlert,
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      label: 'Límite de Drawdown',
      current: fmt(objectives.currentDrawdown),
      target: fmt(objectives.maxDrawdown),
      pct: objectives.maxDrawdown > 0
        ? Math.min((objectives.currentDrawdown / objectives.maxDrawdown) * 100, 100)
        : 0,
      barColor: objectives.currentDrawdown / (objectives.maxDrawdown || 1) > 0.8 ? 'bg-red-500' : 'bg-yellow-500',
      textColor: objectives.currentDrawdown / (objectives.maxDrawdown || 1) > 0.8 ? 'text-red-400' : 'text-yellow-400',
    },
  ];

  return (
    <Card className="glass-effect border-gray-700 bg-slate-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-green-400" />
          Progreso de la Cuenta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', item.iconBg)}>
                    <Icon className={cn('w-4 h-4', item.iconColor)} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className={cn('text-xl font-bold font-mono tabular-nums', item.textColor)}>
                    {item.current}
                  </span>
                  <span className="text-[10px] text-gray-500">/ {item.target}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className={cn('h-1.5 rounded-full transition-all', item.barColor)}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-500">{item.pct.toFixed(1)}% completado</span>
                  <span className="text-[10px] text-gray-500">En progreso</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-blue-300/80 bg-blue-500/10 rounded-lg px-3 py-2 mt-3 border border-blue-500/10">
          💡 Mantén tu drawdown por debajo del 10% y completa los días mínimos para calificar al siguiente nivel.
        </p>
      </CardContent>
    </Card>
  );
};

// ── Weekly P/L Bar ────────────────────────────────────────────
const WeeklyPLChart = ({ trades }) => {
  const data = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const now  = new Date();
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return { day: days[d.getDay() === 0 ? 6 : d.getDay() - 1], date: d.toDateString(), pl: 0 };
    });
    trades.filter(t => t.status === 'CLOSED' && t.close_time).forEach(t => {
      const entry = week.find(w => w.date === new Date(t.close_time).toDateString());
      // FIX BUG 1: antes sumaba profit_loss + pl_adjustment (duplicaba en cierres con override)
      if (entry) entry.pl += getClosedPL(t);
    });
    return week;
  }, [trades]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs">
        <span className={val >= 0 ? 'text-green-400' : 'text-red-400'}>{fmt(val)}</span>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="pl" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ── Recent Activity ───────────────────────────────────────────
const RecentActivity = ({ trades }) => {
  const recent = useMemo(() =>
    trades.filter(t => t.status === 'CLOSED')
      .sort((a, b) => new Date(b.close_time) - new Date(a.close_time))
      .slice(0, 5),
    [trades]
  );
  if (!recent.length) return <p className="text-gray-500 text-sm text-center py-4">Sin operaciones cerradas.</p>;
  return (
    <div className="space-y-1.5">
      {recent.map(t => {
        // FIX BUG 1: antes sumaba profit_loss + pl_adjustment
        const pl = getClosedPL(t);
        const isProfit = pl >= 0;
        return (
          <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0',
              isProfit ? 'bg-green-500/10' : 'bg-red-500/10')}>
              {isProfit ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-mono font-bold text-white text-xs">{t.symbol}</span>
              <span className={cn('ml-1.5 text-[10px] font-bold',
                t.type === 'BUY' ? 'text-green-400' : 'text-red-400')}>{t.type}</span>
              <p className="text-[10px] text-gray-500 truncate">{fmtDate(t.close_time)}</p>
            </div>
            <span className={cn('font-mono font-bold text-xs tabular-nums shrink-0',
              isProfit ? 'text-green-400' : 'text-red-400')}>{fmt(pl)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Top Symbols ───────────────────────────────────────────────
const TopSymbols = ({ trades }) => {
  const symbols = useMemo(() => {
    const map = {};
    trades.filter(t => t.status === 'CLOSED').forEach(t => {
      if (!map[t.symbol]) map[t.symbol] = { symbol: t.symbol, pl: 0, count: 0 };
      // FIX BUG 1: antes sumaba profit_loss + pl_adjustment
      map[t.symbol].pl    += getClosedPL(t);
      map[t.symbol].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [trades]);
  if (!symbols.length) return <p className="text-gray-500 text-sm text-center py-4">Sin datos aún.</p>;
  return (
    <div className="space-y-2">
      {symbols.map(s => (
        <div key={s.symbol} className="flex items-center justify-between py-1 border-b border-slate-800 last:border-0">
          <div>
            <span className="font-mono font-bold text-white text-xs">{s.symbol}</span>
            <span className="ml-2 text-[10px] text-gray-500">{s.count} ops</span>
          </div>
          <span className={cn('font-mono font-bold text-xs tabular-nums',
            s.pl >= 0 ? 'text-green-400' : 'text-red-400')}>{fmt(s.pl)}</span>
        </div>
      ))}
    </div>
  );
};

// ── DashboardPage ─────────────────────────────────────────────
const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: assetsLoading, isMarketOpen } = useAssets();
  const navigate = useNavigate();

  const [trades, setTrades]               = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(true);

  // FIX BUG 2: estado local que refleja cambios en `profiles` en tiempo real,
  // para no depender exclusivamente del `user` del AuthContext (que solo se
  // actualiza en login/refresh y no escucha la tabla `profiles`).
  const [liveProfile, setLiveProfile] = useState(null);

  const getUserData = useCallback(() => {
    if (!user) return null;
    if (user.email === 'demo@tradea.com') {
      return { id: 'demo-user-id', email: 'demo@tradea.com', full_name: 'Usuario Demo',
        balance: 10000, bonus: 500, profit: 1250, isAdmin: false, isDemo: true, trading_locked: false };
    }
    // FIX BUG 2: prioriza liveProfile (dato fresco de la suscripción realtime)
    // sobre el user del AuthContext, que puede estar desactualizado.
    const src = liveProfile || user;
    return { id: user.id, email: user.email, full_name: user.full_name || user.email,
      balance: src.balance ?? 0, bonus: src.bonus ?? 0, profit: src.profit ?? 0,
      isAdmin: user.isAdmin || false, isDemo: false, trading_locked: src.trading_locked || false };
  }, [user, liveProfile]);

  const userData = getUserData();

  const fetchTrades = useCallback(async () => {
    if (!user) { setLoadingTrades(false); return; }
    if (user.email === 'demo@tradea.com') {
      setLoadingTrades(false);
      setTrades([{ id: 'demo-1', symbol: 'EUR/USD', type: 'BUY', lot_size: 1,
        open_price: 1.085, close_price: 1.092, status: 'CLOSED', profit_loss: 700, pl_adjustment: 0,
        open_time: new Date(Date.now() - 86400000 * 2).toISOString(),
        close_time: new Date(Date.now() - 86400000).toISOString(), margin: 0 }]);
      return;
    }
    setLoadingTrades(true);
    try {
      const { data, error } = await supabase.from('trades').select('*')
        .eq('user_id', user.id).order('open_time', { ascending: false });
      if (error) throw error;
      setTrades(data || []);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setTrades([]);
    } finally { setLoadingTrades(false); }
  }, [user]);

  useEffect(() => {
    fetchTrades();
    if (user && user.email !== 'demo@tradea.com') {
      const ch = supabase.channel(`dashboard:trades:${user.id}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` },
          fetchTrades).subscribe();
      return () => supabase.removeChannel(ch);
    }
  }, [user, fetchTrades]);

  // FIX BUG 2: suscripción realtime a la tabla `profiles`. Cualquier ajuste de
  // balance/bonus/profit hecho fuera del flujo de trades (ej. admin, depósito)
  // ahora se refleja al instante sin necesidad de recargar la página.
  useEffect(() => {
    if (!user?.id || user.email === 'demo@tradea.com') return;

    const ch = supabase
      .channel(`dashboard:profile:${user.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => setLiveProfile(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [user?.id, user?.email]);

  const openTrades   = useMemo(() => trades.filter(t => t.status === 'OPEN'),   [trades]);
  const closedTrades = useMemo(() => trades.filter(t => t.status === 'CLOSED'), [trades]);
  const floatingPL   = useTotalPL(openTrades);

  const stats = useMemo(() => {
    if (!closedTrades.length) return null;
    // FIX BUG 1: antes usaba profit_loss + pl_adjustment, duplicando best/worst/avg
    const pls     = closedTrades.map(getClosedPL);
    const winners = pls.filter(p => p > 0);
    const losers  = pls.filter(p => p < 0);
    const daysSet = new Set(closedTrades.map(t => new Date(t.open_time).toDateString()));
    return {
      winRate:    (winners.length / pls.length) * 100,
      best:       Math.max(...pls),
      worst:      Math.min(...pls),
      avgWin:     winners.length ? winners.reduce((a, b) => a + b, 0) / winners.length : 0,
      avgLoss:    losers.length  ? losers.reduce((a, b)  => a + b, 0) / losers.length  : 0,
      total:      pls.length,
      daysTraded: daysSet.size,
    };
  }, [closedTrades]);

  // Account Calculation Logic Fixed
  const openMargins = useMemo(() => openTrades.reduce((acc, t) => acc + (Number(t.margin) || 0), 0), [openTrades]);
  const freeMargin  = Number(userData?.balance) || 0;
  const balance     = freeMargin + openMargins; // MetaTrader traditional Balance
  const bonus       = Number(userData?.bonus) || 0;
  const equity      = balance + bonus + floatingPL; // MetaTrader Equity formula

  const loading = authLoading || assetsLoading || loadingTrades;

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <Loader2 className="h-12 w-12 animate-spin text-green-400" />
    </div>
  );
  if (!loading && !user) { navigate('/login'); return null; }
  if (!userData) return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="text-center">
        <p className="text-white text-xl mb-4">Error al cargar datos</p>
        <Button onClick={() => navigate('/login')}>Volver al Login</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">

      {userData.isDemo && (
        <div className="mb-4 bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-3 text-center">
          <p className="text-indigo-300 text-sm font-medium">🎮 Modo Demo Activo</p>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Resumen de Cuenta</h1>
          <p className="text-gray-400 mt-0.5 text-sm">
            Hola, <span className="text-white font-medium">{userData.full_name || userData.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <MarketStatus isMarketOpen={isMarketOpen} />
          {userData.isAdmin && (
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => navigate('/admin')}>
              <UserCog className="h-4 w-4 mr-1" /> Admin
            </Button>
          )}
        </div>
      </header>

      {/* Account Overview (Fix visual presentation of DB data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Balance (Capital)" value={fmt(balance)} icon={CircleDollarSign} iconColor="bg-green-500/20" color="text-white" />
        <MiniStat label="Equidad" value={fmt(equity)} icon={Activity} iconColor="bg-blue-500/20" color="text-white" />
        <MiniStat label="Margen Libre" value={fmt(freeMargin)} icon={CreditCard} iconColor="bg-purple-500/20" color="text-white" />
        <MiniStat label="P/L Flotante" value={fmt(floatingPL)} icon={floatingPL >= 0 ? TrendingUp : TrendingDown} iconColor={floatingPL >= 0 ? "bg-green-500/20" : "bg-red-500/20"} color={floatingPL >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Ir a Trading',  icon: Zap,       color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20 text-yellow-400', path: '/analysis' },
          { label: 'Ver Historial', icon: History,    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400',         path: '/analysis' },
          { label: 'Depositar',     icon: CreditCard, color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400',     path: '/deposit' },
          { label: 'Retirar',       icon: Download,   color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400', path: '/withdraw' },
        ].map(({ label, icon: Icon, color, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all', color)}>
            <Icon className="w-4 h-4" /><span>{label}</span>
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <MiniStat label="Win Rate"       value={`${stats.winRate.toFixed(1)}%`}
            sub={`${closedTrades.filter(t=>getClosedPL(t)>0).length}/${stats.total} ops`}
            color={stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'} icon={Target}      iconColor="bg-green-500/20" />
          <MiniStat label="Mejor Op."      value={fmt(stats.best)}    color="text-green-400"   icon={Trophy}        iconColor="bg-yellow-500/20" />
          <MiniStat label="Peor Op."       value={fmt(stats.worst)}   color="text-red-400"     icon={AlertTriangle} iconColor="bg-red-500/20" />
          <MiniStat label="Prom. Ganancia" value={fmt(stats.avgWin)}  color="text-green-400"   icon={TrendingUp}    iconColor="bg-green-500/20" />
          <MiniStat label="Prom. Pérdida"  value={fmt(stats.avgLoss)} color="text-red-400"     icon={TrendingDown}  iconColor="bg-red-500/20" />
          <MiniStat label="Total Ops."     value={stats.total}
            sub={`${openTrades.length} abiertas`}                                              icon={BarChart2}     iconColor="bg-blue-500/20" />
          <MiniStat label="Días Operados"  value={stats.daysTraded}   sub="histórico"          icon={Clock}         iconColor="bg-purple-500/20" />
        </div>
      )}

      {/* ✅ Progreso de la cuenta — horizontal, ancho completo */}
      <div className="mb-5">
        <ObjectivesHorizontal user={userData} />
      </div>

      {/* ✅ Wallet TAMX — conectar Coinbase Wallet y agregar el token */}
      {!userData.isDemo && (
        <div className="mb-5">
          <ConnectWallet />
        </div>
      )}

      {/* ✅ Fila de cards pequeños: P/L semanal + Actividad reciente + Activos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">

        <Card className="glass-effect border-gray-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-400" /> P/L últimos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            {closedTrades.length
              ? <WeeklyPLChart trades={closedTrades} />
              : <p className="text-gray-500 text-sm text-center py-8">Sin operaciones cerradas.</p>}
          </CardContent>
        </Card>

        <Card className="glass-effect border-gray-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-green-400" /> Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity trades={trades} />
          </CardContent>
        </Card>

        <Card className="glass-effect border-gray-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" /> Activos más Operados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopSymbols trades={trades} />
          </CardContent>
        </Card>

      </div>

      {/* Curva de Rendimiento — al fondo, ancho completo */}
      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-indigo-400" /> Curva de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <PerformanceChart trades={closedTrades} initialBalance={10000} />
        </CardContent>
      </Card>

    </div>
  );
};

export default DashboardPage;