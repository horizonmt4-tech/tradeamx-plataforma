import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Circle, Phone, Mail, Calendar } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AdminLeadsSpacex() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data } = await supabase
      .from('leads_spacex_bono')
      .select('*')
      .order('created_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const togglearContactado = async (id, actual) => {
    await supabase
      .from('leads_spacex_bono')
      .update({ contactado: !actual })
      .eq('id', id);
    cargar();
  };

  const sinContactar = leads.filter((l) => !l.contactado).length;

  if (loading) return <div style={{ padding: 40, color: 'white' }}>Cargando...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', padding: 32, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Leads SpaceX</h1>
        <p style={{ color: '#94A3B8', marginBottom: 24 }}>
          {leads.length} leads totales · <strong style={{ color: '#F59E0B' }}>{sinContactar} sin contactar</strong>
        </p>

        <div style={{ background: '#0F1F38', borderRadius: 12, border: '1px solid #1E293B', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#050B16' }}>
                <th style={th}>Estado</th>
                <th style={th}>Nombre</th>
                <th style={th}>WhatsApp</th>
                <th style={th}>Email</th>
                <th style={th}>Origen</th>
                <th style={th}>Fecha</th>
                <th style={th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderTop: '1px solid #1E293B' }}>
                  <td style={td}>
                    {lead.contactado ? (
                      <CheckCircle2 size={18} color="#10B981" />
                    ) : (
                      <Circle size={18} color="#F59E0B" />
                    )}
                  </td>
                  <td style={td}>{lead.nombre}</td>
                  <td style={td}>
                    <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>
                      {lead.whatsapp}
                    </a>
                  </td>
                  <td style={td}>{lead.email || '—'}</td>
                  <td style={td}>
                    <span style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60A5FA', borderRadius: 4 }}>
                      {lead.origen}
                    </span>
                  </td>
                  <td style={td}>{new Date(lead.created_at).toLocaleString('es-MX')}</td>
                  <td style={td}>
                    <button 
                      onClick={() => togglearContactado(lead.id, lead.contactado)}
                      style={{
                        padding: '6px 12px',
                        background: lead.contactado ? '#1E293B' : '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {lead.contactado ? 'Marcar pendiente' : 'Marcar contactado'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {leads.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: '#64748B' }}>
              No hay leads capturados todavía
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const th = { padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' };
const td = { padding: '14px 16px', fontSize: 13 };