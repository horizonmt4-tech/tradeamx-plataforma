import React from 'react';
import { CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PaymentConfirmationBadge = ({ planName, capital, price }) => {
  return (
    <Card className="bg-green-900/20 border-green-500/30 mb-6 overflow-hidden">
      <div className="bg-green-600/20 p-3 border-b border-green-500/20 flex items-center justify-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span className="font-bold text-green-100 text-sm uppercase tracking-wider">Payment Confirmed</span>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center pb-3 border-b border-green-500/20">
                <span className="text-gray-400 text-sm">Plan Selected</span>
                <span className="text-white font-bold">{planName}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Trading Capital</span>
                <span className="text-[#d4af37] font-bold text-lg">${parseInt(capital).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> Amount Paid</span>
                <span>${price} USD</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentConfirmationBadge;