// ✅ AdminHeader simplificado
// El GlobalHeader ya provee navegación y métricas globales.
// Este componente solo muestra un breadcrumb/título de sección admin.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';

const BREADCRUMBS = {
  '/admin': ['Admin', 'Gestión de Usuarios'],
  '/admin/withdrawals': ['Admin', 'Retiros'],
  '/admin/bank-details': ['Admin', 'Datos Bancarios'],
  '/admin/plan-settings': ['Admin', 'Planes'],
  '/admin/asset-settings': ['Admin', 'Activos'],
  '/admin/exchange-rate': ['Admin', 'Tipo de Cambio'],
  '/admin/regulation': ['Admin', 'Regulación'],
  '/super-admin': ['Super Admin', 'Dashboard'],
};

const AdminHeader = () => {
  const location = useLocation();
  const crumbs = BREADCRUMBS[location.pathname] || ['Admin'];

  return (
    <div className="flex items-center gap-2 px-1 py-3 mb-2 text-sm">
      <Shield className="w-4 h-4 text-blue-400 shrink-0" />
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600" />}
          <span className={i === crumbs.length - 1 ? 'text-white font-semibold' : 'text-gray-400'}>
            {crumb}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default AdminHeader;