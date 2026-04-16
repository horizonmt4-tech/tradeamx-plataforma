import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';

const RiskDisclosurePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Risk Disclosure | Tradea</title>
        <meta name="description" content="Important risk disclosure information regarding trading activities." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <header className="border-b border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Risk Disclosure</h1>
            <p className="text-gray-400 text-lg">Last Updated: January 2026</p>
          </header>

          <section className="bg-red-900/10 border border-red-900/30 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-red-400">High Risk Warning</h2>
            <p className="text-gray-300 leading-relaxed">
              Trading foreign exchange (Forex) and Contracts for Difference (CFDs) carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">1. Trading Involves Losses</h2>
            <p className="text-gray-300 leading-relaxed">
              Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. There is a possibility that you could sustain a loss of some or all of your initial investment. You should not invest money that you cannot afford to lose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">2. No Profit Guarantee</h2>
            <p className="text-gray-300 leading-relaxed">
              Tradea makes no guarantees of profit or freedom from loss. Past performance of any trading system or methodology is not necessarily indicative of future results. The simulated environment provided during evaluations may not perfectly reflect real market conditions such as slippage or liquidity gaps.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">3. Virtual vs Real Capital</h2>
            <p className="text-gray-300 leading-relaxed">
              All accounts provided during the "Challenge" and "Verification" phases are demo accounts with virtual funds. Success in a simulated environment does not guarantee success in a live trading environment. Market psychology and emotional factors play a significant role in live trading which may not be present in simulation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">4. User Responsibility</h2>
            <p className="text-gray-300 leading-relaxed">
              You acknowledge that you are solely responsible for your trading decisions. Tradea does not provide financial advice, recommendations, or signals. Any information provided on this website is for educational purposes only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">5. Recommended Education</h2>
            <p className="text-gray-300 leading-relaxed">
              We strongly recommend that you educate yourself on the risks associated with foreign exchange trading and seek advice from an independent financial or tax advisor if you have any questions.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RiskDisclosurePage;