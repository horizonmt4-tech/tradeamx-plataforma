import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';

const AMLKYCPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>AML & KYC Policy | Tradea</title>
        <meta name="description" content="Anti-Money Laundering and Know Your Customer policies." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <header className="border-b border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">AML & KYC Policy</h1>
            <p className="text-gray-400 text-lg">Last Updated: January 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">1. Policy Statement</h2>
            <p className="text-gray-300 leading-relaxed">
              Tradea is committed to the highest standards of Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance. We have implemented rigorous policies and procedures to prevent our platform from being used for money laundering, terrorist financing, or other illegal activities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">2. Identity Verification (KYC)</h2>
            <p className="text-gray-300 leading-relaxed">
              Before a trader can receive a funded account or withdraw profits, they must undergo a complete verification process. This ensures that we know exactly who we are doing business with.
            </p>
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                <h3 className="text-lg font-medium text-white mb-3">Required Documents:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li><strong className="text-white">Proof of Identity:</strong> Valid government-issued passport, national ID card, or driver's license.</li>
                    <li><strong className="text-white">Proof of Address:</strong> Recent utility bill, bank statement, or official government document dated within the last 3 months, showing your full name and residential address.</li>
                    <li><strong className="text-white">Selfie Verification:</strong> A live photo to confirm that the person presenting the ID is the owner of the document.</li>
                </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">3. Money Laundering Prevention</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We monitor transactions for suspicious activity. Our AML measures include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Screening users against global sanctions lists (OFAC, UN, EU).</li>
                <li>Monitoring for unusual transaction volumes or patterns.</li>
                <li>Ensuring that withdrawals are made to the same beneficial owner as the account holder.</li>
                <li>Reporting suspicious activities to relevant authorities where required by law.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">4. Verification Process</h2>
            <p className="text-gray-300 leading-relaxed">
              The verification process typically takes 24-48 hours once all documents are submitted. You will be notified via email of the status of your verification. Failure to provide accurate information or documents may result in the suspension or termination of your account.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AMLKYCPage;