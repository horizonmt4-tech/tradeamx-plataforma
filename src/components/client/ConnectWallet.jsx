// ConnectWallet.jsx
// Vista del CLIENTE: conectar su Coinbase Wallet y agregar TAMX.

import { useState, useEffect } from 'react';
import { connectCoinbaseWallet, addTamxToWallet } from '@/lib/coinbaseWallet';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, PlusCircle, Info } from 'lucide-react';

export default function ConnectWallet() {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInjectedWallet, setHasInjectedWallet] = useState(true);

  useEffect(() => {
    // Detecta si hay una wallet inyectada en el navegador (extensión de escritorio,
    // o el navegador integrado dentro de una app de wallet móvil). Si no hay
    // ninguna, el cliente probablemente está en Chrome/Safari normal del celular,
    // donde "Agregar TAMX a mi wallet" no puede disparar el popup automático.
    setHasInjectedWallet(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const { address: connectedAddress } = await connectCoinbaseWallet();
      setAddress(connectedAddress);

      // Guarda la wallet en el perfil para que el admin la encuentre después
      // sin tener que pedírsela manualmente al cliente.
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase
          .from('profiles')
          .update({ wallet_address: connectedAddress })
          .eq('id', userData.user.id);
      }
    } catch (err) {
      setError(err.message || 'No se pudo conectar la wallet.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    setError(null);
    try {
      await addTamxToWallet();
    } catch (err) {
      setError(err.message || 'No se pudo agregar el token.');
    }
  };

  return (
    <Card className="glass-effect border-gray-700 bg-slate-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Wallet className="h-4 w-4 text-cyan-400" />
          Tu wallet TAMX
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-400 mb-3">
          Conecta tu Coinbase Wallet para ver y usar tus tokens TAMX.
        </p>

        {!hasInjectedWallet && (
          <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 mb-3">
            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-300/90 leading-relaxed">
              ¿Estás en el navegador normal de tu celular? Para que el token se agregue
              automático, abre esta página desde el navegador integrado de tu app de
              Coinbase Wallet o Base (busca "TradeAMX" en la barra de búsqueda de la app).
            </p>
          </div>
        )}

        {!address ? (
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {loading ? 'Conectando...' : 'Conectar Coinbase Wallet'}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-300 font-mono break-all bg-slate-800/60 rounded-lg p-2">
              {address}
            </p>
            <Button
              onClick={handleAddToken}
              variant="ghost"
              className="w-full border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar TAMX a mi wallet
            </Button>
          </div>
        )}

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </CardContent>
    </Card>
  );
}