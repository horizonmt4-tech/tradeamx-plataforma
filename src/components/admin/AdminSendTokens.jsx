// AdminSendTokens.jsx
// Panel admin: enviar (mint) TAMX a la wallet de un cliente.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ExternalLink, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';

const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const BASESCAN_TX_URL = (hash) => `https://basescan.org/tx/${hash}`;

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CopyLinkButton({ txHash }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(BASESCAN_TX_URL(txHash));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-white transition-colors"
      title="Copiar link para el cliente"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function AdminSendTokens() {
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('tamx_sends')
      .select('id, tx_hash, to_address, amount, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (!fetchErr) setHistory(data || []);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      fetchHistory();
    } catch (err) {
      setError(err.message || 'Error al enviar tokens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Send className="h-4 w-4 text-cyan-400" />
            Enviar TAMX a cliente
          </CardTitle>
          <p className="text-xs text-gray-500">
            El token se envía directamente a la wallet Coinbase del cliente en Base.
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
              step="any"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder:text-gray-600"
              placeholder="100 o 10.20"
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
              href={BASESCAN_TX_URL(result.txHash)}
            >
              Enviado correctamente. Ver transacción <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">Historial de envíos</CardTitle>
          <p className="text-xs text-gray-500">Últimos 20 envíos, con link listo para mandar al cliente.</p>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-xs text-gray-500">Cargando...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-500">Todavía no hay envíos registrados.</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-2 border-b border-slate-800 last:border-0 text-xs"
                >
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" title={item.error_message} />
                  )}

                  <span className="font-mono text-gray-300">{truncateAddress(item.to_address)}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-white font-medium">{item.amount} TAMX</span>
                  <span className="text-gray-600 ml-auto shrink-0">
                    {new Date(item.created_at).toLocaleString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {item.status === 'success' && (
                    <>
                      <a
                        href={BASESCAN_TX_URL(item.tx_hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 shrink-0"
                        title="Ver en Basescan"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <CopyLinkButton txHash={item.tx_hash} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// Panel admin: enviar (mint) TAMX a la wallet de un cliente.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ExternalLink, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';

const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const BASESCAN_TX_URL = (hash) => `https://basescan.org/tx/${hash}`;

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CopyLinkButton({ txHash }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(BASESCAN_TX_URL(txHash));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-white transition-colors"
      title="Copiar link para el cliente"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function AdminSendTokens() {
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('tamx_sends')
      .select('id, tx_hash, to_address, amount, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (!fetchErr) setHistory(data || []);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      fetchHistory();
    } catch (err) {
      setError(err.message || 'Error al enviar tokens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Send className="h-4 w-4 text-cyan-400" />
            Enviar TAMX a cliente
          </CardTitle>
          <p className="text-xs text-gray-500">
            El token se envía directamente a la wallet Coinbase del cliente en Base.
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
              step="any"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder:text-gray-600"
              placeholder="100 o 10.20"
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
              href={BASESCAN_TX_URL(result.txHash)}
            >
              Enviado correctamente. Ver transacción <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">Historial de envíos</CardTitle>
          <p className="text-xs text-gray-500">Últimos 20 envíos, con link listo para mandar al cliente.</p>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-xs text-gray-500">Cargando...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-500">Todavía no hay envíos registrados.</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-2 border-b border-slate-800 last:border-0 text-xs"
                >
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" title={item.error_message} />
                  )}

                  <span className="font-mono text-gray-300">{truncateAddress(item.to_address)}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-white font-medium">{item.amount} TAMX</span>
                  <span className="text-gray-600 ml-auto shrink-0">
                    {new Date(item.created_at).toLocaleString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {item.status === 'success' && (
                    <>
                      <a
                        href={BASESCAN_TX_URL(item.tx_hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 shrink-0"
                        title="Ver en Basescan"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <CopyLinkButton txHash={item.tx_hash} />
                    </>
                  )}
                </div>
              ))}
            <// AdminSendTokens.jsx
// Panel admin: enviar (mint) TAMX a la wallet de un cliente.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ExternalLink, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';

const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const BASESCAN_TX_URL = (hash) => `https://basescan.org/tx/${hash}`;

function truncateAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CopyLinkButton({ txHash }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(BASESCAN_TX_URL(txHash));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-white transition-colors"
      title="Copiar link para el cliente"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function AdminSendTokens() {
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('tamx_sends')
      .select('id, tx_hash, to_address, amount, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (!fetchErr) setHistory(data || []);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      fetchHistory();
    } catch (err) {
      setError(err.message || 'Error al enviar tokens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Send className="h-4 w-4 text-cyan-400" />
            Enviar TAMX a cliente
          </CardTitle>
          <p className="text-xs text-gray-500">
            El token se envía directamente a la wallet Coinbase del cliente en Base.
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
              step="any"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder:text-gray-600"
              placeholder="100 o 10.20"
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
              href={BASESCAN_TX_URL(result.txHash)}
            >
              Enviado correctamente. Ver transacción <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect border-gray-700 bg-slate-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">Historial de envíos</CardTitle>
          <p className="text-xs text-gray-500">Últimos 20 envíos, con link listo para mandar al cliente.</p>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-xs text-gray-500">Cargando...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-500">Todavía no hay envíos registrados.</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-2 border-b border-slate-800 last:border-0 text-xs"
                >
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" title={item.error_message} />
                  )}

                  <span className="font-mono text-gray-300">{truncateAddress(item.to_address)}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-white font-medium">{item.amount} TAMX</span>
                  <span className="text-gray-600 ml-auto shrink-0">
                    {new Date(item.created_at).toLocaleString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {item.status === 'success' && (
                    <>
                      <a
                        href={BASESCAN_TX_URL(item.tx_hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 shrink-0"
                        title="Ver en Basescan"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <CopyLinkButton txHash={item.tx_hash} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}