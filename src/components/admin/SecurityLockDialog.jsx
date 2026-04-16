import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '../ui/use-toast';

const SecurityLockDialog = ({ isOpen, onClose, onSubmit, isChecking }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await onSubmit(password);
    if (!result.success) {
      setError(result.message);
      toast({
        title: "Acceso Denegado",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-400">
            <ShieldAlert className="w-6 h-6 mr-2" />
            Acceso Restringido
          </DialogTitle>
          <DialogDescription>
            Esta acción requiere autorización de seguridad. Por favor, introduce la contraseña de administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de seguridad"
              className="bg-slate-800 border-gray-600"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isChecking} className="bg-red-600 hover:bg-red-700">
              {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Autorizar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityLockDialog;