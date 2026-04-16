import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, DollarSign, Banknote, User, Hash, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const WithdrawPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !bankName || !accountHolder || !accountNumber) {
      toast({ title: "Error", description: "Por favor completa todos los campos.", variant: "destructive" });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Error", description: "El monto debe ser un número positivo.", variant: "destructive" });
      return;
    }
    if (user && numericAmount > user.balance) {
      toast({ title: "Error", description: "No puedes retirar más de tu balance actual.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc('request_withdrawal', {
        p_amount: numericAmount,
        p_payment_method: bankName,
        p_payment_details: { bankName, accountHolder, accountNumber },
      });
      if (error) throw error;
      try {
        await supabase.functions.invoke('send-withdrawal-notification', {
          body: JSON.stringify({ userEmail: user.email, userName: user.name,
            amount: numericAmount.toFixed(2), bankName, accountHolder, accountNumber }),
        });
      } catch (emailError) { console.error('Email error:', emailError); }
      toast({
        title: "Solicitud Enviada",
        description: `Tu solicitud de retiro por $${numericAmount.toFixed(2)} USD ha sido enviada. Se procesará en 2-3 días hábiles.`,
        className: "bg-green-600 text-white",
      });
      navigate('/withdrawals');
    } catch (error) {
      toast({ title: "Error", description: error.message || "Hubo un problema. Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ FIX: py-8 en lugar de justify-center para que el contenido empiece desde arriba
    // y no quede tapado por el GlobalHeader. App.jsx ya aplica pt-12.
    <div className="min-h-screen gradient-bg trading-grid flex flex-col items-center py-8 px-4">

      {/* Botón volver — fluye con el contenido, no es absolute */}
      <div className="w-full max-w-lg mb-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-lg"
      >
        <Card className="glass-effect border-gray-700 glow-green shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">Solicitar Retiro</CardTitle>
            <CardDescription className="text-gray-300">
              Ingresa los detalles para procesar tu retiro. Balance actual:{' '}
              <span className="font-bold text-green-400">
                ${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Monto a Retirar (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="amount" type="number" step="0.01" placeholder="Ej: 500.00"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 bg-slate-800 border-gray-600 text-white focus:border-green-500" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-white">Nombre del Banco</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="bankName" type="text" placeholder="Ej: Banco Internacional"
                    value={bankName} onChange={(e) => setBankName(e.target.value)}
                    className="pl-10 bg-slate-800 border-gray-600 text-white focus:border-green-500" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder" className="text-white">Nombre del Titular</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="accountHolder" type="text" placeholder="Ej: Juan Pérez"
                    value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)}
                    className="pl-10 bg-slate-800 border-gray-600 text-white focus:border-green-500" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-white">Número de Cuenta</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="accountNumber" type="text" placeholder="Ej: 1234567890"
                    value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                    className="pl-10 bg-slate-800 border-gray-600 text-white focus:border-green-500" required />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button type="submit" disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 glow-green text-lg py-3">
                  {loading
                    ? <motion.div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Send className="w-5 h-5 mr-2" />Enviar Solicitud de Retiro</>
                  }
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WithdrawPage;