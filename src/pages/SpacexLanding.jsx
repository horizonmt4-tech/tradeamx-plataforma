import { useState, useEffect } from 'react';
import {
  Rocket, TrendingUp, Shield, FileCheck, Building2, Clock, Gift,
  ChevronDown, MessageCircle, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';
import LeadMagnetModal from '../components/LeadMagnetModal';

// ============= CONFIG =============
const WHATSAPP_NUMERO = '5574435022'; // ← REEMPLAZA con número real
const FECHA_IPO = new Date('2026-06-12T13:30:00-04:00');
const PRECIO_IPO = 135;
const CAPITAL_OBJETIVO = '1.25T';
const MENSAJE_WHATSAPP_BASE = 'Hola, vi su info del OPI de SpaceX. Quiero más detalles.';

// DATOS REGULATORIOS — reemplaza con datos reales
const TAURUS_RAZON_SOCIAL = '© TradeAMX';
const TAURUS_LICENCIA = 'CNBV 981631';
const TAURUS_DOMICILIO = '.';

export default function SpacexLanding() {
  const [tiempoRestante, setTiempoRestante] = useState(calcularTiempo());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalOrigen, setModalOrigen] = useState('manual');
  const [yaMostrado, setYaMostrado] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTiempoRestante(calcularTiempo()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const abrirWhatsApp = (extra = '', origen = 'directo') => {
    if (typeof window !== 'undefined' && window.va) {
      try { window.va('event', { name: 'whatsapp_click', origen }); } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact', { source: origen });
    }
    const mensaje = encodeURIComponent(MENSAJE_WHATSAPP_BASE + (extra ? ' ' + extra : ''));
    const url = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + mensaje;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.contenedor}>

      {/* ============= BANNER URGENTE BONO ============= */}
      <div style={styles.bannerBono}>
        <div style={styles.bannerBonoInner}>
          <span style={styles.bannerBonoEmoji}>🎁</span>
          <span style={styles.bannerBonoTexto}>
            <strong>BONO ESPECIAL: 75%</strong> sobre tu depósito inicial · 
            <span style={styles.bannerBonoCta} onClick={() => abrirModal('banner_top')}>
              Obtener bono →
            </span>
          </span>
        </div>
      </div>

      {/* ============= 1. HERO ============= */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroBadge}>
            <Rocket size={14} />
            <span>NASDAQ · SPCX · OPI 12 JUNIO 2026</span>
          </div>

          <h1 style={styles.heroTitle}>
            La empresa de Elon Musk<br />
            <span style={{ color: '#3B82F6' }}>sale a la bolsa en {tiempoRestante.dias} días</span>
          </h1>

          <p style={styles.heroSubtitle}>
            $22 mil millones USD en contratos con NASA y el Pentágono.<br />
            10 millones de suscriptores Starlink globales.<br />
            Valuación objetivo: <strong>${CAPITAL_OBJETIVO} USD</strong>.
          </p>

          <div style={styles.countdown}>
            <CountdownBlock valor={tiempoRestante.dias} label="Días" />
            <CountdownBlock valor={tiempoRestante.horas} label="Horas" />
            <CountdownBlock valor={tiempoRestante.minutos} label="Min" />
            <CountdownBlock valor={tiempoRestante.segundos} label="Seg" />
          </div>

          <button 
            onClick={() => abrirModal('hero_cta')} 
            style={styles.ctaPrimario}
          >
            <Gift size={18} />
            Obtener mi bono del 75%
            <ArrowRight size={18} />
          </button>

          <p style={styles.heroFooter}>
            ✓ Bono retirable · ✓ Broker regulado CNBV · ✓ Apertura 100% digital
          </p>
        </div>
        <div style={styles.glowDecoration} />
      </section>

      {/* ============= 2. PROYECTOS Y CONTRATOS ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>POR QUÉ SPACEX</p>
          <h2 style={styles.h2}>
            No es una promesa, son contratos firmados <br />
            <span style={{ color: '#10B981' }}>por más de $22 mil millones USD</span>
          </h2>

          <p style={styles.subtituloProyectos}>
            SpaceX tiene 52 contratos federales activos con NASA, el Departamento de Defensa, Space Force y la NRO. No son proyecciones, son ingresos asegurados por años.
          </p>

          <div style={styles.gridProyectos}>
            <CardProyecto
              emoji="🌙"
              cliente="NASA · Artemis"
              contrato="$4,300M USD"
              descripcion="Llevar astronautas a la Luna en la misión Artemis con el cohete Starship. SpaceX es uno de dos contratistas autorizados."
              plazo="2025-2030"
            />
            <CardProyecto
              emoji="🚀"
              cliente="NASA · Crew Dragon"
              contrato="$4,900M USD"
              descripcion="Único proveedor certificado por NASA para llevar astronautas a la Estación Espacial Internacional."
              plazo="Hasta 2030"
              destacado
            />
            <CardProyecto
              emoji="🛰"
              cliente="Space Force · NSSL"
              contrato="$5,900M USD"
              descripcion="Lanzamientos de seguridad nacional para EE.UU. SpaceX adjudicado 28 de 54 misiones del programa Lane 2."
              plazo="2025-2029"
            />
            <CardProyecto
              emoji="🛡"
              cliente="Pentágono · Starshield"
              contrato="$2,000M USD"
              descripcion="Versión militar de Starlink para comunicaciones del Departamento de Defensa. Proyección de crecimiento a $3,200M en 2026."
              plazo="Multi-anual"
            />
          </div>

          <div style={styles.bannerNumeros}>
            <NumeroGrande valor="$22B+" texto="En contratos federales acumulados" />
            <Divisor />
            <NumeroGrande valor="52" texto="Contratos federales activos" />
            <Divisor />
            <NumeroGrande valor="10M+" texto="Suscriptores Starlink globales" />
            <Divisor />
            <NumeroGrande valor="$11.4B" texto="Ingresos recurrentes Starlink" />
          </div>

          <div style={styles.citaAutoritativa}>
            <p style={styles.citaTexto}>
              "El gobierno estadounidense ha confiado a SpaceX más contratos que a cualquier otro contratista no tradicional en la historia."
            </p>
            <p style={styles.citaFuente}>
              — Datos verificados: Fed-Spend, NASA OIG, SpaceNews (2026)
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button 
              onClick={() => abrirModal('seccion_proyectos')} 
              style={styles.ctaIntermedio}
            >
              <Gift size={18} />
              Obtener mi bono del 75%
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= 3. SECCIÓN BONO DESTACADA ============= */}
      <section style={styles.seccionBono}>
        <div style={styles.container}>
          <div style={styles.bonoDestacado}>
            <div style={styles.bonoBadge}>
              🎁 PROMO ESPECIAL OPI SPACEX
            </div>
            
            <h2 style={styles.bonoTitulo}>
              Recibe un <span style={styles.bonoNumero}>75%</span> adicional<br />
              sobre tu depósito inicial
            </h2>

            <p style={styles.bonoSubtitulo}>
              Promoción exclusiva para los primeros depositantes durante el OPI de SpaceX. <br />
              Bono 100% retirable. Sin condiciones de volumen escondidas.
            </p>

            <div style={styles.bonoEjemplo}>
              <div style={styles.ejemploColumna}>
                <div style={styles.ejemploLabel}>Depositas</div>
                <div style={styles.ejemploValor}>$1,000 USD</div>
              </div>
              <div style={styles.ejemploSeparador}>+</div>
              <div style={styles.ejemploColumna}>
                <div style={styles.ejemploLabel}>Recibes bono</div>
                <div style={{ ...styles.ejemploValor, color: '#F59E0B' }}>$750 USD</div>
              </div>
              <div style={styles.ejemploSeparador}>=</div>
              <div style={styles.ejemploColumna}>
                <div style={styles.ejemploLabel}>Capital operativo</div>
                <div style={{ ...styles.ejemploValor, color: '#10B981' }}>$1,750 USD</div>
              </div>
            </div>

            <button onClick={() => abrirModal('seccion_bono')} style={styles.botonBonoCta}>
              <Gift size={20} />
              Reclamar mi bono ahora
              <ArrowRight size={20} />
            </button>

            <p style={styles.bonoDisclaimer}>
              * Promo válida hasta el 12 de junio 2026. Sujeta a apertura y verificación de cuenta. 
              Términos completos disponibles con tu asesor.
            </p>
          </div>
        </div>
      </section>

      {/* ============= 4. DATOS DEL OPI ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>DATOS DEL OPI</p>
          <h2 style={styles.h2}>
            Información oficial del prospecto S-1 <br />
            <span style={styles.h2Sub}>presentado a la SEC el 20 de mayo 2026</span>
          </h2>

          <div style={styles.gridStats}>
            <StatCard
              numero={'$' + CAPITAL_OBJETIVO}
              label="Valuación objetivo"
              detalle="Superior a Berkshire Hathaway"
            />
            <StatCard
              numero="$75B"
              label="Capital a levantar"
              detalle="3er OPI más grande de la historia"
            />
            <StatCard
              numero="30%"
              label="Reservado para retail"
              detalle="vs 5-10% en OPIs tradicionales"
            />
            <StatCard
              numero={'$' + PRECIO_IPO}
              label="Precio por acción"
              detalle="Confirmado en prospecto"
            />
          </div>

          <div style={styles.callout}>
            <AlertTriangle size={20} color="#F59E0B" />
            <p>
              <strong>Dato relevante:</strong> Según reportes públicos, Elon Musk solicitó reservar hasta 30% de las acciones para inversionistas minoristas, una proporción inusualmente alta para un OPI de este tamaño. Esto puede generar alta demanda en los primeros días de cotización.
            </p>
          </div>
        </div>
      </section>

      {/* ============= 5. CONTEXTO HISTÓRICO ============= */}
      <section style={{ ...styles.seccion, background: '#0F1F38' }}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>CONTEXTO HISTÓRICO</p>
          <h2 style={styles.h2}>Performance de OPIs grandes recientes</h2>
          <p style={styles.subtitulo}>
            Datos públicos. Los resultados pasados no garantizan rendimientos futuros.
          </p>

          <div style={styles.tablaContainer}>
            <table style={styles.tabla}>
              <thead>
                <tr style={styles.tablaHeader}>
                  <th style={styles.th}>Empresa</th>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>Precio OPI</th>
                  <th style={styles.th}>Día 1</th>
                  <th style={styles.th}>+1 año</th>
                </tr>
              </thead>
              <tbody>
                <FilaIPO empresa="Saudi Aramco" anio="2019" precio="$8.53" dia1="+10%" anio1="-5%" />
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
        </div>
      </section>

      {/* ============= 6. CÓMO ACCEDES ============= */}
      <section style={styles.seccion}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>CÓMO PARTICIPAR</p>
          <h2 style={styles.h2}>
            Acceso al OPI con tu cuenta Taurus Fx <br />
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
              titulo="Fondea + recibe bono 75%"
              descripcion="Depósito mínimo en MXN o USD vía SPEI/SWIFT. Recibes 75% adicional sobre lo depositado. Bono 100% retirable."
              tiempo="Inmediato"
              destacado
            />
            <CardPaso
              numero="03"
              titulo="Opera SPCX desde día 1"
              descripcion="Acceso al OPI el 12 de junio en NASDAQ. Compras acciones reales a tu nombre. Tú decides cuándo entrar y salir."
              tiempo="12 de junio"
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={() => abrirModal('seccion_pasos')} style={styles.ctaPrimario}>
              <Gift size={18} />
              Reclamar mi bono ahora
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ============= 7. LICENCIA CNBV ============= */}
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

          <p style={styles.confianzaFooter}>
            Puedes verificar nuestra licencia en el portal oficial de la CNBV.
          </p>
        </div>
      </section>

      {/* ============= 8. FAQ ============= */}
      <section style={styles.seccion}>
        <div style={{ ...styles.container, maxWidth: 720 }}>
          <p style={styles.eyebrow}>PREGUNTAS FRECUENTES</p>
          <h2 style={styles.h2}>Lo que necesitas saber</h2>

          <FAQ
            pregunta="¿Cómo funciona el bono del 75%?"
            respuesta="Al abrir tu cuenta y hacer tu primer depósito, recibes automáticamente un 75% adicional sobre el monto depositado. Por ejemplo, si depositas $1,000 USD recibes $750 USD adicionales. El bono es 100% retirable, no tiene condiciones escondidas de volumen de trading. La promoción es válida hasta el 12 de junio 2026."
          />
          <FAQ
            pregunta="¿Cuánto dinero mínimo necesito?"
            respuesta="El monto mínimo de fondeo es accesible y un asesor te explicará las opciones disponibles según tu perfil. Recuerda que solo debes invertir capital que estés dispuesto a destinar a largo plazo."
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
            pregunta="¿Qué pasa si SPCX baja después del OPI?"
            respuesta="Tú decides cuándo comprar y cuándo vender. Si el precio baja, mantienes tus acciones o vendes para limitar pérdidas. Como en toda inversión, existe riesgo de pérdida de capital."
          />
          <FAQ
            pregunta="¿Cuánto cobra Taurus Fx por operar?"
            respuesta="Cobramos un spread/comisión competitivo por cada operación. No cobramos por apertura de cuenta, mantenimiento ni fondeo. El asesor te explicará los costos exactos antes de operar."
          />
          <FAQ
            pregunta="¿Necesito ser inversionista acreditado?"
            respuesta="No. La cuenta de inversión estándar está disponible para personas físicas mayores de edad con identificación oficial mexicana o residencia comprobable."
          />
        </div>
      </section>

      {/* ============= 9. CTA FINAL ============= */}
      <section style={styles.ctaFinal}>
        <div style={styles.container}>
          <h2 style={styles.h2FinalCta}>
            Faltan {tiempoRestante.dias} días para el OPI
          </h2>
          <p style={styles.ctaFinalTexto}>
            Bono del 75% + apertura digital en 24-48 hrs. <br />
            Inicia el proceso hoy para estar listo el 12 de junio.
          </p>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => abrirModal('cta_final')} 
              style={{ ...styles.ctaPrimario, fontSize: 17, padding: '16px 32px' }}
            >
              <Gift size={20} />
              Quiero mi bono del 75%
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
              La inversión en valores conlleva riesgo de pérdida total o parcial del capital invertido. Los rendimientos pasados no son garantía de rendimientos futuros. Los precios pueden fluctuar significativamente. Antes de invertir, consulta a un asesor financiero independiente sobre la idoneidad del producto para tu perfil.
            </p>
            <p style={styles.disclaimer}>
              La información presentada tiene fines exclusivamente informativos y educativos. No constituye recomendación de inversión ni oferta de compra/venta de valores. Los datos sobre SpaceX provienen de fuentes públicas (prospecto S-1 SEC, Fed-Spend, NASA OIG, SpaceNews, Bloomberg) y pueden cambiar antes del listado oficial.
            </p>
            <p style={styles.disclaimer}>
              La fecha del OPI (12 de junio 2026), precio (${PRECIO_IPO} USD/acción) y términos están sujetos a confirmación final por SpaceX y NASDAQ. Taurus Fx no garantiza la disponibilidad del valor en su plataforma ni resultados específicos de inversión.
            </p>
            <p style={styles.disclaimer}>
              <strong>Sobre el bono del 75%:</strong> Promoción válida del 1 al 12 de junio 2026. Sujeta a apertura y verificación KYC de cuenta. El bono es 100% retirable sin condiciones de volumen. Aplica únicamente al primer depósito. Términos completos disponibles con el asesor asignado.
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

      {/* ============= STICKY BUTTON WHATSAPP ============= */}
      <div className="sticky-whatsapp-bar" style={styles.stickyBar}>
        <div style={styles.urgencyMicrocopy}>
          🟢 Bono del 75% disponible · Asesores activos ahora
        </div>
        <button 
          onClick={() => abrirModal('sticky')} 
          className="sticky-whatsapp-btn"
          style={styles.stickyButton}
        >
          <Gift size={20} />
          <div style={styles.stickyTextBox}>
            <div style={styles.stickyMini}>Promo especial OPI</div>
            <div style={styles.stickyMain}>Obtener bono del 75%</div>
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

function CountdownBlock({ valor, label }) {
  return (
    <div style={styles.countdownBlock}>
      <div style={styles.countdownNumero}>{String(valor).padStart(2, '0')}</div>
      <div style={styles.countdownLabel}>{label}</div>
    </div>
  );
}

function CardProyecto({ emoji, cliente, contrato, descripcion, plazo, destacado }) {
  return (
    <div style={{ ...styles.cardProyecto, ...(destacado ? styles.cardDestacado : {}) }}>
      <div style={styles.proyectoEmoji}>{emoji}</div>
      <div style={styles.proyectoCliente}>{cliente}</div>
      <div style={styles.proyectoMonto}>{contrato}</div>
      <p style={styles.proyectoDescripcion}>{descripcion}</p>
      <div style={styles.proyectoPlazo}>
        <Clock size={11} />
        {plazo}
      </div>
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
      <p style={styles.confianzaTitulo}>{titulo}</p>
      <p style={styles.confianzaValor}>{valor}</p>
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
    <div style={styles.faqItem}>
      <button onClick={() => setAbierto(!abierto)} style={styles.faqBtn}>
        <span style={styles.faqPregunta}>{pregunta}</span>
        <ChevronDown size={20} style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {abierto && <p style={styles.faqRespuesta}>{respuesta}</p>}
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
  contenedor: {
    fontFamily: 'Inter, system-ui, sans-serif',
    background: '#0A1628',
    color: 'white',
    minHeight: '100vh',
    paddingBottom: 100,
  },

  // BANNER SUPERIOR DEL BONO
  bannerBono: {
    background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)',
    padding: '8px 16px',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  bannerBonoInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 1100,
  },
  bannerBonoEmoji: {
    fontSize: 18,
  },
  bannerBonoTexto: {
    fontSize: 'clamp(11px, 2.5vw, 14px)',
    color: 'white',
    fontWeight: 500,
  },
  bannerBonoCta: {
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
    padding: '12px 14px',
    minWidth: 64,
  },
  countdownNumero: {
    fontSize: 'clamp(26px, 6vw, 32px)',
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
    padding: 'clamp(14px, 4vw, 16px) clamp(22px, 5vw, 32px)',
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 'clamp(15px, 4vw, 17px)',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
    fontFamily: 'inherit',
    minHeight: 52,
  },
  ctaIntermedio: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
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
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
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
    color: '#3B82F6',
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
  h2Sub: {
    color: '#94A3B8',
    fontSize: '0.75em',
    fontWeight: 500,
  },
  subtitulo: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: -16,
    marginBottom: 40,
    fontSize: 14,
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

  // PROYECTOS
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
  proyectoEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  proyectoCliente: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#3B82F6',
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
    marginBottom: 16,
  },
  proyectoPlazo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#60A5FA',
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
    marginBottom: 32,
  },
  numeroGrandeBox: {
    textAlign: 'center',
    flex: 1,
    minWidth: 130,
  },
  numeroGrandeValor: {
    fontSize: 'clamp(26px, 5vw, 38px)',
    fontWeight: 800,
    color: '#3B82F6',
    lineHeight: 1,
    marginBottom: 6,
    letterSpacing: '-0.02em',
  },
  numeroGrandeTexto: {
    fontSize: 12,
    color: '#94A3B8',
    maxWidth: 160,
    margin: '0 auto',
    lineHeight: 1.4,
  },
  divisor: {
    width: 1,
    alignSelf: 'stretch',
    background: '#1E293B',
    minHeight: 40,
  },
  citaAutoritativa: {
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderLeft: '3px solid #10B981',
    borderRadius: 8,
    padding: 24,
    maxWidth: 720,
    margin: '0 auto',
  },
  citaTexto: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },
  citaFuente: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },

  // SECCIÓN BONO DESTACADA
  seccionBono: {
    padding: 'clamp(48px, 10vw, 80px) clamp(16px, 5vw, 24px)',
    background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
  },
  bonoDestacado: {
    background: 'linear-gradient(135deg, #1E293B 0%, #0F1F38 100%)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 20,
    padding: 'clamp(32px, 6vw, 56px)',
    textAlign: 'center',
    maxWidth: 800,
    margin: '0 auto',
    boxShadow: '0 20px 60px rgba(245, 158, 11, 0.1)',
  },
  bonoBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
    color: 'white',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.05em',
    marginBottom: 20,
  },
  bonoTitulo: {
    fontSize: 'clamp(28px, 5vw, 44px)',
    fontWeight: 800,
    color: 'white',
    lineHeight: 1.15,
    marginBottom: 16,
    letterSpacing: '-0.02em',
  },
  bonoNumero: {
    background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '1.2em',
  },
  bonoSubtitulo: {
    fontSize: 'clamp(14px, 2.5vw, 17px)',
    color: '#CBD5E1',
    lineHeight: 1.6,
    marginBottom: 32,
    maxWidth: 600,
    margin: '0 auto 32px',
  },
  bonoEjemplo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(8px, 2vw, 16px)',
    padding: 'clamp(16px, 4vw, 24px)',
    background: 'rgba(10, 22, 40, 0.6)',
    borderRadius: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  ejemploColumna: {
    textAlign: 'center',
    minWidth: 80,
  },
  ejemploLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  ejemploValor: {
    fontSize: 'clamp(18px, 4vw, 24px)',
    fontWeight: 800,
    color: 'white',
    fontFamily: 'monospace',
  },
  ejemploSeparador: {
    fontSize: 'clamp(20px, 4vw, 28px)',
    color: '#475569',
    fontWeight: 700,
  },
  botonBonoCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: 'clamp(14px, 4vw, 18px) clamp(28px, 6vw, 40px)',
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    fontSize: 'clamp(15px, 4vw, 18px)',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 32px rgba(245, 158, 11, 0.4)',
    fontFamily: 'inherit',
    minHeight: 56,
    marginBottom: 16,
  },
  bonoDisclaimer: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 1.5,
    maxWidth: 500,
    margin: '0 auto',
  },

  // STATS GENERALES
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: '#0F1F38',
    border: '1px solid #1E293B',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
  },
  statNumero: {
    fontSize: 'clamp(32px, 6vw, 44px)',
    fontWeight: 800,
    color: '#3B82F6',
    lineHeight: 1,
    marginBottom: 8,
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    marginBottom: 4,
  },
  statDetalle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  callout: {
    display: 'flex',
    gap: 12,
    padding: 20,
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    marginTop: 24,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#CBD5E1',
  },

  // PASOS / CARDS GENERALES
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
    border: '1px solid #F59E0B',
    boxShadow: '0 0 32px rgba(245, 158, 11, 0.15)',
  },
  cardNumero: {
    fontSize: 14,
    fontWeight: 700,
    color: '#3B82F6',
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
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#60A5FA',
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

  // TABLA
  tablaContainer: {
    overflowX: 'auto',
    borderRadius: 12,
    border: '1px solid #1E293B',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 500,
  },
  tablaHeader: {
    background: '#0A1628',
  },
  th: {
    padding: 14,
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94A3B8',
    borderBottom: '1px solid #1E293B',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: 14,
    fontSize: 14,
    borderTop: '1px solid #1E293B',
    whiteSpace: 'nowrap',
  },
  fuenteTabla: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    marginTop: 12,
    fontStyle: 'italic',
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
    background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
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
    color: '#F59E0B',
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

  // STICKY WHATSAPP BAR
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
    color: '#F59E0B',
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
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.5)',
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