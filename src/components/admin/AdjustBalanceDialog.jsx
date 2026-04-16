import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, DollarSign, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdjustBalanceDialog = ({ isOpen, onClose, user, onSubmit, isSubmitting }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [justification, setJustification] = useState('');
  const [activeTab, setActiveTab] = useState('adjustment');

  if (!user) return null;

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount === 0) {
      toast({ title: "Error", description: "La cantidad debe ser un número diferente de cero.", variant: "destructive" });
      return;
    }

    // Prevención en frontend: No permitir restar más del balance disponible
    if (activeTab === 'adjustment' && numericAmount < 0 && Math.abs(numericAmount) > (user.balance || 0)) {
      toast({ 
        title: "Fondos Insuficientes", 
        description: `No puedes descontar $${Math.abs(numericAmount)} USD. El balance actual del usuario es de $${(user.balance || 0).toFixed(2)} USD.`, 
        variant: "destructive" 
      });
      return;
    }

    if (!justification.trim()) {
      toast({ title: "Error", description: "La justificación es obligatoria.", variant: "destructive" });
      return;
    }
    
    onSubmit(numericAmount, justification, activeTab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setAmount('');
        setJustification('');
        setActiveTab('adjustment');
      }
    }}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Ajustar Saldo / Bono</DialogTitle>
          <DialogDescription>
            Ajustando el saldo para <span className="font-bold text-purple-400">{user.email}</span>.
            <br/>
            Balance Actual: <span className="text-white font-mono">${(user.balance || 0).toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="adjustment" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />Ajuste de Balance
            </TabsTrigger>
            <TabsTrigger value="bonus" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Gift className="w-4 h-4 mr-2" />Otorgar Bono
            </TabsTrigger>
          </TabsList>
          <TabsContent value="adjustment">
            <p className="text-sm text-gray-400 mt-2 mb-4">Ajusta el balance principal del usuario. Usa números negativos para descontar saldos.</p>
          </TabsContent>
          <TabsContent value="bonus">
            <p className="text-sm text-gray-400 mt-2 mb-4">Otorga un bono que se suma al capital del usuario, pero se registra por separado.</p>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Cantidad (USD)</Label>
            <Input 
              id="amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="col-span-3 bg-slate-800 border-gray-600" 
              placeholder="Ej: 200 o -50" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="justification" className="text-right">Justificación</Label>
            <Input 
              id="justification" 
              value={justification} 
              onChange={(e) => setJustification(e.target.value)} 
              className="col-span-3 bg-slate-800 border-gray-600" 
              placeholder="Ej: Corrección de swap / Depósito externo" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Operación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustBalanceDialog;