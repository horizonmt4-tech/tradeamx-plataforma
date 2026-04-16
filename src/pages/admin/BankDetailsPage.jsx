import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import BankDetailsCard from '@/components/admin/BankDetailsCard';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, ArrowLeft } from 'lucide-react';

const BankDetailsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bankDetails, setBankDetails] = useState({
    id: null,
    bank_name: '',
    beneficiary_name: '',
    clabe: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBankDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_details')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        toast({ 
          title: "Error al cargar detalles bancarios", 
          description: error.message, 
          variant: 'destructive' 
        });
      } else if (data) {
        setBankDetails(data);
      }
    } catch (err) {
      console.error('Fetch bank details error:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBankDetails();
  }, [fetchBankDetails]);

  const handleChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.id]: e.target.value });
  };

  const handleSave = async () => {
    // Validate required fields locally
    if (!bankDetails.bank_name || !bankDetails.beneficiary_name || !bankDetails.clabe) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos bancarios.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      let error;
      if (bankDetails.id) {
        const { error: updateError } = await supabase
          .from('bank_details')
          .update({
            bank_name: bankDetails.bank_name,
            beneficiary_name: bankDetails.beneficiary_name,
            clabe: bankDetails.clabe,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bankDetails.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('bank_details')
          .insert({
            bank_name: bankDetails.bank_name,
            beneficiary_name: bankDetails.beneficiary_name,
            clabe: bankDetails.clabe,
          });
        error = insertError;
      }

      if (error) throw error;
      
      toast({ 
        title: "Éxito", 
        description: "Detalles bancarios actualizados correctamente.", 
        className: 'bg-green-600 text-white' 
      });
      
      await fetchBankDetails();
    } catch (error) {
      toast({ 
        title: "Error al guardar cambios", 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AdminHeader />
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => navigate('/super-admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>

          <Button 
            variant="secondary" 
            className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
            onClick={() => navigate('/admin/profile')}
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Perfil y Seguridad
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Datos Bancarios del Sistema</h1>
          <p className="text-slate-400 text-sm">Configura la cuenta para depósitos manuales (SPEI/Transferencia).</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <BankDetailsCard
            bankDetails={bankDetails}
            handleChange={handleChange}
            handleSave={handleSave}
            saving={saving}
          />
        )}
      </main>
    </div>
  );
};

export default BankDetailsPage;