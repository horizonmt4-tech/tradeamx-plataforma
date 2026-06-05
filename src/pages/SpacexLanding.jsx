import { useState, useEffect } from 'react';
import {
  Rocket, CheckCircle2, XCircle, Clock, DollarSign, TrendingUp,
  Shield, Zap, ChevronDown, MessageCircle, ArrowRight,
} from 'lucide-react';
import Head from 'next/head';

// Dentro del componente, antes del primer return:
<Head>
  <title>Opera el IPO de SpaceX desde el día 1 | Taurus Fx</title>
  <meta name="description" content="Acceso institucional al IPO de SpaceX. Cuenta de $25K USD para operar SPCX el 12 de junio. Sin invertir tu capital." />
  <meta property="og:title" content="Opera el IPO de SpaceX | Taurus Fx" />
  <meta property="og:description" content="Cuenta institucional desde el día 1 del listado de SPCX en NASDAQ." />
  <meta property="og:image" content="/og-image-spacex.jpg" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>

// ============= CONFIG =============
const WHATSAPP_NUMERO = '5215512345678'; // ← reemplaza con el real
const FECHA_IPO = new Date('2026-06-12T13:30:00-04:00'); // Apertura NASDAQ ET
const PRECIO_IPO = 135;
const CAPITAL_DEFAULT = 25000;

const MENSAJE_WHATSAPP_BASE = '¡Hola! Vengo del anuncio del IPO de SpaceX. Quiero información sobre el programa de evaluación para operar SPCX el 12 de junio.';

