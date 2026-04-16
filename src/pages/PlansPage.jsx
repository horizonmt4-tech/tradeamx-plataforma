import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import PricingSection from '@/components/home/PricingSection';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const PlansPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Funding Plans | TradeAMX</title>
        <meta name="description" content="Explore TradeAMX funding plans for professional traders." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24">
        
        {/* Page Header */}
        <section className="relative py-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] to-[#111827]"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4"
                >
                    Choose Your <span className="text-[#d4af37]">Path to Success</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-400 max-w-3xl mx-auto"
                >
                    Transparent rules, competitive pricing, and the capital you need to succeed.
                </motion.p>
            </div>
        </section>
        
        <PricingSection />
        
        <section className="py-20 bg-[#0a0f1a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">Why Choose TradeAMX?</h2>
                    <p className="text-gray-400">Industry leading conditions designed for your growth.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "No Time Limits", desc: "Take your time to pass the challenge. We don't pressure you with deadlines." },
                        { title: "Bi-Weekly Payouts", desc: "Get paid faster. Request withdrawals every 14 days after your first trade." },
                        { title: "Scale up to $2M", desc: "Consistent traders can scale their account size up to $2,000,000." }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 bg-[#111827] rounded-xl border border-gray-800 hover:border-[#d4af37]/50 transition-colors"
                        >
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlansPage;