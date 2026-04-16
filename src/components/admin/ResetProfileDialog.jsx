import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const ResetProfileDialog = ({
  isOpen,
  setIsOpen,
  userToReset,
  handleConfirmReset,
  updating,
}) => {
  if (!userToReset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Restaurar Perfil de Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres restaurar el perfil de <span className="font-bold text-yellow-400">{userToReset.email}</span>?
            <br />
            Esta acción restablecerá su balance, ganancias, pérdidas y eliminará todo su historial de operaciones. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleConfirmReset} disabled={updating} variant="destructive">
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sí, Restaurar Perfil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetProfileDialog;