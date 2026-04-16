import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck } from 'lucide-react';

const AdminLockDialog = ({ isOpen, onClose, onSubmit, isChecking }) => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa tu contraseña de seguridad.',
        variant: 'destructive',
      });
      return;
    }
    const result = await onSubmit(password);
    if (!result.success) {
      toast({
        title: 'Error de Autorización',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="text-yellow-400" />
              Verificación de Seguridad
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Para continuar, por favor ingresa tu contraseña de administrador. Esta medida protege las acciones sensibles.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de Administrador"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isChecking}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isChecking} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              {isChecking ? 'Verificando...' : 'Autorizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLockDialog;