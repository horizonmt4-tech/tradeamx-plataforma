import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, Send, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const CheckEmailPage = () => {
  const { state } = useLocation();
  const email = state?.email || 'tu correo electrónico';
  const isPasswordReset = state?.isPasswordReset || false;
  const { resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      if (isPasswordReset) {
        // Reenviar correo de restablecimiento de contraseña
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Correo Reenviado",
          description: `Se ha enviado un nuevo enlace para resetear tu contraseña a ${email}.`,
          className: 'bg-green-600 text-white',
        });
      } else {
        // Reenviar correo de verificación de cuenta
        await resendVerificationEmail(email);
        toast({
          title: "Correo Reenviado",
          description: `Se ha enviado un nuevo correo de verificación a ${email}.`,
          className: 'bg-green-600 text-white',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg trading-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg"
      >
        <Card className="glass-effect border-gray-700 glow-blue shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              {isPasswordReset ? (
                <KeyRound className="w-8 h-8 text-white" />
              ) : (
                <MailCheck className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-3xl text-white">
              {isPasswordReset ? '¡Revisa tu email!' : '¡Casi listo! Verifica tu email'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {isPasswordReset ? (
                <>
                  Hemos enviado un enlace para restablecer tu contraseña a <br/>
                  <span className="font-bold text-green-400">{email}</span>.
                </>
              ) : (
                <>
                  Hemos enviado un enlace de confirmación a <br/>
                  <span className="font-bold text-green-400">{email}</span>.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-gray-300">
              {isPasswordReset 
                ? 'Por favor, haz clic en el enlace para crear una nueva contraseña. No olvides revisar tu carpeta de spam si no lo encuentras.'
                : 'Por favor, haz clic en el enlace para activar tu cuenta. No olvides revisar tu carpeta de spam si no lo encuentras.'
              }
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleResend} disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                {isPasswordReset ? 'Reenviar enlace de restablecimiento' : 'Reenviar correo de verificación'}
              </Button>
            </motion.div>
            
            <p className="text-xs text-gray-400">
              {isPasswordReset ? (
                <>¿Recordaste tu contraseña? <Link to="/login" className="underline hover:text-green-400">Inicia sesión aquí</Link>.</>
              ) : (
                <>¿Ya lo verificaste? <Link to="/login" className="underline hover:text-green-400">Inicia sesión aquí</Link>.</>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckEmailPage;