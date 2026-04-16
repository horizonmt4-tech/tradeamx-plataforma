import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, KeyRound } from 'lucide-react';

const PasswordResetDialog = ({
  isOpen,
  setIsOpen,
  userForPasswordReset,
  handleConfirmPasswordReset,
  updating,
}) => {
  if (!userForPasswordReset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center"><KeyRound className="w-5 h-5 mr-2 text-cyan-400"/>Resetear Contraseña</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres enviar un correo para resetear la contraseña a <span className="font-bold text-cyan-400">{userForPasswordReset.email}</span>?
            <br />
            El usuario recibirá un enlace para establecer una nueva contraseña.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleConfirmPasswordReset} disabled={updating} className="bg-cyan-600 hover:bg-cyan-700">
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sí, Enviar Correo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;