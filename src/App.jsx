import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ProductsPage from '@/pages/ProductsPage';
import TradingPage from '@/pages/TradingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import CheckEmailPage from '@/pages/CheckEmailPage';
import EmailConfirmationPage from '@/pages/EmailConfirmationPage';
import DashboardPage from '@/pages/DashboardPage';
import DepositPage from '@/pages/DepositPage';
import WithdrawPage from '@/pages/WithdrawPage';
import WithdrawalsPage from '@/pages/WithdrawalsPage';
import AdminPage from '@/pages/AdminPage';
import SuperAdminDashboardPage from '@/pages/admin/SuperAdminDashboardPage';
import SuperAdminProfilePage from '@/pages/admin/SuperAdminProfilePage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import LegalPage from '@/pages/LegalPage';
import CookiesPage from '@/pages/CookiesPage';
import RiskDisclosurePage from '@/pages/RiskDisclosurePage';
import AMLKYCPage from '@/pages/AMLKYCPage';
import PlansPage from '@/pages/PlansPage';
import CheckoutPage from '@/pages/CheckoutPage';
import PlanSelectionPage from '@/pages/PlanSelectionPage';
import AdminUserTradesPage from '@/pages/admin/AdminUserTradesPage';
import AdminEditUserTradesPage from '@/pages/admin/AdminEditUserTradesPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import SupportPage from '@/pages/SupportPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import DepositSuccessPage from '@/pages/DepositSuccessPage';
import DepositCancelPage from '@/pages/DepositCancelPage';
import CalendarPage from '@/pages/CalendarPage';
import AnalysisPage from '@/pages/AnalysisPage';
import NewsPage from '@/pages/NewsPage';
import MineralesLanding from '@/pages/MineralesLanding';

// Nuevas páginas multi-oficina
import VentasPage from '@/pages/ventas/VentasPage';
import ManagerDashboardPage from '@/pages/admin/ManagerDashboardPage';

// Admin Settings Pages
import PlanSettingsPage from '@/pages/admin/PlanSettingsPage';
import AssetSettingsPage from '@/pages/admin/AssetSettingsPage';
import BankDetailsPage from '@/pages/admin/BankDetailsPage';
import ExchangeRateSettingsPage from '@/pages/admin/ExchangeRateSettingsPage';
import RegulationSettingsPage from '@/pages/admin/RegulationSettingsPage';
import AdminWithdrawalsPage from '@/pages/admin/AdminWithdrawalsPage';
import RecoveryPanelPage from '@/pages/admin/RecoveryPanelPage';
import PaymentRecoveryPage from '@/pages/admin/PaymentRecoveryPage';
import StripeWebhookStatusPage from '@/pages/admin/StripeWebhookStatusPage';
import TamxTokensPage from '@/pages/admin/TamxTokensPage';

// Components & Layout
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import SuperAdminRoute from '@/components/SuperAdminRoute';
import VentasRoute from '@/components/VentasRoute';
import GlobalHeader from '@/components/GlobalHeader';
import { Toaster } from '@/components/ui/toaster';
import UpdateNotification from '@/components/UpdateNotification';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { AssetProvider } from '@/contexts/AssetContext';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { SuperAdminAuthProvider } from '@/contexts/SuperAdminAuthContext';

// Hooks
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { Analytics } from '@vercel/analytics/react';

const HeaderWrapper = () => {
  const { user, profile, loading, signOut } = useSupabaseAuth();

  // FIX BUG B: antes NUNCA se le pasaba `openTrades` a <GlobalHeader />, así que
  // ahí siempre caía en el default `openTrades = []` — por eso Margen mostraba
  // $0.00 y Nv. Margen ∞ sin importar cuántas operaciones abiertas hubiera.
  // Aquí se hace el mismo patrón de fetch + suscripción realtime que ya usa
  // DashboardPage, pero filtrando solo trades con status OPEN.
  const [openTrades, setOpenTrades] = useState([]);

  useEffect(() => {
    if (!user?.id) { setOpenTrades([]); return; }
    if (user.email === 'demo@tradea.com') { setOpenTrades([]); return; }

    const fetchOpenTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'OPEN');
        if (error) throw error;
        setOpenTrades(data || []);
      } catch (err) {
        console.error('Error fetching open trades (header):', err);
        setOpenTrades([]);
      }
    };

    fetchOpenTrades();

    const ch = supabase
      .channel(`header:trades:${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` },
        fetchOpenTrades)
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [user?.id, user?.email]);

  return (
    <GlobalHeader
      user={user}
      profile={profile}
      loading={loading}
      signOut={signOut}
      openTrades={openTrades}
    />
  );
};

