import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Target, TrendingUp } from 'lucide-react';

const AboutSection = () => {
  const aboutFeatures = [
    'Capital real para operar, sin simulaciones.',
    'Condiciones de trading competitivas y transparentes.',
    'Tecnología de vanguardia y plataformas robustas.',
    'Soporte dedicado y comunidad de traders.',
  ];

  return (
    <section id="aboutsection" className="py-20 bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Tradea</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            En Tradea, estamos comprometidos con impulsar el talento de traders apasionados. Somos una firma de fondeo moderna que ofrece capital, herramientas avanzadas y un entorno de apoyo para que alcances tus metas financieras en los mercados globales.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-2 bg-gradient-to-br from-green-500/30 to-blue-500/30 rounded-3xl transform rotate-2 blur-lg opacity-70"></div>
            <img  alt="Equipo de traders profesionales analizando gráficos en un entorno de oficina moderno y colaborativo" className="relative rounded-2xl shadow-xl h-96 w-full object-cover" src="https://images.unsplash.com/photo-1573497701240-345a300b8d36" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              Nuestra Misión: Tu Éxito como Trader
            </h3>
            <p className="text-gray-300 mb-8">
              Creemos que cada trader con disciplina y estrategia merece la oportunidad de operar con un capital significativo. Eliminamos las barreras financieras, permitiéndote enfocarte puramente en el trading y en perfeccionar tus habilidades.
            </p>
            
            <div className="space-y-4">
              {aboutFeatures.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Users, title: "Comunidad Fuerte", description: "Únete a una red de traders y aprende de los mejores." },
            { icon: Target, title: "Objetivos Claros", description: "Planes de escalamiento definidos para tu crecimiento." },
            { icon: TrendingUp, title: "Alto Potencial", description: "Gestiona capital significativo y maximiza tus ganancias." },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
              className="bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-colors"
            >
              <item.icon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;