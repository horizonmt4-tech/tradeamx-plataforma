import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, TrendingUp, CreditCard, UserCheck, UserX, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <Card className="bg-slate-800/50 border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <Icon className={`h-4 w-4 ${color}`} />}
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-7 bg-slate-700 rounded w-1/2 animate-pulse"></div>
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
    </CardContent>
  </Card>
);

const SuperAdminStats = ({ stats, loading }) => {
  const statItems = [
    { title: "Usuarios Activos", key: "activeUsers", icon: Users, color: "text-blue-400" },
    { title: "Cuentas Fondeo", key: "propAccounts", icon: UserCheck, color: "text-green-400" },
    { title: "Cuentas Estándar", key: "standardAccounts", icon: UserX, color: "text-yellow-400" },
    { title: "Operaciones Abiertas", key: "openTrades", icon: Briefcase, color: "text-orange-400" },
    { title: "Operaciones Cerradas", key: "closedTrades", icon: TrendingUp, color: "text-indigo-400" },
    { title: "Retiros Totales", key: "withdrawals", icon: CreditCard, color: "text-pink-400" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statItems.map((item) => (
        <StatCard 
          key={item.key} 
          title={item.title} 
          value={loading ? '...' : stats?.[item.key] ?? 0}
          icon={item.icon} 
          color={item.color}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default SuperAdminStats;