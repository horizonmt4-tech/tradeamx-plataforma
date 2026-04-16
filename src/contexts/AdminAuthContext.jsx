import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminLockDialog from '@/components/admin/AdminLockDialog';
import SuperAdminLockDialog from '@/components/admin/SuperAdminLockDialog';
import { useAuth } from './AuthContext';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};

export const AdminAuthProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [onSuccess, setOnSuccess] = useState(null);

  useEffect(() => {
    setIsAuthorized(false);
  }, [user]);

  const checkAuthorization = (callback) => {
    if (isAuthorized) {
      callback();
    } else {
      setOnSuccess(() => () => callback());
      setShowLock(true);
    }
  };

  const handlePasswordSubmit = async (password) => {
    setIsChecking(true);
    try {
      const functionName = user?.is_super_admin ? 'verify-super-admin-password' : 'verify-admin-password';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { password },
      });

      if (error) throw new Error(error.message);
      
      if (data.authorized) {
        setIsAuthorized(true);
        setShowLock(false);
        if (onSuccess) {
          onSuccess();
        }
        return { success: true };
      } else {
        return { success: false, message: 'Contraseña incorrecta.' };
      }
    } catch (err) {
      return { success: false, message: 'Error de comunicación con el servidor.' };
    } finally {
      setIsChecking(false);
    }
  };

  const value = {
    isAuthorized,
    checkAuthorization,
  };

  const LockDialog = user?.is_super_admin ? SuperAdminLockDialog : AdminLockDialog;

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
      <LockDialog
        isOpen={showLock}
        onClose={() => setShowLock(false)}
        onSubmit={handlePasswordSubmit}
        isChecking={isChecking}
      />
    </AdminAuthContext.Provider>
  );
};