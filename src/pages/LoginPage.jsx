import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, TrendingUp, Lock, Sparkles, Copy } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Bienvenido de vuelta",
        description: "Has iniciado sesión exitosamente.",
      });
      
      navigate(from, { replace: true });

    } catch (error) {
      console.error('Error logging in:', error);
      let errorMessage = "Ocurrió un error al iniciar sesión.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Correo o contraseña incorrectos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor confirma tu correo electrónico antes de iniciar sesión.";
      }

      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@tradea.com');
    setPassword('demo123');
    toast({
      title: "Credenciales copiadas",
      description: "Las credenciales de demostración se han rellenado automáticamente.",
    });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">Tradea</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
            <p className="text-gray-400 mt-2">Accede a tu panel de control</p>
        </div>

        <Card className="glass-effect border-gray-700 shadow-xl backdrop-blur-md mb-6">
          <CardHeader className="pb-4">
             <CardTitle className="text-xl text-white flex items-center">
                <Lock className="w-5 h-5 mr-2 text-green-500"/>
                Iniciar Sesión
             </CardTitle>
             <CardDescription className="text-gray-400">Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
                    <Link to="/auth/reset-password" className="text-xs text-green-400 hover:text-green-300 hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-6 shadow-lg shadow-blue-900/20"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar a mi cuenta'}
              </Button>
              
              <div className="text-center text-sm text-gray-400">
                ¿Aún no tienes cuenta?{' '}
                {/* ✅ Corregido: /signup → /register */}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                  Regístrate aquí
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Account Info Card */}
        <Card className="glass-effect border-indigo-500/30 bg-indigo-900/10 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-indigo-500/20 p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm mb-1">Cuenta de Demostración</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Prueba la plataforma con estas credenciales:
                </p>
                
                <div className="grid grid-cols-1 gap-2 text-xs bg-slate-900/40 p-2 rounded border border-indigo-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-indigo-300 font-mono">demo@tradea.com</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Password:</span>
                    <span className="text-indigo-300 font-mono">demo123</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fillDemoCredentials}
                  className="w-full mt-3 h-8 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Rellenar datos de prueba
                </Button>
              </div>
            </div>
          </CardContent>
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

export default LoginPage;