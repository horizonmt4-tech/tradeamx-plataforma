import React, { createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const SuperAdminAuthContext = createContext();

export const useSuperAdminAuth = () => {
  const context = useContext(SuperAdminAuthContext);
  if (!context) {
    throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider');
  }
  return context;
};

export const SuperAdminAuthProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const checkAuthorization = async () => {
    if (!user?.is_super_admin) {
      toast({
        title: 'Acceso Denegado',
        description: 'Solo el súper administrador puede realizar esta acción.',
        variant: 'destructive',
      });
      return false;
    }

    const password = prompt('Ingresa la contraseña de súper administrador:');
    if (!password) return false;

    const { data, error } = await supabase.functions.invoke('verify-super-admin-password', {
      body: JSON.stringify({ password }),
    });

    if (error || !data?.valid) {
      toast({
        title: 'Contraseña Incorrecta',
        description: 'La contraseña ingresada no es válida.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const value = {
    checkAuthorization,
  };

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
};