// ============= COMPONENTE PRINCIPAL =============
export default function SpacexLanding() {
  const [tiempoRestante, setTiempoRestante] = useState(calcularTiempo());

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoRestante(calcularTiempo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const abrirWhatsApp = (mensajeExtra = '') => {
    const mensaje = encodeURIComponent(MENSAJE_WHATSAPP_BASE + (mensajeExtra ? ' ' + mensajeExtra : ''));
    const url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + mensaje;
    
    // Track de conversión (si tienes Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact');
    }
    
    window.open(url, '_blank');
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0A1628', color: 'white', minHeight: '100vh' }}>
      {/* ============= HERO ============= */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroBadge}>
            <Rocket size={14} />
            <span>NASDAQ · TICKER SPCX · 12 JUNIO 2026</span>
          </div>

          <h1 style={styles.heroTitle}>
            Opera el IPO de SpaceX <br />
            <span style={{ color: '#3B82F6' }}>desde el primer minuto</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Mientras el público retail recibe asignaciones limitadas, <br />
            tú operas SPCX con cuenta institucional de <strong>${CAPITAL_DEFAULT.toLocaleString()} USD</strong>.
          </p>

          {/* Countdown */}
          <div style={styles.countdown}>
            <CountdownBlock valor={tiempoRestante.dias} label="Días" />
            <Separador />
            <CountdownBlock valor={tiempoRestante.horas} label="Horas" />
            <Separador />
            <CountdownBlock valor={tiempoRestante.minutos} label="Min" />
            <Separador />
            <CountdownBlock valor={tiempoRestante.segundos} label="Seg" />
          </div>

          <button onClick={() => abrirWhatsApp('Quiero empezar la evaluación esta semana.')} style={styles.ctaPrimario}>
            <MessageCircle size={18} />
            Hablar con un asesor por WhatsApp
            <ArrowRight size={18} />
          </button>

          <p style={styles.heroFooter}>
            ⚡ Respuesta en menos de 24 hrs · Evaluación disponible esta semana
          </p>
        </div>

        {/* Glow decorativo */}
        <div style={styles.glowDecoration} />
      </section>

      {/* ============= PROBLEMA ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>EL PROBLEMA</p>
          <h2 style={styles.h2}>
            El IPO de SpaceX es la oportunidad de la década. <br />
            <span style={{ color: '#EF4444' }}>Y casi nadie podrá aprovecharla.</span>
          </h2>

          <div style={styles.grid3}>
            <CardProblema
              icon={XCircle}
              titulo="Asignaciones mínimas en brokers retail"
              descripcion="Los brokers tradicionales asignan entre 0.1% y 2% del IPO a clientes minoristas. Y solo si tienes una relación previa."
            />
            <CardProblema
              icon={XCircle}
              titulo="Mercado pre-IPO restringido"
              descripcion="Plataformas como Forge o EquityZen exigen ser inversionista acreditado: mínimo $200K USD en activos para participar."
            />
            <CardProblema
              icon={XCircle}
              titulo="Precio inflado en el listado"
              descripcion="Cuando finalmente puedas comprar en mercado abierto, el precio puede haber subido 30-50% por el FOMO del primer día."
            />
          </div>
        </div>
      </section>

      {/* ============= SOLUCIÓN ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>LA SOLUCIÓN</p>
          <h2 style={styles.h2}>
            Acceso institucional al evento más grande <br />
            <span style={{ color: '#10B981' }}>desde el minuto 1 del listado</span>
          </h2>

          <div style={styles.grid3}>
            <CardPaso
              numero="01"
              titulo="Pasas la evaluación"
              descripcion="Costo único de $35 USD. La evaluación toma 2-7 días según tu ritmo. Reglas claras, sin trucos."
            />
            <CardPaso
              numero="02"
              titulo="Recibes tu cuenta"
              descripcion="Te otorgamos acceso a una cuenta institucional de $25K, $50K o $100K USD en 24-48 hrs."
              destacado
            />
            <CardPaso
              numero="03"
              titulo="Operas SPCX el 12 de junio"
              descripcion="Desde el primer minuto del listado, con apalancamiento, sin arriesgar tu capital propio. Recibes el 80% del rendimiento."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={() => abrirWhatsApp('Quiero saber el detalle de los pasos.')} style={styles.ctaSecundario}>
              Quiero saber más por WhatsApp <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= COMPARATIVA ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>COMPARATIVA</p>
          <h2 style={styles.h2}>
            ¿En qué grupo quieres estar el 12 de junio?
          </h2>

          <div style={styles.comparativa}>
            <ColumnaComparativa
              titulo="Broker retail"
              subtitulo="La mayoría del público"
              negativa
              items={[
                'Asignación 0.1% - 2% del IPO',
                'Inviertes tu propio dinero',
                'Pierdes capital si la acción baja',
                'Cobran comisiones por trade',
                'Sin apalancamiento',
              ]}
              destacado="Capital activo típico: $500-$5,000 USD"
            />
            <ColumnaComparativa
              titulo="Cuenta institucional"
              subtitulo="Con nosotros"
              positiva
              items={[
                'Acceso al CFD desde minuto 1',
                'Capital de la firma, no tuyo',
                'No arriesgas tu dinero propio',
                'Sin comisiones por operación',
                'Apalancamiento institucional',
              ]}
              destacado="Capital activo: $25,000 - $100,000 USD"
            />
          </div>
        </div>
      </section>

      {/* ============= PRUEBA SOCIAL ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>POR QUÉ CONFIAR</p>
          <h2 style={styles.h2}>Traders LATAM ya operan con nosotros</h2>

          <div style={styles.gridStats}>
            <Stat numero="1,400+" label="Traders fondeados" />
            <Stat numero="$2.4M" label="Pagados en payouts" />
            <Stat numero="48 hrs" label="Aprobación promedio" />
            <Stat numero="80/20" label="Profit split a tu favor" />
          </div>

          <div style={styles.testimonios}>
            <Testimonio
              nombre="Carlos M."
              ubicacion="México"
              texto="Pasé la evaluación en 5 días y recibí mi cuenta de $50K. El equipo de soporte me explicó todo el proceso por WhatsApp."
            />
            <Testimonio
              nombre="Ana R."
              ubicacion="Colombia"
              texto="Llevaba 2 años intentando operar con mi propio capital. Con la cuenta institucional cambió todo."
            />
            <Testimonio
              nombre="Diego F."
              ubicacion="Argentina"
              texto="Ya estoy preparando mi estrategia para el día del listado. La plataforma soporta CFDs sobre acciones de NASDAQ."
            />
          </div>
        </div>
      </section>

      {/* ============= FAQ ============= */}
      <section style={styles.seccion}>
        <div style={styles.container} style={{ ...styles.container, maxWidth: 720 }}>
          <p style={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <h2 style={styles.h2}>Lo que necesitas saber</h2>

          <FAQ
            pregunta="¿Realmente podré operar SPCX desde el día 1?"
            respuesta="Sí, nuestra plataforma agregará CFD sobre SPCX el mismo día del listado en NASDAQ. La disponibilidad oficial está sujeta a confirmación del listado."
          />
          <FAQ
            pregunta="¿Cuánto cuesta participar?"
            respuesta="La evaluación tiene un costo único de $35 USD. No hay mensualidades, no hay sorpresas. Si pasas la evaluación, recibes la cuenta institucional sin costos adicionales."
          />
          <FAQ
            pregunta="¿Y si no paso la evaluación?"
            respuesta="Puedes intentar de nuevo pagando otra evaluación. No hay penalización ni reportes en buró. Es un proceso de habilidad."
          />
          <FAQ
            pregunta="¿Cuánto tarda la aprobación de mi cuenta?"
            respuesta="Entre 24 y 48 horas después de pasar la evaluación. Para el 12 de junio, recomendamos empezar la evaluación a más tardar el 9 de junio."
          />
          <FAQ
            pregunta="¿Recibo dinero en mi cuenta bancaria?"
            respuesta="Sí, los payouts se procesan vía USDT (TRC20/ERC20), transferencia internacional o PayPal según tu preferencia. El 80% del rendimiento neto es tuyo."
          />
          <FAQ
            pregunta="¿Es legal en mi país?"
            respuesta="El programa de evaluación de trading es legal en la mayoría de países de LATAM. No es una inversión ni un instrumento financiero regulado. Consulta a un asesor local si tienes dudas específicas."
          />
        </div>
      </section>

      {/* ============= CTA FINAL ============= */}
      <section style={styles.ctaFinal}>
        <div style={styles.container}>
          <h2 style={{ ...styles.h2, color: 'white', marginBottom: 16 }}>
            Faltan {tiempoRestante.dias} días para el IPO
          </h2>
          <p style={{ fontSize: 18, color: '#94A3B8', marginBottom: 32, textAlign: 'center' }}>
            La evaluación tarda 2-7 días. Empieza hoy para estar listo el 12 de junio.
          </p>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => abrirWhatsApp('Quiero empezar HOY mismo.')} style={{ ...styles.ctaPrimario, fontSize: 18, padding: '16px 32px' }}>
              <MessageCircle size={20} />
              Empezar ahora por WhatsApp
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= FOOTER + DISCLAIMER ============= */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <p style={styles.disclaimer}>
            ⚠️ <strong>Aviso de riesgo:</strong> El trading apalancado conlleva un alto riesgo de pérdida. El rendimiento pasado no garantiza resultados futuros. 
            La disponibilidad del CFD sobre SPCX está sujeta al listado oficial en NASDAQ. 
            Este programa es una evaluación de habilidad, no una inversión ni un instrumento financiero regulado. 
            Tradea no proporciona asesoría financiera personalizada.
          </p>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Tradea. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* WhatsApp flotante */}
      <button onClick={() => abrirWhatsApp()} style={styles.fabWhatsapp} aria-label="Contactar por WhatsApp">
        <MessageCircle size={28} />
      </button>
    </div>
  );
}

