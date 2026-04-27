import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useLocalization } from "@/contexts/LocalizationContext";
import { cn } from "@/lib/utils";
import PaymentMethodCard from "@/components/dashboard/PaymentMethodCard";
import StripeCardDeposit from "@/components/dashboard/StripeCardDeposit";
import {
  User, MapPin, CreditCard, ChevronRight, ChevronLeft,
  Check, Copy, Bitcoin, Banknote, Globe, Phone,
  UploadCloud, Loader2, CheckCircle, ArrowLeft,
  Building2, TrendingUp,
} from "lucide-react";


const COUNTRIES = [
  { code: "MX", name: "México",   flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Perú",     flag: "🇵🇪" },
  { code: "CL", name: "Chile",    flag: "🇨🇱" },
  { code: "OT", name: "Otros",    flag: "🌍" },
];

// ─── Métodos por país ────────────────────────────────────────────────────────
const PAYMENT_METHODS = {
  MX: [
    { id: "efectivo", label: "Efectivo",       icon: Banknote,   color: "from-green-600 to-emerald-700", desc: "NU, OXXO, BBVA, 3B, Farmacias, Bodega" },
    { id: "spei",     label: "SPEI",           icon: Building2,  color: "from-blue-600 to-indigo-700",   desc: "Transferencia bancaria — validación 1-2 h" },
    { id: "card",     label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto",   label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Red Tron TRC-20 — Bitso" },
  ],
  CO: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Red Tron TRC-20" },
  ],
  PE: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Red Tron TRC-20" },
  ],
  CL: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Red Tron TRC-20" },
  ],
  OT: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Red Tron TRC-20" },
  ],
};

// ─── Opciones de efectivo México ─────────────────────────────────────────────
const EFECTIVO_OPTIONS = [
  {
    id: "nu", name: "NU (Telecomm / Financiera Bienestar)", icon: "🟣",
    color: "border-purple-500/30 bg-purple-500/5",
    fields: [{ label: "Número de cuenta", value: "5101-2530-7388-0509" }],
    steps: [
      "Acude a tu sucursal Telecomm (Financiera Bienestar) más cercana.",
      "Indica que deseas realizar un depósito a cuenta NU.",
      "Proporciona el número de cuenta al cajero.",
      "Conserva tu ticket como comprobante.",
    ],
    commission: "Comisión hasta $15 MXN",
  },
  {
    id: "oxxo", name: "OXXO / Spin by OXXO", icon: "🔴",
    color: "border-red-500/30 bg-red-500/5",
    fields: [{ label: "Cuenta SPIN", value: "2242-1701-8061-3314" }],
    steps: [
      "Acude a tu tienda OXXO más cercana.",
      "Indica que deseas realizar un depósito a cuenta Spin.",
      "Proporciona el número de cuenta al cajero.",
      "Conserva tu ticket como comprobante.",
    ],
    commission: "Comisión hasta $12 MXN",
  },
  {
    id: "3b", name: "Tienda 3B / Tapi Pay", icon: "🔵",
    color: "border-blue-500/30 bg-blue-500/5",
    fields: [{ label: "Código de referencia", value: "AP0010054329828541990842181 10949" }],
    steps: [
      "Acude a tu tienda 3B más cercana.",
      "Indica que deseas realizar un depósito a Tapi Pay.",
      "Muestra el código de barras o dicta la referencia al cajero.",
      "Conserva tu ticket como comprobante.",
    ],
    commission: "Comisión hasta $10 MXN",
  },
  {
    id: "bbva", name: "BBVA Practicaja", icon: "🔷",
    color: "border-sky-500/30 bg-sky-500/5",
    fields: [
      { label: "Número de convenio", value: "2209942" },
      { label: "Código de referencia", value: "000012500211" },
    ],
    steps: [
      "Acude a tu sucursal BBVA más cercana.",
      "Acércate a la Practicaja.",
      "Elige la opción Pagar → Servicios → Pagar con efectivo.",
      "Ingresa el número de convenio y el código de referencia.",
      "Guarda tu ticket y envíalo por WhatsApp.",
    ],
    commission: "Sin comisión adicional",
  },
  {
    id: "ahorro", name: "Farmacias del Ahorro / PESPay", icon: "🟢",
    color: "border-green-500/30 bg-green-500/5",
    fields: [{ label: "No. de referencia PESPay", value: "10036314159269002843" }],
    steps: [
      "Acude a la sucursal de Farmacias del Ahorro.",
      "Dile al cajero que quieres realizar un Pago de servicio PESPay.",
      "Muestra el código de barras o dicta la referencia de 20 dígitos.",
      "Paga el monto en efectivo más la comisión de $10 MXN.",
      "Guarda tu recibo.",
    ],
    commission: "Comisión hasta $10 MXN",
  },
  {
    id: "aurrera", name: "Bodega Aurrera / Arcuspay", icon: "🟡",
    color: "border-yellow-500/30 bg-yellow-500/5",
    fields: [{ label: "Código Arcuspay", value: "AP0010054329828541990842181 10949" }],
    steps: [
      "Acude a tu Bodega Aurrera más cercana.",
      "Indica que deseas realizar un depósito a Arcuspay.",
      "Muestra el código QR o dicta el código al cajero.",
      "Conserva tu ticket como comprobante.",
    ],
    commission: "Comisión hasta $10 MXN",
  },
];

// ─── Datos cripto y WU ───────────────────────────────────────────────────────
const CRYPTO_DATA = {
  network:  "Red Tron (TRC-20)",
  currency: "USDT — Tether USD",
  address:  "TAvVKPFmyKiBkpFfpJKt4jXHRL7aKmmmMbY",
  warning:  "Solo debes enviar USDT. Si depositas otra cripto puedes perder los fondos.",
};

const WU_DATA = {
  beneficiary: "DEMIAN ASDRUBAL MENDOZA GONZALEZ",
  id: "2560201581",
  country: "México",
  city: "CDMX",
  steps: [
    "Acude a tu Western Union más cercano.",
    "Indica que deseas hacer un Giro internacional con concepto de pago de servicios.",
    "Llena el formato con los datos del beneficiario.",
    "Guarda tu comprobante y envíalo por WhatsApp.",
  ],
};

const WA_NUMBER = "5215574435022";

// ─── Animaciones ─────────────────────────────────────────────────────────────
const pv = { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -28 } };
const pt = { type: "tween", ease: "easeInOut", duration: 0.25 };

// ─── Sub-componentes UI ──────────────────────────────────────────────────────
const KYCHeader = ({ step, title, subtitle, icon: Icon }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Paso {step} de 2</span>
    </div>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
  </div>
);

const StepDots = ({ current, total }) => (
  <div className="flex justify-center gap-2 mt-6">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={cn(
        "h-1.5 rounded-full transition-all duration-300",
        i + 1 === current ? "w-6 bg-cyan-400" : i + 1 < current ? "w-3 bg-cyan-400/60" : "w-3 bg-slate-600"
      )} />
    ))}
  </div>
);

const BackHeader = ({ onBack, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <button onClick={onBack} className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
      <ChevronLeft className="w-5 h-5 text-white" />
    </button>
    <div>
      <h1 className="text-lg font-bold text-white">{title}</h1>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

const DataCard = ({ label, value, onCopy, copied, mono }) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <div className="flex items-center justify-between gap-3">
      <p className={cn("text-white font-semibold text-sm break-all flex-1", mono && "font-mono text-xs leading-relaxed")}>{value}</p>
      {onCopy && (
        <button onClick={onCopy} className="shrink-0 w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
        </button>
      )}
    </div>
  </div>
);

const WAButton = ({ text }) => (
  <a
    href={"https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text)}
    target="_blank" rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors text-sm"
  >
    <Phone className="w-4 h-4" />
    Enviar comprobante por WhatsApp
  </a>
);

const ExchangeRateBadge = ({ amount, currency, rate, formatPrice }) => {
  if (!amount || parseFloat(amount) < 1 || !rate || currency === "USD") return null;
  return (
    <div className="flex items-center justify-between bg-blue-900/40 border border-blue-700/50 rounded-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-blue-300">
        <TrendingUp className="w-4 h-4" />
        <span className="font-medium">Tipo de cambio</span>
      </div>
      <div className="text-right">
        <span className="text-white font-semibold">${parseFloat(amount).toFixed(2)} USD</span>
        <span className="text-gray-400 mx-2">≈</span>
        <span className="text-green-400 font-bold">{formatPrice(parseFloat(amount))} {currency}</span>
        <div className="text-xs text-gray-500 mt-0.5">1 USD = {rate.toFixed(2)} {currency}</div>
      </div>
    </div>
  );
};

// Formulario de subir comprobante reutilizable
const ProofUploadSection = ({
  amount, setAmount, currency, rate, formatPrice,
  file, fileName, fileInputRef, onFileChange, onSubmit, uploading,
  showAmount = true, label = "Confirmar depósito",
}) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
    {showAmount && (
      <>
        <div>
          <Label className="text-xs text-gray-400 mb-1 block">Monto depositado (USD)</Label>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="number" min="10" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="10.00" className="pl-9 bg-slate-900 border-slate-600 text-white h-10" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">USD</span>
          </div>
        </div>
        {parseFloat(amount) >= 10 && (
          <ExchangeRateBadge amount={amount} currency={currency} rate={rate} formatPrice={formatPrice} />
        )}
      </>
    )}
    <div>
      <Label className="text-xs text-gray-400 mb-1 block">Comprobante de pago</Label>
      <div
        className="relative flex items-center justify-center w-full h-24 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-900 hover:bg-slate-800 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} accept="image/*,.pdf" />
        {fileName
          ? <p className="text-green-400 font-medium text-sm px-4 text-center">{fileName}</p>
          : <div className="text-center text-gray-400">
              <UploadCloud className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs">Haz clic para subir (PNG, JPG, PDF)</p>
            </div>
        }
      </div>
    </div>
    <Button
      onClick={onSubmit}
      disabled={uploading || !file || parseFloat(amount) < 10}
      className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
    >
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar depósito enviado"}
    </Button>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
const DepositPage = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { currency, rate, setCountry: setLocCountry, loading: locLoading, formatPrice } = useLocalization();

  // screens: kyc_step1 | kyc_step2 | methods | efectivo_list | efectivo_detail
  //          | spei | card | crypto | wu | success
  const [screen, setScreen] = useState("kyc_step1");
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  const [form, setForm] = useState({
    full_name: "", phone_number: "", date_of_birth: "", country: "", nationality: "",
  });

  const [selectedEfectivo, setSelectedEfectivo] = useState(null);
  const [copiedKey, setCopiedKey]     = useState(null);
  const [file, setFile]               = useState(null);
  const [fileName, setFileName]       = useState("");
  const [uploading, setUploading]     = useState(false);
  const [depositAmount, setDepositAmount] = useState("10");

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setForm(p => ({ ...p, full_name: user.full_name || "", phone_number: user.phone_number || "" }));
    if (user.kyc_completed && user.country) {
      setLocCountry(user.country);
      setScreen("methods");
    } else if (user.kyc_step === 1) {
      setScreen("kyc_step2");
    } else {
      setScreen("kyc_step1");
    }
  }, [user]); // eslint-disable-line

  useEffect(() => {
    supabase.from("bank_details").select("*").limit(1).single()
      .then(({ data, error }) => { if (!error && data) setBankDetails(data); });
  }, []);

  const userCountry = form.country || user?.country || "";

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: "Copiado al portapapeles" });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setFileName(f.name); }
  };

  const resetProof = () => { setFile(null); setFileName(""); };

  // ── KYC ──────────────────────────────────────────────────────────────────
  const saveStep1 = async () => {
    if (!form.full_name || !form.phone_number) {
      toast({ title: "Completa todos los campos", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ full_name: form.full_name, phone_number: form.phone_number, kyc_step: 1 })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (refreshUser) await refreshUser();
    setScreen("kyc_step2");
  };

  const saveStep2 = async () => {
    if (!form.country || !form.date_of_birth) {
      toast({ title: "Selecciona tu país y fecha de nacimiento", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ country: form.country, date_of_birth: form.date_of_birth, nationality: form.nationality, kyc_step: 2, kyc_completed: true })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (refreshUser) await refreshUser();
    setLocCountry(form.country);
    setScreen("methods");
  };

  // ── Submit comprobante ────────────────────────────────────────────────────
  const handleProofSubmit = async (method) => {
    if (!file) { toast({ title: "Falta el comprobante", variant: "destructive" }); return; }
    if (parseFloat(depositAmount) < 10) { toast({ title: "Monto mínimo $10 USD", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);
      await supabase.functions.invoke("send-deposit-notification", {
        body: {
          userEmail: user.email,
          amount: parseFloat(depositAmount).toFixed(2),
          proofUrl: publicUrl,
          currency: "USD",
          method: method?.toUpperCase() || "DEPÓSITO",
        },
      });
      resetProof();
      setScreen("success");
    } catch (err) {
      toast({ title: "Error al enviar", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleStripeSuccess = () => {
    toast({ title: "¡Depósito exitoso!", description: "Tu balance ha sido actualizado." });
    setScreen("success");
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 flex items-start justify-center pt-6 pb-16 px-4">
      <div className="w-full max-w-lg">

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>

        <AnimatePresence mode="wait">

          {/* ══ KYC PASO 1 ══ */}
          {screen === "kyc_step1" && (
            <motion.div key="step1" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <KYCHeader step={1} title="Información personal" subtitle="Cuéntanos un poco sobre ti para continuar" icon={User} />
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <div>
                  <Label className="text-xs text-gray-400 mb-1.5 block">Nombre completo</Label>
                  <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Ej: Juan García López" className="bg-slate-900 border-slate-600 text-white h-11" />
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1.5 block">Número de teléfono</Label>
                  <Input value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="+52 55 1234 5678" type="tel" className="bg-slate-900 border-slate-600 text-white h-11" />
                </div>
                <Button onClick={saveStep1} disabled={saving} className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continuar</span><ChevronRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </div>
              <StepDots current={1} total={2} />
            </motion.div>
          )}

          {/* ══ KYC PASO 2 ══ */}
          {screen === "kyc_step2" && (
            <motion.div key="step2" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <KYCHeader step={2} title="Tu ubicación" subtitle="Selecciona tu país para ver los métodos de pago disponibles" icon={MapPin} />
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">Selecciona tu país</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {COUNTRIES.map(c => (
                      <button key={c.code} onClick={() => setForm(p => ({ ...p, country: c.code, nationality: c.name }))}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                          form.country === c.code
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-600 bg-slate-900/50 text-gray-300 hover:border-slate-500"
                        )}>
                        <span className="text-2xl">{c.flag}</span>
                        <span className="text-sm font-medium">{c.name}</span>
                        {form.country === c.code && <Check className="w-3.5 h-3.5 ml-auto text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1.5 block">Fecha de nacimiento</Label>
                  <Input type="date" value={form.date_of_birth}
                    onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white h-11" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setScreen("kyc_step1")} className="border-slate-600 text-gray-300 h-12 px-4">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button onClick={saveStep2} disabled={saving || !form.country || !form.date_of_birth}
                    className="flex-1 h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Ver métodos de pago</span><ChevronRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </div>
              </div>
              <StepDots current={2} total={2} />
            </motion.div>
          )}

          {/* ══ MÉTODOS DE PAGO ══ */}
          {screen === "methods" && (
            <motion.div key="methods" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{COUNTRIES.find(c => c.code === userCountry)?.flag}</span>
                  <h1 className="text-xl font-bold text-white">Métodos de depósito</h1>
                </div>
                <p className="text-gray-400 text-sm">
                  {COUNTRIES.find(c => c.code === userCountry)?.name} — Selecciona cómo quieres depositar
                </p>
              </div>
              <div className="space-y-3">
                {(PAYMENT_METHODS[userCountry] || []).map(method => {
                  const Icon = method.icon;
                  return (
                    <button key={method.id}
                      onClick={() => {
                        resetProof();
                        if (method.id === "efectivo") setScreen("efectivo_list");
                        else if (method.id === "spei")   setScreen("spei");
                        else if (method.id === "card")   setScreen("card");
                        else if (method.id === "crypto") setScreen("crypto");
                        else if (method.id === "wu")     setScreen("wu");
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 transition-all group text-left">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{method.label}</p>
                        <p className="text-xs text-gray-400">{method.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setScreen("kyc_step2")} className="mt-6 w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
                ¿Cambiar país? Actualizar información
              </button>
            </motion.div>
          )}

          {/* ══ EFECTIVO — LISTA ══ */}
          {screen === "efectivo_list" && (
            <motion.div key="efectivo_list" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <BackHeader onBack={() => setScreen("methods")} title="Depósito en Efectivo" subtitle="Elige tu opción preferida" />
              <div className="space-y-2">
                {EFECTIVO_OPTIONS.map(opt => (
                  <button key={opt.id}
                    onClick={() => { setSelectedEfectivo(opt); resetProof(); setScreen("efectivo_detail"); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left hover:border-slate-400 hover:bg-slate-800 ${opt.color}`}>
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{opt.name}</p>
                      <p className="text-[11px] text-gray-400">{opt.commission}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ EFECTIVO — DETALLE ══ */}
          {screen === "efectivo_detail" && selectedEfectivo && (
            <motion.div key="efectivo_detail" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <BackHeader onBack={() => setScreen("efectivo_list")} title={selectedEfectivo.name} subtitle={selectedEfectivo.commission} />
              <div className="space-y-4">

                {selectedEfectivo.fields.map((field, i) => (
                  <DataCard key={i} label={field.label} value={field.value}
                    onCopy={() => copyText(selectedEfectivo.id + i, field.value)}
                    copied={copiedKey === selectedEfectivo.id + i} mono />
                ))}

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Instrucciones</p>
                  <ol className="space-y-2">
                    {selectedEfectivo.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <ProofUploadSection
                  amount={depositAmount} setAmount={setDepositAmount}
                  currency={currency} rate={rate} formatPrice={formatPrice}
                  file={file} fileName={fileName}
                  fileInputRef={fileInputRef} onFileChange={handleFileChange}
                  onSubmit={() => handleProofSubmit(selectedEfectivo.name)}
                  uploading={uploading}
                />

                <WAButton text={`Hola, acabo de realizar un depósito en ${selectedEfectivo.name}`} />
              </div>
            </motion.div>
          )}

          {/* ══ SPEI ══ */}
          {screen === "spei" && (
            <motion.div key="spei" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <BackHeader onBack={() => setScreen("methods")} title="Transferencia SPEI" subtitle="Validación en 1-2 horas hábiles" />
              <div className="space-y-4">

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monto a depositar</p>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="number" min="10" value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="10.00" className="pl-9 bg-slate-900 border-slate-600 text-white h-11" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">USD</span>
                  </div>
                  {parseFloat(depositAmount) >= 10 && !locLoading && (
                    <ExchangeRateBadge amount={depositAmount} currency={currency} rate={rate} formatPrice={formatPrice} />
                  )}
                </div>

                {bankDetails ? (
                  <PaymentMethodCard
                    bankDetails={bankDetails}
                    reference={user?.id.slice(0, 8) || "N/A"}
                    amount={parseFloat(depositAmount)}
                    currency={currency}
                    formatPrice={formatPrice}
                  />
                ) : (
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 text-center">
                    <Building2 className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
                    <p className="text-gray-400 text-sm mt-2">Cargando datos bancarios...</p>
                  </div>
                )}

                <ProofUploadSection
                  amount={depositAmount} setAmount={setDepositAmount}
                  currency={currency} rate={rate} formatPrice={formatPrice}
                  file={file} fileName={fileName}
                  fileInputRef={fileInputRef} onFileChange={handleFileChange}
                  onSubmit={() => handleProofSubmit("SPEI")}
                  uploading={uploading}
                  showAmount={false}
                  label="Ya realicé la transferencia"
                />

                <WAButton text="Hola, acabo de realizar una transferencia SPEI" />
              </div>
            </motion.div>
          )}

          {/* ══ TARJETA — STRIPE ══ */}
          {screen === "card" && (
            <motion.div key="card" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <BackHeader onBack={() => setScreen("methods")} title="Pago con Tarjeta" subtitle="Visa / Mastercard — Procesado por Stripe" />
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <div>
                  <Label className="text-xs text-gray-400 mb-1.5 block">Monto a depositar (USD)</Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="number" min="10" value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="10.00" className="pl-9 bg-slate-900 border-slate-600 text-white h-11" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">USD</span>
                  </div>
                </div>
                {parseFloat(depositAmount) >= 10 && !locLoading && (
                  <ExchangeRateBadge amount={depositAmount} currency={currency} rate={rate} formatPrice={formatPrice} />
                )}
                <StripeCardDeposit initialAmount={depositAmount} onSuccess={handleStripeSuccess} />
              </div>
            </motion.div>
          )}

          {/* ══ CRIPTO ══ */}
          {screen === "crypto" && (
            <motion.div key="crypto" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <BackHeader onBack={() => setScreen("methods")} title="Depósito en Cripto" subtitle="USDT — Tether USD" />
              <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-300">
                  ⚠️ {CRYPTO_DATA.warning}
                </div>

                {/* QR CODE — imagen oficial USDT TRC-20 */}
                <div className="flex flex-col items-center bg-white rounded-2xl p-5 gap-3">
                  <img
                    src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAIsAicDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9UqWkpaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo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"
                    alt="QR USDT TRC-20"
                    className="w-48 h-48 object-contain"
                  />
                  <p className="text-xs text-slate-500 font-medium">Escanea para copiar la dirección</p>
                </div>

                <DataCard label="Red" value={CRYPTO_DATA.network} />
                <DataCard label="Moneda" value={CRYPTO_DATA.currency} />
                <DataCard label="Dirección de wallet" value={CRYPTO_DATA.address}
                  onCopy={() => copyText("crypto_addr", CRYPTO_DATA.address)}
                  copied={copiedKey === "crypto_addr"} mono />

                <ProofUploadSection
                  amount={depositAmount} setAmount={setDepositAmount}
                  currency={currency} rate={rate} formatPrice={formatPrice}
                  file={file} fileName={fileName}
                  fileInputRef={fileInputRef} onFileChange={handleFileChange}
                  onSubmit={() => handleProofSubmit("USDT Cripto")}
                  uploading={uploading}
                  label="Ya realicé el depósito en cripto"
                />

                <WAButton text="Hola, acabo de realizar un depósito en USDT (Red Tron TRC-20)" />
              </div>
            </motion.div>
          )}

          {/* ══ WESTERN UNION ══ */}
          {screen === "wu" && (
            <motion.div key="wu" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <BackHeader onBack={() => setScreen("methods")} title="Western Union" subtitle="Giro internacional" />
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 space-y-3">
                  <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Datos del beneficiario</p>
                  {[
                    { label: "Nombre / Beneficiario", value: WU_DATA.beneficiary },
                    { label: "ID",                    value: WU_DATA.id },
                    { label: "País",                  value: WU_DATA.country },
                    { label: "Ciudad",                value: WU_DATA.city },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0">{item.label}</span>
                      <span className="text-sm font-semibold text-white text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Instrucciones</p>
                  <ol className="space-y-2">
                    {WU_DATA.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <WAButton text="Hola, realicé un envío por Western Union para depósito" />
              </div>
            </motion.div>
          )}

          {/* ══ SUCCESS ══ */}
          {screen === "success" && (
            <motion.div key="success" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h1 className="text-2xl font-bold text-white">¡Depósito Recibido!</h1>
                <p className="text-gray-400">
                  Hemos recibido tu solicitud correctamente.
                  Tu depósito será procesado en 1-2 horas hábiles.
                </p>
                <Button onClick={() => navigate("/dashboard")} className="w-full h-12 bg-green-600 hover:bg-green-500 font-semibold">
                  Volver al Dashboard
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default DepositPage;