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
                    src="data:image/jpeg;base64,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"
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