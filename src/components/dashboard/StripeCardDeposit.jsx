import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, DollarSign } from 'lucide-react';
import { useStripeDeposit } from '@/hooks/useStripeDeposit';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@/components/ui/use-toast';

const STRIPE_PK = 'pk_live_51U0X2vKGRgjtMECaxuVbLgjjqBTXe5OCju0IZOz3KpriA7LDmwIQ0DNMt4aK4Ab0lkHyO3c5QeCId8kKzKgi2NsL00cOhfHp2t';
console.log('Stripe Publishable Key loaded:', STRIPE_PK.substring(0, 8) + '...');
const stripePromise = loadStripe(STRIPE_PK);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af'
      },
      iconColor: '#60a5fa',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  }
};

const StripeCardDepositForm = ({ initialAmount, onSuccess }) => {
  const [amount, setAmount] = useState(initialAmount || '10');
  const { createPaymentIntent, confirmPaymentBackend, loading, setLoading } = useStripeDeposit();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    const numAmount = parseFloat(amount);
    if (numAmount < 10) {
      toast({ title: "Monto inválido", description: "El mínimo es $10 USD.", variant: "destructive" });
      return;
    }

    const clientSecret = await createPaymentIntent(numAmount, user.id, user.email);
    if (!clientSecret) return;

    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user.email,
            name: user.full_name || 'Trader',
          },
        },
      });

      if (error) {
        toast({
          title: "Error en el pago",
          description: error.message,
          variant: "destructive"
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        const confirmed = await confirmPaymentBackend(paymentIntent.id, user.id);
        if (confirmed && onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al procesar la tarjeta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDeposit} className="space-y-6 max-w-sm mx-auto p-4 bg-slate-900/50 rounded-xl border border-slate-700">
      <div className="text-center space-y-2">
        <CreditCard className="w-12 h-12 text-blue-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Pago con Tarjeta Segura</h3>
        <p className="text-sm text-gray-400">Procesado de forma segura a través de Stripe</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="stripe-amount" className="text-gray-300">Monto del Depósito (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="stripe-amount"
              type="number"
              min="10"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-600 text-white font-semibold text-lg"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500">Mínimo depósito: $10 USD</p>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Datos de la Tarjeta</Label>
          <div className="p-4 bg-slate-800 border border-slate-600 rounded-md">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <Button 
          type="submit"
          disabled={!stripe || loading || !amount || parseFloat(amount) < 10}
          className="w-full bg-blue-600 hover:bg-blue-700 glow-blue text-white py-6 text-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            `Pagar $${amount} USD`
          )}
        </Button>
      </div>
    </form>
  );
};

const StripeCardDeposit = ({ initialAmount, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardDepositForm initialAmount={initialAmount} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripeCardDeposit;