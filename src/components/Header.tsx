import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Search, ChevronDown, LogOut, User, Wifi, WifiOff, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { ROLE_DISPLAY_LABELS, ROLE_BADGE_STYLES } from '../services/routeGuard';

// Maps tab ids to human-readable page titles
const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  'my-crops': 'My Crops',
  'demand-forecast': 'Demand Forecast',
  'find-buyers': 'Find Buyers',
  'farmer-offers': 'Offers',
  orders: 'My Orders',
  logistics: 'Logistics',
  traceability: 'Traceability',
  'cost-simulator': 'Cost Simulator',
  profile: 'My Profile',
  'create-demand': 'Create Demand',
  'demand-pool': 'Demand Pool',
  'smart-matching': 'Smart Matching',
  'reverse-auction': 'Reverse Auction',
  'bulk-demand': 'Bulk Demand',
  'bulk-buyer': 'Bulk Procurement Console',
  'fpo-members': 'Members',
  'fpo-produce': 'Produce',
  shipments: 'Shipments',
  'pickup-requests': 'Pickup Requests',
  routes: 'Routes',
  'route-optimization': 'Route Optimization',
  delivery: 'Delivery',
  tracking: 'Tracking & QR',
  'gov-users': 'Users Directory',
  'gov-farmers': 'Farmers',
  'gov-buyers': 'Buyers',
  'gov-fpos': 'FPOs',
  'gov-price-trends': 'Price Trends',
  'sys-users': 'Users',
  'roles-permissions': 'Roles & Permissions',
  'system-monitoring': 'System Monitoring',
  reports: 'Reports & KPIs',
  settlement: 'Settlement',
  'impact-kpis': 'Impact & KPIs',
};

const ROLE_COLORS: Record<string, string> = {
  FPO: 'bg-amber-100 text-amber-800',
  LOGISTICS: 'bg-orange-100 text-orange-800',
};

const ROLE_LABELS: Record<string, string> = {
  FPO: 'FPO',
  LOGISTICS: 'Logistics',
};

export const Header: React.FC = () => {
  const {
    toggleSidebar,
    activeTab,
    currentUser,
    currentRole,
    setActiveTab,
    logout,
    isOnline,
    syncStatus,
    pendingSyncCount,
    syncOfflineQueue,
    isInstallable,
    promptInstall,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const displayRole = ROLE_DISPLAY_LABELS[currentRole] || currentRole;
  const badgeStyle = ROLE_BADGE_STYLES[currentRole] || ROLE_BADGE_STYLES.FARMER;

  const pageTitle = PAGE_TITLES[activeTab] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 flex items-center px-4 gap-3 shadow-2xs">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <div className="hidden sm:block min-w-0">
        <h1 className="text-sm font-medium text-slate-900 truncate tracking-tight">{pageTitle}</h1>
      </div>

      {/* Search Bar — grows to fill space */}
      <div className="flex-1 max-w-sm mx-auto sm:mx-0 sm:ml-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search produce, orders, demands..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-emerald-900/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Network Connectivity & Offline Sync Status Pill */}
        {!isOnline ? (
          <button
            onClick={syncOfflineQueue}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl text-[11px] font-medium shadow-2xs transition cursor-pointer"
            title="Offline Field Mode: Changes are saved locally on device. Click to retry synchronization."
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Offline (Field Mode)</span>
            <span className="sm:hidden">Offline</span>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-700 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono">
                {pendingSyncCount} saved
              </span>
            )}
          </button>
        ) : syncStatus === 'syncing' ? (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-xl text-[11px] font-medium animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
            <span className="hidden sm:inline">Syncing changes...</span>
            <span className="sm:hidden">Syncing</span>
          </div>
        ) : syncStatus === 'synced' ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-xl text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">All changes synced</span>
            <span className="sm:hidden">Synced</span>
          </div>
        ) : (
          <div
            className="hidden sm:flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-medium"
            title="Connected to network. Field data synchronized."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Online</span>
          </div>
        )}

        {/* PWA Install Button when installable */}
        {isInstallable && (
          <button
            onClick={promptInstall}
            className="hidden md:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-xs cursor-pointer"
            title="Install UZHAVAN Connect to your home screen or desktop for fast offline field access"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install App</span>
          </button>
        )}

        {/* Authenticated Role Indicator Badge (Informational, Non-Clickable, No Dropdown) */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider select-none shadow-2xs border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
          title={`Authenticated Account Role: ${displayRole} (Enforced by backend session)`}
          aria-label={`Current Role: ${displayRole}`}
        >
          <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} animate-pulse shrink-0`} />
          <span>{displayRole}</span>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition border border-slate-200/60 cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-xs font-medium text-white shadow-2xs shrink-0">
              {currentUser.avatar || '👤'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-800 leading-tight">{(currentUser.name || 'User').split(' ')[0]}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-lg border border-slate-200/90 z-50 overflow-hidden py-1">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-900">{currentUser.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser.email || 'user@uzhavanconnect.gov.in'}</p>
                <span className="mt-1.5 inline-block text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {ROLE_LABELS[currentRole] || currentRole}
                </span>
              </div>
              <button
                onClick={() => { setActiveTab('profile'); setIsUserMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                My Profile
              </button>
              {isInstallable && (
                <button
                  onClick={() => { promptInstall(); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 transition text-left cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  Install App (PWA)
                </button>
              )}
              <div className="border-t border-slate-100 mt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setIsUserMenuOpen(false); }}
        />
      )}
    </header>
  );
};
