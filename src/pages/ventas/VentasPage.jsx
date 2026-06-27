// src/pages/ventas/VentasPage.jsx
// Panel exclusivo para usuarios con role = 'ventas'
// Solo ve nuevos registros de su oficina (datos de contacto)

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users, Phone, Mail, RefreshCw, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fmtDate = (d) => new Date(d).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City',
  dateStyle: 'short',
  timeStyle: 'short',
});

const VentasPage = () => {
  const { user } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filtro, setFiltro]       = useState('7'); // días

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    const dias = parseInt(filtro);
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, created_at, country, balance, has_purchased_plan')
      .eq('role', 'client')
      .gte('created_at', desde.toISOString())
      .order('created_at', { ascending: false });

    // Si es ventas (no manager) solo ve su oficina
    if (!user.isManager && user.office_id) {
      query = query.eq('office_id', user.office_id);
    }

    const { data, error } = await query;
    if (!error) setRegistros(data || []);
    setLoading(false);
  }, [filtro, user]);

  useEffect(() => { fetchRegistros(); }, [fetchRegistros]);

  const filtered = registros.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone_number?.includes(search)
  );

  const abrirWhatsApp = (phone, name) => {
    const num = phone?.replace(/\D/g, '');
    if (!num) return;
    const msg = encodeURIComponent(`¡Hola ${name}! Te contactamos de TradeAMX para darte la bienvenida y ayudarte a comenzar.`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Ventas</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {user.office_name} — Nuevos registros para seguimiento
            </p>
          </div>
          <Button onClick={fetchRegistros} variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: `Registros (${filtro}d)`, value: registros.length, color: 'text-sky-400' },
            { label: 'Con teléfono',    value: registros.filter(r => r.phone_number).length, color: 'text-green-400' },
            { label: 'Con plan activo', value: registros.filter(r => r.has_purchased_plan).length, color: 'text-yellow-400' },
            { label: 'Sin plan',        value: registros.filter(r => !r.has_purchased_plan).length, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className="pl-9 bg-slate-900 border-slate-700 text-white" />
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Hoy', value: '1' },
              { label: '7 días', value: '7' },
              { label: '15 días', value: '15' },
              { label: '30 días', value: '30' },
            ].map(f => (
              <button key={f.value} onClick={() => setFiltro(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filtro === f.value
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No hay registros en este período</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => (
              <div key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {r.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {r.full_name || 'Sin nombre'}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {r.email}
                    </span>
                    {r.phone_number && (
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {r.phone_number}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    r.has_purchased_plan
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {r.has_purchased_plan ? 'Con plan' : 'Sin plan'}
                  </span>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(r.created_at)}
                  </p>
                </div>

                {r.phone_number && (
                  <button
                    onClick={() => abrirWhatsApp(r.phone_number, r.full_name)}
                    className="shrink-0 w-9 h-9 rounded-lg bg-green-600 hover:bg-green-500 flex items-center justify-center transition-colors"
                    title="Contactar por WhatsApp"
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasPage;