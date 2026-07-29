// ConnectWallet.jsx
// Vista del CLIENTE: ver su balance de TAMX en tiempo real (leído directo de
// la blockchain, no depende de que Coinbase Wallet lo haya "indexado") y
// conectar su wallet para agregar el token visualmente si lo desea.

import { useState, useEffect, useCallback } from 'react';
import { connectCoinbaseWallet, addTamxToWallet, getTamxBalance } from '@/lib/coinbaseWallet';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, PlusCircle, Info, RefreshCw, ExternalLink } from 'lucide-react';

const BASESCAN_ADDRESS_URL = (addr) =>
  `https://basescan.org/token/0xDCA8Ce12aC35990baA05f007f92BC28507Ffe710?a=${addr}`;

export default function ConnectWallet() {
  const [address, setAddress] = useState(null);
  const [savedWallet, setSavedWallet] = useState(null); // wallet guardada en el perfil, aunque no esté conectada ahora
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInjectedWallet, setHasInjectedWallet] = useState(true);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    setHasInjectedWallet(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  const fetchBalance = useCallback(async (walletAddress) => {
    if (!walletAddress) return;
    setBalanceLoading(true);
    try {
      const bal = await getTamxBalance(walletAddress);
      setBalance(bal);
    } catch (err) {
      console.error('Error leyendo balance TAMX:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Al cargar, revisa si el cliente ya tiene una wallet guardada en su perfil
  // (de una conexión anterior) y muestra su balance de inmediato, sin
  // necesitar que la wallet esté activa en este navegador.
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', userData.user.id)
        .single();
      if (profile?.wallet_address) {
        setSavedWallet(profile.wallet_address);
        fetchBalance(profile.wallet_address);
      }
    })();
  }, [fetchBalance]);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const { address: connectedAddress } = await connectCoinbaseWallet();
      setAddress(connectedAddress);
      setSavedWallet(connectedAddress);

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase
          .from('profiles')
          .update({ wallet_address: connectedAddress })
          .eq('id', userData.user.id);
      }
      fetchBalance(connectedAddress);
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
        {savedWallet && (
          <div className="bg-slate-800/60 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Balance TAMX (en vivo, blockchain)</span>
              <button
                onClick={() => fetchBalance(savedWallet)}
                disabled={balanceLoading}
                className="text-slate-400 hover:text-white transition-colors"
                title="Actualizar balance"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${balanceLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-2xl font-bold text-white font-mono tabular-nums">
              {balance === null ? '—' : balance.toLocaleString('es-MX', { maximumFractionDigits: 4 })}
              <span className="text-sm text-gray-400 ml-1">TAMX</span>
            </p>
            <a
              href={BASESCAN_ADDRESS_URL(savedWallet)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 mt-1"
            >
              Verificar en Basescan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

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