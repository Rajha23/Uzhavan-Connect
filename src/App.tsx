import React from 'react';
import { useApp } from './context/AppContext';
import { UserRole } from './types';

// Layout components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Global modals (always mounted regardless of shell)
import { ProducePassportModal } from './components/ProducePassportModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { LanguageOnboardingModal } from './components/LanguageOnboardingModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';

// Public pages (no sidebar)
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './pages/AccessDenied';

// Authenticated pages
import { FarmerDashboard } from './pages/FarmerDashboard';
import { FindBuyersPage } from './pages/FindBuyersPage';

import { BuyerDashboard } from './pages/BuyerDashboard';
import { BulkBuyerDashboard } from './pages/BulkBuyerDashboard';
import { DemandPoolPage } from './pages/DemandPoolPage';
import { ReverseAuctionPage } from './pages/ReverseAuctionPage';
import { DemandIntelligencePage } from './pages/DemandIntelligencePage';

import { AdminDashboard } from './pages/AdminDashboard';
import { FpoDashboard } from './pages/FpoDashboard';
import { LogisticsDashboard } from './pages/LogisticsDashboard';

import { SettlementPage } from './pages/SettlementPage';
import { ImpactKPIPage } from './pages/ImpactKPIPage';
import { ProfilePage } from './pages/ProfilePage';

// New pages
import { TraceabilityPage } from './pages/TraceabilityPage';
import { OrdersPage } from './pages/OrdersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SchemesPage } from "./pages/SchemesPage";
import { NewsPage } from './pages/NewsPage';
import { SubsidyPage } from './pages/SubsidyPage';
import { SupportPage } from './pages/SupportPage';

// Inline components for simple stubs
import { MiddlemanSimulator } from './components/MiddlemanSimulator';
import { RouteOptimizationMap } from './components/RouteOptimizationMap';
import { SmartMatchingEngine } from './components/SmartMatchingEngine';
import { DocumentManagerModal } from './components/DocumentManagerModal';

// ─── Public and Role-Guarded Route Definitions ──────────────────────────────

const PUBLIC_TABS = ['home', 'landing', 'login', 'register', 'traceability', 'tracking', 'support'];

// Role definitions for protected features
const FARMER_ALLOWED_ROLES: UserRole[] = ['FARMER', 'FPO_AGGREGATOR', 'ADMIN'];
const BUYER_ALLOWED_ROLES: UserRole[] = ['RETAIL_BUYER', 'BULK_BUYER', 'ADMIN'];
const BULK_BUYER_ALLOWED_ROLES: UserRole[] = ['BULK_BUYER', 'ADMIN'];
const MATCHING_ALLOWED_ROLES: UserRole[] = ['RETAIL_BUYER', 'BULK_BUYER', 'FPO_AGGREGATOR', 'ADMIN'];
const LOGISTICS_ALLOWED_ROLES: UserRole[] = ['LOGISTICS', 'ADMIN'];
const REPORTS_ALLOWED_ROLES: UserRole[] = ['ADMIN', 'FPO_AGGREGATOR'];

// ─── Page Renderer ──────────────────────────────────────────────────────────

const PageContent: React.FC = () => {
  const { activeTab, currentRole, isAuthenticated, attemptedFeature } = useApp();

  // Guard: Unauthenticated users are strictly blocked from protected routes
  if (!isAuthenticated && !PUBLIC_TABS.includes(activeTab)) {
    return <LoginPage initialMode="LOGIN" />;
  }

  switch (activeTab) {
    // ── Public / Auth ────────────────────────────────
    case 'home':
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage initialMode="LOGIN" />;
    case 'register':
      return <LoginPage initialMode="REGISTER" />;

    // ── Access Denied Screen ─────────────────────────
    case 'access-denied':
      return <AccessDenied attemptedFeature={attemptedFeature || 'Requested Module'} />;

    // ── Dashboard based on Authorized Role ────────────
    case 'dashboard':
      if (currentRole === 'BULK_BUYER') return <BulkBuyerDashboard />;
      if (currentRole === 'RETAIL_BUYER') return <BuyerDashboard />;
      if (currentRole === 'FPO_AGGREGATOR') return <FpoDashboard />;
      if (currentRole === 'LOGISTICS') return <LogisticsDashboard />;
      if (currentRole === 'ADMIN') return <AdminDashboard />;
      if (currentRole === 'FARMER') return <FarmerDashboard />;
      return <AccessDenied attemptedFeature="Unrecognized User Role Dashboard" />;

    // ── Direct Portal Routes ─────────────────────────
    case 'bulk-buyer':
    case 'bulk-dashboard':
      if (currentRole !== 'BULK_BUYER' && currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="Bulk Buyer Procurement Portal" />;
      }
      return <BulkBuyerDashboard />;

    case 'bulk-demand':
      if (currentRole !== 'BULK_BUYER' && currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="Bulk Demand Pool" />;
      }
      return <DemandPoolPage />;

    case 'farmer':
    case 'farmer-dashboard':
      if (currentRole !== 'FARMER' && currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="Farmer Operations Portal" />;
      }
      return <FarmerDashboard />;

    case 'buyer':
    case 'buyer-dashboard':
      if (currentRole !== 'RETAIL_BUYER' && currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="Institutional Buyer Portal" />;
      }
      return <BuyerDashboard />;

    case 'fpo':
    case 'fpo-dashboard':
      if (currentRole !== 'FPO_AGGREGATOR' && currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="FPO Aggregator Operations Portal" />;
      }
      return <FpoDashboard />;

    case 'operations':
    case 'logistics':
    case 'logistics-dashboard':
      if (currentRole !== 'LOGISTICS' && currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="Logistics Operations Portal" />;
      }
      return <LogisticsDashboard />;

    case 'admin':
    case 'admin-dashboard':
    case 'sys-users':
    case 'roles-permissions':
    case 'system-monitoring':
      if (currentRole !== 'ADMIN') {
        return <AccessDenied attemptedFeature="Platform Administrator Console" />;
      }
      return <AdminDashboard />;

    // ── Farmer Operations (RBAC: FARMER, FPO, ADMIN) ──
    case 'my-crops':
      if (!FARMER_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Farmer Crop Listings" />;
      }
      return currentRole === 'FPO_AGGREGATOR' ? <FpoDashboard /> : <FarmerDashboard />;
    case 'find-buyers':
    case 'farmer-offers':
      if (!FARMER_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Farmer Buyer Discovery & Match Offers" />;
      }
      return <FindBuyersPage />;
    case 'cost-simulator':
    case 'middleman-sim':
      if (!FARMER_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Middleman Net Realization Simulator" />;
      }
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <MiddlemanSimulator />
        </div>
      );

    // ── Buyer Operations (RBAC: RETAIL_BUYER, ADMIN) ─
    case 'create-demand':
      if (!BUYER_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Institutional Buyer Demand Portal" />;
      }
      return <BuyerDashboard />;
    case 'demand-pool':
      if (!BUYER_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Demand Aggregation Pools" />;
      }
      return <DemandPoolPage />;
    case 'reverse-auction':
      if (!BUYER_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Institutional Reverse Auction" />;
      }
      return <ReverseAuctionPage />;
    case 'smart-matching':
      if (!MATCHING_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Algorithmic Smart Matching" />;
      }
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <SmartMatchingEngine />
        </div>
      );

    // ── Operations / Logistics (RBAC: LOGISTICS, ADMIN) ─
    case 'shipments':
    case 'hubs':
    case 'delivery':
      if (!LOGISTICS_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Logistics Dispatch & Hub Management" />;
      }
      return currentRole === 'LOGISTICS' ? <LogisticsDashboard /> : <AdminDashboard />;
    case 'routes':
    case 'route-optimization':
      if (!LOGISTICS_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="VRP Vehicle Route Optimization" />;
      }
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <RouteOptimizationMap />
        </div>
      );

    // ── Market / Analysis ────────────────────────────
    case 'demand-intel':
    case 'demand-forecast':
      if (currentRole === 'RETAIL_BUYER' || currentRole === 'LOGISTICS') {
        return <AccessDenied attemptedFeature="Agricultural Supply & Demand Forecasting" />;
      }
      return <DemandIntelligencePage />;

    // ── Traceability & Public Audit ──────────────────
    case 'traceability':
    case 'tracking':
      return <TraceabilityPage />;

    // ── Settlement ───────────────────────────────────
    case 'settlement':
      if (currentRole === 'RETAIL_BUYER' || currentRole === 'LOGISTICS') {
        return <AccessDenied attemptedFeature="Farmer Payment & Settlement Ledger" />;
      }
      return <SettlementPage />;

    // ── Reports / KPIs (RBAC: ADMIN, FPO) ────────────
    case 'reports':
    case 'impact-kpis':
    case 'analytics':
      if (!REPORTS_ALLOWED_ROLES.includes(currentRole)) {
        return <AccessDenied attemptedFeature="Executive Analytics & Impact Reports" />;
      }
      return <ImpactKPIPage />;

    // ── Orders (Role-filtered internally) ─────────────
    case 'orders':
      return <OrdersPage />;

    // ── Profile ──────────────────────────────────────
    case 'profile':
      return <ProfilePage />;

    // ── Notifications & Operational Alerts Center ────
    case 'notifications':
      return <NotificationsPage />;
    case 'news':
      return <NewsPage />;

    case 'schemes':
      return <SchemesPage />;

    case 'subsidy':
      return <SubsidyPage />;

    case 'support':
      return <SupportPage />;

    default:
      if (currentRole === 'BULK_BUYER') return <BulkBuyerDashboard />;
      if (currentRole === 'RETAIL_BUYER') return <BuyerDashboard />;
      if (currentRole === 'FPO_AGGREGATOR') return <FpoDashboard />;
      if (currentRole === 'LOGISTICS') return <LogisticsDashboard />;
      if (currentRole === 'ADMIN') return <AdminDashboard />;
      return <FarmerDashboard />;
  }
};

// ─── Atmospheric Light Greenery Background Illumination ─────────────────────
const AgriAtmosphericGlow: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
    {/* Soft top-left sage/cream morning illumination */}
    <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-[#7f9f94]/20 via-[#dff1ed]/35 to-transparent blur-3xl" />
    {/* Soft top-right olive/mint ambient illumination */}
    <div className="absolute top-16 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-[#f0c982]/18 via-[#e7f3ef]/30 to-transparent blur-3xl" />
    {/* Subtle central clearing */}
    <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[28rem] rounded-full bg-[#fffaf0]/35 blur-[100px]" />
    {/* Subtle bottom-right moss glow */}
    <div className="absolute -bottom-32 right-8 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tl from-[#147d78]/14 via-[#e7f3ef]/30 to-transparent blur-3xl" />
    {/* Subtle bottom-left warm earth hint */}
    <div className="absolute -bottom-16 -left-16 w-[26rem] h-[26rem] rounded-full bg-[#f0c982]/12 blur-3xl" />
  </div>
);

// ─── Public Shell (Landing + Login — no sidebar) ────────────────────────────

const PublicShell: React.FC = () => (
  <div className="min-h-screen flex flex-col agri-canvas relative">
    <div className="noise-overlay" />
    <AgriAtmosphericGlow />
    <Navbar />
    <main className="flex-1 relative z-10">
      <PageContent />
    </main>
    <Footer />

    <ProducePassportModal />
    <LanguageSelectorModal />
    <LanguageOnboardingModal />
    <ChatbotWidget />
    <SyncStatusIndicator />
  </div>
);

// ─── Authenticated Shell (Sidebar + Header) ──────────────────────────────────

const AuthenticatedShell: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen agri-canvas relative">
      <div className="noise-overlay" />
      <AgriAtmosphericGlow />
      {/* Left sidebar — fixed */}
      <Sidebar />

      {/* Right side: header + scrollable main */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300 relative z-10">
        <Header />
        <main className={`flex-1 overflow-auto ${activeTab === 'dashboard' ? 'dashboard-main' : ''}`}>
          <PageContent />
        </main>
      </div>

      {/* Global modals */}
      <ProducePassportModal />
      <DocumentManagerModal />
      <LanguageSelectorModal />
      <LanguageOnboardingModal />
      <ChatbotWidget />
      <SyncStatusIndicator />
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { isInitializing, isAuthenticated, activeTab } = useApp();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-700 border-t-transparent"></div>
      </div>
    );
  }

  // Public pages that always show the navbar shell
  const isPublicPage = !isAuthenticated || PUBLIC_TABS.includes(activeTab);

  return isPublicPage ? <PublicShell /> : <AuthenticatedShell />;
}
