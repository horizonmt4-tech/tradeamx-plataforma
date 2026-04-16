import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart3, Target } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description, delay, customIcon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="glass-effect border-gray-700 hover:glow-blue transition-all duration-300 transform hover:scale-105 h-full">
      <CardHeader>
        {customIcon ? customIcon : <Icon className="w-10 h-10 text-green-500 mb-3" />}
        <CardTitle className="text-white text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-300 text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    { icon: Zap, title: 'Ejecución Instantánea', description: 'Latencia ultra-baja para aprovechar cada oportunidad del mercado.' },
    { icon: BarChart3, title: 'Analytics Avanzados', description: 'Herramientas de análisis profesional para optimizar tu trading.' },
    { icon: Target, title: 'Objetivos Claros', description: 'Metas realistas y alcanzables para todos los niveles de traders.' },
  ];

  return (
    <section id="featuressection" className="py-20 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Características Únicas
          </h2>
          <p className="text-gray-300 text-lg">
            Todo lo que necesitas para ser un trader exitoso
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;