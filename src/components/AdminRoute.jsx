// ── AdminRoute.jsx (Retención) ────────────────────────────────
// Solo usuarios con role = 'retencion' o 'manager'
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
      </div>
    );
  }

  // Retención y Manager tienen acceso al panel de admin/retención
  if (!user || (!user.isAdmin && !user.isManager)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;