// ============= SUB-COMPONENTES =============

function CountdownBlock({ valor, label }) {
  return (
    <div style={styles.countdownBlock}>
      <div style={styles.countdownNumero}>{String(valor).padStart(2, '0')}</div>
      <div style={styles.countdownLabel}>{label}</div>
    </div>
  );
}

function Separador() {
  return <div style={{ color: '#3B82F6', fontSize: 28, fontWeight: 'bold', alignSelf: 'flex-start', marginTop: 12 }}>:</div>;
}

function CardProblema({ icon: Icon, titulo, descripcion }) {
  return (
    <div style={styles.card}>
      <Icon size={32} color="#EF4444" strokeWidth={1.5} />
      <h3 style={styles.cardTitulo}>{titulo}</h3>
      <p style={styles.cardTexto}>{descripcion}</p>
    </div>
  );
}

function CardPaso({ numero, titulo, descripcion, destacado }) {
  return (
    <div style={{ ...styles.card, ...(destacado ? styles.cardDestacado : {}) }}>
      <div style={styles.cardNumero}>{numero}</div>
      <h3 style={styles.cardTitulo}>{titulo}</h3>
      <p style={styles.cardTexto}>{descripcion}</p>
    </div>
  );
}

function ColumnaComparativa({ titulo, subtitulo, items, positiva, negativa, destacado }) {
  const bg = positiva ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.05)';
  const borde = positiva ? '#10B981' : '#1E293B';

  return (
    <div style={{ ...styles.columnaComp, background: bg, border: '1px solid ' + borde }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{titulo}</h3>
        <p style={{ fontSize: 13, color: '#94A3B8' }}>{subtitulo}</p>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 20 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
            {positiva ? <CheckCircle2 size={18} color="#10B981" /> : <XCircle size={18} color="#EF4444" />}
            {item}
          </li>
        ))}
      </ul>
      <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 13, color: '#CBD5E1' }}>
        {destacado}
      </div>
    </div>
  );
}

