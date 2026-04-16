import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldX, ShieldCheck } from 'lucide-react';

const BanUserDialog = ({ user, isOpen, onClose, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState('');
  const isBanned = user?.account_banned;

  if (!user) return null;

  const handleConfirm = () => {
    if (!isBanned && !reason.trim()) return;
    onConfirm(user, !isBanned, reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setReason(''); onClose(); } }}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl ${isBanned ? 'text-green-400' : 'text-red-400'}`}>
            {isBanned
              ? <><ShieldCheck className="w-5 h-5" /> Desbloquear Acceso</>
              : <><ShieldX className="w-5 h-5" /> Bloquear Acceso Total</>
            }
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-1">
            {isBanned
              ? `Esto restaurará el acceso completo a la plataforma para ${user.email}.`
              : `Esto bloqueará el LOGIN de ${user.email}. No podrá entrar a la plataforma de ninguna manera.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Info del usuario */}
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white font-mono">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Balance:</span>
              <span className="text-white font-mono">${(user.balance || 0).toFixed(2)}</span>
            </div>
            {isBanned && user.banned_reason && (
              <div className="flex justify-between">
                <span className="text-gray-400">Motivo anterior:</span>
                <span className="text-red-400 text-xs">{user.banned_reason}</span>
              </div>
            )}
          </div>

          {/* Motivo (solo al banear) */}
          {!isBanned && (
            <div>
              <Label className="text-gray-300 mb-1.5 block">
                Motivo del bloqueo <span className="text-red-400">*</span>
              </Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Fraude detectado, uso de scripts automatizados"
                className="bg-slate-800 border-gray-600 text-white focus:border-red-500"
                autoFocus
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Este motivo queda registrado internamente para auditoría.
              </p>
            </div>
          )}

          {!isBanned && (
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 space-y-1">
              <p className="font-semibold">⚠️ Esta acción:</p>
              <p>• Deshabilitará el login inmediatamente</p>
              <p>• Bloqueará también todas las operaciones de trading</p>
              <p>• El usuario recibirá un error al intentar ingresar</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setReason(''); onClose(); }} disabled={isSubmitting}
            className="border-gray-600 text-gray-300">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || (!isBanned && !reason.trim())}
            className={isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBanned ? 'Restaurar Acceso' : 'Confirmar Bloqueo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserDialog;