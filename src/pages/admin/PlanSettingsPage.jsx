import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlanSettingsPage = () => {
  const { toast } = useToast();
  const { checkAuthorization } = useSuperAdminAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('funding_plans').select('*').order('sort_order');
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los planes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const authorized = await checkAuthorization();
    if (!authorized) return;

    setSaving(true);
    try {
      for (const plan of plans) {
        const { error } = await supabase
          .from('funding_plans')
          .upsert(plan, { onConflict: 'id' });
        
        if (error) throw error;
      }
      toast({ title: 'Éxito', description: 'Planes actualizados correctamente.', className: 'bg-green-600 text-white' });
      await fetchPlans();
    } catch (error) {
      console.error('Error saving plans:', error);
      toast({ title: 'Error al guardar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id, field, value) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddPlan = () => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      name: 'Nuevo Plan',
      capital: 10000,
      price: 100,
      description: 'Descripción del plan',
      features: [],
      popular: false,
      sort_order: plans.length,
    };
    setPlans([...plans, newPlan]);
  };

  const handleDeletePlan = async (id) => {
    const authorized = await checkAuthorization();
    if (!authorized) return;

    try {
      const { error } = await supabase.from('funding_plans').delete().eq('id', id);
      if (error) throw error;
      
      setPlans(plans.filter(p => p.id !== id));
      toast({ title: 'Éxito', description: 'Plan eliminado.', className: 'bg-yellow-500 text-black' });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el plan.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/super-admin">
                <Button variant="outline" size="icon" className="border-gray-600 hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">Configuración de Planes</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPlan} variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                <Plus className="mr-2 h-4 w-4" /> Agregar Plan
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="glass-effect border-gray-700">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <Input
                      value={plan.name}
                      onChange={(e) => handleChange(plan.id, 'name', e.target.value)}
                      className="bg-slate-800 border-gray-600 text-white text-xl font-bold max-w-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Capital</Label>
                    <Input
                      type="number"
                      value={plan.capital}
                      onChange={(e) => handleChange(plan.id, 'capital', parseFloat(e.target.value))}
                      className="bg-slate-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>Precio</Label>
                    <Input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handleChange(plan.id, 'price', parseFloat(e.target.value))}
                      className="bg-slate-800 border-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Input
                      value={plan.description || ''}
                      onChange={(e) => handleChange(plan.id, 'description', e.target.value)}
                      className="bg-slate-800 border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PlanSettingsPage;