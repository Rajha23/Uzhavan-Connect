import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, Search, ChevronDown, LogOut, User, Wifi, WifiOff, RefreshCw, Download, CheckCircle2, Globe2, Bell } from 'lucide-react';
import { ROLE_DISPLAY_LABELS, ROLE_BADGE_STYLES } from '../services/routeGuard';
import { NotificationBell } from './NotificationBell';

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
  notifications: 'Notifications & Alerts',
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
    unreadNotificationsCount,
    isOnline,
    syncStatus,
    pendingSyncCount,
    syncOfflineQueue,
    isInstallable,
    promptInstall,
  } = useApp();

  const { currentLanguageDef, openLanguageSelector, t } = useLanguage();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const displayRole = ROLE_DISPLAY_LABELS[currentRole] || currentRole;
  const badgeStyle = ROLE_BADGE_STYLES[currentRole] || ROLE_BADGE_STYLES.FARMER;

  const pageTitle = PAGE_TITLES[activeTab] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#ccd5ae]/40 flex items-center px-4 sm:px-6 gap-3 shadow-soft">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-2xl text-[#5c7065] hover:text-[#01472e] hover:bg-[#ccd5ae]/20 transition cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <div className="hidden sm:block min-w-0">
        <h1 className="text-sm sm:text-base font-medium text-[#01472e] truncate tracking-tight">{pageTitle}</h1>
      </div>

      {/* Search Bar — grows to fill space */}
      <div className="flex-1 max-w-sm mx-auto sm:mx-0 sm:ml-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#788c80]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search produce, orders, demands..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/80 border border-[#ccd5ae]/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#01472e]/20 focus:border-[#01472e] focus:bg-white transition placeholder:text-[#788c80] text-[#01472e] shadow-2xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        {/* Network Connectivity & Offline Sync Status Pill */}
        {!isOnline ? (
          <button
            onClick={syncOfflineQueue}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-[11px] font-medium shadow-2xs transition cursor-pointer"
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
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1.5 rounded-2xl text-[11px] font-medium animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
            <span className="hidden sm:inline">Syncing changes...</span>
            <span className="sm:hidden">Syncing</span>
          </div>
        ) : syncStatus === 'synced' ? (
          <div className="flex items-center gap-1.5 bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40 px-3.5 py-1.5 rounded-2xl text-[11px] font-medium shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e] shrink-0" />
            <span className="hidden sm:inline">All changes synced</span>
            <span className="sm:hidden">Synced</span>
          </div>
        ) : (
          <div
            className="hidden sm:flex items-center gap-1.5 text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/40 px-3 py-1.5 rounded-2xl text-[11px] font-medium shadow-2xs"
            title="Connected to network. Field data synchronized."
          >
            <span className="w-2 h-2 rounded-full bg-[#01472e] animate-pulse" />
            <span>Online</span>
          </div>
        )}

        {/* Multilingual 22-Language Quick Switch Pill */}
        <button
          type="button"
          onClick={openLanguageSelector}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/90 hover:bg-white text-[#01472e] border border-[#ccd5ae]/80 shadow-2xs hover:border-[#01472e]/60 transition hover:scale-[1.02] cursor-pointer"
          title="Change platform language (22 Constitutional Languages supported)"
          aria-label="Change Language"
        >
          <Globe2 className="w-3.5 h-3.5 text-[#01472e] shrink-0" />
          <span className="font-bold tracking-tight">{currentLanguageDef.nativeName}</span>
          <span className="hidden xl:inline text-[10px] text-slate-500 font-normal">({currentLanguageDef.name})</span>
        </button>

        {/* Centralized Notifications & Operational Alerts Bell */}
        <NotificationBell />

        {/* PWA Install Button when installable */}
        {isInstallable && (
          <button
            onClick={promptInstall}
            className="hidden md:flex items-center gap-1.5 bg-[#01472e] hover:bg-[#003b25] text-[#fefae0] px-3.5 py-1.5 rounded-2xl text-xs font-medium transition shadow-soft cursor-pointer"
            title="Install UZHAVAN Connect to your home screen or desktop for fast offline field access"
          >
            <Download className="w-3.5 h-3.5 text-[#ccd5ae]" />
            <span>Install App</span>
          </button>
        )}

        {/* Authenticated Role Indicator Badge (Informational, Non-Clickable, No Dropdown) */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-medium tracking-wider select-none shadow-2xs border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
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
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-2xl hover:bg-white/80 transition border border-[#ccd5ae]/50 bg-white/60 shadow-2xs cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-xl bg-[#01472e] flex items-center justify-center text-xs font-medium text-[#fefae0] shadow-2xs shrink-0">
              {currentUser.avatar || '👤'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-[#01472e] leading-tight">{(currentUser.name || 'User').split(' ')[0]}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#788c80] hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-[24px] shadow-forest-lg border border-[#ccd5ae]/60 z-50 overflow-hidden py-1.5 animate-in fade-in duration-150">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-[#ccd5ae]/30 bg-[#faf9f5]">
                <p className="text-xs font-medium text-[#01472e]">{currentUser.name || 'User'}</p>
                <p className="text-[10px] text-[#5c7065] truncate">{currentUser.email || 'user@uzhavanconnect.gov.in'}</p>
                <span className="mt-1.5 inline-block text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40">
                  {ROLE_LABELS[currentRole] || currentRole}
                </span>
              </div>

              <button
                onClick={() => { setActiveTab('profile'); setIsUserMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#01472e] hover:bg-[#eef2e1]/50 transition text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-[#788c80]" />
                {t('profile.title')}
              </button>

              <button
                onClick={() => { setActiveTab('notifications'); setIsUserMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#01472e] hover:bg-[#eef2e1]/50 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-[#788c80]" />
                  <span>Notifications & Alerts</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-bold text-[#fefae0] bg-[#01472e] px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </button>

              {/* Language Selection trigger in dropdown */}
              <button
                onClick={() => { openLanguageSelector(); setIsUserMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-[#01472e] hover:bg-[#eef2e1]/50 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-[#788c80]" />
                  <span>Language / மொழி</span>
                </div>
                <span className="text-[10px] font-bold text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/40 px-2 py-0.5 rounded-md">
                  {currentLanguageDef.nativeName}
                </span>
              </button>

              {isInstallable && (
                <button
                  onClick={() => { promptInstall(); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#01472e] font-medium bg-[#eaf4ec] hover:bg-[#d5ebd9] transition text-left cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#01472e]" />
                  Install App (PWA)
                </button>
              )}
              <div className="border-t border-[#ccd5ae]/30 mt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-700 hover:bg-rose-50 transition text-left cursor-pointer font-medium"
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
