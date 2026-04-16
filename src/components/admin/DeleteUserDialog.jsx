import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

const DeleteUserDialog = ({ user, isOpen, onClose, onConfirm, isSubmitting }) => {
  const [confirmEmail, setConfirmEmail] = useState('');

  if (!user) return null;

  const isMatch = confirmEmail.trim().toLowerCase() === user.email?.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setConfirmEmail(''); onClose(); } }}>
      <DialogContent className="bg-slate-900 border-red-900/50 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-400">
            <Trash2 className="w-5 h-5" /> Eliminar Usuario Permanentemente
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-1">
            Esta acción es <span className="text-red-400 font-bold">irreversible</span>. Se eliminarán todos los datos del usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Datos del usuario */}
          <div className="bg-slate-800 rounded-lg p-3 border border-red-900/40 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white font-mono">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nombre:</span>
              <span className="text-white">{user.full_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Balance:</span>
              <span className="text-red-400 font-mono font-bold">${(user.balance || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Lo que se elimina */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 text-xs text-red-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Se eliminará permanentemente:
            </p>
            <p>• Cuenta de acceso (no podrá recuperar la cuenta)</p>
            <p>• Todo el historial de operaciones (trades)</p>
            <p>• Todas las solicitudes de retiro</p>
            <p>• Perfil y balance completo</p>
          </div>

          {/* Confirmación por email */}
          <div>
            <Label className="text-gray-300 mb-1.5 block text-sm">
              Escribe el email del usuario para confirmar:
            </Label>
            <Input
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user.email}
              className={`bg-slate-800 border-gray-600 text-white font-mono text-sm transition-colors
                ${isMatch ? 'border-red-500 focus:border-red-400' : 'focus:border-gray-500'}`}
              autoFocus
            />
            {confirmEmail && !isMatch && (
              <p className="text-[10px] text-red-400 mt-1">El email no coincide</p>
            )}
            {isMatch && (
              <p className="text-[10px] text-red-300 mt-1">✓ Confirmado — puedes proceder con la eliminación</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setConfirmEmail(''); onClose(); }} disabled={isSubmitting}
            className="border-gray-600 text-gray-300">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(user)}
            disabled={isSubmitting || !isMatch}
            className="bg-red-700 hover:bg-red-600 disabled:opacity-40"
          >
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Eliminando...</>
              : <><Trash2 className="mr-2 h-4 w-4" />Eliminar Permanentemente</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;