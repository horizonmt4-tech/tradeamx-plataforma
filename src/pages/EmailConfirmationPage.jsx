import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const EmailConfirmationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "¡Email verificado!",
      description: "Ahora puedes iniciar sesión en tu cuenta.",
      className: 'bg-green-600 text-white',
    });
    // Redirect to login after a few seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, navigate]);

  return (
    <div className="min-h-screen gradient-bg trading-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg"
      >
        <Card className="glass-effect border-gray-700 glow-green shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-white">¡Verificación Exitosa!</CardTitle>
            <CardDescription className="text-gray-300">
              Tu cuenta ha sido activada correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-gray-300">
              Serás redirigido a la página de inicio de sesión en unos segundos.
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <LogIn className="w-5 h-5 mr-2" />
                  Ir a Iniciar Sesión Ahora
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailConfirmationPage;