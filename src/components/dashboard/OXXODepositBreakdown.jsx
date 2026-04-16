import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const OXXODepositBreakdown = ({ totalAmount, limit = 5000, className }) => {
  // Calculate chunks
  const calculateChunks = () => {
    const chunks = [];
    let remaining = totalAmount;
    
    while (remaining > 0) {
      let chunk = Math.min(remaining, limit);
      chunks.push(chunk);
      remaining -= chunk;
    }
    return chunks;
  };

  const chunks = calculateChunks();
  
  if (chunks.length <= 1) return null;

  const formatMXN = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className={cn("bg-white rounded-lg border border-amber-200 overflow-hidden shadow-sm", className)}>
        {/* Warning Header */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 flex gap-3">
             <div className="bg-amber-100 p-2 rounded-full h-fit">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
             </div>
             <div>
                <h4 className="font-bold text-amber-900 text-sm md:text-base">
                    Límite de OXXO excedido
                </h4>
                <div className="text-amber-800/90 text-sm mt-1 space-y-1">
                    <p>
                        OXXO tiene un límite de <span className="font-bold">$5,000.00 MXN</span> por transacción.
                    </p>
                    <p>
                        Para depositar el total de <span className="font-bold text-amber-950">{formatMXN(totalAmount)}</span>, 
                        necesitas realizar <span className="font-bold bg-amber-200/50 px-1 rounded text-amber-900">múltiples depósitos</span>.
                    </p>
                </div>
             </div>
        </div>

        {/* Breakdown Visual */}
        <div className="p-4 bg-white">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Plan de depósitos
            </p>
            <div className="space-y-3">
                {chunks.map((chunk, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "flex items-center justify-between p-3 rounded-md border",
                            index === 0 
                                ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100" 
                                : "bg-gray-50 border-gray-100 opacity-75"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                index === 0 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                            )}>
                                {index + 1}
                            </div>
                            <span className={cn(
                                "font-mono font-bold",
                                index === 0 ? "text-blue-900" : "text-gray-600"
                            )}>
                                {formatMXN(chunk)}
                            </span>
                        </div>
                        
                        {index === 0 ? (
                            <div className="flex items-center text-blue-700 text-xs font-bold bg-blue-100 px-2 py-1 rounded">
                                <span>PAGAR AHORA</span>
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 font-medium">PENDIENTE</span>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                 <p className="text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 inline mr-1 text-green-500" />
                    Sube el comprobante de cada depósito individualmente.
                 </p>
            </div>
        </div>
    </div>
  );
};

export default OXXODepositBreakdown;