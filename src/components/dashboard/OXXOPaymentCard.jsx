import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CreditCard, Info, Store } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeCanvas } from 'qrcode.react';
import OXXODepositBreakdown from './OXXODepositBreakdown';

const OXXOPaymentCard = ({ usdAmount, rate, currency }) => {
  const { toast } = useToast();
  const oxxoAccountNumber = "2242 1701 8061 3314";
  const limitMXN = 5000;

  // Calculate MXN totals
  const totalMXN = usdAmount * rate;
  const isOverLimit = totalMXN > limitMXN;
  
  // The amount to display for THIS specific QR/Transaction
  const currentDepositMXN = isOverLimit ? limitMXN : totalMXN;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast({ title: "Copiado", description: "Número de cuenta copiado al portapapeles" });
  };

  const formatMXN = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
      {/* Branding Header */}
      <div className="bg-[#1e40af] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-sm">
                <div className="flex gap-0.5">
                   <div className="w-2 h-2 bg-[#1e40af] rounded-full"></div>
                   <div className="w-2 h-2 bg-[#fbbf24] rounded-full"></div>
                   <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                </div>
            </div>
            <span className="font-bold text-lg tracking-tight">Trade<span className="text-[#fbbf24]">AMX</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded text-xs font-medium">
             <Store className="w-3 h-3" />
             <span>OXXO Pay</span>
        </div>
      </div>

      <CardContent className="pt-6 space-y-6">
         
         {/* Breakdown Logic (Visible if over limit) */}
         {isOverLimit && (
             <OXXODepositBreakdown totalAmount={totalMXN} limit={limitMXN} />
         )}

         {/* Active Deposit Section */}
         <div className="space-y-6">
            <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {isOverLimit ? 'Monto de este depósito (1º)' : 'Total a pagar en caja'}
                </p>
                <div className="inline-block bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-xl px-6 py-3">
                    <p className="text-4xl font-bold text-[#1e40af]">
                        {formatMXN(currentDepositMXN)}
                    </p>
                </div>
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" />
                    Comisión OXXO aprox. $12.00 MXN
                </p>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center space-y-3">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <QRCodeCanvas 
                        value={oxxoAccountNumber.replace(/\s/g, '')} 
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-900">Escanea este código</p>
                    <p className="text-xs text-gray-500">Díselo al cajero: "Quiero realizar un depósito a cuenta"</p>
                </div>
            </div>

            {/* Account Details */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-bold text-gray-500 uppercase">Número de Cuenta Spin</span>
                     <span className="text-xs text-[#1e40af] font-medium">Spin by OXXO</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-mono text-lg md:text-xl font-bold text-gray-800 tracking-wider truncate">
                            {oxxoAccountNumber}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(oxxoAccountNumber)} className="hover:bg-white hover:text-[#1e40af]">
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </div>
         </div>
         
         {/* Instructions Footer */}
         <div className="border-t border-gray-100 pt-4">
             <h4 className="text-xs font-bold text-gray-900 uppercase mb-2">Pasos para pagar:</h4>
             <ol className="text-sm text-gray-600 space-y-1 list-decimal pl-4">
                 <li>Ve a cualquier tienda OXXO.</li>
                 <li>Muestra el código QR o dicta los 16 dígitos.</li>
                 <li>Paga <span className="font-bold text-[#1e40af]">{formatMXN(currentDepositMXN)}</span> en efectivo.</li>
                 <li>Conserva el ticket y súbelo abajo.</li>
             </ol>
         </div>

      </CardContent>
    </Card>
  );
};

export default OXXOPaymentCard;