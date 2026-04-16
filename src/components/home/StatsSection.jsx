import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Globe, Award } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="text-center"
  >
    <Icon className="w-8 h-8 text-green-500 mx-auto mb-4" />
    <div className="text-3xl font-bold text-white number-ticker">{value}</div>
    <div className="text-gray-400">{label}</div>
  </motion.div>
);

const StatsSection = () => {
  const stats = [
    { label: 'Traders Activos', value: '15,000+', icon: Users },
    { label: 'Capital Distribuido', value: '$50M+', icon: DollarSign },
    { label: 'Países', value: '120+', icon: Globe },
    { label: 'Tasa de Éxito', value: '89%', icon: Award }
  ];

  return (
    <section className="py-16 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;