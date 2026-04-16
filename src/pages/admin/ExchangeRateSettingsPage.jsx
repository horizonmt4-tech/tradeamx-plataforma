import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CandlestickChart, AlertCircle } from 'lucide-react';

const ExchangeRateSettingsPage = () => {
  const { toast } = useToast();
  const { checkSuperAdminAuthorization } = useSuperAdminAuth();
  const [exchangeRate, setExchangeRate] = useState('');
  const [currentRateSource, setCurrentRateSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchExchangeRate = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-exchange-rate');
      if (error) throw error;
      
      setExchangeRate(data.rate.toString());
      setCurrentRateSource(data.source);

    } catch (error) {
      toast({ title: "Error al cargar tipo de cambio", description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const executeSave = async () => {
    const newRate = parseFloat(exchangeRate);
    if (isNaN(newRate) || newRate <= 0) {
      toast({ title: "Valor inválido", description: "Por favor, introduce un número positivo.", variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('admin_update_exchange_rate', { p_new_rate: newRate });
      if (error) throw error;

      toast({ title: "Éxito", description: "Tipo de cambio actualizado.", className: 'bg-green-600 text-white' });
      await fetchExchangeRate();
    } catch (error) {
      toast({ title: "Error al guardar", description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    checkSuperAdminAuthorization(executeSave);
  };

  return (
    <>
      <AdminHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-effect border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center"><CandlestickChart className="w-5 h-5 mr-2 text-red-400"/>Gestión de Tipo de Cambio (USD a MXN)</CardTitle>
            <CardDescription className="text-gray-300">
              Establece el tipo de cambio que se usará en toda la plataforma para convertir precios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {currentRateSource === 'auto' && (
                  <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">
                      Actualmente se está usando un tipo de cambio automático. Se recomienda establecer uno manual para mayor control.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="exchangeRate" className="text-lg text-gray-300">
                    1 USD =
                  </Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="bg-slate-800 border-gray-600 text-white text-2xl h-14 focus:border-green-500 focus:ring-green-500"
                    placeholder="Ej. 18.50"
                  />
                   <p className="text-xs text-gray-400 pt-1">
                    Fuente actual: <span className={`font-semibold ${currentRateSource === 'manual' ? 'text-green-400' : 'text-yellow-400'}`}>{currentRateSource === 'manual' ? 'Manual' : 'Automático'}</span>
                  </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                  {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Guardar Tipo de Cambio'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default ExchangeRateSettingsPage;