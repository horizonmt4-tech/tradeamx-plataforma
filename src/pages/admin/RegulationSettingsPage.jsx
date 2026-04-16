import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegulationSettingsPage = () => {
  const { toast } = useToast();
  const { checkAuthorization } = useSuperAdminAuth();
  const [regulationText, setRegulationText] = useState('');
  const [regulationNumber, setRegulationNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRegulationInfo();
  }, []);

  const fetchRegulationInfo = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'regulation_info')
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({ title: 'Error', description: 'No se pudo cargar la información de regulación.', variant: 'destructive' });
    } else if (data) {
      setRegulationText(data.value.text || '');
      setRegulationNumber(data.value.number || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const authorized = await checkAuthorization();
    if (!authorized) return;

    setSaving(true);
    const { error } = await supabase.rpc('admin_update_regulation_info', {
      p_text: regulationText,
      p_number: regulationNumber,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Información de regulación actualizada correctamente.' });
    }
    setSaving(false);
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-6 flex items-center space-x-4">
            <Link to="/super-admin">
              <Button variant="outline" size="icon" className="border-gray-600 hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Información de Regulación</h1>
          </div>

          <Card className="glass-effect border-gray-700">
            <CardHeader>
              <CardTitle>Configurar Información de Regulación</CardTitle>
              <CardDescription>Esta información se mostrará en el footer del sitio web.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="regulationText">Texto de Regulación</Label>
                <Input
                  id="regulationText"
                  value={regulationText}
                  onChange={(e) => setRegulationText(e.target.value)}
                  placeholder="Ej: Regulado por"
                  className="bg-slate-800 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="regulationNumber">Número de Regulación</Label>
                <Input
                  id="regulationNumber"
                  value={regulationNumber}
                  onChange={(e) => setRegulationNumber(e.target.value)}
                  placeholder="Ej: FCA #123456"
                  className="bg-slate-800 border-gray-600"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default RegulationSettingsPage;