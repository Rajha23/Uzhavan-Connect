import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sprout,
  LayoutDashboard,
  TrendingUp,
  Tag,
  Search,
  CheckCircle2,
  Package,
  Truck,
  QrCode,
  User,
  LogOut,
  Layers,
  Sparkles,
  Gavel,
  Users,
  FileText,
  ShieldCheck,
  Building2,
  Route,
  Navigation,
  MapPin,
  Clock,
  ChevronDown,
  X,
  Scale,
  Bell,
  Landmark,
  HandCoins,
  Globe2,
  Headphones
, Newspaper
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  section?: string;
}

export const Sidebar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    logout,
    unreadNotificationsCount
  } = useApp();

  const { t, currentLanguageDef, openLanguageSelector } = useLanguage();

  // Role-specific sidebars per user specification
  const getMenuItems = (): MenuItem[] => {
    switch (currentRole) {
      case 'FARMER':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'demand-forecast', label: t('nav.demandForecast'), icon: TrendingUp, section: 'MAIN' },
          { id: 'my-crops', label: t('nav.myCrops'), icon: Sprout, section: 'MAIN' },
          { id: 'find-buyers', label: t('nav.findBuyers'), icon: Search, section: 'MARKET' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'settlement', label: t('nav.settlement'), icon: Scale, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' }
        ];

      case 'RETAIL_BUYER':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'create-demand', label: t('nav.createDemand'), icon: Sparkles, section: 'MAIN' },
          { id: 'demand-pool', label: t('nav.demandPool'), icon: Layers, section: 'MARKET' },
          { id: 'smart-matching', label: t('nav.smartMatching'), icon: Search, section: 'MARKET' },
          { id: 'reverse-auction', label: t('nav.reverseAuction'), icon: Gavel, section: 'MARKET' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' }
        ];

      case 'BULK_BUYER':
        return [
          { id: 'dashboard', label: t('nav.bulkProcurement', 'Bulk Procurement'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'bulk-demand', label: t('nav.bulkDemand', 'Bulk Demand'), icon: Users, section: 'MAIN' },
          { id: 'tracking', label: t('nav.fleetTelematics', 'Fleet Telematics'), icon: Truck, section: 'OPERATIONS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'settlement', label: t('nav.settlement'), icon: Scale, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' }
        ];

      case 'FPO_AGGREGATOR':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'my-crops', label: t('nav.aggregatedProduce'), icon: Sprout, section: 'MAIN' },
          { id: 'demand-forecast', label: t('nav.demandForecast'), icon: TrendingUp, section: 'MAIN' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' }
        ];

      case 'LOGISTICS':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'shipments', label: t('nav.shipments'), icon: Truck, section: 'LOGISTICS' },
          { id: 'route-optimization', label: t('nav.routeOptimization'), icon: Navigation, section: 'LOGISTICS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' }
        ];

      case 'ADMIN':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'demand-intel', label: t('nav.demandIntelligence'), icon: TrendingUp, section: 'MAIN' },
          { id: 'smart-matching', label: t('nav.smartMatching'), icon: Search, section: 'MARKET' },
          { id: 'hubs', label: t('nav.hubs', 'Hubs'), icon: MapPin, section: 'LOGISTICS' },
          { id: 'route-optimization', label: t('nav.routeOptimization'), icon: Navigation, section: 'LOGISTICS' },
          { id: 'shipments', label: t('nav.shipments'), icon: Truck, section: 'LOGISTICS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'reports', label: t('nav.reports'), icon: FileText, section: 'OPERATIONS' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' }
        ];

      default:
        return [];
    }
  };


  const menuItems = getMenuItems();

  // Group items by section
  const sections = Array.from(new Set(menuItems.map((item) => item.section || 'MAIN')));

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#f8faf8]/95 backdrop-blur-md text-[#16333a] border-r border-[#7f9f94]/30 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-soft ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="p-4 border-b border-[#7f9f94]/25 flex items-center justify-between bg-white/60">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#16333a] flex items-center justify-center text-white shadow-soft group-hover:bg-[#147d78] transition-colors">
                <Sprout className="w-5 h-5 text-[#dff1ed]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-semibold tracking-tight text-[#16333a] group-hover:text-[#147d78] transition-colors">
                    Uzhavan Connect
                  </span>
                  <span className="text-[9px] bg-[#dff1ed] text-[#147d78] font-semibold px-1.5 py-0.5 rounded-full border border-[#7f9f94]/40">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-[#6d817c] font-normal tracking-normal -mt-0.5">
                  {t('landing.tagline', 'Agricultural Intelligence')}
                </p>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-[#5c7065] hover:text-[#01472e] hover:bg-[#ccd5ae]/20 rounded-xl lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Groups */}
          <nav className="p-3 space-y-4 max-h-[calc(100vh-175px)] overflow-y-auto">
            {sections.map((secName) => {
              const secLabel =
                secName === 'MAIN' ? t('nav.sectionMain', 'MAIN') :
                secName === 'MARKET' ? t('nav.sectionMarket', 'MARKET') :
                secName === 'OPERATIONS' ? t('nav.sectionOperations', 'OPERATIONS') :
                secName === 'LOGISTICS' ? t('nav.sectionLogistics', 'LOGISTICS') :
                secName === 'SETTINGS' ? t('nav.sectionSettings', 'SETTINGS') : secName;

              return (
                <div key={secName} className="space-y-1">
                  <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a9b96] mb-1.5 mt-2">
                    {secLabel}
                  </div>
                  {menuItems
                    .filter((item) => item.section === secName)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition cursor-pointer ${
                            isActive
                              ? 'bg-[#16333a] text-white shadow-soft font-semibold'
                              : 'text-[#60736f] hover:bg-[#dff1ed]/70 hover:text-[#147d78]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#dff1ed]' : 'text-[#8a9b96]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                              isActive ? 'bg-[#dff1ed] text-[#16333a]' : 'bg-[#147d78] text-white'
                            } leading-none`}>
                              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User & Sign Out */}
        <div className="p-3 border-t border-[#7f9f94]/25 bg-[#eef4f0]/80 space-y-2">
          <div
            onClick={() => handleSelect('profile')}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#7f9f94]/40 cursor-pointer transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#dff1ed] border border-[#7f9f94]/40 flex items-center justify-center text-sm font-medium text-[#147d78] shadow-2xs">
              {currentUser.avatar || '👨‍🌾'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#16333a] truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#6d817c] truncate font-normal">
                {currentUser.organization || currentUser.email || 'Member'}
              </p>
            </div>
          </div>

          {/* Language selector button in sidebar footer */}
          <button
            type="button"
            onClick={openLanguageSelector}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-[#16333a] border border-[#7f9f94]/35 shadow-2xs hover:border-[#147d78]/50 transition cursor-pointer"
            title={t('nav.changeLanguage', 'Change platform language (22 Constitutional Languages)')}
          >
            <div className="flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-[#147d78]" />
              <span className="font-bold">{currentLanguageDef.nativeName}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">22</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-2xl transition cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('common.logout', 'Sign Out')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
