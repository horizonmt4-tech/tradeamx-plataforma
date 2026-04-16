import React from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

const LegalPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Legal Information</h1>
            
            <div className="space-y-8 text-gray-300">
                <section className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-semibold text-white mb-4">Terms of Service</h2>
                    <p className="mb-4">
                        Welcome to Tradea. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions.
                    </p>
                    <p className="mb-4">
                        Our services are provided "as is" and intended for educational and evaluation purposes. All trading activities on our platform are simulated and do not involve real financial risk in the live markets until explicitly stated otherwise in a funded account agreement.
                    </p>
                </section>

                <section className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>
                    <p className="mb-4">
                        We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>
                    <p>
                        We collect data to improve our services, process payments, and ensure compliance with regulatory standards. We do not sell your personal data to third parties.
                    </p>
                </section>

                <section className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-semibold text-white mb-4">Risk Disclosure</h2>
                    <p className="mb-4">
                        Trading in financial markets involves a high degree of risk and may not be suitable for all investors. You should carefully consider your investment objectives, level of experience, and risk appetite before deciding to trade.
                    </p>
                    <p>
                        There is a possibility that you may sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.
                    </p>
                </section>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;