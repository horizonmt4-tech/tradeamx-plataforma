import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

const TradingPanelDisabledOverlay = ({ icon, title, text, showMarketHours = false }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center rounded-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Icono animado */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="mb-4"
        >
          {icon}
        </motion.div>

        {/* Título */}
        <motion.h3 
          className="text-xl md:text-2xl font-bold text-white mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>

        {/* Texto descriptivo */}
        <motion.p 
          className="text-slate-300 max-w-md text-sm md:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>

        {/* Horarios del mercado (opcional) */}
        {showMarketHours && (
          <motion.div
            className="mt-6 p-4 bg-slate-800/80 border border-slate-700 rounded-lg max-w-sm w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Horarios de Trading</h4>
            </div>
            
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Lunes - Viernes:</span>
                <span className="text-white font-mono">00:00 - 23:59</span>
              </div>
              <div className="flex justify-between">
                <span>Fin de semana:</span>
                <span className="text-red-400 font-semibold">Cerrado</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Indicador de pulso */}
        <motion.div
          className="mt-4 flex items-center gap-2 text-xs text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span>Mercado cerrado</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TradingPanelDisabledOverlay;