function AppContent() {
  const { isUpdateAvailable } = useAutoUpdate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Helmet>
        <title>TradeAMX - The Future of Trading</title>
        <meta name="description" content="TradeAMX is a cutting-edge proprietary trading firm offering funded accounts for skilled traders." />
      </Helmet>

      <UpdateNotification isUpdateAvailable={isUpdateAvailable} />

      <Routes>
        {/* ── Landings sin header (rutas independientes) ── */}
        <Route path="/MineralesLanding" element={<MineralesLanding />} />

        {/* ── Todo lo demás: con header ── */}
        <Route path="*" element={
          <>
            <HeaderWrapper />
            <main className="flex-grow pt-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<SignUpPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/trading" element={<TradingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/check-email" element={<CheckEmailPage />} />
                <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/risk" element={<RiskDisclosurePage />} />
                <Route path="/aml-kyc" element={<AMLKYCPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/news" element={<NewsPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
                <Route path="/deposit/success" element={<ProtectedRoute><DepositSuccessPage /></ProtectedRoute>} />
                <Route path="/deposit/cancel" element={<ProtectedRoute><DepositCancelPage /></ProtectedRoute>} />
                <Route path="/withdraw" element={<ProtectedRoute><WithdrawPage /></ProtectedRoute>} />
                <Route path="/withdrawals" element={<ProtectedRoute><WithdrawalsPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/plan-selection" element={<ProtectedRoute><PlanSelectionPage /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

                {/* Ventas */}
                <Route path="/ventas" element={<VentasRoute><VentasPage /></VentasRoute>} />

                {/* Retención */}
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                <Route path="/admin/user/:userId/trades" element={<AdminRoute><AdminUserTradesPage /></AdminRoute>} />
                <Route path="/admin/user/:userId/trades/edit" element={<AdminRoute><AdminEditUserTradesPage /></AdminRoute>} />
                <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawalsPage /></AdminRoute>} />
                <Route path="/admin/payment-recovery" element={<ProtectedRoute><AdminRoute><PaymentRecoveryPage /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/stripe-webhook-status" element={<ProtectedRoute><AdminRoute><StripeWebhookStatusPage /></AdminRoute></ProtectedRoute>} />

                {/* Manager */}
                <Route path="/manager"         element={<SuperAdminRoute><ManagerDashboardPage /></SuperAdminRoute>} />
                <Route path="/admin/dashboard" element={<SuperAdminRoute><ManagerDashboardPage /></SuperAdminRoute>} />
                <Route path="/super-admin"     element={<SuperAdminRoute><ManagerDashboardPage /></SuperAdminRoute>} />
                <Route path="/admin/profile"   element={<SuperAdminRoute><SuperAdminProfilePage /></SuperAdminRoute>} />
                <Route path="/admin/plan-settings"        element={<SuperAdminRoute><PlanSettingsPage /></SuperAdminRoute>} />
                <Route path="/admin/asset-settings"       element={<SuperAdminRoute><AssetSettingsPage /></SuperAdminRoute>} />
                <Route path="/admin/bank-details"         element={<SuperAdminRoute><BankDetailsPage /></SuperAdminRoute>} />
                <Route path="/admin/exchange-rate"        element={<SuperAdminRoute><ExchangeRateSettingsPage /></SuperAdminRoute>} />
                <Route path="/admin/regulation"           element={<SuperAdminRoute><RegulationSettingsPage /></SuperAdminRoute>} />
                <Route path="/admin/recovery"             element={<SuperAdminRoute><RecoveryPanelPage /></SuperAdminRoute>} />
                <Route path="/admin/tamx-tokens"          element={<SuperAdminRoute><TamxTokensPage /></SuperAdminRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        } />
      </Routes>

      <Toaster />
      <Analytics />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LocalizationProvider>
        <AuthProvider>
          <AssetProvider>
            <SupabaseAuthProvider>
              <AdminAuthProvider>
                <SuperAdminAuthProvider>
                  <AppContent />
                </SuperAdminAuthProvider>
              </AdminAuthProvider>
            </SupabaseAuthProvider>
          </AssetProvider>
        </AuthProvider>
      </LocalizationProvider>
    </Router>
  );
}

export default App;