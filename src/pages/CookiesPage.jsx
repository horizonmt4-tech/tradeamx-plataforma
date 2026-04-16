import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';

const CookiesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Cookie Policy | Tradea</title>
        <meta name="description" content="Information about how Tradea uses cookies." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <header className="border-b border-gray-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Cookie Policy</h1>
            <p className="text-gray-400 text-lg">Last Updated: January 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">1. What Are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">2. Types of Cookies We Use</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <ul className="space-y-4">
                <li>
                  <strong className="text-white block mb-1">Essential Cookies</strong>
                  Necessary for the website to function properly. This includes cookies that enable you to log into secure areas of our website.
                </li>
                <li>
                  <strong className="text-white block mb-1">Analytics/Performance Cookies</strong>
                  Allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works.
                </li>
                <li>
                  <strong className="text-white block mb-1">Functionality Cookies</strong>
                  Used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences (for example, your choice of language or region).
                </li>
                <li>
                  <strong className="text-white block mb-1">Marketing Cookies</strong>
                  These cookies record your visit to our website, the pages you have visited, and the links you have followed. We use this information to make our website and the advertising displayed on it more relevant to your interests.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">3. Third Parties</h2>
            <p className="text-gray-300 leading-relaxed">
              We may use third-party analytics services, such as Google Analytics, which set their own cookies to help us measure traffic and usage trends. These third parties have their own privacy policies addressing how they use such information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#d4af37]">4. How to Disable Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org. Please note that disabling essential cookies may result in the loss of functionality of our services.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPage;