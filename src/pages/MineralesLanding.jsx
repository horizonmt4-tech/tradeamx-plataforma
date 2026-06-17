import { useState, useEffect } from 'react';
import {
  Gem, TrendingUp, Shield, FileCheck, Building2, BatteryCharging,
  ChevronDown, ArrowRight, AlertTriangle, Zap, Globe, Factory,
} from 'lucide-react';
import LeadMagnetModal from '../components/LeadMagnetModal';

// ============= CONFIG =============
const WHATSAPP_NUMERO = '5215574435022'; // ← REEMPLAZA con número real

// DATOS REGULATORIOS — reemplaza con datos reales
const TAURUS_RAZON_SOCIAL = '© TradeAMX';
const TAURUS_LICENCIA = 'CNBV 981631';
const TAURUS_DOMICILIO = '.';

export default function MineralesLanding() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalOrigen, setModalOrigen] = useState('manual');
  const [yaMostrado, setYaMostrado] = useState(false);

  const abrirModal = (origen = 'manual') => {
    setModalOrigen(origen);
    setModalAbierto(true);
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { source: origen });
    }
  };

  // Auto-trigger del modal por scroll, exit-intent o tiempo
  useEffect(() => {
    if (yaMostrado) return;

    let scrollTriggered = false;

    const handleScroll = () => {
      if (scrollTriggered) return;
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      const pctScrolled = (scrolled + viewportHeight) / totalHeight;

      if (pctScrolled > 0.5) {
        scrollTriggered = true;
        abrirModal('scroll_50pct');
        setYaMostrado(true);
      }
    };

    const handleMouseLeave = (e) => {
      if (e.clientY < 10 && !scrollTriggered) {
        scrollTriggered = true;
        abrirModal('exit_intent');
        setYaMostrado(true);
      }
    };

    const timer = setTimeout(() => {
      if (!scrollTriggered) {
        scrollTriggered = true;
        abrirModal('time_60s');
        setYaMostrado(true);
      }
    }, 60000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [yaMostrado]);

  return (
    <div style={styles.contenedor}>

      {/* ============= BANNER SUPERIOR ============= */}
      <div style={styles.bannerTop}>
        <div style={styles.bannerTopInner}>
          <span style={styles.bannerTopEmoji}>⚡</span>
          <span style={styles.bannerTopTexto}>
            <strong>La transición energética ya empezó</strong> · Aprende a operar los metales que la impulsan ·
            <span style={styles.bannerTopCta} onClick={() => abrirModal('banner_top')}>
              Más info →
            </span>
          </span>
        </div>
      </div>

      {/* ============= 1. HERO ============= */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroBadge}>
            <BatteryCharging size={14} />
            <span>COMMODITIES · LITIO · COBRE · NÍQUEL</span>
          </div>

          <h1 style={styles.heroTitle}>
            Los metales que mueven el futuro<br />
            <span style={{ color: '#22D3EE' }}>ya se están operando</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Autos eléctricos, baterías y energías limpias dispararon la demanda de litio, cobre y níquel.
            Aprende a tomar posición en estos mercados con la estructura y disciplina de Taurus Fx.
          </p>

          <button
            onClick={() => abrirModal('hero_cta')}
            style={styles.ctaPrimario}
          >
            <Gem size={18} />
            Quiero más información
            <ArrowRight size={18} />
          </button>

          <p style={styles.heroFooter}>
            ✓ Broker regulado CNBV · ✓ Acompañamiento de asesores · ✓ Apertura 100% digital
          </p>
        </div>
        <div style={styles.glowDecoration} />
      </section>

      {/* ============= 2. POR QUÉ LOS METALES ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>POR QUÉ AHORA</p>
          <h2 style={styles.h2}>
            La mayor transformación energética <br />
            <span style={{ color: '#22D3EE' }}>de la historia reciente</span>
          </h2>

          <p style={styles.subtituloProyectos}>
            El mundo está electrificando todo: transporte, redes y almacenamiento. Eso significa una demanda
            sin precedentes de metales industriales, y un mercado lleno de movimiento para quien sabe leerlo.
          </p>

          <div style={styles.gridProyectos}>
            <CardMetal
              icon={BatteryCharging}
              nombre="Litio"
              etiqueta="El metal de las baterías"
              descripcion="Componente esencial de las baterías de autos eléctricos y almacenamiento. La demanda proyectada crece con cada nuevo vehículo eléctrico que sale al mercado."
            />
            <CardMetal
              icon={Zap}
              nombre="Cobre"
              etiqueta="El conductor universal"
              descripcion="Indispensable en cableado, motores eléctricos y redes de energía. Sin cobre no hay electrificación: cada coche eléctrico usa hasta 4 veces más que uno de gasolina."
              destacado
            />
            <CardMetal
              icon={Factory}
              nombre="Níquel"
              etiqueta="Densidad de energía"
              descripcion="Clave en baterías de alto rendimiento y acero inoxidable. Su rol en la autonomía de los vehículos eléctricos lo vuelve estratégico."
            />
            <CardMetal
              icon={Globe}
              nombre="Commodities"
              etiqueta="Mercado global 24h"
              descripcion="Los metales se operan en mercados internacionales con alta liquidez. Movimiento constante y oportunidades tanto al alza como a la baja."
            />
          </div>

          <div style={styles.bannerNumeros}>
            <NumeroGrande valor="+300%" texto="Crecimiento proyectado de demanda de litio a 2030*" />
            <Divisor />
            <NumeroGrande valor="24/5" texto="Mercados de commodities operando" />
            <Divisor />
            <NumeroGrande valor="4x" texto="Más cobre en un auto eléctrico vs uno de gasolina" />
          </div>

          <p style={styles.fuenteTabla}>
            * Proyecciones de organismos como la Agencia Internacional de Energía (IEA). Datos de referencia, no constituyen recomendación de inversión.
          </p>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => abrirModal('seccion_metales')}
              style={styles.ctaIntermedio}
            >
              <Gem size={18} />
              Quiero aprender a operarlos
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= 3. QUÉ OFRECE TAURUS FX ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>CÓMO TE ACOMPAÑAMOS</p>
          <h2 style={styles.h2}>
            No improvisamos. <br />
            <span style={{ color: '#22D3EE' }}>Operamos con método</span>
          </h2>

          <div style={styles.grid3}>
            <CardBeneficio
              icon={TrendingUp}
              titulo="Análisis top-down"
              descripcion="Te enseñamos a leer el mercado de lo macro a lo micro: tendencia semanal, diaria y zonas de oportunidad. Estructura clara, no corazonadas."
            />
            <CardBeneficio
              icon={Shield}
              titulo="Gestión de riesgo"
              descripcion="Lo más importante no es cuánto ganas, sino cómo proteges tu capital. Aprende disciplina y manejo de riesgo desde el primer día."
              destacado
            />
            <CardBeneficio
              icon={Building2}
              titulo="Acompañamiento real"
              descripcion="Asesores y una comunidad activa de traders. No estás solo: tienes guía mientras desarrollas tu propio criterio."
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={() => abrirModal('seccion_beneficios')} style={styles.ctaPrimario}>
              <Gem size={18} />
              Quiero más información
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= 4. CÓMO EMPIEZAS ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>CÓMO EMPEZAR</p>
          <h2 style={styles.h2}>
            Tres pasos para empezar a operar <br />
            <span style={{ color: '#22D3EE' }}>con un broker regulado por CNBV</span>
          </h2>

          <div style={styles.grid3}>
            <CardPaso
              numero="01"
              titulo="Déjanos tus datos"
              descripcion="Llena el formulario y un asesor de Taurus Fx te contactará para resolver tus dudas y explicarte cómo funciona."
              tiempo="Hoy mismo"
            />
            <CardPaso
              numero="02"
              titulo="Abre tu cuenta"
              descripcion="Proceso 100% digital. Necesitas INE, comprobante de domicilio y CURP. Aprobación en 24-48 hrs según validación KYC."
              tiempo="24-48 hrs"
              destacado
            />
            <CardPaso
              numero="03"
              titulo="Opera con guía"
              descripcion="Accede a formación, análisis y acompañamiento para operar commodities con método. Tú decides cada movimiento."
              tiempo="Continuo"
            />
          </div>
        </div>
      </section>

      {/* ============= 5. RESPALDO REGULATORIO ============= */}
      <section style={styles.seccion}>
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

          <p style={styles.confianzaFooter}>
            Puedes verificar nuestra licencia en el portal oficial de la CNBV.
          </p>
        </div>
      </section>

      {/* ============= 6. FAQ ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={{ ...styles.container, maxWidth: 720 }}>
          <p style={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <h2 style={styles.h2}>Lo que necesitas saber</h2>

          <FAQ
            pregunta="¿Qué significa operar commodities como el litio o el cobre?"
            respuesta="Significa tomar posiciones en instrumentos financieros ligados al precio de estos metales, aprovechando sus movimientos al alza o a la baja. No compras el metal físico: operas su cotización en mercados internacionales a través de la plataforma de Taurus Fx."
          />
          <FAQ
            pregunta="¿Necesito experiencia previa en trading?"
            respuesta="No es indispensable. Taurus Fx te acompaña con formación y una metodología de análisis estructurada. Dicho esto, operar conlleva riesgo y requiere disciplina; por eso el enfoque es educativo y de acompañamiento, no de promesas."
          />
          <FAQ
            pregunta="¿Cuánto dinero mínimo necesito?"
            respuesta="El monto mínimo de fondeo es accesible y un asesor te explicará las opciones según tu perfil. Recuerda invertir solo capital que estés dispuesto a arriesgar."
          />
          <FAQ
            pregunta="¿El dinero que deposito queda a mi nombre?"
            respuesta="Sí. Como broker regulado por la CNBV, las cuentas de clientes son segregadas. Tu capital nunca se mezcla con los recursos operativos de Taurus Fx y queda registrado a tu nombre."
          />
          <FAQ
            pregunta="¿Puedo retirar mi dinero cuando quiera?"
            respuesta="Sí. Los retiros se procesan a tu cuenta bancaria registrada. El tiempo depende del método: SPEI (mismo día hábil), SWIFT internacional (2-5 días hábiles)."
          />
          <FAQ
            pregunta="¿Hay riesgo de perder dinero?"
            respuesta="Sí. Toda inversión y operación en mercados financieros conlleva riesgo de pérdida parcial o total del capital. Los precios de los commodities pueden fluctuar significativamente. Por eso enseñamos gestión de riesgo y nunca garantizamos resultados."
          />
        </div>
      </section>

      {/* ============= 7. CTA FINAL ============= */}
      <section style={styles.ctaFinal}>
        <div style={styles.container}>
          <h2 style={styles.h2FinalCta}>
            La transición energética no espera
          </h2>
          <p style={styles.ctaFinalTexto}>
            Aprende a operar los metales del futuro con método y acompañamiento. <br />
            Déjanos tus datos y da el primer paso hoy.
          </p>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => abrirModal('cta_final')}
              style={{ ...styles.ctaPrimario, fontSize: 17, padding: '16px 32px' }}
            >
              <Gem size={20} />
              Quiero más información
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= FOOTER + DISCLAIMER ============= */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.disclaimerBox}>
            <h3 style={styles.disclaimerTitulo}>
              ⚠️ Aviso de riesgo y advertencias legales
            </h3>
            <p style={styles.disclaimer}>
              <strong>{TAURUS_RAZON_SOCIAL}</strong> es una institución autorizada por la Comisión Nacional Bancaria y de Valores (CNBV) bajo el folio <strong>{TAURUS_LICENCIA}</strong>. Domicilio: {TAURUS_DOMICILIO}.
            </p>
            <p style={styles.disclaimer}>
              La inversión y operación en mercados financieros, incluyendo commodities y metales, conlleva riesgo de pérdida total o parcial del capital invertido. Los rendimientos pasados no son garantía de rendimientos futuros. Los precios pueden fluctuar significativamente. Antes de invertir, consulta a un asesor financiero independiente sobre la idoneidad del producto para tu perfil.
            </p>
            <p style={styles.disclaimer}>
              La información presentada tiene fines exclusivamente informativos y educativos. No constituye recomendación de inversión ni oferta de compra/venta de instrumentos financieros. Los datos sobre demanda de metales provienen de fuentes públicas (Agencia Internacional de Energía y reportes de mercado) y pueden cambiar.
            </p>
            <p style={styles.disclaimer}>
              Taurus Fx no garantiza la disponibilidad de instrumentos específicos en su plataforma ni resultados de inversión. Operar con apalancamiento incrementa tanto las ganancias potenciales como las pérdidas.
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

      {/* ============= STICKY BUTTON ============= */}
      <div className="sticky-cta-bar" style={styles.stickyBar}>
        <div style={styles.urgencyMicrocopy}>
          🟢 Asesores activos ahora · Resuelve tus dudas sin compromiso
        </div>
        <button
          onClick={() => abrirModal('sticky')}
          className="sticky-cta-btn"
          style={styles.stickyButton}
        >
          <Gem size={20} />
          <div style={styles.stickyTextBox}>
            <div style={styles.stickyMini}>Metales del futuro</div>
            <div style={styles.stickyMain}>Quiero más información</div>
          </div>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ============= MODAL LEAD MAGNET ============= */}
      <LeadMagnetModal
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        origen={modalOrigen}
      />

    </div>
  );
}

// ============= SUB-COMPONENTES =============

function CardMetal({ icon: Icon, nombre, etiqueta, descripcion, destacado }) {
  return (
    <div style={{ ...styles.cardProyecto, ...(destacado ? styles.cardDestacado : {}) }}>
      <div style={styles.metalIcono}>
        <Icon size={28} color="#22D3EE" />
      </div>
      <div style={styles.proyectoCliente}>{etiqueta}</div>
      <div style={styles.proyectoMonto}>{nombre}</div>
      <p style={styles.proyectoDescripcion}>{descripcion}</p>
    </div>
  );
}

function NumeroGrande({ valor, texto }) {
  return (
    <div style={styles.numeroGrandeBox}>
      <div style={styles.numeroGrandeValor}>{valor}</div>
      <div style={styles.numeroGrandeTexto}>{texto}</div>
    </div>
  );
}

function Divisor() {
  return <div style={styles.divisor} />;
}

function CardBeneficio({ icon: Icon, titulo, descripcion, destacado }) {
  return (
    <div style={{ ...styles.card, ...(destacado ? styles.cardDestacado : {}) }}>
      <div style={styles.beneficioIcono}>
        <Icon size={24} color="#22D3EE" />
      </div>
      <h3 style={styles.cardTitulo}>{titulo}</h3>
      <p style={styles.cardTexto}>{descripcion}</p>
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
      <Icon size={28} color="#22D3EE" />
      <p style={styles.confianzaTitulo}>{titulo}</p>
      <p style={styles.confianzaValor}>{valor}</p>
    </div>
  );
}

