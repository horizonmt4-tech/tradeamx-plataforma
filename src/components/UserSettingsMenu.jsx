import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, User, Mail, Key, Loader2, LogOut, UserCog, Crown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ChangePasswordDialog from './ChangePasswordDialog';

const UserSettingsMenu = () => {
  const { user, resendVerificationEmail, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isVerifyEmailDialogOpen, setIsVerifyEmailDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    if (user?.id === 'demo-user') {
      toast({ title: "Cuenta Demo", description: "La cuenta demo no requiere verificación.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await resendVerificationEmail(user.email);
      toast({ title: "Correo enviado", description: "Se ha enviado un nuevo correo de verificación.", className: 'bg-green-600 text-white' });
      setIsVerifyEmailDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-white">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Ver Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} disabled={loading}>
            <Key className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => setIsVerifyEmailDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Verificar Correo</span>
          </DropdownMenuItem>
          
          {(user?.isAdmin || user?.is_super_admin) && (
            <>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuLabel>Paneles de Admin</DropdownMenuLabel>
              {user.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Panel de Retención</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {user.is_super_admin && (
                <DropdownMenuItem asChild>
                  <Link to="/super-admin">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Panel Manager</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </>
          )}

          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-red-500/10 focus:text-red-300">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="bg-slate-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Mi Perfil</DialogTitle>
            <DialogDescription>
              Esta es la información de tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Nombre:</span>
              <span className="font-medium text-white">{user?.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Email:</span>
              <span className="font-medium text-white">{user?.email}</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-gray-400">Tipo de Cuenta:</span>
              <span className="font-medium text-green-400">{user?.account_type}</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-gray-400">Perfil de Reglas:</span>
              <span className="font-medium text-blue-400">{user?.rules_profile === 'prop_firm' ? 'Cuenta de Fondeo' : 'Estándar'}</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVerifyEmailDialogOpen} onOpenChange={setIsVerifyEmailDialogOpen}>
        <DialogContent className="bg-slate-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Verificar Correo Electrónico</DialogTitle>
            <DialogDescription>
              Te enviaremos un correo de verificación a <span className="font-bold text-green-400">{user?.email}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 text-sm">
              Haz clic en el enlace del correo para verificar tu cuenta. Si no recibes el correo, revisa tu carpeta de spam.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleResendVerification} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Correo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserSettingsMenu;