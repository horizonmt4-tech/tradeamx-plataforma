import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const stripePromise = loadStripe('pk_live_51Ram6dG8LIOEEY3AYJTCYpXm9P6nmzNnFyunwIEmQRpOyy4KF8Bfcjx0QyMxCHT1ga5e4Ur67ItEjvWkBak3MbgY00rEMY6O4A');

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initiateCheckout = async (planId, email) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan_id: planId, email }
      });

      if (error) {
        throw new Error(error.message || 'Error creating checkout session');
      }

      if (!data?.sessionId) {
        throw new Error('No session ID returned from server');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) {
        throw stripeError;
      }

    } catch (err) {
      console.error('Checkout error:', err);
      toast({
        title: "Checkout Error",
        description: err.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { initiateCheckout, loading };
};

export default useStripeCheckout;