// ── VentasRoute.jsx ───────────────────────────────────────────
// Solo usuarios con role = 'ventas' o 'manager'
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const VentasRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isVentas && !user.isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default VentasRoute;