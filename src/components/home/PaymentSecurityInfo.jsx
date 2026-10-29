import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent } from '@/components/ui/card';
    import { ShieldCheck } from 'lucide-react';

    const PaymentSecurityInfo = () => {
      return (
        <section id="payment-security" className="relative py-16 bg-slate-900 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                Pagos Seguros y Confiables
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Tu seguridad es nuestra prioridad. Ofrecemos métodos de pago confiables para que operes con total tranquilidad.
              </p>
            </motion.div>

            

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-blue-600 text-white shadow-xl">
                <ShieldCheck className="w-7 h-7 mr-3" />
                <span className="text-xl font-bold">Transacciones 100% Seguras y Protegidas</span>
              </div>
            </motion.div>
          </div>
        </section>
      );
    };

    export default PaymentSecurityInfo;
