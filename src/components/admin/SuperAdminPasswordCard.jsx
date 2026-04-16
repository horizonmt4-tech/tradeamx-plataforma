import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';

    const SuperAdminPasswordCard = () => {
        const [secretKey, setSecretKey] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const { toast } = useToast();

        const handleChangePassword = async () => {
            if (secretKey !== 'FERNANDA') {
                toast({ title: "Clave secreta incorrecta", description: "La clave secreta proporcionada no es válida.", variant: "destructive" });
                return;
            }
            if (!newPassword || newPassword.length < 8) {
                toast({ title: "Contraseña inválida", description: "La nueva contraseña debe tener al menos 8 caracteres.", variant: "destructive" });
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase.functions.invoke('update-super-admin-password', {
                    body: { newPassword },
                });

                if (error) throw new Error(error.message);

                if (data.success) {
                    toast({ title: "Éxito", description: data.message, className: 'bg-green-600 text-white' });
                    setSecretKey('');
                    setNewPassword('');
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        return (
            <Card className="glass-effect border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-2 text-red-500" />
                        Seguridad Súper Admin
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Cambia la contraseña de Súper Administrador. Esta acción es crítica.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="secret-key" className="text-gray-300">Clave Secreta de Autorización</Label>
                        <Input
                            id="secret-key"
                            type="password"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            placeholder="Introduce la clave secreta"
                            className="bg-slate-800 border-gray-600 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-gray-300">Nueva Contraseña de Súper Admin</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="bg-slate-800 border-gray-600 text-white"
                        />
                    </div>
                    <Button onClick={handleChangePassword} disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-5 h-5 mr-2" />Cambiar Contraseña</>}
                    </Button>
                </CardContent>
            </Card>
        );
    };

    export default SuperAdminPasswordCard;