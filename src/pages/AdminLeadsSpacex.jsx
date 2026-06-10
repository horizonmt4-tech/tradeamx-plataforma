import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Circle, ShieldAlert, Lock, Loader2 } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AdminLeadsSpacex() {
  const [estado, setEstado] = useState('verificando'); // verificando | sin_sesion | no_autorizado | autorizado
  const [usuario, setUsuario] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Verificar sesión + rol al cargar
  useEffect(() => {
    verificarAcceso();
  }, []);

  const verificarAcceso = async () => {
    setEstado('verificando');

    // 1. Verifica que haya sesión activa
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setEstado('sin_sesion');
      return;
    }

    // 2. Verifica que el usuario sea admin (ajusta el nombre de tu tabla si es distinto)
    const { data: perfil, error } = await supabase
      .from('profiles') // ← ajusta si tu tabla se llama distinto (users, usuarios, etc.)
      .select('is_admin, email, full_name')
      .eq('id', session.user.id)
      .single();

    if (error || !perfil) {
      console.error('Error al cargar perfil:', error);
      setEstado('no_autorizado');
      return;
    }

    if (!perfil.is_admin) {
      setEstado('no_autorizado');
      return;
    }

    setUsuario({ ...perfil, email: session.user.email });
    setEstado('autorizado');
    cargarLeads();
  };

  const cargarLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads_spacex_bono')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al cargar leads:', error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const togglearContactado = async (id, actual) => {
    await supabase
      .from('leads_spacex_bono')
      .update({ contactado: !actual })
      .eq('id', id);
    cargarLeads();
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // ← ajusta a la ruta de login real de Tradea
  };

  // ============= PANTALLAS DE BLOQUEO =============

  if (estado === 'verificando') {
    return (
      <PantallaCarga>
        <Loader2 size={32} className="spin" color="#3B82F6" />
        <p>Verificando acceso...</p>
      </PantallaCarga>
    );
  }

  if (estado === 'sin_sesion') {
    return (
      <PantallaBloqueo
        icono={<Lock size={48} color="#F59E0B" />}
        titulo="Necesitas iniciar sesión"
        mensaje="Esta área es solo para administradores autorizados. Inicia sesión con tu cuenta de Tradea."
        botonTexto="Ir a iniciar sesión"
        onClick={() => (window.location.href = '/login')}
      />
    );
  }

  if (estado === 'no_autorizado') {
    return (
      <PantallaBloqueo
        icono={<ShieldAlert size={48} color="#EF4444" />}
        titulo="Acceso denegado"
        mensaje="Tu cuenta no tiene permisos de administrador para ver este panel. Si crees que es un error, contacta al equipo técnico."
        botonTexto="Volver al inicio"
        onClick={() => (window.location.href = '/')}
      />
    );
  }

  // ============= DASHBOARD AUTORIZADO =============

  const sinContactar = leads.filter((l) => !l.contactado).length;

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.wrapper}>
        
        {/* Header con info del usuario */}
        <div style={estilos.header}>
          <div>
            <h1 style={estilos.titulo}>Leads SpaceX</h1>
            <p style={estilos.subtitulo}>
              {leads.length} leads totales · <strong style={{ color: '#F59E0B' }}>{sinContactar} sin contactar</strong>
            </p>
          </div>
          <div style={estilos.headerUsuario}>
            <div style={estilos.usuarioBadge}>
              <span style={estilos.usuarioIcono}>👤</span>
              <div>
                <div style={estilos.usuarioNombre}>{usuario.nombre || usuario.email}</div>
                <div style={estilos.usuarioRol}>Administrador</div>
              </div>
            </div>
            <button onClick={cerrarSesion} style={estilos.botonSalir}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tabla de leads */}
        <div style={estilos.tablaContainer}>
          {loading ? (
            <div style={estilos.cargando}>
              <Loader2 size={24} className="spin" color="#3B82F6" />
              <span>Cargando leads...</span>
            </div>
          ) : (
            <table style={estilos.tabla}>
              <thead>
                <tr style={estilos.tablaHeader}>
                  <th style={estilos.th}>Estado</th>
                  <th style={estilos.th}>Nombre</th>
                  <th style={estilos.th}>WhatsApp</th>
                  <th style={estilos.th}>Email</th>
                  <th style={estilos.th}>Origen</th>
                  <th style={estilos.th}>Fecha</th>
                  <th style={estilos.th}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} style={estilos.fila}>
                    <td style={estilos.td}>
                      {lead.contactado ? (
                        <CheckCircle2 size={18} color="#10B981" />
                      ) : (
                        <Circle size={18} color="#F59E0B" />
                      )}
                    </td>
                    <td style={estilos.td}>{lead.nombre}</td>
                    <td style={estilos.td}>
                      <a 
                        href={`https://wa.me/${lead.whatsapp}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={estilos.whatsappLink}
                      >
                        {lead.whatsapp}
                      </a>
                    </td>
                    <td style={estilos.td}>{lead.email || '—'}</td>
                    <td style={estilos.td}>
                      <span style={estilos.origenTag}>
                        {lead.origen}
                      </span>
                    </td>
                    <td style={estilos.td}>
                      {new Date(lead.created_at).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={estilos.td}>
                      <button 
                        onClick={() => togglearContactado(lead.id, lead.contactado)}
                        style={{
                          ...estilos.botonAccion,
                          background: lead.contactado ? '#1E293B' : '#3B82F6',
                        }}
                      >
                        {lead.contactado ? 'Marcar pendiente' : 'Marcar contactado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && leads.length === 0 && (
            <div style={estilos.vacio}>
              No hay leads capturados todavía
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= SUB-COMPONENTES =============

function PantallaCarga({ children }) {
  return (
    <div style={estilos.pantallaCarga}>
      {children}
    </div>
  );
}

function PantallaBloqueo({ icono, titulo, mensaje, botonTexto, onClick }) {
  return (
    <div style={estilos.pantallaBloqueo}>
      <div style={estilos.bloqueoCard}>
        <div style={estilos.bloqueoIcono}>{icono}</div>
        <h1 style={estilos.bloqueoTitulo}>{titulo}</h1>
        <p style={estilos.bloqueoMensaje}>{mensaje}</p>
        <button onClick={onClick} style={estilos.bloqueoBoton}>
          {botonTexto}
        </button>
      </div>
    </div>
  );
}

// ============= ESTILOS =============
const estilos = {
  contenedor: {
    minHeight: '100vh',
    background: '#0A1628',
    color: 'white',
    padding: 32,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  wrapper: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 8,
    letterSpacing: '-0.02em',
  },
  subtitulo: {
    color: '#94A3B8',
    fontSize: 14,
  },
  headerUsuario: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  usuarioBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 14px',
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 8,
  },
  usuarioIcono: {
    fontSize: 20,
  },
  usuarioNombre: {
    fontSize: 13,
    fontWeight: 600,
    color: 'white',
  },
  usuarioRol: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  botonSalir: {
    padding: '8px 14px',
    background: 'transparent',
    color: '#EF4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  tablaContainer: {
    background: '#0F1F38',
    borderRadius: 12,
    border: '1px solid #1E293B',
    overflow: 'auto',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 800,
  },
  tablaHeader: {
    background: '#050B16',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94A3B8',
    whiteSpace: 'nowrap',
  },
  fila: {
    borderTop: '1px solid #1E293B',
  },
  td: {
    padding: '14px 16px',
    fontSize: 13,
  },
  whatsappLink: {
    color: '#25D366',
    textDecoration: 'none',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  origenTag: {
    fontSize: 11,
    padding: '3px 8px',
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#60A5FA',
    borderRadius: 4,
    fontWeight: 600,
  },
  botonAccion: {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  cargando: {
    padding: 60,
    textAlign: 'center',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  vacio: {
    padding: 60,
    textAlign: 'center',
    color: '#64748B',
  },
  pantallaCarga: {
    minHeight: '100vh',
    background: '#0A1628',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  pantallaBloqueo: {
    minHeight: '100vh',
    background: '#0A1628',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  bloqueoCard: {
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 16,
    padding: 48,
    maxWidth: 460,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  bloqueoIcono: {
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  bloqueoTitulo: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 12,
    letterSpacing: '-0.02em',
  },
  bloqueoMensaje: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 1.6,
    marginBottom: 24,
  },
  bloqueoBoton: {
    padding: '12px 28px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};