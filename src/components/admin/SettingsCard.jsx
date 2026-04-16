import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Banknote, DollarSign, CandlestickChart, Shield } from 'lucide-react';

const SettingsCard = () => {
  return (
    <Card className="glass-effect border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center"><Settings className="w-5 h-5 mr-2 text-purple-400"/>Configuración General</CardTitle>
        <CardDescription className="text-gray-300">
          Gestiona la configuración global de la plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/bank-details">
          <Button variant="outline" className="w-full h-20 flex flex-col justify-center items-center gap-2 text-base">
            <Banknote className="w-6 h-6 text-green-400"/>
            <span>Detalles Bancarios</span>
          </Button>
        </Link>
        <Link to="/admin/plan-settings">
          <Button variant="outline" className="w-full h-20 flex flex-col justify-center items-center gap-2 text-base">
            <DollarSign className="w-6 h-6 text-blue-400"/>
            <span>Precios de Planes</span>
          </Button>
        </Link>
        <Link to="/admin/exchange-rate">
          <Button variant="outline" className="w-full h-20 flex flex-col justify-center items-center gap-2 text-base">
            <CandlestickChart className="w-6 h-6 text-red-400"/>
            <span>Tipo de Cambio</span>
          </Button>
        </Link>
        <Link to="/admin/regulation">
          <Button variant="outline" className="w-full h-20 flex flex-col justify-center items-center gap-2 text-base">
            <Shield className="w-6 h-6 text-indigo-400"/>
            <span>Regulación</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;