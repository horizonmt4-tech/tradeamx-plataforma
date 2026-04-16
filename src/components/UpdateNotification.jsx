
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function UpdateNotification({ isUpdateAvailable }) {
  const [isVisible, setIsVisible] = useState(false);

  // Check if update is available and not temporarily dismissed
  useEffect(() => {
    if (isUpdateAvailable) {
      const dismissedUntil = localStorage.getItem('update_dismissed_until');
      const now = new Date().getTime();
      
      if (!dismissedUntil || now > parseInt(dismissedUntil, 10)) {
        setIsVisible(true);
      }
    }
  }, [isUpdateAvailable]);

  // Auto-dismiss after 10 seconds if user doesn't interact
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleUpdate = () => {
    // Clear cache to ensure fresh load
    localStorage.removeItem('update_dismissed_until');
    window.location.reload(true);
  };

  const handleDismiss = () => {
    const fiveMinutes = 5 * 60 * 1000;
    localStorage.setItem('update_dismissed_until', (new Date().getTime() + fiveMinutes).toString());
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-slate-800 border border-slate-700 shadow-2xl rounded-lg p-4 flex items-center gap-6 text-slate-100"
        >
          <div className="text-sm font-medium">Nueva versión disponible</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDismiss} 
              className="text-xs h-8 bg-transparent border-slate-600 hover:bg-slate-700 hover:text-white"
            >
              Después
            </Button>
            <Button 
              size="sm" 
              onClick={handleUpdate} 
              className="text-xs h-8 bg-cyan-600 hover:bg-cyan-500 text-white border-none"
            >
              Actualizar ahora
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
