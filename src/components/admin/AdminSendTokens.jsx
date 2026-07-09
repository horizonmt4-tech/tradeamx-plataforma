// AdminSendTokens.jsx
// Panel admin: enviar (mint) TAMX a la wallet de un cliente.

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ExternalLink } from 'lucide-react';

const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

export default function AdminSendTokens() {
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setError(null);
    setResult(null);

    if (!isValidAddress(wallet)) {
      setError('Wallet inválida. Debe empezar con 0x y tener 42 caracteres.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-tamx', {
        body: { to: wallet, amount },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      setWallet('');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Error al enviar tokens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-gray-700 bg-slate-900/50 max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Send className="h-4 w-4 text-cyan-400" />
          Enviar TAMX a cliente
        </CardTitle>
        <p className="text-xs text-gray-500">
          El token se envía directamente a la wallet Coinbase del cliente en Sepolia.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Wallet del cliente</label>
          <input
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-sm text-white font-mono placeholder:text-gray-600"
            placeholder="0x..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value.trim())}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Cantidad de TAMX</label>
          <input
            type="number"
            min="0"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder:text-gray-600"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          {loading ? 'Enviando...' : 'Enviar tokens'}
        </Button>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        {result?.txHash && (
          <a
            className="flex items-center gap-1 text-green-400 text-xs underline"
            target="_blank"
            rel="noreferrer"
            href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
          >
            Enviado correctamente. Ver transacción <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}