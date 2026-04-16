import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Terms & Conditions | Tradea</title>
        <meta name="description" content="Terms and Conditions for using Tradea platform and services." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <header className="border-b border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Terms & Conditions</h1>
            <p className="text-gray-400 text-lg">Last Updated: January 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">1. Platform Usage</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using Tradea, you agree to be bound by these Terms. The platform is intended for users who are at least 18 years old. You agree to use the services only for lawful purposes and in accordance with these Terms. Unauthorized use of the platform may give rise to a claim for damages and/or be a criminal offense.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">2. User Account</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Registration:</strong> You must provide accurate, current, and complete information during the registration process.</li>
                <li><strong className="text-white">Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</li>
                <li><strong className="text-white">One Account Policy:</strong> Users are generally limited to one active profile unless explicitly authorized for multiple strategies.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">3. Trading Rules & Virtual Capital</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                All trading activities during the evaluation phases are conducted in a simulated environment with virtual capital.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Risk:</strong> There is no real financial risk of loss during the evaluation phase, but fees paid for challenges are non-refundable once trading has commenced.</li>
                <li><strong className="text-white">Parameters:</strong> Traders must adhere to specific rules regarding drawdown limits, profit targets, and trading days as defined in their specific plan.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">4. Withdrawals & Funds</h2>
            <p className="text-gray-300 leading-relaxed">
              Profit splits are paid out according to the schedule defined in your funded trader agreement. Payments are processed via bank transfer or cryptocurrency. You are responsible for any tax obligations related to your earnings in your jurisdiction. Withdrawal requests are subject to review to ensure compliance with trading rules.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">5. Prohibitions</h2>
            <p className="text-gray-300 leading-relaxed">
              Strictly prohibited activities include but are not limited to: use of high-frequency trading bots, tick scalping, arbitrage, gap trading, and any form of market manipulation. Sharing accounts or trading on behalf of others is strictly forbidden and will result in immediate termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">6. Account Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              Tradea reserves the right to suspend or terminate your account at any time without prior notice if we believe you have violated these Terms or engaged in fraudulent activity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">7. Applicable Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Tradea is registered, without regard to its conflict of law provisions.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;