import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, Edit, Save, X } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

const AssetSettingsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [newAsset, setNewAsset] = useState({ symbol: '', category: '', contract_size: 1, price: 0, precision: 2, leverage: 100, spread: 0, swap_long: 0, swap_short: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const categories = ['Divisas (Forex)', 'Criptomonedas', 'Acciones (Stocks)', 'Índices', 'Materias Primas'];

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) throw error;
      
      const sortedAssets = (data || []).sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return a.symbol.localeCompare(b.symbol);
      });
      setAssets(sortedAssets);
    } catch (err) {
      console.error('Error fetching assets:', err);
      toast({ title: 'Error', description: 'No se pudieron cargar los activos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleInputChange = (e, id) => {
    const { name, value } = e.target;
    const parsedValue = ['price', 'contract_size', 'precision', 'leverage', 'spread', 'swap_long', 'swap_short'].includes(name) ? parseFloat(value) : value;

    if (id === 'new') {
        setNewAsset(prev => ({ ...prev, [name]: parsedValue }));
    } else {
        setAssets(assets.map(asset => asset.id === id ? { ...asset, [name]: parsedValue } : asset));
    }
  };

  const handleSelectChange = (value, name, id) => {
    if (id === 'new') {
        setNewAsset(prev => ({ ...prev, [name]: value }));
    } else {
        setAssets(assets.map(asset => asset.id === id ? { ...asset, [name]: value } : asset));
    }
  };

  const handleSave = async (id) => {
    const assetToSave = assets.find(asset => asset.id === id);
    if (!assetToSave) return;
    
    // eslint-disable-next-line no-unused-vars
    const { id: assetId, created_at, ...updateData } = assetToSave;

    try {
      const { error } = await supabase.from('assets').update(updateData).eq('id', assetId);
      if (error) throw error;
      
      toast({ title: 'Éxito', description: 'Activo guardado correctamente.', className: 'bg-green-600 text-white' });
      setEditingAssetId(null);
      await fetchAssets();
    } catch (err) {
      console.error('Error saving asset:', err);
      toast({ title: 'Error', description: `No se pudo guardar el activo: ${err.message}`, variant: 'destructive' });
    }
  };
  
  const handleAdd = async () => {
    if (!newAsset.symbol || !newAsset.category) {
        toast({ title: 'Error', description: 'Símbolo y categoría son requeridos.', variant: 'destructive' });
        return;
    }
    
    try {
      const { error } = await supabase.from('assets').insert([newAsset]);
      if (error) throw error;
      
      toast({ title: 'Éxito', description: 'Activo agregado correctamente.', className: 'bg-green-600 text-white' });
      setIsAdding(false);
      setNewAsset({ symbol: '', category: '', contract_size: 1, price: 0, precision: 2, leverage: 100, spread: 0, swap_long: 0, swap_short: 0 });
      await fetchAssets();
    } catch (err) {
      console.error('Error adding asset:', err);
      toast({ title: 'Error', description: `No se pudo agregar el activo: ${err.message}`, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('¿Estás seguro de que quieres eliminar este activo? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: 'Éxito', description: 'Activo eliminado.', className: 'bg-yellow-500 text-black' });
      await fetchAssets();
    } catch (err) {
      console.error('Error deleting asset:', err);
      toast({ title: 'Error', description: `No se pudo eliminar el activo: ${err.message}`, variant: 'destructive' });
    }
  };
  
  const AssetRow = ({ asset }) => {
    const isEditing = editingAssetId === asset.id;
    return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center p-4 bg-slate-800 rounded-lg">
            {isEditing ? (
                <>
                    <Input name="symbol" value={asset.symbol} onChange={(e) => handleInputChange(e, asset.id)} className="bg-slate-700 border-slate-600" />
                    <Select value={asset.category} onValueChange={(value) => handleSelectChange(value, 'category', asset.id)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-gray-600 text-white"><SelectGroup>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                    <Input type="number" name="contract_size" value={asset.contract_size} onChange={(e) => handleInputChange(e, asset.id)} className="bg-slate-700 border-slate-600" title="Tamaño Contrato" />
                    <Input type="number" name="price" value={asset.price} onChange={(e) => handleInputChange(e, asset.id)} className="bg-slate-700 border-slate-600" title="Precio Base" />
                    <Input type="number" name="precision" value={asset.precision} onChange={(e) => handleInputChange(e, asset.id)} className="bg-slate-700 border-slate-600" title="Precisión" />
                    <div className="flex space-x-2">
                        <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => handleSave(asset.id)}><Save className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditingAssetId(null); fetchAssets(); }}><X className="w-4 h-4" /></Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="font-bold">{asset.symbol}</div>
                    <div className="text-gray-400">{asset.category}</div>
                    <div>{asset.contract_size}</div>
                    <div>${Number(asset.price || 0).toFixed(asset.precision || 2)}</div>
                    <div>{asset.precision}</div>
                    <div className="flex space-x-2">
                        <Button size="icon" variant="outline" onClick={() => setEditingAssetId(asset.id)} className="bg-slate-700 hover:bg-slate-600"><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                </>
            )}
        </div>
    );
  };
  
  const AddAssetRow = () => (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center p-4 bg-slate-800 rounded-lg border-2 border-dashed border-green-500">
        <Input placeholder="Símbolo" name="symbol" value={newAsset.symbol} onChange={(e) => handleInputChange(e, 'new')} className="bg-slate-700 border-slate-600" />
        <Select value={newAsset.category} onValueChange={(value) => handleSelectChange(value, 'category', 'new')}>
            <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-gray-600 text-white"><SelectGroup>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Input placeholder="Tamaño Contrato" type="number" name="contract_size" value={newAsset.contract_size} onChange={(e) => handleInputChange(e, 'new')} className="bg-slate-700 border-slate-600" />
        <Input placeholder="Precio Base" type="number" name="price" value={newAsset.price} onChange={(e) => handleInputChange(e, 'new')} className="bg-slate-700 border-slate-600" />
        <Input placeholder="Precisión" type="number" name="precision" value={newAsset.precision} onChange={(e) => handleInputChange(e, 'new')} className="bg-slate-700 border-slate-600" />
        <div className="flex space-x-2">
            <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={handleAdd}><Save className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)}><X className="w-4 h-4" /></Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-effect border-gray-700">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Configuración de Activos</CardTitle>
              <CardDescription>Añade, edita o elimina los activos disponibles para operar.</CardDescription>
            </div>
            {!isAdding && <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white"><PlusCircle className="mr-2 h-4 w-4" />Añadir Activo</Button>}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:grid grid-cols-6 gap-4 items-center px-4 py-2 text-gray-400 font-bold uppercase text-sm">
                  <span>Símbolo</span>
                  <span>Categoría</span>
                  <span>Tamaño Contrato</span>
                  <span>Precio</span>
                  <span>Precisión</span>
                  <span>Acciones</span>
                </div>
                {isAdding && <AddAssetRow />}
                {assets.map(asset => <AssetRow key={asset.id} asset={asset} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AssetSettingsPage;