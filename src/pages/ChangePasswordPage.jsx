import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowLeft, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import { validatePassword, getPasswordRequirements } from '@/utils/passwordValidator';

const ChangePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const validation = validatePassword(newPassword);
  const requirements = getPasswordRequirements();

  useEffect(() => {
    if (!token) {
      toast({
        title: "Enlace inválido",
        description: "El enlace de recuperación no es válido o ha expirado.",
        variant: "destructive"
      });
    }
  }, [token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) return;
    
    if (!validation.isValid) {
      toast({ title: "Contraseña inválida", description: "Por favor cumple todos los requisitos.", variant: "destructive" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-and-reset-password', {
        body: { token, newPassword, confirmPassword }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSuccess(true);
      toast({
        title: "¡Éxito!",
        description: "Contraseña actualizada correctamente.",
        className: "bg-green-600 text-white border-none",
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al cambiar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-gray-700 text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-white mb-2">Enlace Inválido</CardTitle>
          <CardDescription className="mb-6">El token de recuperación falta o es inválido.</CardDescription>
          <Button asChild variant="outline" className="border-gray-600 text-white">
            <Link to="/auth/reset-password">Solicitar nuevo enlace</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/80 border-gray-700 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-4">
             <CardTitle className="text-xl text-white flex items-center">
                <KeyRound className="w-5 h-5 mr-2 text-blue-500"/>
                Crear Nueva Contraseña
             </CardTitle>
             <CardDescription className="text-gray-400">
               Ingresa tu nueva contraseña a continuación.
             </CardDescription>
          </CardHeader>

          {success ? (
            <CardContent className="space-y-4 pb-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold text-white">¡Actualizada!</h3>
              <p className="text-gray-400">Redirigiendo al inicio de sesión...</p>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-200">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                  <p className="text-xs text-gray-400 font-semibold mb-2">Requisitos:</p>
                  <ul className="text-xs space-y-1">
                    {requirements.map((req, index) => {
                      const isMet = !validation.errors.some(e => e.includes(req.split(' ')[0])); // basic match
                      // Real-time check logic
                      let met = false;
                      if (index === 0) met = newPassword.length >= 8;
                      if (index === 1) met = /[A-Z]/.test(newPassword);
                      if (index === 2) met = /[0-9]/.test(newPassword);
                      if (index === 3) met = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

                      return (
                        <li key={index} className={`flex items-center gap-1.5 ${met ? 'text-green-400' : 'text-gray-500'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {req}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 shadow-lg"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Actualizar Contraseña'}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;