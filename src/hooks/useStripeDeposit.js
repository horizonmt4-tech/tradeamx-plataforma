import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useStripeDeposit = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = async (amount, userId, email) => {
    if (amount < 10) {
      toast({
        title: "Monto muy bajo",
        description: "El depósito mínimo es de $10.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
        body: { amount, userId, email }
      });

      if (error) {
        throw new Error(error.message || 'Error al crear el intento de pago');
      }

      if (data?.clientSecret) {
        return data.clientSecret;
      } else {
        throw new Error('No se recibió el clientSecret del servidor');
      }
    } catch (err) {
      console.error('Payment intent error:', err);
      toast({
        title: "Error de pago",
        description: err.message || "Fallo al iniciar el depósito. Intenta nuevamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmPaymentBackend = async (paymentIntentId, userId) => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-stripe-payment', {
        body: { paymentIntentId, userId }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || 'Error al confirmar el pago en el servidor');
      }
      return true;
    } catch (err) {
      console.error('Confirm backend error:', err);
      toast({
        title: "Error de confirmación",
        description: "El pago se realizó pero hubo un problema actualizando el balance. Contacta a soporte.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { createPaymentIntent, confirmPaymentBackend, loading, setLoading };
};

export default useStripeDeposit;