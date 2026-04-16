import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionAvailable, setSessionAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user && session.user.aud === 'authenticated') {
      setSessionAvailable(true);
    } else {
      setSessionAvailable(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionAvailable(true);
        setIsLoading(false);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "Error",
        description: "Por favor, introduce una nueva contraseña.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      await supabase.auth.signOut();

      toast({
        title: "Éxito",
        description: "Tu contraseña ha sido actualizada. Serás redirigido para iniciar sesión.",
        className: 'bg-green-600 text-white',
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado. Por favor, solicita uno nuevo.");
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen gradient-bg trading-grid flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        </div>
    );
  }

  if (!sessionAvailable) {
    return (
      <div className="min-h-screen gradient-bg trading-grid flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white"
        >
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Acceso Inválido</h1>
          <p className="text-gray-300 mt-2 max-w-sm">
            Para proteger tu cuenta, esta página solo es accesible a través del enlace de recuperación de contraseña enviado a tu correo.
          </p>
           <Button onClick={() => navigate('/login')} className="mt-6">Volver a Inicio de Sesión</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg trading-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-gray-700 glow-green shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-white">Actualizar Contraseña</CardTitle>
            <CardDescription className="text-gray-300">
              Introduce tu nueva contraseña a continuación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Nueva Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-gray-600 text-white focus:border-green-500 focus:ring-green-500"
                />
              </div>
               {error && <p className="text-sm text-red-500">{error}</p>}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Actualizar Contraseña'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;