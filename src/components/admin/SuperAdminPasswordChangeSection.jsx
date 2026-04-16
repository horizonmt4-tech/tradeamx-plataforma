import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const SuperAdminPasswordChangeSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If not super admin, don't render
  if (!user?.is_super_admin) return null;

  const validations = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword !== '' && newPassword === confirmPassword,
  };

  const isStrong = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrong) {
      toast({
        title: "Contraseña inválida",
        description: "Asegúrate de cumplir con todos los requisitos de seguridad.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-update-super-admin-password', {
        body: { newPassword }
      });

      // Handle function invocation error (network issues, 500s, etc.)
      if (error) {
        throw new Error(error.message || 'Error communicating with the server');
      }
      
      // Handle the API response payload
      if (data?.success) {
        toast({
          title: "Éxito",
          description: data.message || "Contraseña actualizada correctamente.",
          className: "bg-green-600 text-white"
        });
        // Clear fields after success
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Throw an error with the specific message from the edge function
        throw new Error(data?.message || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      console.error('Error changing super admin password:', err);
      toast({
        title: "Error",
        description: err.message || "Hubo un problema al actualizar la contraseña.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className={`flex items-center gap-2 text-sm ${isValid ? 'text-green-500' : 'text-slate-400'}`}>
      {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl">Cambiar Contraseña de Súper Administrador</CardTitle>
        <CardDescription>
          Actualiza tu contraseña de acceso. Asegúrate de usar una contraseña segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="Ingresa la nueva contraseña"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="Repite la nueva contraseña"
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ValidationItem isValid={validations.length} text="Mínimo 8 caracteres" />
            <ValidationItem isValid={validations.upper} text="Al menos una mayúscula" />
            <ValidationItem isValid={validations.lower} text="Al menos una minúscula" />
            <ValidationItem isValid={validations.number} text="Al menos un número" />
            <ValidationItem isValid={validations.special} text="Al menos un carácter especial" />
            <ValidationItem isValid={validations.match} text="Las contraseñas coinciden" />
          </div>

          <Button 
            type="submit" 
            disabled={!isStrong || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuperAdminPasswordChangeSection;