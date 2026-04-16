import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Banknote, Loader2 } from 'lucide-react';

const BankDetailsCard = ({ bankDetails, handleChange, handleSave, saving }) => {
  return (
    <Card className="glass-effect border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center"><Banknote className="w-5 h-5 mr-2 text-green-400"/> Detalles de la Cuenta Bancaria</CardTitle>
        <CardDescription className="text-gray-300">
          Gestiona la información de la cuenta bancaria para transferencias de planes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bank_name" className="text-gray-300">Nombre del Banco</Label>
          <Input
            id="bank_name"
            value={bankDetails.bank_name || ''}
            onChange={handleChange}
            className="bg-slate-800 border-gray-600 text-white mt-1"
          />
        </div>
        <div>
          <Label htmlFor="beneficiary_name" className="text-gray-300">Nombre del Beneficiario</Label>
          <Input
            id="beneficiary_name"
            value={bankDetails.beneficiary_name || ''}
            onChange={handleChange}
            className="bg-slate-800 border-gray-600 text-white mt-1"
          />
        </div>
        <div>
          <Label htmlFor="clabe" className="text-gray-300">CLABE</Label>
          <Input
            id="clabe"
            value={bankDetails.clabe || ''}
            onChange={handleChange}
            className="bg-slate-800 border-gray-600 text-white mt-1"
          />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Guardar Cambios'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BankDetailsCard;