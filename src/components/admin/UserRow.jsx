import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ShieldCheck, RotateCcw, History, Edit, KeyRound, DollarSign, Lock, Unlock, ShieldX, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordDialog from './ChangePasswordDialog';

const UserRow = ({
  user,
  onEditClick,
  onActivateClick,
  onResetClick,
  onAdjustBalanceClick,
  onToggleLockClick,
  onBanClick,
  onDeleteClick,
}) => {
  const { user: authUser } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const isSuperAdmin = authUser?.is_super_admin;
  const isBanned = user.account_banned;

  return (
    <>
      <div className="block md:grid md:grid-cols-12 md:items-center p-3 text-sm text-white hover:bg-slate-800/50 transition-colors">

        {/* ── Desktop ── */}
        <div className="hidden md:flex md:col-span-3 font-mono truncate pr-2 items-center gap-1.5">
          {isBanned && (
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Cuenta bloqueada" />
          )}
          {!isBanned && user.trading_locked && (
            <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" title="Trading bloqueado" />
          )}
          <span className={`truncate ${isBanned ? 'text-red-400 line-through' : ''}`}>{user.email}</span>
        </div>
        <div className="hidden md:block md:col-span-2 truncate pr-2 text-gray-300">{user.full_name || 'N/A'}</div>
        <div className="hidden md:block md:col-span-2 font-mono">${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div className="hidden md:block md:col-span-1 font-mono text-green-400">${(user.profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div className="hidden md:block md:col-span-1 font-mono text-red-400">{user.drawdown || 0}%</div>
        <div className="hidden md:flex md:col-span-1 items-center gap-1">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.rules_profile === 'prop_firm' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
            {user.rules_profile === 'prop_firm' ? 'Fondeo' : 'Estándar'}
          </span>
          {isBanned && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">BAN</span>}
        </div>
        <div className="hidden md:flex md:col-span-2 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white w-52">
              <DropdownMenuItem onClick={() => onEditClick(user)}>
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
              </DropdownMenuItem>
              {/* ✅ Corregido: /admin/users/ → /admin/user/ */}
              <DropdownMenuItem asChild>
                <Link to={`/admin/user/${user.id}/trades`} className="flex items-center">
                  <History className="mr-2 h-4 w-4" /> Ver Operaciones
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-600" />
              <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4 text-blue-400" /> Cambiar Contraseña
              </DropdownMenuItem>
              {isSuperAdmin && onAdjustBalanceClick && (
                <DropdownMenuItem onClick={() => onAdjustBalanceClick(user)}>
                  <DollarSign className="mr-2 h-4 w-4 text-purple-400" /> Ajustar Saldo/Bono
                </DropdownMenuItem>
              )}
              {!user.has_purchased_plan && (
                <DropdownMenuItem onClick={() => onActivateClick(user)}>
                  <ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> Activar Plan
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onResetClick(user)}>
                <RotateCcw className="mr-2 h-4 w-4 text-yellow-500" /> Restaurar Perfil
              </DropdownMenuItem>

              {isSuperAdmin && onToggleLockClick && (
                <>
                  <DropdownMenuSeparator className="bg-slate-600" />
                  <DropdownMenuItem onClick={() => onToggleLockClick(user)} className={user.trading_locked ? 'text-green-400 focus:text-green-300' : 'text-orange-400 focus:text-orange-300'}>
                    {user.trading_locked
                      ? <><Unlock className="mr-2 h-4 w-4" /> Desbloquear Trading</>
                      : <><Lock className="mr-2 h-4 w-4" /> Bloquear Trading</>
                    }
                  </DropdownMenuItem>
                </>
              )}

              {isSuperAdmin && onBanClick && (
                <DropdownMenuItem
                  onClick={() => onBanClick(user)}
                  className={isBanned ? 'text-green-400 focus:text-green-300' : 'text-red-400 focus:text-red-300'}
                >
                  {isBanned
                    ? <><ShieldCheck className="mr-2 h-4 w-4" /> Restaurar Acceso</>
                    : <><ShieldX className="mr-2 h-4 w-4" /> Bloquear Acceso Total</>
                  }
                </DropdownMenuItem>
              )}

              {isSuperAdmin && onDeleteClick && (
                <>
                  <DropdownMenuSeparator className="bg-slate-600" />
                  <DropdownMenuItem onClick={() => onDeleteClick(user)} className="text-red-600 focus:text-red-500 focus:bg-red-950/30">
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cuenta
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Mobile ── */}
        <div className="md:hidden w-full">
          <div className="flex justify-between items-start">
            <div className="flex-grow truncate flex items-center gap-2">
              {isBanned && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
              {!isBanned && user.trading_locked && <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
              <div className="truncate">
                <p className={`font-bold text-base truncate ${isBanned ? 'line-through text-red-400' : ''}`}>{user.full_name || 'N/A'}</p>
                <p className="font-mono text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
              {isBanned && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-500/20 text-red-400">BAN</span>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white w-52">
                  <DropdownMenuItem onClick={() => onEditClick(user)}><Edit className="mr-2 h-4 w-4" />Editar Perfil</DropdownMenuItem>
                  {/* ✅ Corregido: /admin/users/ → /admin/user/ */}
                  <DropdownMenuItem asChild>
                    <Link to={`/admin/user/${user.id}/trades`} className="flex items-center">
                      <History className="mr-2 h-4 w-4" />Ver Operaciones
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-600" />
                  <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}><KeyRound className="mr-2 h-4 w-4 text-blue-400" />Cambiar Contraseña</DropdownMenuItem>
                  {isSuperAdmin && onAdjustBalanceClick && <DropdownMenuItem onClick={() => onAdjustBalanceClick(user)}><DollarSign className="mr-2 h-4 w-4 text-purple-400" />Ajustar Saldo/Bono</DropdownMenuItem>}
                  {!user.has_purchased_plan && <DropdownMenuItem onClick={() => onActivateClick(user)}><ShieldCheck className="mr-2 h-4 w-4 text-green-500" />Activar Plan</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => onResetClick(user)}><RotateCcw className="mr-2 h-4 w-4 text-yellow-500" />Restaurar Perfil</DropdownMenuItem>
                  {isSuperAdmin && onToggleLockClick && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-600" />
                      <DropdownMenuItem onClick={() => onToggleLockClick(user)} className={user.trading_locked ? 'text-green-400' : 'text-orange-400'}>
                        {user.trading_locked ? <><Unlock className="mr-2 h-4 w-4" />Desbloquear Trading</> : <><Lock className="mr-2 h-4 w-4" />Bloquear Trading</>}
                      </DropdownMenuItem>
                    </>
                  )}
                  {isSuperAdmin && onBanClick && (
                    <DropdownMenuItem onClick={() => onBanClick(user)} className={isBanned ? 'text-green-400' : 'text-red-400'}>
                      {isBanned ? <><ShieldCheck className="mr-2 h-4 w-4" />Restaurar Acceso</> : <><ShieldX className="mr-2 h-4 w-4" />Bloquear Acceso Total</>}
                    </DropdownMenuItem>
                  )}
                  {isSuperAdmin && onDeleteClick && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-600" />
                      <DropdownMenuItem onClick={() => onDeleteClick(user)} className="text-red-600 focus:bg-red-950/30">
                        <Trash2 className="mr-2 h-4 w-4" />Eliminar Cuenta
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><p className="text-gray-400 text-xs font-semibold">BALANCE</p><p className="font-mono">${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
            <div><p className="text-gray-400 text-xs font-semibold">PERFIL</p>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.rules_profile === 'prop_firm' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {user.rules_profile === 'prop_firm' ? 'Fondeo' : 'Estándar'}
              </span>
            </div>
            <div><p className="text-gray-400 text-xs font-semibold">GANANCIA</p><p className="font-mono text-green-400">${(user.profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
            <div><p className="text-gray-400 text-xs font-semibold">PÉRDIDA</p><p className="font-mono text-red-400">{user.drawdown || 0}%</p></div>
          </div>
        </div>
      </div>

      <ChangePasswordDialog isOpen={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} user={user} />
    </>
  );
};

export default UserRow;