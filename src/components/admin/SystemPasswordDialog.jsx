import React, { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';

const SystemPasswordDialog = ({ isOpen, onClose, onConfirm, isSubmitting, onForgotPassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  const calculateStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 33;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 33;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) strength += 34;
    return strength;
  };

  const strength = calculateStrength(newPassword);
  
  const getStrengthColor = () => {
    if (strength === 0) return 'bg-slate-700';
    if (strength <= 33) return 'bg-red-500';
    if (strength <= 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 33) return 'Débil';
    if (strength <= 66) return 'Media';
    return 'Fuerte';
  };

  const errors = [];
  if (currentPassword.length === 0) {
    errors.push('La contraseña actual es requerida');
  }
  if (newPassword && newPassword.length < 8) {
    errors.push('La nueva contraseña debe tener al menos 8 caracteres');
  }
  if (confirmPassword && newPassword !== confirmPassword) {
    errors.push('Las contraseñas no coinciden');
  }
  if (newPassword && currentPassword && newPassword === currentPassword) {
    errors.push('La nueva contraseña debe ser diferente a la actual');
  }

  const isValid = 
    currentPassword.length > 0 &&
    newPassword.length >= 8 && 
    newPassword === confirmPassword && 
    newPassword !== currentPassword &&
    errors.length === 0;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(currentPassword, newPassword);
    }
  };

  const handleForgotClick = () => {
    onClose();
    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
              <Lock className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl">
              Cambiar Contraseña del Sistema
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Ingresa tu contraseña actual y confirma la nueva contraseña maestra de acceso. Asegúrate de usar una contraseña segura y guardarla en un lugar protegido.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <Label htmlFor="currentPassword">Contraseña Actual <span className="text-red-500">*</span></Label>
              <button 
                onClick={handleForgotClick}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                ¿Olvidaste la contraseña?
              </button>
            </div>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-950 border-slate-700 pr-10 focus-visible:ring-blue-500 text-white"
                placeholder="Contraseña actual"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="newPassword">Nueva Contraseña <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-950 border-slate-700 pr-10 focus-visible:ring-blue-500 text-white"
                placeholder="Mínimo 8 caracteres"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {newPassword.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="flex gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${getStrengthColor()}`} style={{ width: `${strength}%` }} />
                </div>
                <p className={`text-xs text-right ${strength <= 33 ? 'text-red-400' : strength <= 66 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {getStrengthLabel()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-950 border-slate-700 pr-10 focus-visible:ring-blue-500 text-white"
                placeholder="Vuelve a ingresar la nueva contraseña"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md text-red-400 text-sm">
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-900/50 disabled:text-blue-200/50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Confirmar Cambio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SystemPasswordDialog;