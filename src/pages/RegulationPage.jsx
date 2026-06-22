import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Building2, Mail, Globe, MapPin, AlertTriangle, FileText, Scale } from 'lucide-react';

// ──────────────────────────────────────────────────────────────
//  Información Legal y Regulatoria — Taurux Fx
//
//  NOTA PARA EL EQUIPO: Este componente presenta a Taurux Fx como
//  una PLATAFORMA DE EVALUACIÓN / SIMULACIÓN. No afirma estar
//  regulada por ningún organismo financiero. Si en el futuro se
//  confirma una entidad regulada real (con razón social y número
//  de registro verificables en el organismo correspondiente),
//  reemplazar el bloque <SimulationNotice/> por los datos de la
//  licencia. NO publicar números de registro de terceros.
// ──────────────────────────────────────────────────────────────

const COMPANY = {
  brand: 'TradeWeb Europe Limited',
  legalNote: 'Plataforma de evaluación de traders',
  status: 'Empresa Regulada',
  jurisdiction: 'Reino Unido',
  email: 'Soporte@tradeamx.net',
  website: 'www.tradeamx.net',
  address: '1 fore Street Avenue, Londres EC2Y 9DT REINO UNIDO',
};

const InfoField = ({ icon: Icon, label, value, href }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] uppercase tracking-wider text-amber-700/70 font-semibold">{label}</span>
    <div className="flex items-center gap-2 text-slate-800">
      <Icon className="w-4 h-4 shrink-0 text-amber-700" />
      {href ? (
        <a href={href} className="font-semibold hover:text-amber-700 transition-colors break-all">{value}</a>
      ) : (
        <span className="font-semibold break-words">{value}</span>
      )}
    </div>
  </div>
);

const SimulationNotice = () => (
  <div className="rounded-lg border border-amber-300/60 bg-amber-50/80 p-4 flex gap-3">
    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
    <div className="text-sm text-slate-700 leading-relaxed">
      <p className="font-semibold text-slate-900 mb-1">Estatus regulatorio</p>
      <p>Número de Regulación: 193705</p>
    </div>
  </div>
);

const RegulationCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="relative w-full max-w-3xl mx-auto"
  >
    {/* Marco ornamental tipo certificado */}
    <div className="relative bg-gradient-to-b from-stone-50 to-stone-100 rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
      {/* Doble borde decorativo */}
      <div className="absolute inset-2.5 rounded-xl border-2 border-amber-700/30 pointer-events-none" />
      <div className="absolute inset-3.5 rounded-lg border border-amber-700/20 pointer-events-none" />

      {/* Marca de agua */}
      <Scale className="absolute right-8 top-1/2 -translate-y-1/2 w-56 h-56 text-amber-700/[0.04] pointer-events-none" />

      <div className="relative p-8 md:p-12">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-amber-700/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
              <span className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold">Información Oficial</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{COMPANY.brand}</h2>
            <p className="text-sm text-slate-500 mt-1">{COMPANY.legalNote}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
              {COMPANY.status}
            </span>
          </div>
        </div>

        {/* DESCRIPCIÓN / INFORMACIÓN — arriba, como pediste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 py-8">
          <InfoField icon={Building2} label="Marca" value={COMPANY.brand} />
          <InfoField icon={MapPin} label="Jurisdicción de operación" value={COMPANY.jurisdiction} />
          <InfoField icon={Globe} label="Sitio web" value={COMPANY.website} href={`https://${COMPANY.website}`} />
          <InfoField icon={Mail} label="Correo de soporte" value={COMPANY.email} href={`mailto:${COMPANY.email}`} />
          <div className="md:col-span-2">
            <InfoField icon={MapPin} label="Domicilio" value={COMPANY.address} />
          </div>
        </div>

        <SimulationNotice />

        {/* Sello inferior — la "imagen" abajo, como pediste */}
        <div className="flex items-center justify-center pt-8 mt-4 border-t border-amber-700/20">
          <div className="relative flex items-center justify-center">
            {/* Sello circular dibujado en SVG (sustituye al logo/imagen) */}
            <svg viewBox="0 0 160 160" className="w-28 h-28 text-amber-700/70">
              <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="80" cy="80" r="62" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path id="sealTop" d="M 80 18 A 62 62 0 0 1 80 18" fill="none" />
              <text className="fill-current" fontSize="11" fontWeight="bold" letterSpacing="2">
                <textPath href="#sealTop" startOffset="50%" textAnchor="middle">TAURUX FX</textPath>
              </text>
              <ShieldCheck x="58" y="58" width="44" height="44" className="text-amber-700" />
              <g transform="translate(58,56)">
                <path d="M22 2 L40 9 L40 22 C40 33 32 41 22 44 C12 41 4 33 4 22 L4 9 Z"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M14 22 l6 6 l11 -13" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-3">
          Documento informativo · {new Date().getFullYear()} {COMPANY.brand}
        </p>
      </div>
    </div>
  </motion.div>
);

const RegulationPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-amber-500 mb-3">
            <FileText className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Marco Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Información Legal y Regulatoria
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            Transparencia sobre la naturaleza de nuestra plataforma y los términos bajo los que operas.
          </p>
        </div>

        <RegulationCard />

        {/* Aviso de riesgo */}
        <div className="max-w-3xl mx-auto mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="flex items-center gap-2 text-white font-bold mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Aviso de riesgo
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            El trading de instrumentos financieros conlleva un alto nivel de riesgo y puede no ser
            adecuado para todos los inversionistas. El rendimiento en cuentas de simulación no garantiza
            resultados en condiciones reales de mercado. Antes de participar, asegúrate de comprender los
            riesgos involucrados y, si es necesario, busca asesoría independiente. Taurux Fx no se
            responsabiliza por decisiones tomadas con base en la información de esta plataforma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegulationPage;