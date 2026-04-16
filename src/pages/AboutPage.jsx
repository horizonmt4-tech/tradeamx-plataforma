import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';
import { Target, Eye, Lightbulb, Users } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>About Us | Tradea</title>
        <meta name="description" content="Learn about Tradea's mission, vision, and values." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
               Empowering Traders <span className="text-[#d4af37]">Worldwide</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We provide the capital, you provide the talent. Together, we unlock your true trading potential.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-[#d4af37]/30 transition-colors">
                <div className="bg-[#d4af37]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <Target className="w-6 h-6 text-[#d4af37]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-gray-300 leading-relaxed">
                    To democratize access to professional trading capital. We believe that financial constraints shouldn't hold back talented traders. Our mission is to identify disciplined traders and provide them with the funding and tools they need to succeed in the global financial markets.
                </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-[#d4af37]/30 transition-colors">
                 <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-gray-300 leading-relaxed">
                    To become the premier proprietary trading firm in Latin America and beyond. We envision a community where traders grow through merit, transparency, and continuous education, setting new standards for integrity in the prop trading industry.
                </p>
            </div>
          </div>

          <section>
             <h2 className="text-3xl font-bold text-white text-center mb-10">Core Values</h2>
             <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-center">
                    <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Innovation</h3>
                    <p className="text-gray-400 text-sm">Constantly improving our technology and platform to give you the edge.</p>
                 </div>
                 <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-center">
                    <Users className="w-8 h-8 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
                    <p className="text-gray-400 text-sm">Building a supportive network where traders can learn and grow together.</p>
                 </div>
                 <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-center">
                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Transparency</h3>
                    <p className="text-gray-400 text-sm">Clear rules, no hidden fees, and honest communication at every step.</p>
                 </div>
             </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;