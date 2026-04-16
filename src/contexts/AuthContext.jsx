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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        
        // Handle 401 Unauthorized explicitly
        if (error.code === '401' || error.status === 401) {
            await handleLogout("Sesión inválida");
            return null;
        }

        // Don't clear user on generic network error, just return basic auth user
      }

      const userProfile = {
        ...authUser,
        ...profile,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
        isAdmin: profile?.is_admin || false,
        is_super_admin: profile?.is_super_admin || false,
        balance: profile?.balance ?? 0,
        bonus: profile?.bonus ?? 0,
        profit: profile?.profit ?? 0,
        drawdown: profile?.drawdown ?? 0,
        trading_days: profile?.trading_days ?? 0,
        account_type: profile?.account_type || 'Basic',
        hasPurchasedPlan: profile?.has_purchased_plan || false,
        rules_profile: profile?.rules_profile || 'standard',
        mt4_credentials: profile?.mt4_credentials || null,
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
        console.log('Logging out...');
        clearDemoMode();
        
        // Clear Supabase session
        const { error } = await supabase.auth.signOut();
        if (error) console.error("SignOut error:", error);

        // Force cleanup local storage to remove potential stale tokens
        localStorage.removeItem('sb-cgfjgosmqfsoypmfqnhq-auth-token'); 
        
        setUser(null);
        
        if (reason) {
            toast({
                title: "Sesión cerrada",
                description: reason,
                variant: "destructive"
            });
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
      
      if (error) {
          if (error.message && (error.message.includes('Invalid Refresh Token') || error.message.includes('refresh_token_not_found'))) {
              await handleLogout("Tu sesión ha expirado por seguridad. Por favor ingresa nuevamente.");
              return;
          }
      }

      if (session?.user) {
        await fetchUserProfile(session.user);
      }
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
      isAdmin: false,
      is_super_admin: false,
      isDemo: true, 
      mt4_credentials: {
        server: 'Tradea-Demo',
        login: '123456',
        password: 'demopassword'
      },
      ctrader_credentials: {
        server: 'Tradea-Live',
        login: '654321',
        password: 'demopassword'
      },
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

        if (isDemoMode) {
          setDemoUser();
          return;
        }

        await assignSuperAdminRoleIfNeeded();

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          // Auto cleanup if token is bad
          if (sessionError.message?.includes('Invalid Refresh Token')) {
             await handleLogout();
          }
          setLoading(false);
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);

        if (!mounted) return;

        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        if (isDemoMode && event === 'SIGNED_OUT') {
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          clearDemoMode(); 
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed, update profile if needed or just sync state
          console.log("Token refreshed successfully");
          // Optionally fetch profile again to ensure checks pass
          // await fetchUserProfile(session.user); 
        } else if (event === 'USER_UPDATED' && session?.user) {
            await fetchUserProfile(session.user);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, assignSuperAdminRoleIfNeeded, setDemoUser, clearDemoMode, handleLogout]);

  const login = async (email, password) => {
    if (email === 'demo@tradea.com' && password === 'demo123') {
      setDemoUser();
      return;
    }

    clearDemoMode(); 
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password, fullName) => {
    clearDemoMode(); 
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
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