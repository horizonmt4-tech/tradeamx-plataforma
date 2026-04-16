import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Lock, ArrowRight, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PK = 'pk_live_51TJdWSB0dcR9Y7FQENnz7hFRMkiaDWHnJlj1jRpFx224udkzhv3CJfBfU7blkno2Z08nPXi95CytB8kjOpPeDrsX00jbanyAWn';
const stripePromise = loadStripe(STRIPE_PK);

const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [plan, setPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);

  useEffect(() => {
    const trackCart = async () => {
      if (user && planId) {
        try {
          await supabase
            .from('profiles')
            .update({
              current_cart: {
                planId: planId,
                addedAt: new Date().toISOString(),
                status: 'in_checkout'
              }
            })
            .eq('id', user.id);
        } catch (error) {
          console.error("Error tracking cart:", error);
        }
      }
    };

    trackCart();
  }, [user, planId]);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      setInitializing(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('funding_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error("Plan not found");
        
        setPlan(data);
        
        if (!data.price_id) {
          console.warn("Warning: Plan loaded but missing price_id");
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        setError("No se pudo cargar la información del plan.");
        toast({
          title: "Error",
          description: "No se pudo cargar la información del plan.",
          variant: "destructive"
        });
      } finally {
        setInitializing(false);
      }
    };

    fetchPlan();
  }, [planId, navigate, toast]);

  const handlePayment = async () => {
    if (!user) {
        toast({ title: "Acceso requerido", description: "Por favor inicia sesión para continuar.", variant: "destructive" });
        navigate('/login', { state: { from: `/checkout/${planId}` } });
        return;
    }

    if (!plan) return;

    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'card') {
        
        if (!plan.price_id) {
           throw new Error("Configuración incompleta: El plan no tiene un ID de precio (price_id).");
        }

        toast({
          title: "Iniciando pago seguro",
          description: "Preparando sesión de Stripe...",
        });

        const requestPayload = { 
            price_id: plan.price_id,
            planId: plan.id,
            user_id: user.id,
            email: user.email,
            clientReferenceId: user.id,
            successUrl: `${window.location.origin}/dashboard`,
            cancelUrl: `${window.location.origin}/checkout/${planId}`,
            metadata: {
              plan_name: plan.name
            }
        };

        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-checkout-session', {
            body: requestPayload
        });

        if (sessionError) {
            throw new Error(`Error de conexión: ${sessionError.message}`);
        }

        if (sessionData?.error) {
            throw new Error(`Error del servidor: ${sessionData.error}`);
        }

        if (!sessionData?.sessionId) {
            throw new Error("Respuesta inválida del servidor de pagos.");
        }

        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe no se pudo inicializar.");

        const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: sessionData.sessionId
        });

        if (stripeError) {
             throw stripeError;
        }

      } else {
        toast({
          title: "Redirigiendo",
          description: "Conectando con pasarela de criptomonedas...",
        });
        
        setTimeout(() => {
             window.location.href = "https://example.com/crypto-payment"; 
        }, 1500);
      }

    } catch (err) {
      console.error("Payment Flow Exception:", err);
      const errorMessage = err.message || "Hubo un problema desconocido al procesar la solicitud.";
      setError(errorMessage);
      
      toast({
        title: "Error en el pago",
        description: errorMessage,
        variant: "destructive",
        action: <Button variant="outline" size="sm" onClick={handlePayment}>Reintentar</Button>
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
                <p className="text-gray-400 animate-pulse">Cargando detalles del plan...</p>
            </div>
        </div>
      );
  }

  if (error && !plan) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <Card className="max-w-md w-full bg-slate-800 border-red-900/50">
                <CardHeader className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <CardTitle className="text-white text-xl">Error al cargar</CardTitle>
                    <CardDescription className="text-gray-400">{error}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                    <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Recargar Página
                    </Button>
                </CardFooter>
            </Card>
        </div>
      );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 hover:text-white mb-4 pl-0">
                ← Volver a Planes
            </Button>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
              Finalizar Compra
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              Estás a un paso de obtener tu cuenta de fondeo de <span className="text-[#d4af37] font-semibold">${parseInt(plan.capital).toLocaleString()}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-slate-800 border-gray-700 h-full sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-gray-300 pb-4 border-b border-gray-700/50">
                    <span className="font-medium">Plan Seleccionado</span>
                    <span className="font-bold text-white">{plan.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Capital de Trading</span>
                    <span className="font-bold text-green-400">${parseInt(plan.capital).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Tarifa de Inscripción</span>
                    <span className="font-bold text-white">${plan.price}</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-extrabold text-white">
                      <span>Total a Pagar</span>
                      <span>${plan.price} USD</span>
                    </div>
                  </div>
                  
                  {error && (
                      <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-sm text-red-200 mt-4 flex gap-2 items-start">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{error}</span>
                      </div>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center text-sm">
                      <ShieldCheck className="w-4 h-4 mr-2"/> Garantía de Seguridad
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Tus datos están protegidos con encriptación SSL de 256 bits. No almacenamos la información de tu tarjeta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Selection */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="bg-slate-800 border-gray-700 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white">Método de Pago</CardTitle>
                  <CardDescription>Selecciona cómo deseas realizar el pago.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                    <div className="px-6 pb-2">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-900 h-14 p-1">
                        <TabsTrigger value="card" className="h-full data-[state=active]:bg-slate-800 text-base">
                            <CreditCard className="w-4 h-4 mr-2" /> Tarjeta (Stripe)
                        </TabsTrigger>
                        <TabsTrigger value="crypto" className="h-full data-[state=active]:bg-slate-800 text-base">
                            <Wallet className="w-4 h-4 mr-2" /> Criptomonedas
                        </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <div className="p-6 bg-slate-800/50">
                        <TabsContent value="card" className="mt-0 space-y-4">
                            <div className="bg-slate-900 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">Pago seguro con Stripe</h3>
                                    <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                                        Serás redirigido a la pasarela de pago segura de Stripe para completar tu compra con tarjeta de crédito o débito.
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                                    <span className="text-xs border border-gray-600 px-2 py-1 rounded bg-slate-800 text-gray-400">VISA</span>
                                    <span className="text-xs border border-gray-600 px-2 py-1 rounded bg-slate-800 text-gray-400">Mastercard</span>
                                    <span className="text-xs border border-gray-600 px-2 py-1 rounded bg-slate-800 text-gray-400">Amex</span>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="crypto" className="mt-0">
                            <div className="bg-slate-900 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center space-y-4 border-dashed">
                                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
                                    <span className="text-2xl text-orange-500">₿</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">Pago con Criptomonedas</h3>
                                    <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                                        Paga con Bitcoin, Ethereum, USDT y más. La activación puede tardar unos minutos según la confirmación de la red.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
                <CardFooter className="bg-slate-900/50 p-6 border-t border-slate-700">
                  <Button 
                    className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold py-6 text-lg shadow-lg shadow-yellow-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Pagar ${plan.price} USD <ArrowRight className="ml-2 h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6 flex items-center justify-center text-xs text-gray-500 gap-6">
                <span className="flex items-center"><Lock className="w-3 h-3 mr-1" /> Pago Seguro 256-bit SSL</span>
                <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Datos Protegidos</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;