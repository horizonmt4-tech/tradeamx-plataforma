import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const CTASection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePricingScroll = () => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'pricing-section' } });
    } else {
      scrollToSection('pricing-section');
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20 z-0"></div>
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar tu carrera como trader profesional?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de traders que ya están generando ingresos con TradeAMX
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handlePricingScroll}
              size="lg" 
              className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold h-12 px-8 text-lg rounded-full shadow-lg"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;