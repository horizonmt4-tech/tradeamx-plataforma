import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Gift, BarChart, UserCheck, Clock, Download, ShieldX } from 'lucide-react';
import UserList from '@/components/admin/UserList';
import EditUserDialog from '@/components/admin/EditUserDialog';
import ActivatePlanDialog from '@/components/admin/ActivatePlanDialog';
import ResetProfileDialog from '@/components/admin/ResetProfileDialog';
import PasswordResetDialog from '@/components/admin/PasswordResetDialog';
import AdjustBalanceDialog from '@/components/admin/AdjustBalanceDialog';
import BanUserDialog from '@/components/admin/BanUserDialog';
import DeleteUserDialog from '@/components/admin/DeleteUserDialog';

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <Card className="bg-slate-800/60 border-slate-700/50">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{title}</p>
        <p className="text-xl font-bold text-white font-mono tabular-nums">{value}</p>
        {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const AdminPage = () => {
  const { toast }              = useToast();
  const { user: authUser }     = useAuth();
  const { checkAuthorization } = useAdminAuth();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans]         = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [updating, setUpdating]   = useState(false);

  // Dialog states
  const [editingUser, setEditingUser]                     = useState(null);
  const [activatingUser, setActivatingUser]               = useState(null);
  const [resettingUser, setResettingUser]                 = useState(null);
  const [passwordResettingUser, setPasswordResettingUser] = useState(null);
  const [adjustingBalanceUser, setAdjustingBalanceUser]   = useState(null);
  const [banningUser, setBanningUser]                     = useState(null);
  const [deletingUser, setDeletingUser]                   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('profiles').select('*');
      if (searchQuery) q = q.ilike('email', `%${searchQuery}%`);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('funding_plans').select('*').order('sort_order');
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers, fetchPlans]);

  useEffect(() => {
    const ch = supabase.channel('profiles-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [fetchUsers]);

  const stats = useMemo(() => ({
    total:      users.length,
    propFirm:   users.filter(u => u.rules_profile === 'prop_firm').length,
    withPlan:   users.filter(u => u.has_purchased_plan).length,
    banned:     users.filter(u => u.account_banned).length,
    locked:     users.filter(u => u.trading_locked && !u.account_banned).length,
    totalBal:   users.reduce((s, u) => s + (Number(u.balance) || 0), 0),
    totalBonus: users.reduce((s, u) => s + (Number(u.bonus) || 0), 0),
    newUsers:   users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 86400000)).length,
  }), [users]);

  // ── Handlers ───────────────────────────────────────────────

  const handleActivatePlan = async () => {
    if (!activatingUser || !selectedPlanId) return;
    checkAuthorization(async () => {
      setUpdating(true);
      try {
        const plan = plans.find(p => p.id === selectedPlanId);
        const { error } = await supabase.rpc('admin_activate_plan', {
          p_user_id:      activatingUser.id,
          p_plan_name:    plan.name,
          p_plan_capital: plan.capital,
        });
        if (error) throw error;
        
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              user_email: activatingUser.email,
              user_name:  activatingUser.full_name || undefined,
              plan_name:  plan.name,
              capital:    plan.capital,
            },
          });
        } catch (emailErr) {
          console.warn('[AdminPage] Welcome email failed:', emailErr);
        }

        toast({
          title: '✅ Plan activado',
          description: `${plan.name} → ${activatingUser.email} · Email de bienvenida enviado`,
          className: 'bg-green-600 text-white',
        });
        setActivatingUser(null);
        setSelectedPlanId('');
        await fetchUsers();
      } catch (err) {
        console.error('Activate plan error:', err);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setUpdating(false);
      }
    });
  };

  const handleConfirmReset = async () => {
    if (!resettingUser) return;
    checkAuthorization(async () => {
      setUpdating(true);
      try {
        const { error } = await supabase.rpc('admin_reset_user_profile', { p_user_id: resettingUser.id });
        if (error) throw error;
        
        toast({ title: 'Perfil restaurado', description: resettingUser.email, className: 'bg-yellow-500 text-black' });
        setResettingUser(null);
        await fetchUsers();
      } catch (err) {
        console.error('Reset profile error:', err);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setUpdating(false);
      }
    });
  };

  const handleConfirmPasswordReset = async () => {
    if (!passwordResettingUser) return;
    setUpdating(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(passwordResettingUser.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      
      toast({ title: 'Email enviado', description: passwordResettingUser.email });
      setPasswordResettingUser(null);
    } catch (err) {
      console.error('Password reset error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const handleAdjustBalance = async (amount, justification, type) => {
    if (!adjustingBalanceUser) return;
    checkAuthorization(async () => {
      setUpdating(true);
      try {
        const rpc = type === 'bonus' ? 'manager_add_bonus' : 'manager_add_balance';
        const { error } = await supabase.rpc(rpc, {
          p_user_id:      adjustingBalanceUser.id,
          p_amount:       amount,
          p_justification: justification,
        });
        if (error) throw error;
        
        toast({ title: 'Balance ajustado', description: adjustingBalanceUser.email, className: 'bg-purple-600 text-white' });
        setAdjustingBalanceUser(null);
        await fetchUsers();
      } catch (err) {
        console.error('Adjust balance error:', err);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setUpdating(false);
      }
    });
  };

  const handleToggleLock = (userToToggle) => {
    checkAuthorization(async () => {
      try {
        const newLock = !userToToggle.trading_locked;
        const { error } = await supabase.rpc('manager_toggle_trading_lock', {
          p_user_id: userToToggle.id,
          p_locked:  newLock,
        });
        if (error) throw error;
        
        toast({
          title: newLock ? '🔒 Trading bloqueado' : '🔓 Trading desbloqueado',
          description: userToToggle.email,
          className: newLock ? 'bg-orange-600 text-white' : 'bg-green-600 text-white',
        });
        await fetchUsers();
      } catch (err) {
        console.error('Toggle lock error:', err);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    });
  };

  const handleBanUser = async (user, banned, reason) => {
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('admin_ban_user', {
        p_user_id: user.id,
        p_banned:  banned,
        p_reason:  reason || null,
      });
      if (error) throw error;
      
      toast({
        title: banned ? '🚫 Acceso bloqueado' : '✅ Acceso restaurado',
        description: `${user.email}${reason ? ` · ${reason}` : ''}`,
        className: banned ? 'bg-red-700 text-white' : 'bg-green-600 text-white',
      });
      setBanningUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Ban user error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (user) => {
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('admin_delete_user', { p_user_id: user.id });
      if (error) throw error;
      
      toast({
        title: '🗑️ Usuario eliminado',
        description: `${user.email} eliminado permanentemente.`,
        className: 'bg-red-800 text-white',
      });
      setDeletingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      toast({ title: 'Error al eliminar', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-400" /> Gestión de Usuarios
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">{users.length} usuarios registrados</p>
              </div>
              <div className="flex gap-2 items-center">
                {stats.banned > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 border border-red-700/40 rounded-lg text-xs text-red-400">
                    <ShieldX className="w-3.5 h-3.5" /> {stats.banned} bloqueados
                  </div>
                )}
                <Link to="/admin/withdrawals">
                  <Button className="bg-green-600 hover:bg-green-700 h-9">
                    <Download className="w-4 h-4 mr-2" /> Retiros Pendientes
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <StatCard title="Total"       value={stats.total}      icon={Users}      color="bg-blue-500/20" />
              <StatCard title="Nuevos 30d"  value={stats.newUsers}   icon={UserCheck}  color="bg-cyan-500/20" />
              <StatCard title="Con Plan"    value={stats.withPlan}   icon={TrendingUp} color="bg-green-500/20" />
              <StatCard title="Fondeo"      value={stats.propFirm}   icon={BarChart}   color="bg-indigo-500/20" />
              <StatCard title="Bloqueados"  value={stats.locked}     icon={Clock}      color="bg-orange-500/20" />
              <StatCard title="Balance"     value={`$${(stats.totalBal / 1000).toFixed(0)}k`}   icon={DollarSign} color="bg-emerald-500/20" />
              <StatCard title="Bonos"       value={`$${(stats.totalBonus / 1000).toFixed(0)}k`} icon={Gift}       color="bg-pink-500/20" />
            </div>

            <UserList
              users={users}
              loading={loading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              fetchUsers={fetchUsers}
              onEditClick={setEditingUser}
              onActivateClick={setActivatingUser}
              onResetClick={setResettingUser}
              onPasswordResetClick={setPasswordResettingUser}
              onAdjustBalanceClick={authUser?.is_super_admin ? setAdjustingBalanceUser : null}
              onToggleLockClick={authUser?.is_super_admin ? handleToggleLock : null}
              onBanClick={authUser?.is_super_admin ? setBanningUser : null}
              onDeleteClick={authUser?.is_super_admin ? setDeletingUser : null}
            />
          </motion.div>
        </main>
      </div>

      {/* Dialogs */}
      {editingUser && <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} onSuccess={fetchUsers} />}
      <ActivatePlanDialog
        isOpen={!!activatingUser}
        setIsOpen={() => setActivatingUser(null)}
        userToActivate={activatingUser}
        plans={plans}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        handleActivatePlan={handleActivatePlan}
        updating={updating}
      />
      <ResetProfileDialog
        isOpen={!!resettingUser}
        setIsOpen={() => setResettingUser(null)}
        userToReset={resettingUser}
        handleConfirmReset={handleConfirmReset}
        updating={updating}
      />
      <PasswordResetDialog
        isOpen={!!passwordResettingUser}
        setIsOpen={() => setPasswordResettingUser(null)}
        userForPasswordReset={passwordResettingUser}
        handleConfirmPasswordReset={handleConfirmPasswordReset}
        updating={updating}
      />
      {adjustingBalanceUser && (
        <AdjustBalanceDialog
          isOpen={!!adjustingBalanceUser}
          onClose={() => setAdjustingBalanceUser(null)}
          user={adjustingBalanceUser}
          onSubmit={handleAdjustBalance}
          isSubmitting={updating}
        />
      )}
      <BanUserDialog
        user={banningUser}
        isOpen={!!banningUser}
        onClose={() => setBanningUser(null)}
        onConfirm={handleBanUser}
        isSubmitting={updating}
      />
      <DeleteUserDialog
        user={deletingUser}
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        isSubmitting={updating}
      />
    </>
  );
};

export default AdminPage;