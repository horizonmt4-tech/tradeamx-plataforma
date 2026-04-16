import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck, CreditCard } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const PlanPreviewModal = ({ isOpen, onClose, plan }) => {
  const navigate = useNavigate();

  if (!plan) return null;

  const handleConfirm = () => {
    onClose();
    // Redirect to checkout page with plan_id
    navigate(`/checkout/${plan.id}`);
  };

  const features = Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white p-0 overflow-hidden gap-0 shadow-2xl shadow-black/50">
        
        {/* Header Section */}
        <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-[#d4af37] tracking-tight">
                {plan.name}
              </DialogTitle>
               <div className="text-center mt-4">
                  <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Trading Capital</div>
                  <span className="text-5xl font-extrabold text-white tracking-tighter">
                    ${parseInt(plan.capital).toLocaleString()}
                  </span>
               </div>
            </DialogHeader>
        </div>
        
        {/* Content Section */}
        <div className="p-6 bg-slate-950">
           {/* Price Box */}
           <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-6 flex justify-between items-center shadow-inner">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#d4af37]/10 rounded-full">
                    <CreditCard className="w-5 h-5 text-[#d4af37]" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-300">Precio del Plan</span>
                    <span className="text-xs text-gray-500">Pago único</span>
                 </div>
              </div>
              <span className="text-2xl font-bold text-white">${plan.price} <span className="text-sm text-gray-500 font-normal">USD</span></span>
           </div>

           {/* Features List */}
           <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Lo que incluye este plan:</h4>
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {features.map((feature, i) => (
                     <div key={i} className="flex items-start gap-3 group">
                        <CheckCircle className="w-4 h-4 text-[#d4af37] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-gray-300 leading-tight group-hover:text-white transition-colors">{feature}</span>
                     </div>
                  ))}
                  <div className="flex items-start gap-3">
                     <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                     <span className="text-sm text-gray-300 leading-tight">Garantía de satisfacción de 14 días</span>
                  </div>
              </div>
           </div>

           {/* Footer Buttons */}
           <div className="grid grid-cols-2 gap-4 pt-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="w-full border-gray-700 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold h-11 shadow-lg shadow-[#d4af37]/20"
              >
                Pagar Ahora
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanPreviewModal;