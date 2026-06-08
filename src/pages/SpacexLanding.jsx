import { useState, useEffect } from 'react';
import {
  Rocket, TrendingUp, Shield, FileCheck, Building2,
  ChevronDown, MessageCircle, ArrowRight, ExternalLink, AlertTriangle,
} from 'lucide-react';

// ============= CONFIG =============
const WHATSAPP_NUMERO = '525574435022'; // ← reemplaza
const FECHA_IPO = new Date('2026-06-12T13:30:00-04:00');
const PRECIO_IPO = 135;
const VALUACION_OBJETIVO = 1500; // billones USD (1.5T)
const RETAIL_PCT = 30; // % reservado retail según reportes
const MENSAJE_WHATSAPP_BASE = 'Hola, vi la información del IPO de SpaceX en el sitio. Quiero conocer cómo acceder a través de mi cuenta con Taurus Fx.';

// DATOS REGULATORIOS — reemplaza con datos reales
const TAURUS_RAZON_SOCIAL = '© 2026 TradeAMX. All rights reserved.';
const TAURUS_LICENCIA = 'CNBV 981631';
const TAURUS_DOMICILIO = '.';

export default function SpacexLanding() {
  const [tiempoRestante, setTiempoRestante] = useState(calcularTiempo());

  useEffect(() => {
    const t = setInterval(() => setTiempoRestante(calcularTiempo()), 1000);
    return () => clearInterval(t);
  }, []);

  const abrirWhatsApp = (extra = '') => {
    const mensaje = encodeURIComponent(MENSAJE_WHATSAPP_BASE + (extra ? ' ' + extra : ''));
    const url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + mensaje;
    if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'Contact');
    window.open(url, '_blank');
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0A1628', color: 'white' }}>
      
      {/* ============= 1. HERO ============= */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroBadge}>
            <Rocket size={14} />
            <span>NASDAQ · SPCX · IPO 12 JUNIO 2026</span>
          </div>

          <h1 style={styles.heroTitle}>
            El IPO más grande<br />
            <span style={{ color: '#3B82F6' }}>de la historia bursátil</span>
          </h1>

          <p style={styles.heroSubtitle}>
            SpaceX sale a cotizar el 12 de junio en NASDAQ a <strong>${PRECIO_IPO} USD/acción</strong>.<br />
            Con valuación estimada de <strong>$1.5 billones USD</strong>, superaría el IPO de Saudi Aramco.
          </p>

          <div style={styles.countdown}>
            <CountdownBlock valor={tiempoRestante.dias} label="Días" />
            <CountdownBlock valor={tiempoRestante.horas} label="Horas" />
            <CountdownBlock valor={tiempoRestante.minutos} label="Min" />
            <CountdownBlock valor={tiempoRestante.segundos} label="Seg" />
          </div>

          <button onClick={() => abrirWhatsApp('Quiero conocer las opciones disponibles.')} style={styles.ctaPrimario}>
            <MessageCircle size={18} />
            Hablar con un asesor por WhatsApp
            <ArrowRight size={18} />
          </button>

          <p style={styles.heroFooter}>
            Asesoría sin costo · Broker regulado por CNBV · Respuesta en menos de 24 hrs
          </p>
        </div>
        <div style={styles.glowDecoration} />
      </section>

      {/* ============= 2. POR QUÉ ES ÚNICO (DATOS DEL S-1) ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>POR QUÉ ESTE IPO ES DISTINTO</p>
          <h2 style={styles.h2}>
            Datos oficiales del prospecto S-1 <br />
            <span style={{ color: '#94A3B8', fontSize: '0.75em', fontWeight: 500 }}>presentado a la SEC el 20 de mayo 2026</span>
          </h2>

          <div style={styles.gridStats}>
            <StatCard
              numero="$1.5T"
              label="Valuación objetivo"
              detalle="Superior a Berkshire Hathaway"
            />
            <StatCard
              numero="$75B"
              label="Capital a levantar"
              detalle="3er IPO más grande de la historia"
            />
            <StatCard
              numero="30%"
              label="Reservado para retail"
              detalle="vs 5-10% en IPOs tradicionales"
            />
            <StatCard
              numero="555M"
              label="Acciones ofertadas"
              detalle="Precio fijo: $135 USD"
            />
          </div>

          <div style={styles.callout}>
            <AlertTriangle size={20} color="#F59E0B" />
            <p>
              <strong>Dato relevante:</strong> Según reportes públicos, Elon Musk solicitó reservar hasta 30% de las acciones para inversionistas minoristas, una proporción inusualmente alta para un IPO de este tamaño. Esto puede generar alta demanda en los primeros días de cotización.
            </p>
          </div>
        </div>
      </section>

      {/* ============= 3. CONTEXTO HISTÓRICO ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>CONTEXTO HISTÓRICO</p>
          <h2 style={styles.h2}>Performance de IPOs grandes recientes</h2>
          <p style={styles.subtitulo}>
            Datos públicos. Los resultados pasados no garantizan rendimientos futuros.
          </p>

          <div style={styles.tablaContainer}>
            <table style={styles.tabla}>
              <thead>
                <tr style={styles.tablaHeader}>
                  <th style={styles.th}>Empresa</th>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>Precio IPO</th>
                  <th style={styles.th}>Día 1</th>
                  <th style={styles.th}>+1 año</th>
                </tr>
              </thead>
              <tbody>
                <FilaIPO empresa="Saudi Aramco" anio="2019" precio="$8.53" dia1="+10%" anio1="-5%" fuente />
                <FilaIPO empresa="Alibaba" anio="2014" precio="$68" dia1="+38%" anio1="+58%" />
                <FilaIPO empresa="Reddit" anio="2024" precio="$34" dia1="+48%" anio1="+85%" />
                <FilaIPO empresa="ARM Holdings" anio="2023" precio="$51" dia1="+25%" anio1="+135%" />
                <FilaIPO empresa="Cava Group" anio="2023" precio="$22" dia1="+99%" anio1="+62%" destacado />
              </tbody>
            </table>
          </div>

          <p style={styles.fuenteTabla}>
            Fuente: Datos públicos de NASDAQ y NYSE. No constituye recomendación de inversión.
          </p>

          <div style={styles.callout}>
            <TrendingUp size={20} color="#10B981" />
            <p>
              <strong>Observación:</strong> Los IPOs tecnológicos grandes con alta expectativa mediática han mostrado históricamente movimientos significativos en los primeros días. El comportamiento de SpaceX dependerá de múltiples factores incluyendo condiciones de mercado, sentimiento del inversionista y noticias específicas de la compañía.
            </p>
          </div>
        </div>
      </section>

      {/* ============= 4. CÓMO ACCEDES ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>CÓMO PARTICIPAR</p>
          <h2 style={styles.h2}>
            Acceso al IPO con tu cuenta Tradeamx <br />
            <span style={{ color: '#10B981' }}>broker regulado por CNBV</span>
          </h2>

          <div style={styles.grid3}>
            <CardPaso
              numero="01"
              titulo="Abre tu cuenta real"
              descripcion="Proceso 100% digital. Necesitas INE, comprobante de domicilio y CURP. Aprobación en 24-48 hrs según validación KYC."
              tiempo="24-48 hrs"
            />
            <CardPaso
              numero="02"
              titulo="Fondea tu cuenta"
              descripcion="Depósito mínimo en MXN o USD vía transferencia SPEI/SWIFT. Tu dinero queda a tu nombre en cuenta segregada."
              tiempo="Inmediato"
              destacado
            />
            <CardPaso
              numero="03"
              titulo="Opera SPCX desde día 1"
              descripcion="Acceso al IPO el 12 de junio en NASDAQ. Compras acciones reales a tu nombre. Sin apalancamiento forzado. Tú decides cuándo entrar y salir."
              tiempo="12 de junio"
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={() => abrirWhatsApp('Quiero empezar el proceso de apertura de cuenta.')} style={styles.ctaPrimario}>
              <MessageCircle size={18} />
              Empezar apertura de cuenta
              <ArrowRight size={18} />
            </button>
            <p style={styles.heroFooter}>
              Asesoría gratuita · Sin compromiso · Cuenta a tu nombre
            </p>
          </div>
        </div>
      </section>

      {/* ============= 5. LICENCIA Y CONFIANZA ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>RESPALDO REGULATORIO</p>
          <h2 style={styles.h2}>Broker autorizado por la CNBV</h2>

          <div style={styles.cardsConfianza}>
            <CardConfianza
              icon={Building2}
              titulo="Razón social"
              valor={TAURUS_RAZON_SOCIAL}
            />
            <CardConfianza
              icon={Shield}
              titulo="Licencia CNBV"
              valor={TAURUS_LICENCIA}
            />
            <CardConfianza
              icon={FileCheck}
              titulo="Cuentas segregadas"
              valor="Tu dinero queda a tu nombre"
            />
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#94A3B8' }}>
            Puedes verificar nuestra licencia en el portal de la CNBV.
          </p>
        </div>
      </section>

      {/* ============= 6. FAQ ============= */}
      <section style={styles.seccion}>
        <div style={{ ...styles.container, maxWidth: 720 }}>
          <p style={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <h2 style={styles.h2}>Lo que necesitas saber</h2>

          <FAQ
            pregunta="¿Cuánto dinero mínimo necesito para invertir?"
            respuesta="El monto mínimo de fondeo varía según el tipo de cuenta. Un asesor te explicará las opciones disponibles según tu perfil. Recuerda que solo debes invertir capital que estés dispuesto a destinar a largo plazo y que el trading conlleva riesgo de pérdida."
          />
          <FAQ
            pregunta="¿El dinero que deposito queda a mi nombre?"
            respuesta="Sí. Como broker regulado por la CNBV, las cuentas de clientes son segregadas. Tu capital nunca se mezcla con los recursos operativos de Taurus Fx y queda registrado a tu nombre."
          />
          <FAQ
            pregunta="¿Puedo retirar mi dinero cuando quiera?"
            respuesta="Sí. Los retiros se procesan a tu cuenta bancaria registrada. El tiempo de retiro depende del método: SPEI (mismo día hábil), SWIFT internacional (2-5 días hábiles)."
          />
          <FAQ
            pregunta="¿Qué pasa si SPCX baja después del IPO?"
            respuesta="Tú decides cuándo comprar y cuándo vender. Si el precio baja, mantienes tus acciones (igual que con cualquier broker tradicional) o vendes para limitar pérdidas. Como en toda inversión, existe riesgo de pérdida de capital."
          />
          <FAQ
            pregunta="¿Cuánto cobra Taurus Fx por operar SPCX?"
            respuesta="Cobramos un spread/comisión competitivo por cada operación. No cobramos comisiones por apertura de cuenta, mantenimiento ni fondeo. El asesor te explicará los costos exactos antes de operar."
          />
          <FAQ
            pregunta="¿Es lo mismo que una cuenta fondeada/challenge?"
            respuesta="No. Esta es una cuenta de inversión real con tu propio capital. Las cuentas fondeadas (de las prop firms) son para evaluación de habilidades de trading con capital de la firma, y no permiten operar IPOs. Para acceder a SPCX desde el día 1 necesitas una cuenta real con un broker regulado."
          />
          <FAQ
            pregunta="¿Necesito ser inversionista acreditado?"
            respuesta="No para la mayoría de productos. La cuenta de inversión estándar está disponible para personas físicas mayores de edad con identificación oficial mexicana o residencia comprobable."
          />
        </div>
      </section>

      {/* ============= 7. CTA FINAL ============= */}
      <section style={styles.ctaFinal}>
        <div style={styles.container}>
          <h2 style={{ ...styles.h2, color: 'white', marginBottom: 12 }}>
            Faltan {tiempoRestante.dias} días para el IPO
          </h2>
          <p style={{ fontSize: 18, color: '#CBD5E1', marginBottom: 32, textAlign: 'center', maxWidth: 600, margin: '0 auto 32px' }}>
            La apertura de cuenta toma 24-48 hrs. <br />
            Inicia el proceso hoy para estar listo el 12 de junio.
          </p>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => abrirWhatsApp('Quiero hablar con un asesor HOY mismo.')} style={{ ...styles.ctaPrimario, fontSize: 18, padding: '16px 32px' }}>
              <MessageCircle size={20} />
              Hablar con asesor por WhatsApp
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= FOOTER + DISCLAIMER LEGAL CNBV ============= */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.disclaimerBox}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#F59E0B' }}>
              ⚠️ Aviso de riesgo y advertencias legales
            </h3>
            <p style={styles.disclaimer}>
              <strong>{TAURUS_RAZON_SOCIAL}</strong> es una institución autorizada por la Comisión Nacional Bancaria y de Valores (CNBV) bajo el folio <strong>{TAURUS_LICENCIA}</strong>. Domicilio: {TAURUS_DOMICILIO}.
            </p>
            <p style={styles.disclaimer}>
              La inversión en valores conlleva riesgo de pérdida total o parcial del capital invertido. Los rendimientos pasados no son garantía de rendimientos futuros. Los precios de los activos pueden fluctuar significativamente. Antes de invertir, lee detalladamente los términos y condiciones, el prospecto del emisor y consulta a un asesor financiero independiente sobre la idoneidad del producto para tu perfil.
            </p>
            <p style={styles.disclaimer}>
              La información presentada en este sitio tiene fines exclusivamente informativos y educativos. No constituye recomendación de inversión, oferta de compra/venta de valores, ni asesoría personalizada. Los datos sobre SpaceX provienen de fuentes públicas (prospecto S-1 SEC, reportes Reuters, Bloomberg) y pueden cambiar antes del listado oficial.
            </p>
            <p style={styles.disclaimer}>
              La fecha del IPO (12 de junio 2026), precio ($135 USD/acción) y términos están sujetos a confirmación final por parte de SpaceX y NASDAQ. Taurus Fx no garantiza la disponibilidad del valor en su plataforma ni resultados específicos de inversión.
            </p>
            <p style={styles.disclaimer}>
              Si requieres atención o tienes alguna queja, comunícate a la UNE de Taurus Fx o a la CONDUSEF al 55 5340 0999.
            </p>
          </div>
          <div style={styles.footerLinks}>
            <a href="/aviso-privacidad" style={styles.footerLink}>Aviso de privacidad</a>
            <a href="/terminos" style={styles.footerLink}>Términos y condiciones</a>
            <a href="/avisos-cnbv" style={styles.footerLink}>Avisos CNBV</a>
            <a href="/condusef" style={styles.footerLink}>CONDUSEF</a>
          </div>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} {TAURUS_RAZON_SOCIAL}. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* WhatsApp flotante */}
      <button onClick={() => abrirWhatsApp()} style={styles.fabWhatsapp} aria-label="WhatsApp">
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

function StatCard({ numero, label, detalle }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statNumero}>{numero}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statDetalle}>{detalle}</div>
    </div>
  );
}

function CardPaso({ numero, titulo, descripcion, tiempo, destacado }) {
  return (
    <div style={{ ...styles.card, ...(destacado ? styles.cardDestacado : {}) }}>
      <div style={styles.cardNumero}>{numero}</div>
      <h3 style={styles.cardTitulo}>{titulo}</h3>
      <p style={styles.cardTexto}>{descripcion}</p>
      {tiempo && (
        <div style={styles.cardTiempo}>
          ⏱ {tiempo}
        </div>
      )}
    </div>
  );
}

function CardConfianza({ icon: Icon, titulo, valor }) {
  return (
    <div style={styles.cardConfianza}>
      <Icon size={28} color="#3B82F6" />
      <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 12, marginBottom: 4 }}>{titulo}</p>
      <p style={{ fontSize: 14, fontWeight: 600 }}>{valor}</p>
    </div>
  );
}

function FilaIPO({ empresa, anio, precio, dia1, anio1, destacado }) {
  return (
    <tr style={destacado ? { background: 'rgba(16, 185, 129, 0.05)' } : {}}>
      <td style={styles.td}>{empresa}</td>
      <td style={styles.td}>{anio}</td>
      <td style={styles.td}>{precio}</td>
      <td style={{ ...styles.td, color: '#10B981', fontWeight: 600 }}>{dia1}</td>
      <td style={{ ...styles.td, color: anio1.includes('-') ? '#EF4444' : '#10B981', fontWeight: 600 }}>{anio1}</td>
    </tr>
  );
}

