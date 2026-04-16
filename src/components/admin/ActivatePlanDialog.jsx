import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const ActivatePlanDialog = ({
  isOpen,
  setIsOpen,
  userToActivate,
  plans,
  selectedPlanId,
  setSelectedPlanId,
  handleActivatePlan,
  updating,
}) => {
  if (!userToActivate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Activar Plan Manualmente</DialogTitle>
          <DialogDescription>
            Selecciona un plan para activar en la cuenta de <span className="font-bold text-green-400">{userToActivate.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="col-span-3 bg-slate-800 border-gray-600">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-gray-600 text-white">
                {plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.capital.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleActivatePlan} disabled={updating}>
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activar Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivatePlanDialog;