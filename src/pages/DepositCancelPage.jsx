import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DepositCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-effect border-gray-700 max-w-md w-full text-center">
          <CardHeader>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-3xl text-white">Pago Cancelado</CardTitle>
            <CardDescription className="text-gray-300 text-lg mt-2">
              Has cancelado el proceso de depósito.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-400">
              No se ha realizado ningún cargo a tu tarjeta. Puedes intentar realizar el depósito nuevamente en cualquier momento.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')} 
                className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/deposit')} 
                className="w-full bg-blue-600 hover:bg-blue-700 glow-blue"
              >
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DepositCancelPage;