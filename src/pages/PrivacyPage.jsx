import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Privacy Policy | Tradea</title>
        <meta name="description" content="Privacy Policy for Tradea services and data collection practices." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <header className="border-b border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-gray-400 text-lg">Last Updated: January 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">1. Data Collection</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                At Tradea, we prioritize the protection of your personal information. We collect data necessary to provide our trading evaluation services efficiently and securely.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Personal Identification:</strong> Name, email address, phone number, and government-issued ID for KYC purposes.</li>
                <li><strong className="text-white">Trading Data:</strong> Trade history, performance metrics, IP addresses used for account access, and platform logs.</li>
                <li><strong className="text-white">Technical Data:</strong> Device information, browser type, and operating system details to ensure platform compatibility.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">2. Data Usage</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Your data is utilized strictly for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Service Improvement:</strong> Analyzing trading patterns to enhance platform performance and user experience.</li>
                <li><strong className="text-white">Security:</strong> Monitoring for suspicious activity, fraud prevention, and unauthorized access attempts.</li>
                <li><strong className="text-white">Communication:</strong> Sending important account updates, support responses, and service announcements.</li>
                <li><strong className="text-white">Compliance:</strong> Meeting legal and regulatory requirements for financial evaluation services.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">3. Cookies & Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies to maintain your session security and remember your preferences. You can control cookie settings through your browser, though disabling them may affect platform functionality. We also utilize third-party analytics tools (such as Google Analytics) to understand aggregated user behavior without personally identifying individuals.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">4. User Rights</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Under applicable data protection laws, you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion of your data ("Right to be Forgotten"), subject to legal retention requirements.</li>
                <li>Object to processing of your personal data for specific purposes.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">5. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions regarding this Privacy Policy or wish to exercise your data rights, please contact our Data Protection Officer at:
            </p>
            <a href="mailto:privacy@tradeamx.com" className="text-[#667eea] hover:underline font-medium text-lg block">
              privacy@tradeamx.com
            </a>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;