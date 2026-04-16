import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DepositSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you might want to verify the session_id here
    // For now, we just show success. Webhook handles the actual balance update.
  }, []);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-effect border-gray-700 max-w-md w-full text-center glow-green">
          <CardHeader>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-3xl text-white">¡Depósito Exitoso!</CardTitle>
            <CardDescription className="text-gray-300 text-lg mt-2">
              Tu pago ha sido procesado correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-400">
              El balance de tu cuenta se actualizará en unos instantes. Puedes verificar tu balance en el panel principal.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-green-600 hover:bg-green-700 glow-green py-6 text-lg"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DepositSuccessPage;