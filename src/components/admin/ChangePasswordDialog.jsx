import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { validatePassword, getPasswordRequirements } from '@/utils/passwordValidator';

const ChangePasswordDialog = ({ isOpen, onClose, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validation = validatePassword(newPassword);
  const requirements = getPasswordRequirements();

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      toast({ title: "Error", description: "La contraseña no cumple los requisitos.", variant: "destructive" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { email: user.email, newPassword }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "¡Éxito!",
        description: "Contraseña actualizada correctamente.",
        className: "bg-green-600 text-white border-none",
      });

      handleClose();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && handleClose()}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <KeyRound className="w-5 h-5 mr-2 text-blue-400" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Actualiza la contraseña para el usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-200">Usuario</Label>
            <Input
              value={user.email}
              readOnly
              disabled
              className="bg-slate-800 border-slate-700 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-new-password" className="text-gray-200">Nueva Contraseña</Label>
            <Input
              id="admin-new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-confirm-password" className="text-gray-200">Confirmar Contraseña</Label>
            <Input
              id="admin-confirm-password"
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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="border-gray-600 text-gray-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !newPassword || !confirmPassword || !validation.isValid || newPassword !== confirmPassword}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Actualizar Contraseña'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;