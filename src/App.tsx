import React from 'react';
import { useApp } from './context/AppContext';

// Layout components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Global modals (always mounted regardless of shell)

import { ProducePassportModal } from './components/ProducePassportModal';
import { ArchitectureModal } from './components/ArchitectureModal';

// Public pages (no sidebar)
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './pages/AccessDenied';

// Authenticated pages
import { FarmerDashboard } from './pages/FarmerDashboard';
import { FindBuyersPage } from './pages/FindBuyersPage';

import { BuyerDashboard } from './pages/BuyerDashboard';
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

// Inline components for simple stubs
import { MiddlemanSimulator } from './components/MiddlemanSimulator';
import { RouteOptimizationMap } from './components/RouteOptimizationMap';
import { SmartMatchingEngine } from './components/SmartMatchingEngine';

// ─── Page Renderer ──────────────────────────────────────────────────────────

const PageContent: React.FC = () => {
  const { activeTab, currentRole, hasPermission, isAuthenticated } = useApp();

  // Unauthenticated users can only view landing or the login page
  if (!isAuthenticated && activeTab !== 'home' && activeTab !== 'landing') {
    return <LoginPage />;
  }

  switch (activeTab) {
    // ── Home / Auth ──────────────────────────────────
    case 'home':
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;

    // ── Dashboard based on Role ───────────────
    case 'dashboard':
      if (currentRole === 'RETAIL_BUYER') return <BuyerDashboard />;
      if (currentRole === 'FPO_AGGREGATOR') return <FpoDashboard />;
      if (currentRole === 'LOGISTICS') return <LogisticsDashboard />;
      if (currentRole === 'ADMIN') return <AdminDashboard />;
      return <FarmerDashboard />;

    // ── Farmer ──────────────────────────────────────
    case 'my-crops':
      return <FarmerDashboard />;
    case 'find-buyers':
    case 'farmer-offers':
      return <FindBuyersPage />;
    case 'cost-simulator':
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <MiddlemanSimulator />
        </div>
      );

    // ── Buyer ─────────────────────────────
    case 'create-demand':
      return <BuyerDashboard />;
    case 'demand-pool':
      return <DemandPoolPage />;
    case 'reverse-auction':
      return <ReverseAuctionPage />;
    case 'smart-matching':
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <SmartMatchingEngine />
        </div>
      );

    // ── Operations / Logistics ────────────────────────────────────
    case 'shipments':
    case 'hubs':
    case 'delivery':
      return <AdminDashboard />;
    case 'routes':
    case 'route-optimization':
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <RouteOptimizationMap />
        </div>
      );

    // ── Market / Analysis ────────────────────────────
    case 'demand-intel':
    case 'demand-forecast':
      return <DemandIntelligencePage />;

    // ── Traceability ─────────────────────────────────
    case 'traceability':
    case 'tracking':
      return <TraceabilityPage />;

    // ── Settlement ───────────────────────────────────
    case 'settlement':
      return <SettlementPage />;

    // ── Reports / KPIs ───────────────────────────────
    case 'reports':
    case 'impact-kpis':
    case 'analytics':
      return <ImpactKPIPage />;

    // ── Orders ───────────────────────────────────────
    case 'orders':
      return <OrdersPage />;

    // ── Profile ───────────────────────────
    case 'profile':
      return <ProfilePage />;

    // ── Middleman Simulator ──────────────────────────
    case 'middleman-sim':
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <MiddlemanSimulator />
        </div>
      );

    default:
      return <FarmerDashboard />;
  }
};

// ─── Public Shell (Landing + Login — no sidebar) ────────────────────────────

const PublicShell: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-cream text-forest font-sans relative">
    <div className="noise-overlay" />
    <Navbar />
    <main className="flex-1">
      <PageContent />
    </main>
    <Footer />

    <ProducePassportModal />
    <ArchitectureModal />
  </div>
);

// ─── Authenticated Shell (Sidebar + Header) ──────────────────────────────────

const AuthenticatedShell: React.FC = () => {
  const { sidebarOpen } = useApp();
  return (
    <div className="min-h-screen bg-cream font-sans relative text-forest">
      <div className="noise-overlay" />
      {/* Left sidebar — fixed */}
      <Sidebar />

      {/* Right side: header + scrollable main */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-auto">
          <PageContent />
        </main>
      </div>

      {/* Global modals */}

      <ProducePassportModal />
      <ArchitectureModal />
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { isInitializing, isAuthenticated, activeTab } = useApp();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-forest border-t-transparent"></div>
      </div>
    );
  }

  // Public pages that always show the navbar shell
  const publicTabs = ['home', 'landing', 'login'];
  const isPublicPage = !isAuthenticated || publicTabs.includes(activeTab);

  return isPublicPage ? <PublicShell /> : <AuthenticatedShell />;
}
