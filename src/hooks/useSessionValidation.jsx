import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export const useSessionValidation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // If we were previously logged in (checked via local storage or similar), we might want to alert
        // But for now, just silently failing validation or logging out is safer to avoid loops
        return;
      }

      // Optional: Check token expiration specifically if needed
      const expiresAt = session?.expires_at;
      const now = Math.floor(Date.now() / 1000);
      
      if (expiresAt && expiresAt < now) {
         if (mounted) {
             console.warn("Session expired during validation check");
             await supabase.auth.signOut();
             navigate('/login');
             toast({
                 title: "Sesión expirada",
                 description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
                 variant: "destructive"
             });
         }
      }

    }, 60000); // Check every minute

    return () => {
        mounted = false;
        clearInterval(interval);
    };
  }, [navigate, toast]);
};

export default useSessionValidation;