function FAQ({ pregunta, respuesta }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={styles.faqItem}>
      <button onClick={() => setAbierto(!abierto)} style={styles.faqBtn}>
        <span style={styles.faqPregunta}>{pregunta}</span>
        <ChevronDown size={20} style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {abierto && <p style={styles.faqRespuesta}>{respuesta}</p>}
    </div>
  );
}

// ============= ESTILOS =============
const styles = {
  contenedor: {
    fontFamily: 'Inter, system-ui, sans-serif',
    background: '#0A1628',
    color: 'white',
    minHeight: '100vh',
    paddingBottom: 100,
  },

  // BANNER SUPERIOR
  bannerTop: {
    background: 'linear-gradient(90deg, #22D3EE 0%, #2563EB 100%)',
    padding: '8px 16px',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  bannerTopInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 1100,
  },
  bannerTopEmoji: {
    fontSize: 18,
  },
  bannerTopTexto: {
    fontSize: 'clamp(11px, 2.5vw, 14px)',
    color: 'white',
    fontWeight: 500,
  },
  bannerTopCta: {
    marginLeft: 6,
    fontWeight: 800,
    textDecoration: 'underline',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  // HERO
  hero: {
    position: 'relative',
    padding: 'clamp(48px, 10vw, 80px) clamp(16px, 5vw, 24px) clamp(60px, 12vw, 100px)',
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
    background: 'rgba(34, 211, 238, 0.1)',
    border: '1px solid rgba(34, 211, 238, 0.3)',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.05em',
    marginBottom: 24,
    color: '#67E8F9',
  },
  heroTitle: {
    fontSize: 'clamp(32px, 6vw, 60px)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 20,
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: 'clamp(15px, 3vw, 18px)',
    lineHeight: 1.6,
    color: '#94A3B8',
    maxWidth: 620,
    margin: '0 auto 36px',
  },
  ctaPrimario: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: 'clamp(14px, 4vw, 16px) clamp(22px, 5vw, 32px)',
    background: 'linear-gradient(135deg, #22D3EE, #2563EB)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 'clamp(15px, 4vw, 17px)',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(34, 211, 238, 0.4)',
    fontFamily: 'inherit',
    minHeight: 52,
  },
  ctaIntermedio: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #22D3EE, #2563EB)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(34, 211, 238, 0.3)',
    fontFamily: 'inherit',
    minHeight: 48,
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
    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },

  // SECCIONES GENERALES
  seccion: {
    padding: 'clamp(48px, 10vw, 80px) clamp(16px, 5vw, 24px)',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#22D3EE',
    marginBottom: 12,
    textAlign: 'center',
  },
  h2: {
    fontSize: 'clamp(26px, 4.5vw, 42px)',
    fontWeight: 800,
    lineHeight: 1.2,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: '-0.02em',
  },
  subtituloProyectos: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: -16,
    marginBottom: 40,
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    lineHeight: 1.6,
    maxWidth: 700,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  // METALES / PROYECTOS
  gridProyectos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  cardProyecto: {
    background: '#0A1628',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
  },
  metalIcono: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: 'rgba(34, 211, 238, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  proyectoCliente: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#22D3EE',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  proyectoMonto: {
    fontSize: 26,
    fontWeight: 800,
    color: 'white',
    marginBottom: 12,
    letterSpacing: '-0.02em',
  },
  proyectoDescripcion: {
    fontSize: 13,
    lineHeight: 1.6,
    color: '#94A3B8',
  },
  bannerNumeros: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    background: '#050B16',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: '28px 16px',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  numeroGrandeBox: {
    textAlign: 'center',
    flex: 1,
    minWidth: 130,
  },
  numeroGrandeValor: {
    fontSize: 'clamp(26px, 5vw, 38px)',
    fontWeight: 800,
    color: '#22D3EE',
    lineHeight: 1,
    marginBottom: 6,
    letterSpacing: '-0.02em',
  },
  numeroGrandeTexto: {
    fontSize: 12,
    color: '#94A3B8',
    maxWidth: 180,
    margin: '0 auto',
    lineHeight: 1.4,
  },
  divisor: {
    width: 1,
    alignSelf: 'stretch',
    background: '#1E293B',
    minHeight: 40,
  },

  // CARDS GENERALES
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: 28,
  },
  cardDestacado: {
    border: '1px solid #22D3EE',
    boxShadow: '0 0 32px rgba(34, 211, 238, 0.15)',
  },
  beneficioIcono: {
    width: 48,
    height: 48,
    borderRadius: 10,
    background: 'rgba(34, 211, 238, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardNumero: {
    fontSize: 14,
    fontWeight: 700,
    color: '#22D3EE',
    letterSpacing: '0.1em',
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
  cardTiempo: {
    display: 'inline-block',
    marginTop: 16,
    padding: '4px 10px',
    background: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#67E8F9',
  },

  // CONFIANZA
  cardsConfianza: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16,
  },
  cardConfianza: {
    background: '#0A1628',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
  },
  confianzaTitulo: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 4,
  },
  confianzaValor: {
    fontSize: 14,
    fontWeight: 600,
  },
  confianzaFooter: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
    color: '#94A3B8',
  },

  fuenteTabla: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
    maxWidth: 700,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  // FAQ
  faqItem: {
    borderBottom: '1px solid #1E293B',
    padding: '16px 0',
  },
  faqBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'white',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  faqPregunta: {
    fontSize: 'clamp(14px, 3vw, 16px)',
    fontWeight: 600,
  },
  faqRespuesta: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#CBD5E1',
  },

  // CTA FINAL
  ctaFinal: {
    padding: 'clamp(48px, 10vw, 80px) clamp(16px, 5vw, 24px)',
    background: 'linear-gradient(135deg, #0E7490 0%, #1E3A8A 100%)',
    textAlign: 'center',
  },
  h2FinalCta: {
    fontSize: 'clamp(26px, 4.5vw, 42px)',
    fontWeight: 800,
    lineHeight: 1.2,
    color: 'white',
    marginBottom: 12,
    letterSpacing: '-0.02em',
  },
  ctaFinalTexto: {
    fontSize: 'clamp(15px, 3vw, 18px)',
    color: '#CBD5E1',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 600,
    margin: '0 auto 32px',
  },

  // FOOTER
  footer: {
    padding: '40px 24px 24px',
    background: '#050B16',
    borderTop: '1px solid #1E293B',
  },
  disclaimerBox: {
    background: '#0A1628',
    border: '1px solid #1E293B',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    maxWidth: 900,
    margin: '0 auto 24px',
  },
  disclaimerTitulo: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 12,
    color: '#22D3EE',
  },
  disclaimer: {
    fontSize: 11.5,
    lineHeight: 1.6,
    color: '#94A3B8',
    marginBottom: 10,
  },
  footerLinks: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 12,
    color: '#64748B',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  copyright: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
  },

  // STICKY BAR
  stickyBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 16px 16px',
    background: 'linear-gradient(to top, rgba(10, 22, 40, 0.98) 70%, rgba(10, 22, 40, 0))',
    zIndex: 999,
    WebkitBackdropFilter: 'blur(8px)',
    backdropFilter: 'blur(8px)',
  },
  urgencyMicrocopy: {
    textAlign: 'center',
    fontSize: 11,
    color: '#22D3EE',
    marginBottom: 8,
    fontWeight: 700,
  },
  stickyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #22D3EE, #2563EB)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(34, 211, 238, 0.5)',
    fontFamily: 'inherit',
  },
  stickyTextBox: {
    flex: 1,
    textAlign: 'left',
    minWidth: 0,
  },
  stickyMini: {
    fontSize: 10,
    opacity: 0.9,
    marginBottom: 1,
  },
  stickyMain: {
    fontSize: 14,
    fontWeight: 700,
  },
};