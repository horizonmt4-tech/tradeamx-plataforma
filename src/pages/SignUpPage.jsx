import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowLeft, TrendingUp, CheckCircle, Lock, Ticket } from 'lucide-react';
import PaymentConfirmationBadge from '@/components/PaymentConfirmationBadge';

const SignUpPage = () => {
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName]             = useState('');
  const [phoneNumber, setPhoneNumber]       = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [codeStatus, setCodeStatus]         = useState(null); // null | 'valid' | 'invalid'
  const [loading, setLoading]               = useState(false);
  const [plan, setPlan]                     = useState(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  const { toast }          = useToast();
  const navigate           = useNavigate();
  const [searchParams]     = useSearchParams();

  const sessionId  = searchParams.get('session_id');
  const planId     = searchParams.get('plan_id');
  const emailParam = searchParams.get('email');
  // Soporte para código en URL: /register?code=TAURUX2026
  const codeParam  = searchParams.get('code');

  useEffect(() => {
    if (emailParam)  setEmail(emailParam);
    if (codeParam)   setInvitationCode(codeParam.toUpperCase());
    if (sessionId && planId) {
      setIsPaymentConfirmed(true);
      fetchPlanDetails(planId);
    }
  }, [sessionId, planId, emailParam, codeParam]);

  const fetchPlanDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('funding_plans').select('*').eq('id', id).single();
      if (!error && data) setPlan(data);
    } catch (err) {
      console.error("Failed to fetch plan", err);
    }
  };

  // Validar código de invitación cuando el usuario termina de escribirlo
  const handleCodeBlur = async () => {
    if (!invitationCode.trim()) { setCodeStatus(null); return; }
    const { data } = await supabase.rpc('validate_invitation_code', {
      p_code: invitationCode.trim().toUpperCase(),
    });
    setCodeStatus(data ? 'valid' : 'invalid');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password || !confirmPassword || !fullName || !phoneNumber) {
        throw new Error('Por favor completa todos los campos.');
      }
      if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');
      if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

      // Resolver office_id desde el código de invitación (si lo pusieron)
      let office_id = null;
      if (invitationCode.trim()) {
        const { data: oid } = await supabase.rpc('validate_invitation_code', {
          p_code: invitationCode.trim().toUpperCase(),
        });
        if (!oid) throw new Error('El código de invitación no es válido o ya expiró.');
        office_id = oid;
      } else {
        // Sin código → oficina default TaurusFX
        const { data: offices } = await supabase
          .from('offices').select('id').eq('code', 'TAURUXFX').single();
        office_id = offices?.id || null;
      }

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone_number: phoneNumber },
        },
      });
      if (authError) throw authError;

      const user = authData?.user;

      // 2. Actualizar perfil con office_id (el trigger de Supabase crea el perfil,
      //    aquí solo le asignamos la oficina)
      if (user && office_id) {
        await supabase
          .from('profiles')
          .update({ office_id, role: 'client' })
          .eq('id', user.id);
      }

      // 3. Si hay pago confirmado, verificar y activar plan
      if (isPaymentConfirmed && sessionId && user) {
        toast({ title: "Verificando pago...", description: "Por favor espera un momento." });
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId, user_id: user.id },
        });
        if (verifyError) throw new Error('Error en la verificación del pago: ' + verifyError.message);
        if (!verifyData?.success) throw new Error('No se pudo verificar el pago o activar el plan.');
        toast({ title: "¡Cuenta activada!", description: "Tu plan de fondeo ha sido activado exitosamente." });
      } else {
        toast({ title: "¡Cuenta creada!", description: "Bienvenido a TradeAMX." });
      }

      if (authData?.session) navigate('/dashboard');
      else navigate('/check-email');

    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 transition-all">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">TradeAMX</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="text-gray-400 mt-2">Comienza tu viaje como trader profesional hoy</p>
        </div>

        <Card className="glass-effect border-gray-700 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Registro</CardTitle>
            <CardDescription className="text-gray-400">Ingresa tus datos para registrarte</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {isPaymentConfirmed && plan && (
                <PaymentConfirmationBadge planName={plan.name} capital={plan.capital} price={plan.price} />
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-200">Nombre Completo</Label>
                <Input id="fullName" type="text" placeholder="Ej. Juan Pérez"
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="nombre@ejemplo.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500"
                  required disabled={!!emailParam} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-200">Número de Teléfono</Label>
                <Input id="phoneNumber" type="tel" placeholder="Ej. +52 55 1234 5678"
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500"
                  required minLength={6} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Contraseña</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500"
                  required minLength={6} />
              </div>

              {/* ── Código de invitación (opcional) ── */}
              <div className="space-y-2">
                <Label htmlFor="invitationCode" className="text-gray-200 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" />
                  Código de invitación
                  <span className="text-gray-500 font-normal">(opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="invitationCode"
                    type="text"
                    placeholder="Ej. TAURUX2026"
                    value={invitationCode}
                    onChange={(e) => { setInvitationCode(e.target.value.toUpperCase()); setCodeStatus(null); }}
                    onBlur={handleCodeBlur}
                    className={`bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 uppercase tracking-widest
                      ${codeStatus === 'valid'   ? 'border-green-500 focus:border-green-500' : ''}
                      ${codeStatus === 'invalid' ? 'border-red-500 focus:border-red-500'     : ''}
                    `}
                  />
                  {codeStatus === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-xs font-medium">✓ Válido</span>
                  )}
                  {codeStatus === 'invalid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium">✗ Inválido</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Si alguien te refirió, ingresa su código de invitación.</p>
              </div>

              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Acceso a plataforma de trading
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Soporte dedicado
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-6 shadow-lg shadow-green-900/20"
                disabled={loading}
              >
                {loading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : isPaymentConfirmed ? 'Completar Registro y Activar' : 'Crear Cuenta'
                }
              </Button>
              <div className="text-center text-sm text-gray-400">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-green-400 hover:text-green-300 font-medium hover:underline transition-colors">
                  Inicia Sesión
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-300 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;