function Stat({ numero, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 800, color: '#3B82F6', marginBottom: 4 }}>{numero}</div>
      <div style={{ fontSize: 13, color: '#94A3B8' }}>{label}</div>
    </div>
  );
}

function Testimonio({ nombre, ubicacion, texto }) {
  return (
    <div style={{ background: '#0A1628', padding: 24, borderRadius: 12, border: '1px solid #1E293B' }}>
      <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16, color: '#CBD5E1' }}>"{texto}"</p>
      <div style={{ fontSize: 13 }}>
        <strong style={{ color: 'white' }}>{nombre}</strong>
        <span style={{ color: '#64748B', marginLeft: 8 }}>· {ubicacion}</span>
      </div>
    </div>
  );
}

function FAQ({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #1E293B', padding: '16px 0' }}>
      <button onClick={() => setAbierto(!abierto)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'transparent', border: 'none', color: 'white', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{pregunta}</span>
        <ChevronDown size={20} style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      {abierto && (
        <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: '#CBD5E1' }}>{respuesta}</p>
      )}
    </div>
  );
}

// ============= UTILS =============
function calcularTiempo() {
  const diff = FECHA_IPO - new Date();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / 1000 / 60) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

// ============= ESTILOS =============
const styles = {
  hero: {
    position: 'relative',
    padding: '80px 24px 100px',
    overflow: 'hidden',
  },
  heroContainer: {
    maxWidth: 900,
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.05em',
    marginBottom: 24,
    color: '#60A5FA',
  },
  heroTitle: {
    fontSize: 'clamp(36px, 6vw, 64px)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 20,
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 1.6,
    color: '#94A3B8',
    maxWidth: 600,
    margin: '0 auto 36px',
  },
  countdown: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 36,
    flexWrap: 'wrap',
  },
  countdownBlock: {
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 8,
    padding: '12px 16px',
    minWidth: 70,
  },
  countdownNumero: {
    fontSize: 32,
    fontWeight: 800,
    fontFamily: 'monospace',
    color: '#3B82F6',
    lineHeight: 1,
  },
  countdownLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: 4,
  },
  ctaPrimario: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 28px',
    background: '#25D366',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
    transition: 'transform 0.15s',
  },
  ctaSecundario: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    background: 'transparent',
    color: '#3B82F6',
    border: '1px solid #3B82F6',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  heroFooter: {
    marginTop: 16,
    fontSize: 13,
    color: '#64748B',
  },
  glowDecoration: {
    position: 'absolute',
    top: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 600,
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  seccion: {
    padding: '80px 24px',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#3B82F6',
    marginBottom: 12,
    textAlign: 'center',
  },
  h2: {
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 800,
    lineHeight: 1.2,
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: '-0.02em',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: 28,
  },
  cardDestacado: {
    border: '1px solid #3B82F6',
    boxShadow: '0 0 32px rgba(59, 130, 246, 0.15)',
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 700,
    margin: '16px 0 8px',
  },
  cardTexto: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#94A3B8',
  },
  cardNumero: {
    fontSize: 14,
    fontWeight: 700,
    color: '#3B82F6',
    letterSpacing: '0.1em',
  },
  comparativa: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  },
  columnaComp: {
    padding: 28,
    borderRadius: 12,
  },
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 24,
    marginBottom: 48,
  },
  testimonios: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  ctaFinal: {
    padding: '80px 24px',
    background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
    textAlign: 'center',
  },
  footer: {
    padding: '40px 24px',
    background: '#050B16',
    borderTop: '1px solid #1E293B',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#64748B',
    maxWidth: 900,
    margin: '0 auto 16px',
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  fabWhatsapp: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: '#25D366',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
};