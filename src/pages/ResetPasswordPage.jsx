import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { validatePassword, getPasswordRequirements } from '@/utils/passwordValidator';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const validation = validatePassword(newPassword);
  const requirements = getPasswordRequirements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({ title: "Error", description: "Por favor ingresa tu correo electrónico.", variant: "destructive" });
      return;
    }

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
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { email, newPassword }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "¡Éxito!",
        description: "Contraseña actualizada exitosamente.",
        className: "bg-green-600 text-white border-none",
      });

      navigate('/login');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al cambiar la contraseña. Verifica que el correo sea correcto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-slate-900/80 border-gray-700 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-4">
             <CardTitle className="text-xl text-white flex items-center">
                <KeyRound className="w-5 h-5 mr-2 text-blue-500"/>
                Recuperar Contraseña
             </CardTitle>
             <CardDescription className="text-gray-400">
               Ingresa tu correo y la nueva contraseña para actualizar tu acceso.
             </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>

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
                    let met = false;
                    if (index === 0) met = newPassword.length >= 8;
                    if (index === 1) met = /[A-Z]/.test(newPassword);
                    if (index === 2) met = /[a-z]/.test(newPassword);
                    if (index === 3) met = /[0-9]/.test(newPassword);

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
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 shadow-lg"
                disabled={loading || !email || !newPassword || !confirmPassword}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Actualizar Contraseña'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-300 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio de sesión
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;