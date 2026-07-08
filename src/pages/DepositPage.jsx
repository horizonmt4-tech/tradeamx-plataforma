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