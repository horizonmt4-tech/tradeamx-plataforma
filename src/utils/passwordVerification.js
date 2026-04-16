import { supabase } from '@/lib/supabaseClient';

/**
 * Verifies the system/admin password using the Edge Function
 * @param {string} password - The password to verify
 * @returns {Promise<boolean>} - True if authorized, false otherwise
 */
export const verifyAdminPassword = async (password) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-admin-password', {
      body: { password }
    });

    if (error) {
      console.error('Error verifying admin password:', error);
      throw error;
    }

    return data?.authorized === true;
  } catch (err) {
    console.error('Verification utility error:', err);
    throw new Error('No se pudo verificar la contraseña. Intente nuevamente.');
  }
};

/**
 * Resets the system password without requiring the old one (Super Admin only)
 * @param {string} newPassword - The new password to set
 * @returns {Promise<Object>} - Result object with success and message
 */
export const resetSystemPassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.functions.invoke('reset-system-password', {
      body: { newPassword }
    });

    if (error) {
      console.error('Error resetting system password:', error);
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.message || 'Error al restablecer la contraseña');
    }

    return data;
  } catch (err) {
    console.error('Reset utility error:', err);
    throw new Error(err.message || 'No se pudo restablecer la contraseña.');
  }
};