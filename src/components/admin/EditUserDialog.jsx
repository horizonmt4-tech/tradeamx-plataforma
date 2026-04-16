import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';

const EditUserDialog = ({ user, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    balance: '',
    profit: '',
    drawdown: '',
    rules_profile: 'prop_firm'
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        balance: user.balance || 0,
        profit: user.profit || 0,
        drawdown: user.drawdown || 0,
        rules_profile: user.rules_profile || 'prop_firm'
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, rules_profile: value });
  };

  const handleUpdateProfile = async () => {
    // Validation
    const parsedBalance = parseFloat(formData.balance);
    const parsedProfit = parseFloat(formData.profit);
    const parsedDrawdown = parseFloat(formData.drawdown);

    if (isNaN(parsedBalance) || isNaN(parsedProfit) || isNaN(parsedDrawdown)) {
      toast({ title: "Error de validación", description: "Los valores deben ser numéricos.", variant: "destructive" });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.rpc('admin_update_user_metrics', {
        p_user_id: user.id,
        p_new_balance: parsedBalance,
        p_new_profit: parsedProfit,
        p_new_drawdown: parsedDrawdown,
        p_rules_profile: formData.rules_profile
      });

      if (error) throw error;

      toast({ title: "Éxito", description: "Perfil de usuario actualizado correctamente.", className: 'bg-green-600 text-white' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({ title: "Error al actualizar", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-slate-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Perfil de Usuario</DialogTitle>
          <DialogDescription>
            Estás modificando el perfil para <span className="font-bold text-green-400">{user.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">Balance</Label>
            <Input id="balance" type="number" value={formData.balance} onChange={handleChange} className="col-span-3 bg-slate-800 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profit" className="text-right">Ganancia</Label>
            <Input id="profit" type="number" value={formData.profit} onChange={handleChange} className="col-span-3 bg-slate-800 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="drawdown" className="text-right">Pérdida (%)</Label>
            <Input id="drawdown" type="number" value={formData.drawdown} onChange={handleChange} className="col-span-3 bg-slate-800 border-gray-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rules_profile" className="text-right">Perfil Reglas</Label>
            <Select value={formData.rules_profile} onValueChange={handleSelectChange}>
              <SelectTrigger className="col-span-3 bg-slate-800 border-gray-600">
                <SelectValue placeholder="Seleccionar perfil" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-gray-600 text-white">
                <SelectItem value="prop_firm">Fondeo</SelectItem>
                <SelectItem value="standard">Estándar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
            <Link to={`/admin/user/${user.id}/trades`}>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Editar Operaciones <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleUpdateProfile} disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;