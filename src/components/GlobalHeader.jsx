import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, Download } from 'lucide-react';
import { useTotalPL } from '@/hooks/useRealTimePL';
import UserSettingsMenu from '@/components/UserSettingsMenu';
import { cn } from '@/lib/utils';

// ── Metric Pill ───────────────────────────────────────────────
const Metric = ({ label, value, color = 'text-white' }) => (
  <div className="flex flex-col items-center px-3 py-1 border-r border-slate-700 last:border-0">
    <span className="text-[9px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">{label}</span>
    <span className={cn('text-xs font-bold font-mono tabular-nums', color)}>{value}</span>
  </div>
);

// ── GlobalHeader ──────────────────────────────────────────────
// Recibe user, profile, loading y signOut como props desde HeaderWrapper en App.jsx
// NO usa useAuth() directamente — evita conflicto entre AuthContext y SupabaseAuthContext
const GlobalHeader = ({ user, profile, loading, signOut, openTrades = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const floatingPL = useTotalPL(openTrades);

  // Usar profile si está disponible (tiene balance/bonus actualizados), fallback a user
  const activeUser = profile || user;
  const balance = Number(activeUser?.balance) || 0;
  const bonus = Number(activeUser?.bonus) || 0;

  const totalMargin = useMemo(
    () => openTrades.reduce((acc, t) => acc + (Number(t.margin) || 0), 0),
    [openTrades]
  );

  const equity = balance + bonus + floatingPL;
  const available = equity - totalMargin;
  const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : Infinity;

  const marginColor =
    marginLevel === Infinity ? 'text-green-400' :
      marginLevel >= 100 ? 'text-green-400' :
        marginLevel >= 50 ? 'text-yellow-400' :
          'text-red-400';

  const plColor = floatingPL >= 0 ? 'text-green-400' : 'text-red-400';

  // Rutas públicas donde NO mostrar el header
  const publicPaths = [
    '/', '/login', '/signup', '/register', '/plans', '/contact', '/about',
    '/faq', '/support', '/legal', '/privacy', '/terms', '/risk-disclosure',
    '/cookies', '/aml-kyc', '/check-email', '/update-password', '/reset-password',
  ];
  const isPublic = publicPaths.includes(location.pathname) ||
    location.pathname.startsWith('/auth/');

  // No renderizar si no hay usuario, es ruta pública, o está cargando
  if (!user || isPublic || loading) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 h-12">
      <div className="flex items-center justify-between h-full px-3 md:px-4 max-w-screen-2xl mx-auto">

        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="shrink-0 mr-2">
          <img
            src="https://horizons-cdn.hostinger.com/4cbc99ef-1375-4750-b360-c2cd4a566cc0/2fd39ff36c91274f9c9360d45b501e13.png"
            alt="TradeaMX"
            className="h-7 w-auto object-contain"
          />
        </button>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1 mr-4">
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Trading', path: '/analysis' },
            { label: 'Calendario', path: '/calendar' },
            { label: 'Noticias', path: '/news' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'px-3 py-1 rounded text-xs font-semibold transition-colors',
                location.pathname === path
                  ? 'text-white bg-slate-700'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Metrics */}
        <div className="flex items-center overflow-x-auto scrollbar-none flex-1 justify-end mr-3">
          <Metric label="Balance" value={`$${balance.toFixed(2)}`} />
          <Metric label="Capital" value={`$${equity.toFixed(2)}`} color="text-blue-400" />
          <Metric
            label="Flotante"
            value={`${floatingPL >= 0 ? '+' : ''}$${floatingPL.toFixed(2)}`}
            color={plColor}
          />
          <div className="hidden sm:flex">
            <Metric label="Margen" value={`$${totalMargin.toFixed(2)}`} color="text-purple-400" />
          </div>
          <div className="hidden md:flex">
            <Metric
              label="Nv. Margen"
              value={marginLevel === Infinity ? '∞' : `${marginLevel.toFixed(0)}%`}
              color={marginColor}
            />
          </div>
          <div className="hidden sm:flex">
            <Metric label="Disponible" value={`$${available.toFixed(2)}`} color="text-cyan-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 hidden sm:flex"
            onClick={() => navigate('/deposit')}
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Depositar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs border-slate-600 text-slate-300 hover:bg-slate-800 hidden sm:flex"
            onClick={() => navigate('/withdraw')}
          >
            <Download className="w-3 h-3 mr-1" />
            Retirar
          </Button>
          <UserSettingsMenu />
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;