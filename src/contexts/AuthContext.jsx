import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const assignSuperAdminRoleIfNeeded = useCallback(async () => {
    const hasRun = localStorage.getItem('superAdminAssigned');
    if (!hasRun) {
      try {
        const { error } = await supabase.rpc('assign_super_admin_role');
        if (!error) {
          localStorage.setItem('superAdminAssigned', 'true');
        }
      } catch (error) {
        console.error("Exception during super admin assignment:", error);
      }
    }
  }, []);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      // Traer perfil + datos de la oficina en una sola query
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, offices(id, name, code, color)')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        if (error.code === '401' || error.status === 401) {
          await handleLogout("Sesión inválida");
          return null;
        }
      }

      // ── Determinar rol del usuario ──────────────────────────
      // Prioridad: campo 'role' en profiles → flags legacy is_admin / is_super_admin
      const role = profile?.role || (
        profile?.is_super_admin ? 'manager' :
        profile?.is_admin       ? 'retencion' :
        'client'
      );

      const userProfile = {
        ...authUser,
        ...profile,
        full_name:    profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
        name:         profile?.full_name || authUser.user_metadata?.full_name || authUser.email,

        // ── Roles ─────────────────────────────────────────────
        role,
        isAdmin:       role === 'retencion' || role === 'manager',
        is_super_admin: role === 'manager',
        isManager:     role === 'manager',
        isRetencion:   role === 'retencion',
        isVentas:      role === 'ventas',
        isClient:      role === 'client',

        // ── Oficina ───────────────────────────────────────────
        office_id:    profile?.office_id || null,
        office:       profile?.offices || null,   // { id, name, code, color }
        office_name:  profile?.offices?.name || 'TaurusFX',
        office_code:  profile?.offices?.code || 'TAURUXFX',

        // ── Datos financieros ──────────────────────────────────
        balance:      profile?.balance ?? 0,
        bonus:        profile?.bonus ?? 0,
        profit:       profile?.profit ?? 0,
        drawdown:     profile?.drawdown ?? 0,
        trading_days: profile?.trading_days ?? 0,
        account_type: profile?.account_type || 'Basic',
        hasPurchasedPlan: profile?.has_purchased_plan || false,
        rules_profile: profile?.rules_profile || 'standard',
        mt4_credentials:    profile?.mt4_credentials || null,
        ctrader_credentials: profile?.ctrader_credentials || null,
      };

      setUser(userProfile);
      setLoading(false);
      return userProfile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  const handleLogout = useCallback(async (reason = null) => {
    try {
      clearDemoMode();
      const { error } = await supabase.auth.signOut();
      if (error) console.error("SignOut error:", error);
      localStorage.removeItem('sb-cgfjgosmqfsoypmfqnhq-auth-token');
      setUser(null);
      if (reason) {
        toast({ title: "Sesión cerrada", description: reason, variant: "destructive" });
      }
    } catch (err) {
      console.error("Logout exception:", err);
      setUser(null);
    }
  }, [toast]);

  const refreshUser = useCallback(async () => {
    if (user?.email === 'demo@tradea.com') return;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error?.message?.includes('Invalid Refresh Token')) {
        await handleLogout("Tu sesión ha expirado. Por favor ingresa nuevamente.");
        return;
      }
      if (session?.user) await fetchUserProfile(session.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [fetchUserProfile, user, handleLogout]);

  const setDemoUser = useCallback(() => {
    const demoUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo@tradea.com',
      full_name: 'Usuario Demo',
      name: 'Usuario Demo',
      account_type: 'Elite',
      balance: 100000,
      bonus: 5000,
      profit: 1250.75,
      drawdown: 2.5,
      trading_days: 15,
      hasPurchasedPlan: true,
      rules_profile: 'standard',
      role: 'client',
      isAdmin: false,
      is_super_admin: false,
      isManager: false,
      isRetencion: false,
      isVentas: false,
      isClient: true,
      isDemo: true,
      office_id: null,
      office: null,
      office_name: 'TaurusFX',
      office_code: 'TAURUXFX',
      mt4_credentials: { server: 'Tradea-Demo', login: '123456', password: 'demopassword' },
      ctrader_credentials: { server: 'Tradea-Live', login: '654321', password: 'demopassword' },
    };
    setUser(demoUser);
    setLoading(false);
    localStorage.setItem('isDemoMode', 'true');
  }, []);

  const clearDemoMode = useCallback(() => {
    localStorage.removeItem('isDemoMode');
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        if (isDemoMode) { setDemoUser(); return; }

        await assignSuperAdminRoleIfNeeded();

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (sessionError.message?.includes('Invalid Refresh Token')) await handleLogout();
          setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else {
          if (mounted) { setUser(null); setLoading(false); }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) { setUser(null); setLoading(false); }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        if (isDemoMode && event === 'SIGNED_OUT') return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          clearDemoMode();
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'USER_UPDATED' && session?.user) {
          await fetchUserProfile(session.user);
        }
      }
    );

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchUserProfile, assignSuperAdminRoleIfNeeded, setDemoUser, clearDemoMode, handleLogout]);

  const login = async (email, password) => {
    if (email === 'demo@tradea.com' && password === 'demo123') {
      setDemoUser(); return;
    }
    clearDemoMode();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password, fullName) => {
    clearDemoMode();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const logout = () => handleLogout();

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    refreshUser,
    setDemoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};