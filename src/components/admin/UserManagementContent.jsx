import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Gift, BarChart, FilePieChart } from 'lucide-react';
import UserList from '@/components/admin/UserList';
import EditUserDialog from '@/components/admin/EditUserDialog';
import ActivatePlanDialog from '@/components/admin/ActivatePlanDialog';
import ResetProfileDialog from '@/components/admin/ResetProfileDialog';
import AdjustBalanceDialog from '@/components/admin/AdjustBalanceDialog';
import PasswordResetDialog from '@/components/admin/PasswordResetDialog';
import AdminLockDialog from '@/components/admin/AdminLockDialog';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="glass-effect border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color || 'text-gray-400'}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
);

const UserManagementContent = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [activatingPlanUser, setActivatingPlanUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [adjustingBalanceUser, setAdjustingBalanceUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [lockingUser, setLockingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', variant: 'destructive' });
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    const channel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      propFirmUsers: users.filter(u => u.rules_profile === 'prop_firm').length,
      standardUsers: users.filter(u => u.rules_profile === 'standard').length,
      totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
      totalBonus: users.reduce((sum, u) => sum + (u.bonus || 0), 0),
    };
  }, [users]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Usuarios" value={stats.totalUsers} icon={Users} color="text-blue-400" />
        <StatCard title="Cuentas Fondeo" value={stats.propFirmUsers} icon={FilePieChart} color="text-green-400" />
        <StatCard title="Cuentas Estándar" value={stats.standardUsers} icon={BarChart} color="text-yellow-400" />
        <StatCard title="Balance Total" value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="text-indigo-400" />
        <StatCard title="Bonos Totales" value={`$${stats.totalBonus.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={Gift} color="text-pink-400" />
      </div>

      <UserList
        users={filteredUsers}
        loading={loading}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
        fetchUsers={fetchUsers}
        onEditClick={setEditingUser}
        onActivateClick={setActivatingPlanUser}
        onResetClick={setResettingUser}
        onAdjustBalanceClick={setAdjustingBalanceUser}
        onPasswordResetClick={setResetPasswordUser}
        onToggleLockClick={setLockingUser}
      />

      {editingUser && <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} />}
      {activatingPlanUser && <ActivatePlanDialog user={activatingPlanUser} onClose={() => setActivatingPlanUser(null)} />}
      {resettingUser && <ResetProfileDialog user={resettingUser} onClose={() => setResettingUser(null)} />}
      {adjustingBalanceUser && <AdjustBalanceDialog user={adjustingBalanceUser} onClose={() => setAdjustingBalanceUser(null)} />}
      {resetPasswordUser && <PasswordResetDialog user={resetPasswordUser} onClose={() => setResetPasswordUser(null)} />}
      {lockingUser && <AdminLockDialog user={lockingUser} onClose={() => setLockingUser(null)} />}
    </>
  );
};

export default UserManagementContent;