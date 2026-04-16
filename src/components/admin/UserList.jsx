import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, RefreshCw, Loader2 } from 'lucide-react';
import UserRow from '@/components/admin/UserRow';

const UserList = ({
  users,
  loading,
  searchQuery,
  setSearchQuery,
  fetchUsers,
  onEditClick,
  onActivateClick,
  onResetClick,
  onPasswordResetClick,
  onAdjustBalanceClick,
  onToggleLockClick,
  onBanClick,       // ✅ nuevo
  onDeleteClick,    // ✅ nuevo
}) => (
  <Card className="glass-effect border-gray-700">
    <CardHeader>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" /> Lista de Usuarios
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gestiona usuarios, activaciones y accesos.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-gray-600 text-white"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800 text-xs text-gray-400 font-bold hidden md:grid grid-cols-12 p-3 uppercase tracking-wide">
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Nombre</div>
          <div className="col-span-2">Balance</div>
          <div className="col-span-1">Ganancia</div>
          <div className="col-span-1">Pérdida</div>
          <div className="col-span-1">Perfil</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>
        <div className="divide-y divide-gray-700">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No se encontraron usuarios.
            </div>
          ) : (
            users.map(u => (
              <UserRow
                key={u.id}
                user={u}
                onEditClick={onEditClick}
                onActivateClick={onActivateClick}
                onResetClick={onResetClick}
                onPasswordResetClick={onPasswordResetClick}
                onAdjustBalanceClick={onAdjustBalanceClick}
                onToggleLockClick={onToggleLockClick}
                onBanClick={onBanClick}
                onDeleteClick={onDeleteClick}
              />
            ))
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default UserList;