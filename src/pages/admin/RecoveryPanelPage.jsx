import React from 'react';
import RecoveryEmailPanel from '@/components/admin/RecoveryEmailPanel';
import { motion } from 'framer-motion';

const RecoveryPanelPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Campañas de Recuperación</h1>
            <p className="text-slate-400 mt-1">Gestiona el envío de correos a usuarios con carritos abandonados o sin planes activos.</p>
          </div>
          
          <RecoveryEmailPanel />
        </motion.div>
      </div>
    </div>
  );
};

export default RecoveryPanelPage;