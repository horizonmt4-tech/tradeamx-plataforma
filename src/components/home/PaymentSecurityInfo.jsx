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
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <Card className="glass-effect border-gray-700 flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <img 
                  alt="Logo de Visa a color" 
                  className="h-16 object-contain mb-4" 
                 src="https://horizons-cdn.hostinger.com/4cbc99ef-1375-4750-b360-c2cd4a566cc0/368255377d5ec5156cb29a8de8c19ac7.webp" />
                <CardContent className="p-0 text-white font-semibold text-lg">
                  Visa
                </CardContent>
              </Card>

              <Card className="glass-effect border-gray-700 flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <img 
                  alt="Logo de Mastercard a color" 
                  className="h-16 object-contain mb-4" 
                 src="https://horizons-cdn.hostinger.com/4cbc99ef-1375-4750-b360-c2cd4a566cc0/f4dedea6af858785949a1ec61b7c820c.png" />
                <CardContent className="p-0 text-white font-semibold text-lg">
                  Mastercard
                </CardContent>
              </Card>

              <Card className="glass-effect border-gray-700 flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <img 
                  alt="Logo de SPEI a color" 
                  className="h-16 object-contain mb-4" 
                 src="https://horizons-cdn.hostinger.com/4cbc99ef-1375-4750-b360-c2cd4a566cc0/7af87dd0aee85247851a37179b4c065b.png" />
                <CardContent className="p-0 text-white font-semibold text-lg">
                  SPEI
                </CardContent>
              </Card>
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