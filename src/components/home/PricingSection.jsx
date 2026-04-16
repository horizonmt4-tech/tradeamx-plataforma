import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const PricingSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleGetStarted = () => {
    navigate('/plans');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) return null;

  return (
    <section id="pricing-section" className="py-20 relative overflow-hidden bg-[#0a0f1a]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto"
        >
          {loading ? (
             Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-[#111827] border border-gray-800 h-[600px] rounded-xl animate-pulse"></div>
             ))
          ) : (
            plans.map((plan) => {
              const isFeatured = plan.is_featured;
              const features = Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []);

              return (
                <motion.div key={plan.id} variants={itemVariants} className="h-full relative">
                   {isFeatured && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30 w-full text-center pointer-events-none">
                        <span className="bg-[#d4af37] text-black text-[11px] font-extrabold px-6 py-2 rounded-full inline-flex items-center shadow-xl shadow-yellow-900/40 uppercase tracking-widest gap-1.5 mx-auto ring-4 ring-[#0a0f1a]">
                          <Star className="w-3.5 h-3.5 fill-black text-black" />
                          Most Popular
                        </span>
                      </div>
                    )}

                  <Card className={`
                    h-full flex flex-col relative transition-all duration-300 rounded-xl
                    bg-[#111827] backdrop-blur-md group
                    ${isFeatured ? 'border-2 border-[#d4af37] shadow-xl shadow-[#d4af37]/5 z-20 mt-0' : 'border border-gray-800 hover:border-gray-600 mt-0'}
                  `}>
                    <CardHeader className="text-center pt-10 pb-2">
                      <CardTitle className={`text-xl font-bold mb-1 ${isFeatured ? 'text-[#d4af37]' : 'text-white'}`}>
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                          ${(plan.capital || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Trading Capital
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col px-4 pb-6 pt-4">
                      <div className="flex justify-center mb-6">
                         <div className={`px-5 py-1.5 rounded-full border ${isFeatured ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]' : 'bg-gray-800 border-gray-700 text-white'}`}>
                           <span className="text-xl font-bold">${plan.price}</span>
                           <span className="text-[10px] ml-1 opacity-70">USD</span>
                         </div>
                      </div>

                      <div className="space-y-2.5 mb-6 flex-grow">
                        {features.slice(0, 6).map((feature, i) => (
                          <div key={i} className="flex items-start">
                            <CheckCircle className={`w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 ${isFeatured ? 'text-[#d4af37]' : 'text-blue-500/80'}`} />
                            <span className="text-gray-400 text-xs font-medium leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-2">
                        <Button 
                          onClick={handleGetStarted}
                          className={`w-full font-bold h-10 text-xs uppercase tracking-wide transition-all duration-300 shadow-lg group
                            ${isFeatured ? 'bg-[#d4af37] hover:bg-[#b5952f] text-black hover:shadow-[#d4af37]/20' : 'bg-gray-700 hover:bg-gray-600 text-white'}
                          `}
                        >
                          Get Started 
                          <ChevronRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;