import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, ShoppingCart, CreditCard, UserPlus, Calendar, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const UserAnalyticsRow = ({ user, statusType }) => {
  const timeAgo = user.created_at 
    ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: es }) 
    : 'N/A';

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-slate-800/50 transition-colors last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          user.rules_profile === 'prop_firm' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
        }`}>
          {user.rules_profile === 'prop_firm' ? <Users className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{user.email}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Registrado {timeAgo}</span>
            <span className="text-gray-600">•</span>
            <span>{user.full_name || 'Sin nombre'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Account Type Badge */}
        <Badge variant="outline" className={`${
          user.rules_profile === 'prop_firm' 
            ? 'border-blue-500/50 text-blue-400' 
            : 'border-green-500/50 text-green-400'
        }`}>
          {user.rules_profile === 'prop_firm' ? 'Fondeo' : 'Estándar'}
        </Badge>

        {/* Status Specific Info */}
        {statusType === 'cart' && user.current_cart && (
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Plan: {user.current_cart.planId}
          </Badge>
        )}

        {statusType === 'purchased' && (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            <CreditCard className="w-3 h-3 mr-1" />
            {user.account_type || 'Plan Activo'}
          </Badge>
        )}
      </div>
    </div>
  );
};

const UserListSection = ({ users, title, icon: Icon, description, statusType }) => (
  <Card className="bg-slate-900 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="w-5 h-5 text-gray-400" />
        {title}
        <Badge variant="secondary" className="ml-2">{users.length}</Badge>
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[400px] pr-4">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Package className="w-8 h-8 mb-2 opacity-50" />
            <p>No se encontraron usuarios en esta categoría.</p>
          </div>
        ) : (
          <div className="border border-gray-700 rounded-md bg-slate-950/50">
            {users.map(user => (
              <UserAnalyticsRow key={user.id} user={user} statusType={statusType} />
            ))}
          </div>
        )}
      </ScrollArea>
    </CardContent>
  </Card>
);

const UserAnalytics = ({ users }) => {
  // Memoize filtered lists
  const analytics = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = users.filter(u => new Date(u.created_at) > thirtyDaysAgo);
    
    return {
      newFunding: newUsers.filter(u => u.rules_profile === 'prop_firm'),
      newStandard: newUsers.filter(u => u.rules_profile === 'standard'),
      inCart: users.filter(u => u.current_cart && !u.has_purchased_plan),
      purchased: users.filter(u => u.has_purchased_plan && u.rules_profile === 'prop_firm'),
    };
  }, [users]);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect border-gray-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Nuevos (Fondeo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{analytics.newFunding.length}</div>
            <p className="text-xs text-gray-500">Últimos 30 días</p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-gray-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Nuevos (Estándar)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{analytics.newStandard.length}</div>
            <p className="text-xs text-gray-500">Últimos 30 días</p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-gray-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">En Carrito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{analytics.inCart.length}</div>
            <p className="text-xs text-gray-500">Checkout incompleto</p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-gray-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Planes Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{analytics.purchased.length}</div>
            <p className="text-xs text-gray-500">Total histórico</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funding" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="funding">Nuevos Fondeo</TabsTrigger>
          <TabsTrigger value="standard">Nuevos Estándar</TabsTrigger>
          <TabsTrigger value="cart">En Carrito</TabsTrigger>
          <TabsTrigger value="purchased">Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="funding" className="mt-4">
          <UserListSection 
            users={analytics.newFunding} 
            title="Nuevas Cuentas de Fondeo" 
            icon={Users}
            description="Usuarios registrados en los últimos 30 días con perfil de fondeo."
            statusType="new"
          />
        </TabsContent>

        <TabsContent value="standard" className="mt-4">
          <UserListSection 
            users={analytics.newStandard} 
            title="Nuevas Cuentas Estándar" 
            icon={UserPlus}
            description="Usuarios registrados en los últimos 30 días con perfil estándar."
            statusType="new"
          />
        </TabsContent>

        <TabsContent value="cart" className="mt-4">
          <UserListSection 
            users={analytics.inCart} 
            title="Carrito Abandonado / Activo" 
            icon={ShoppingCart}
            description="Usuarios que han iniciado el proceso de checkout pero no han finalizado la compra."
            statusType="cart"
          />
        </TabsContent>

        <TabsContent value="purchased" className="mt-4">
          <UserListSection 
            users={analytics.purchased} 
            title="Planes Adquiridos" 
            icon={CreditCard}
            description="Usuarios que han completado exitosamente la compra de un plan de fondeo."
            statusType="purchased"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalytics;