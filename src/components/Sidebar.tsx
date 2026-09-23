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
  Headphones,
  MessageSquare,
  Award,
  AlertCircle,
  Newspaper,
  CalendarDays,
  LineChart
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
          { id: 'crop-yield-prediction', label: t('nav.cropYieldPrediction', 'Yield Predictor'), icon: Sparkles, section: 'MAIN' },
          { id: 'harvest-forecast', label: t('nav.harvestForecast', 'Harvest Forecast'), icon: CalendarDays, section: 'MAIN' },
          { id: 'market-price-prediction', label: t('nav.aiPricePredictor', 'AI Price Predictor'), icon: LineChart, section: 'MAIN' },
          { id: 'find-buyers', label: t('nav.findBuyers'), icon: Search, section: 'MARKET' },
          { id: 'tasks', label: t('nav.taskManagement', 'Task Management'), icon: CheckCircle2, section: 'OPERATIONS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'settlement', label: t('nav.settlement'), icon: Scale, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' },
          // Feedback
          { id: 'farmer-platform-feedback', label: t('nav.platformFeedback', 'Platform Feedback'), icon: MessageSquare, section: 'FEEDBACK' },
          { id: 'my-complaints', label: t('nav.myComplaints', 'My Complaints'), icon: AlertCircle, section: 'FEEDBACK' },
          { id: 'you-said-we-improved', label: t('nav.youSaidWeImproved', 'You Said, We Improved'), icon: Award, section: 'FEEDBACK' },
        ];

      case 'RETAIL_BUYER':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'create-demand', label: t('nav.createDemand'), icon: Sparkles, section: 'MAIN' },
          { id: 'demand-pool', label: t('nav.demandPool'), icon: Layers, section: 'MARKET' },
          { id: 'smart-matching', label: t('nav.smartMatching'), icon: Search, section: 'MARKET' },
          { id: 'market-price-prediction', label: t('nav.aiPricePredictor', 'AI Price Predictor'), icon: LineChart, section: 'MARKET' },
          { id: 'reverse-auction', label: t('nav.reverseAuction'), icon: Gavel, section: 'MARKET' },
          { id: 'tasks', label: t('nav.taskManagement', 'Task Management'), icon: CheckCircle2, section: 'OPERATIONS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' },
          // Feedback
          { id: 'my-complaints', label: t('nav.myComplaints', 'My Complaints'), icon: AlertCircle, section: 'FEEDBACK' },
          { id: 'report-problem', label: t('nav.reportProblem', 'Report a Problem'), icon: MessageSquare, section: 'FEEDBACK' },
          { id: 'you-said-we-improved', label: t('nav.youSaidWeImproved', 'You Said, We Improved'), icon: Award, section: 'FEEDBACK' },
        ];

      case 'BULK_BUYER':
        return [
          { id: 'dashboard', label: t('nav.bulkProcurement', 'Bulk Procurement'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'bulk-demand', label: t('nav.bulkDemand', 'Bulk Demand'), icon: Users, section: 'MAIN' },
          { id: 'market-price-prediction', label: t('nav.aiPricePredictor', 'AI Price Predictor'), icon: LineChart, section: 'MAIN' },
          { id: 'tasks', label: t('nav.taskManagement', 'Task Management'), icon: CheckCircle2, section: 'OPERATIONS' },
          { id: 'tracking', label: t('nav.fleetTelematics', 'Fleet Telematics'), icon: Truck, section: 'OPERATIONS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'settlement', label: t('nav.settlement'), icon: Scale, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' },
          { id: 'my-complaints', label: t('nav.myComplaints', 'My Complaints'), icon: AlertCircle, section: 'FEEDBACK' },
          { id: 'report-problem', label: t('nav.reportProblem', 'Report a Problem'), icon: MessageSquare, section: 'FEEDBACK' },
          { id: 'you-said-we-improved', label: t('nav.youSaidWeImproved', 'You Said, We Improved'), icon: Award, section: 'FEEDBACK' },
        ];

      case 'FPO_AGGREGATOR':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'my-crops', label: t('nav.aggregatedProduce'), icon: Sprout, section: 'MAIN' },
          { id: 'demand-forecast', label: t('nav.demandForecast'), icon: TrendingUp, section: 'MAIN' },
          { id: 'tasks', label: t('nav.taskManagement', 'Task Management'), icon: CheckCircle2, section: 'OPERATIONS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'settlement', label: t('nav.settlement', 'Settlement'), icon: Scale, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'reports', label: t('nav.reports', 'Reports & Analytics'), icon: FileText, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' },
          { id: 'hub-feedback', label: t('nav.hubFeedback', 'Hub Feedback'), icon: MessageSquare, section: 'FEEDBACK' },
          { id: 'my-complaints', label: t('nav.myComplaints', 'My Complaints'), icon: AlertCircle, section: 'FEEDBACK' },
          { id: 'you-said-we-improved', label: t('nav.youSaidWeImproved', 'You Said, We Improved'), icon: Award, section: 'FEEDBACK' },
        ];

      case 'LOGISTICS':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'shipments', label: t('nav.shipments'), icon: Truck, section: 'LOGISTICS' },
          { id: 'route-optimization', label: t('nav.routeOptimization'), icon: Navigation, section: 'LOGISTICS' },
          { id: 'tasks', label: t('nav.taskManagement', 'Task Management'), icon: CheckCircle2, section: 'OPERATIONS' },
          { id: 'orders', label: t('nav.orders'), icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability', 'Traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' },
          { id: 'delivery-feedback', label: t('nav.deliveryFeedback', 'Delivery Feedback'), icon: MessageSquare, section: 'FEEDBACK' },
          { id: 'my-complaints', label: t('nav.myComplaints', 'My Complaints'), icon: AlertCircle, section: 'FEEDBACK' },
          { id: 'you-said-we-improved', label: t('nav.youSaidWeImproved', 'You Said, We Improved'), icon: Award, section: 'FEEDBACK' },
        ];

      case 'ADMIN':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, section: 'MAIN' },
          { id: 'demand-intel', label: t('nav.demandIntelligence'), icon: TrendingUp, section: 'MAIN' },
          { id: 'smart-matching', label: t('nav.smartMatching'), icon: Search, section: 'MARKET' },
          { id: 'hubs', label: t('nav.hubs', 'Hubs'), icon: MapPin, section: 'LOGISTICS' },
          { id: 'route-optimization', label: t('nav.routeOptimization'), icon: Navigation, section: 'LOGISTICS' },
          { id: 'shipments', label: t('nav.shipments'), icon: Truck, section: 'LOGISTICS' },
          { id: 'tasks', label: t('nav.taskManagement', 'Task Management'), icon: CheckCircle2, section: 'OPERATIONS' },
          { id: 'traceability', label: t('nav.traceability'), icon: QrCode, section: 'OPERATIONS' },
          { id: 'settlement', label: t('nav.settlement', 'Settlement'), icon: Scale, section: 'OPERATIONS' },
          { id: 'news', label: t('nav.news', 'News & Updates'), icon: Newspaper, section: 'SUPPORT' },
          { id: 'schemes', label: t('nav.schemes', 'Govt Schemes'), icon: Landmark, section: 'SUPPORT' },
          { id: 'subsidy', label: t('nav.subsidy', 'Subsidy'), icon: HandCoins, section: 'SUPPORT' },
          { id: 'support', label: t('nav.support', 'Support & Assistance'), icon: Headphones, section: 'SUPPORT' },
          { id: 'reports', label: t('nav.reports'), icon: FileText, section: 'OPERATIONS' },
          { id: 'notifications', label: t('nav.notifications'), icon: Bell, section: 'SETTINGS' },
          { id: 'profile', label: t('nav.profile'), icon: User, section: 'SETTINGS' },
          { id: 'feedback-intelligence', label: t('nav.feedbackIntelligence', 'Feedback Intelligence'), icon: MessageSquare, section: 'FEEDBACK' },
          { id: 'my-complaints', label: t('nav.complaintsDesk', 'Complaints Desk'), icon: AlertCircle, section: 'FEEDBACK' },
          { id: 'you-said-we-improved', label: t('nav.youSaidWeImproved', 'You Said, We Improved'), icon: Award, section: 'FEEDBACK' },
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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#f0f8ff]/95 backdrop-blur-md text-[#023e8a] border-r border-[#bae6fd]/40 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-soft ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="p-4 border-b border-[#bae6fd]/30 flex items-center justify-between bg-white/40">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#023e8a] flex items-center justify-center text-[#fefae0] shadow-soft group-hover:bg-[#03045e] transition-colors overflow-hidden border border-[#bae6fd]/40">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-medium tracking-tight text-[#023e8a] group-hover:text-[#03045e] transition-colors">
                    Uzhavan Connect
                  </span>
                  <span className="text-[9px] bg-[#e0f2fe] text-[#023e8a] font-medium px-1.5 py-0.5 rounded-full border border-[#7dd3fc]/40">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-[#475569] font-normal tracking-normal -mt-0.5">
                  {t('landing.tagline', 'Agricultural Intelligence')}
                </p>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-[#475569] hover:text-[#023e8a] hover:bg-[#bae6fd]/20 rounded-xl cursor-pointer transition-colors"
              aria-label={t('common.close', undefined, 'Close')}
              title={t('common.close', undefined, 'Close')}
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
                secName === 'SETTINGS' ? t('nav.sectionSettings', 'SETTINGS') :
                secName === 'FEEDBACK' ? t('nav.sectionFeedback', 'FEEDBACK') : secName;

              return (
                <div key={secName} className="space-y-1">
                  <div className="px-3 text-[10px] font-medium uppercase tracking-wider text-[#64748b] mb-1.5 mt-2">
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
                              ? 'bg-[#023e8a] text-[#fefae0] shadow-soft font-medium'
                              : 'text-[#475569] hover:bg-[#bae6fd]/20 hover:text-[#023e8a]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#fefae0]' : 'text-[#64748b]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                              isActive ? 'bg-[#fefae0] text-[#023e8a]' : 'bg-[#023e8a] text-[#fefae0]'
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
        <div className="p-3 border-t border-[#bae6fd]/30 bg-[#f0f8ff]/40 space-y-2">
          <div
            onClick={() => handleSelect('profile')}
            className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-white/80 border border-transparent hover:border-[#bae6fd]/60 cursor-pointer transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#e0f2fe] border border-[#7dd3fc]/40 flex items-center justify-center text-sm font-medium text-[#023e8a] shadow-2xs">
              {currentUser.avatar || '👨‍🌾'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#023e8a] truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#475569] truncate font-normal">
                {currentUser.organization || currentUser.email || t('common.member', 'Member')}
              </p>
            </div>
          </div>

          {/* Language selector button in sidebar footer */}
          <button
            type="button"
            onClick={openLanguageSelector}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold bg-white/70 hover:bg-white text-[#023e8a] border border-[#bae6fd]/60 shadow-2xs hover:border-[#023e8a]/50 transition cursor-pointer"
            title={t('nav.changeLanguage', 'Change platform language (22 Constitutional Languages)')}
          >
            <div className="flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-[#023e8a]" />
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
