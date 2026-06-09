import { useState, useEffect } from 'react';
import { X, Gift, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Usa el cliente Supabase que ya tienes
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const WHATSAPP_NUMERO = '5215574435022'; // ← MISMO número que en SpacexLanding.jsx

export default function LeadMagnetModal({ abierto, onClose, origen = 'modal' }) {
  const [form, setForm] = useState({ nombre: '', whatsapp: '', email: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  // Capturar UTMs de la URL
  const getUTMs = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_content: params.get('utm_content') || '',
      utm_campaign: params.get('utm_campaign') || '',
    };
  };

  const validarWhatsapp = (numero) => {
    const limpio = numero.replace(/\D/g, '');
    return limpio.length >= 10;
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!form.nombre.trim() || form.nombre.length < 3) {
      setError('Ingresa tu nombre completo');
      return;
    }
    if (!validarWhatsapp(form.whatsapp)) {
      setError('Ingresa un número de WhatsApp válido (10 dígitos)');
      return;
    }
    if (form.email && !form.email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    setEnviando(true);

    try {
      const utms = getUTMs();
      const { error: dbError } = await supabase.from('leads_spacex_bono').insert({
        nombre: form.nombre.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        email: form.email.trim() || null,
        origen,
        utm_source: utms.utm_source,
        utm_content: utms.utm_content,
        utm_campaign: utms.utm_campaign,
      });

      if (dbError) throw dbError;

      // Tracking Meta Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'IPO SpaceX Bono 75%',
          value: 1,
          currency: 'USD',
        });
      }

      // Tracking Vercel Analytics
      if (typeof window !== 'undefined' && window.va) {
        try { window.va('event', { name: 'lead_capturado', origen }); } catch (e) {}
      }

      setExito(true);

      // Abrir WhatsApp después de 2 segundos
      setTimeout(() => {
        const mensaje = encodeURIComponent(
          `Hola, soy ${form.nombre}. Vengo del IPO de SpaceX y quiero mi bono del 75% sobre depósito inicial.`
        );
        window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}`, '_blank');
      }, 2000);

    } catch (err) {
      console.error('Error al guardar lead:', err);
      setError('Hubo un error. Intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  // Cerrar con ESC
  useEffect(() => {
    if (!abierto) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [abierto, onClose]);

  if (!abierto) return null;

  return (
    <div style={estilos.overlay} onClick={onClose}>
      <div style={estilos.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Botón cerrar */}
        <button onClick={onClose} style={estilos.cerrar}>
          <X size={20} />
        </button>

        {!exito ? (
          <>
            {/* Header con bono */}
            <div style={estilos.headerBono}>
              <div style={estilos.iconoCircle}>
                <Gift size={32} color="white" />
              </div>
              <h2 style={estilos.tituloModal}>
                Bono especial del <span style={{ color: '#F59E0B' }}>75%</span><br />
                sobre tu depósito inicial
              </h2>
              <p style={estilos.subtituloModal}>
                Promo exclusiva por el IPO de SpaceX. <br />
                Deja tus datos y un asesor te explicará cómo obtenerlo.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={enviar} style={estilos.form}>
              <Campo>
                <Label>Nombre completo *</Label>
                <Input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Juan Pérez"
                  disabled={enviando}
                />
              </Campo>

              <Campo>
                <Label>WhatsApp *</Label>
                <Input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="55 1234 5678"
                  disabled={enviando}
                />
                <Hint>Con código de país (ej: México +52)</Hint>
              </Campo>

              <Campo>
                <Label>Email <span style={{ opacity: 0.5 }}>(opcional)</span></Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  disabled={enviando}
                />
              </Campo>

              {error && (
                <div style={estilos.error}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={enviando} style={estilos.botonEnviar}>
                {enviando ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Quiero mi bono del 75%
                    <MessageCircle size={18} />
                  </>
                )}
              </button>

              <p style={estilos.privacidad}>
                🔒 Tus datos están protegidos. No spam. <br />
                Al enviar aceptas el <a href="/aviso-privacidad" style={{ color: '#60A5FA' }}>aviso de privacidad</a>.
              </p>
            </form>
          </>
        ) : (
          <div style={estilos.exito}>
            <div style={estilos.iconoExito}>
              <CheckCircle2 size={48} color="white" />
            </div>
            <h2 style={estilos.tituloExito}>¡Listo, {form.nombre.split(' ')[0]}!</h2>
            <p style={estilos.textoExito}>
              Tus datos quedaron registrados. <br />
              Te estamos redirigiendo a WhatsApp con un asesor...
            </p>
            <Loader2 size={24} className="spin" color="#3B82F6" style={{ marginTop: 20 }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============= SUB-COMPONENTES =============
function Campo({ children }) {
  return <div style={{ marginBottom: 14 }}>{children}</div>;
}

function Label({ children }) {
  return <label style={estilos.label}>{children}</label>;
}

function Input({ ...props }) {
  return <input {...props} style={estilos.input} />;
}

function Hint({ children }) {
  return <p style={estilos.hint}>{children}</p>;
}

// ============= ESTILOS =============
const estilos = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 11, 22, 0.85)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 16,
    maxWidth: 440,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  cerrar: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerBono: {
    padding: '32px 24px 20px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)',
  },
  iconoCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
  },
  tituloModal: {
    fontSize: 22,
    fontWeight: 800,
    color: 'white',
    lineHeight: 1.2,
    marginBottom: 10,
    letterSpacing: '-0.01em',
  },
  subtituloModal: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 1.5,
  },
  form: {
    padding: '0 24px 24px',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: '#0A1628',
    border: '1px solid #1E293B',
    borderRadius: 8,
    color: 'white',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  hint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  error: {
    padding: '10px 12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    fontSize: 13,
    color: '#FCA5A5',
    marginBottom: 12,
  },
  botonEnviar: {
    width: '100%',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
    minHeight: 52,
    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
  },
  privacidad: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 1.5,
  },
  exito: {
    padding: '40px 24px',
    textAlign: 'center',
  },
  iconoExito: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  tituloExito: {
    fontSize: 24,
    fontWeight: 800,
    color: 'white',
    marginBottom: 12,
  },
  textoExito: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 1.5,
  },
};