function FAQ({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #1E293B', padding: '16px 0' }}>
      <button onClick={() => setAbierto(!abierto)} style={styles.faqBtn}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{pregunta}</span>
        <ChevronDown size={20} style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      {abierto && <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: '#CBD5E1' }}>{respuesta}</p>}
    </div>
  );
}

// ============= UTILS =============
function calcularTiempo() {
  const diff = FECHA_IPO - new Date();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff / 3600000) % 24),
    minutos: Math.floor((diff / 60000) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

// ============= ESTILOS =============
const styles = {
  hero: { position: 'relative', padding: '80px 24px 100px', overflow: 'hidden' },
  heroContainer: { maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
    marginBottom: 24, color: '#60A5FA',
  },
  heroTitle: { fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' },
  heroSubtitle: { fontSize: 18, lineHeight: 1.6, color: '#94A3B8', maxWidth: 600, margin: '0 auto 36px' },
  countdown: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 8, marginBottom: 36, flexWrap: 'wrap' },
  countdownBlock: { background: '#0F1F38', border: '1px solid #1E293B', borderRadius: 8, padding: '12px 16px', minWidth: 70 },
  countdownNumero: { fontSize: 32, fontWeight: 800, fontFamily: 'monospace', color: '#3B82F6', lineHeight: 1 },
  countdownLabel: { fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 },
  ctaPrimario: {
    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px',
    background: '#25D366', color: 'white', border: 'none', borderRadius: 8,
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
  },
  heroFooter: { marginTop: 16, fontSize: 13, color: '#64748B' },
  glowDecoration: {
    position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
    width: 600, height: 600, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 1,
  },
  seccion: { padding: '80px 24px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#3B82F6', marginBottom: 12, textAlign: 'center' },
  h2: { fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, lineHeight: 1.2, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.02em' },
  subtitulo: { textAlign: 'center', color: '#94A3B8', marginTop: -32, marginBottom: 48, fontSize: 14 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  gridStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: { background: '#0F1F38', border: '1px solid #1E293B', borderRadius: 12, padding: 24, textAlign: 'center' },
  statNumero: { fontSize: 44, fontWeight: 800, color: '#3B82F6', lineHeight: 1, marginBottom: 8 },
  statLabel: { fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 },
  statDetalle: { fontSize: 12, color: '#94A3B8' },
  callout: {
    display: 'flex', gap: 12, padding: 20, background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, marginTop: 24,
  },
  card: { background: '#0F1F38', border: '1px solid #1E293B', borderRadius: 12, padding: 28 },
  cardDestacado: { border: '1px solid #3B82F6', boxShadow: '0 0 32px rgba(59, 130, 246, 0.15)' },
  cardTitulo: { fontSize: 18, fontWeight: 700, margin: '16px 0 8px' },
  cardTexto: { fontSize: 14, lineHeight: 1.6, color: '#94A3B8' },
  cardNumero: { fontSize: 14, fontWeight: 700, color: '#3B82F6', letterSpacing: '0.1em' },
  cardTiempo: {
    display: 'inline-block', marginTop: 16, padding: '4px 10px',
    background: 'rgba(59, 130, 246, 0.1)', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#60A5FA',
  },
  cardsConfianza: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 },
  cardConfianza: { background: '#0A1628', border: '1px solid #1E293B', borderRadius: 12, padding: 24, textAlign: 'center' },
  tablaContainer: { overflowX: 'auto', borderRadius: 12, border: '1px solid #1E293B' },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  tablaHeader: { background: '#0A1628' },
  th: { padding: 14, textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', borderBottom: '1px solid #1E293B' },
  td: { padding: 14, fontSize: 14, borderTop: '1px solid #1E293B' },
  fuenteTabla: { textAlign: 'center', fontSize: 11, color: '#64748B', marginTop: 12, fontStyle: 'italic' },
  ctaFinal: { padding: '80px 24px', background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)', textAlign: 'center' },
  footer: { padding: '40px 24px 24px', background: '#050B16', borderTop: '1px solid #1E293B' },
  disclaimerBox: { background: '#0A1628', border: '1px solid #1E293B', borderRadius: 8, padding: 24, marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' },
  disclaimer: { fontSize: 11.5, lineHeight: 1.6, color: '#94A3B8', marginBottom: 10 },
  footerLinks: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 },
  footerLink: { fontSize: 12, color: '#64748B', textDecoration: 'none', cursor: 'pointer' },
  copyright: { fontSize: 11, color: '#475569', textAlign: 'center' },
  faqBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'transparent', border: 'none', color: 'white', padding: 0, cursor: 'pointer', textAlign: 'left' },
  fabWhatsapp: {
    position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%',
    background: '#25D366', color: 'white', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
};