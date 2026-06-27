import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// FIX: redirige a cada rol a su panel correcto al intentar entrar al dashboard
const ROLE_REDIRECTS = {
  manager:   '/manager',
  ventas:    '/ventas',
  retencion: '/admin',
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario es manager/ventas/retencion e intenta entrar a /dashboard
  // redirigirlo a su panel correspondiente
  if (location.pathname === '/dashboard' && ROLE_REDIRECTS[user.role]) {
    return <Navigate to={ROLE_REDIRECTS[user.role]} replace />;
  }

  return children;
};

export default ProtectedRoute;