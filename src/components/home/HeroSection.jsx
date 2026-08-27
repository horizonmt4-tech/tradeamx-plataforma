import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const HeroSection = () => {
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
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center items-center overflow-hidden bg-[#0a0f1a] pt-32 pb-16">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#111827] to-[#0a0f1a] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0f1a]/0 to-transparent pointer-events-none"></div>
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.22, 1, 0.36, 1],
            type: "spring"
          }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-[#d4af37]/10 blur-[60px] rounded-full"></div>
          <img 
            src="/IMG-20260210-WA0040.jpg" 
            alt="TradeAMX - Funding Tomorrow's Traders" 
            className="w-[120px] md:w-[150px] h-auto object-contain relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-10 max-w-4xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
            TRADEAMX
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#d4af37] tracking-widest uppercase mb-6 drop-shadow-md">
            FUNDING TOMORROW'S TRADERS
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Unlock your trading potential with professional capital. <span className="text-white font-medium">No risk to your own funds</span>, unlimited growth potential.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-lg mx-auto"
        >
          <div className="flex-1">
            <Button 
              onClick={handlePricingScroll}
              className="w-full h-14 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold text-lg rounded-xl shadow-lg shadow-[#d4af37]/20 transition-all duration-300 group hover:-translate-y-1"
            >
              Ver Planes
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <Link to="/about" className="flex-1">
            <Button 
              variant="outline"
              className="w-full h-14 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
            >
              Aprende Más
              <Info className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
