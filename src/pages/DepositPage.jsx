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

// ─── Países disponibles ──────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "MX", name: "México",   flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Perú",     flag: "🇵🇪" },
  { code: "CL", name: "Chile",    flag: "🇨🇱" },
];

// ─── Métodos por país ────────────────────────────────────────────────────────
const PAYMENT_METHODS = {
  MX: [
    { id: "efectivo", label: "Efectivo",       icon: Banknote,   color: "from-green-600 to-emerald-700", desc: "NU, OXXO, BBVA, 3B, Farmacias, Bodega" },
    { id: "spei",     label: "SPEI",           icon: Building2,  color: "from-blue-600 to-indigo-700",   desc: "Transferencia bancaria — validación 1-2 h" },
    { id: "card",     label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto",   label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Ethereum Network — Bitso" },
  ],
  CO: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Ethereum Network" },
  ],
  PE: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Ethereum Network" },
  ],
  CL: [
    { id: "card",   label: "Tarjeta",        icon: CreditCard, color: "from-violet-600 to-purple-700", desc: "Visa / Mastercard via Stripe" },
    { id: "crypto", label: "Cripto (USDT)",  icon: Bitcoin,    color: "from-orange-500 to-yellow-600", desc: "Ethereum Network" },
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
  network: "Ethereum (ERC-20)",
  currency: "USDT — Tether USD",
  address: "0x49F3bCf9495740B4ca5630b03E6196E3589a9579",
  warning: "Solo debes enviar USDT. Si depositas otra cripto puedes perder los fondos.",
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

const WA_NUMBER = "5215512345678";

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
                <DataCard label="Red" value={CRYPTO_DATA.network} />
                <DataCard label="Moneda" value={CRYPTO_DATA.currency} />
                <DataCard label="Dirección de wallet" value={CRYPTO_DATA.address}
                  onCopy={() => copyText("crypto_addr", CRYPTO_DATA.address)}
                  copied={copiedKey === "crypto_addr"} mono />
                <WAButton text="Hola, acabo de realizar un depósito en USDT (Cripto)" />
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