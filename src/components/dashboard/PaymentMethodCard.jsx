import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Building2, CreditCard, Hash, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PaymentMethodCard = ({ bankDetails, reference, amount, currency, formatPrice }) => {
  const { toast } = useToast();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: `${label} copiado al portapapeles` });
  };

  if (!bankDetails) return null;

  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardHeader className="bg-slate-900/50 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-xl text-white">Transferencia SPEI</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Realiza una transferencia interbancaria utilizando los siguientes datos.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Amount Display */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-300 mb-1">Monto exacto a transferir</p>
            <p className="text-3xl font-bold text-white">
                {formatPrice ? formatPrice(amount) : `$${amount} ${currency}`}
            </p>
        </div>

        {/* Bank Details Grid */}
        <div className="space-y-4">
            <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Banco Destino</span>
                <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{bankDetails.bank_name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800" onClick={() => copyToClipboard(bankDetails.bank_name, 'Banco')}>
                        <Copy className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Beneficiario</span>
                <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{bankDetails.beneficiary_name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800" onClick={() => copyToClipboard(bankDetails.beneficiary_name, 'Beneficiario')}>
                        <Copy className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">CLABE Interbancaria</span>
                <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-mono font-medium tracking-wide">{bankDetails.clabe}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800" onClick={() => copyToClipboard(bankDetails.clabe, 'CLABE')}>
                        <Copy className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Concepto / Referencia</span>
                <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-mono font-medium">{reference}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-800" onClick={() => copyToClipboard(reference, 'Referencia')}>
                        <Copy className="w-4 h-4 text-gray-400" />
                    </Button>
                </div>
                <p className="text-xs text-amber-500 mt-1">* Es importante incluir esta referencia para identificar tu pago.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;