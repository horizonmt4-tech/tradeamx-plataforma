import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import SuperAdminPasswordChangeSection from '@/components/admin/SuperAdminPasswordChangeSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminProfilePage = () => {
  const { user } = useAuth();

  if (!user?.is_super_admin) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AdminHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Perfil de Súper Administrador</h1>
            <p className="text-slate-400">Gestiona tu información y credenciales de seguridad.</p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-500" />
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-slate-400 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Nombre Completo
                  </span>
                  <p className="font-medium text-white">{user.full_name || 'Súper Administrador'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Correo Electrónico
                  </span>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                <ShieldAlert className="w-4 h-4" /> Rol: Súper Administrador
              </div>
            </CardContent>
          </Card>

          <SuperAdminPasswordChangeSection />
        </motion.div>
      </main>
    </div>
  );
};

export default SuperAdminProfilePage;