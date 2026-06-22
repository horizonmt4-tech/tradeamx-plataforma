import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { scrollToSection } from '@/lib/utils';




const Footer = () => {
  const [regulationInfo, setRegulationInfo] = useState({ text: 'Tradea está regulada por la Financial Conduct Authority (FCA).', number: 'Número de referencia FCA: #840402.' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchRegulationInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'regulation_info')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.value) {
          setRegulationInfo({
            text: data.value.text || 'Información de regulación no disponible.',
            number: data.value.number || ''
          });
        }
      } catch (error) {
        console.error("Error fetching regulation info:", error.message);
      }
    };

    fetchRegulationInfo();
  }, []);

  const handlePricingScroll = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'pricing-section' } });
    } else {
      scrollToSection('pricing-section');
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-12 text-center">
            {/* Logo Section */}
            <Link to="/" className="flex flex-col items-center space-y-4 mb-8">
               <img 
                src="https://horizons-cdn.hostinger.com/4cbc99ef-1375-4750-b360-c2cd4a566cc0/2fd39ff36c91274f9c9360d45b501e13.png" 
                alt="TradeAMX - Funding Tomorrow's Traders" 
                className="h-[60px] w-auto object-contain"
              />
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg mb-8">
              Empowering traders with professional capital. Join the fastest growing prop firm in Latin America and trade with confidence.
            </p>

            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors p-2 bg-white/5 rounded-full"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors p-2 bg-white/5 rounded-full"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors p-2 bg-white/5 rounded-full"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors p-2 bg-white/5 rounded-full"><Linkedin className="w-5 h-5" /></a>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-t border-slate-900 pt-12">
          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
               <li><Link to="/about" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">About Us</Link></li>
               <li><Link to="/contact" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Contact</Link></li>
               {/* Careers link points to plans as placeholder in original, keeping or updating? Prompt said only update Pricing links. */}
               <li><a href="#" onClick={handlePricingScroll} className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Careers</a></li>
            </ul>
          </div>
          
          {/* Trading Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Trading</h3>
            <ul className="space-y-3">
               <li><a href="#pricing-section" onClick={handlePricingScroll} className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Funding Plans</a></li>
               <li><a href="#pricing-section" onClick={handlePricingScroll} className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Pricing</a></li>
               <li><a href="#pricing-section" onClick={handlePricingScroll} className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Scaling Plan</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
               <li><Link to="/terms" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Terms & Conditions</Link></li>
               <li><Link to="/privacy" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Privacy Policy</Link></li>
               <li><Link to="/risk-disclosure" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Risk Disclosure</Link></li>
               <li><Link to="/cookies" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Cookie Policy</Link></li>
               <li><Link to="/aml-kyc" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">AML & KYC</Link></li>
               <li><Link to="/regulacion" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Información Legal y Regulatoria</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
               <li><Link to="/faq" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">FAQ</Link></li>
               <li><Link to="/contact" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">Help Center</Link></li>
               <li><a href="mailto:support@tradeamx.com" className="text-gray-400 hover:text-[#d4af37] text-sm transition-colors">support@tradeamx.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>{regulationInfo.text} {regulationInfo.number}</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} TradeAMX. All rights reserved.
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
             <p className="text-xs text-gray-500 leading-relaxed text-justify">
                <strong>Risk Warning:</strong> Trading Forex, CFDs, and other financial instruments on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. There is a possibility that you may sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks associated with foreign exchange trading and seek advice from an independent financial advisor if you have any doubts. The information on this website is not directed at residents of any country or jurisdiction where such distribution or use would be contrary to local law or regulation.
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;