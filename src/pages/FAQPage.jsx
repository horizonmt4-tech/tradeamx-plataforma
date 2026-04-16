import React, { useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Frequently Asked Questions | Tradea</title>
        <meta name="description" content="Common questions and answers about Tradea trading platform." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <header className="border-b border-gray-800 pb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-400 text-lg">Everything you need to know about trading with us.</p>
          </header>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#d4af37]">Account & Registration</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">How do I sign up for an evaluation?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Click on the "Sign Up" or "Get Started" button, choose your desired funding plan, complete the registration form, and proceed with the payment. Once confirmed, you will receive your login credentials via email.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">Is identity verification required?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Yes. To comply with AML/KYC regulations, you must verify your identity before receiving a funded account or making any withdrawals. This typically requires a government ID and proof of address.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#d4af37]">Trading Rules</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-3" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">What instruments can I trade?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  You can trade a wide variety of instruments including Forex majors and minors, Metals (Gold, Silver), Indices, and select Commodities. Crypto trading may be available depending on your specific plan.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">Is holding trades over the weekend allowed?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Weekend holding rules vary by account type. Please check the specific parameters of the challenge you purchase. Generally, Swing accounts allow weekend holding, while standard Intraday accounts may require you to close positions on Friday.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#d4af37]">Funding Plans</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-5" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">Can I upgrade my plan later?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                   Direct upgrades are not available for active accounts. However, you can purchase a new, larger challenge or take advantage of our Scaling Plan, which increases your capital balance as you consistently demonstrate profitability.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">What is the profit split?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Our standard profit split starts at 80% for the trader. This can increase up to 90% for traders who meet specific scaling criteria and maintain consistent performance over time.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#d4af37]">Withdrawals</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-7" className="border border-slate-800 rounded-lg px-4 bg-slate-900/30">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">How do I withdraw my profits?</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  Withdrawals can be requested from your dashboard once you are eligible. We offer payouts via Bank Transfer and Cryptocurrency (USDT). Requests are typically processed within 24-48 business hours.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;