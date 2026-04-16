import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Star, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

const PlanSelectionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { initiateCheckout, loading: checkoutLoading } = useStripeCheckout();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('funding_plans')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (planId) => {
    // We don't have the email yet, so we just pass planId. 
    // The user will enter email during Stripe checkout or we rely on Stripe to collect it.
    // However, the task says 'accepts plan_id and email'. 
    // If we want to pre-fill email, we would need an input here. 
    // Assuming for now we redirect to Stripe and Stripe collects email or we let user proceed without pre-filling it in Stripe if not logged in.
    initiateCheckout(planId, null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-4">
              Choose Your Funding Plan
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select the capital level that suits your trading style and start your journey today.
            </p>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
             </div>
          ) : error ? (
             <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-white text-lg">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                   <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </Button>
             </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {plans.map((plan) => {
                const features = Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []);
                const isFeatured = plan.is_featured;

                return (
                  <motion.div key={plan.id} variants={itemVariants} className="h-full">
                    <Card className={`
                      h-full flex flex-col relative transition-all duration-300 rounded-xl overflow-hidden
                      bg-[#111827] border-gray-800 hover:border-[#d4af37]/50 hover:shadow-2xl hover:shadow-[#d4af37]/10 hover:scale-[1.02]
                      ${isFeatured ? 'border-[#d4af37] shadow-xl shadow-[#d4af37]/5 ring-1 ring-[#d4af37]/20' : ''}
                    `}>
                      {isFeatured && (
                         <div className="bg-[#d4af37] text-black text-[10px] font-bold text-center py-1 uppercase tracking-widest">
                            Most Popular
                         </div>
                      )}
                      
                      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#d4af37]/5 to-transparent opacity-50 pointer-events-none" />

                      <CardHeader className="text-center pt-8 pb-4 relative z-10">
                        <CardTitle className="text-xl font-bold text-white mb-2">{plan.name}</CardTitle>
                        <div className="text-4xl font-extrabold text-white tracking-tight">
                          ${parseInt(plan.capital).toLocaleString()}
                        </div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                          Trading Capital
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow px-6 relative z-10">
                         <div className="flex justify-center mb-6">
                            <div className="inline-flex items-baseline px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
                               <span className="text-2xl font-bold text-[#d4af37]">${plan.price}</span>
                               <span className="text-xs text-gray-400 ml-1">USD</span>
                            </div>
                         </div>

                         <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-400">Profit Split</span>
                               <span className="text-green-400 font-bold">{plan.profit_split}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-400">Daily Loss</span>
                               <span className="text-white font-medium">{plan.max_daily_loss}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-400">Profit Target</span>
                               <span className="text-blue-400 font-bold">{plan.profit_target}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-400">Period</span>
                               <span className="text-white font-medium">{plan.trading_period}</span>
                            </div>
                         </div>

                         <div className="space-y-3 mb-6 pt-4 border-t border-gray-800">
                            {features.slice(0, 5).map((feature, i) => (
                              <div key={i} className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-[#d4af37] mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400 text-xs font-medium">{feature}</span>
                              </div>
                            ))}
                         </div>
                      </CardContent>

                      <CardFooter className="pb-8 px-6 relative z-10">
                        <Button 
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled={checkoutLoading}
                          className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold h-12 rounded-lg shadow-lg shadow-[#d4af37]/20 transition-all uppercase tracking-wide"
                        >
                          {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay Now'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlanSelectionPage;