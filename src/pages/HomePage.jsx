import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/home/Navbar';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import AboutSection from '@/components/home/AboutSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/home/Footer';
import StockTickerBanner from '@/components/home/StockTickerBanner';
import PaymentSecurityInfo from '@/components/home/PaymentSecurityInfo';
import { scrollToSection } from '@/lib/utils';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we need to scroll to a section from navigation state
    if (location.state?.scrollTo) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToSection(location.state.scrollTo);
      }, 100);
      
      // Clean up state history if possible to prevent scroll on refresh (optional, but good UX)
      // window.history.replaceState({}, document.title)
    } else if (location.hash) {
      // Fallback for direct hash access
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      <Navbar />
      <StockTickerBanner />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <PaymentSecurityInfo />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;