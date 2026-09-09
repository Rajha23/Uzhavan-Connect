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
  Scale
} from 'lucide-react';

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
    switchRole,
    logout
  } = useApp();

  // Role-specific sidebars per user specification
  const getMenuItems = (): MenuItem[] => {
    switch (currentRole) {
      case 'FARMER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
          { id: 'demand-forecast', label: 'Demand Signals', icon: TrendingUp, section: 'MAIN' },
          { id: 'my-crops', label: 'My Produce', icon: Sprout, section: 'MAIN' },
          { id: 'find-buyers', label: 'My Matches', icon: Search, section: 'MARKET' },
          { id: 'orders', label: 'Orders', icon: Package, section: 'OPERATIONS' },
          { id: 'settlement', label: 'Earnings', icon: Scale, section: 'OPERATIONS' },
          { id: 'traceability', label: 'Traceability', icon: QrCode, section: 'OPERATIONS' },
          { id: 'profile', label: 'Profile', icon: User, section: 'SETTINGS' }
        ];

      case 'RETAIL_BUYER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
          { id: 'create-demand', label: 'Create Demand', icon: Sparkles, section: 'MAIN' },
          { id: 'demand-pool', label: 'Demand Pools', icon: Layers, section: 'MARKET' },
          { id: 'smart-matching', label: 'Supplier Matches', icon: Search, section: 'MARKET' },
          { id: 'reverse-auction', label: 'Reverse Auction', icon: Gavel, section: 'MARKET' },
          { id: 'orders', label: 'Orders', icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: 'Traceability', icon: QrCode, section: 'OPERATIONS' },
          { id: 'profile', label: 'Profile', icon: User, section: 'SETTINGS' }
        ];

      case 'FPO_AGGREGATOR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
          { id: 'my-crops', label: 'Aggregated Produce', icon: Sprout, section: 'MAIN' },
          { id: 'demand-forecast', label: 'Demand Signals', icon: TrendingUp, section: 'MAIN' },
          { id: 'orders', label: 'Orders', icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: 'Traceability', icon: QrCode, section: 'OPERATIONS' },
          { id: 'profile', label: 'Profile', icon: User, section: 'SETTINGS' }
        ];

      case 'LOGISTICS':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
          { id: 'shipments', label: 'Shipments', icon: Truck, section: 'LOGISTICS' },
          { id: 'route-optimization', label: 'Route Planning', icon: Navigation, section: 'LOGISTICS' },
          { id: 'orders', label: 'Active Pickups', icon: Package, section: 'OPERATIONS' },
          { id: 'profile', label: 'Profile', icon: User, section: 'SETTINGS' }
        ];

      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
          { id: 'demand-intel', label: 'Demand Intelligence', icon: TrendingUp, section: 'MAIN' },
          { id: 'smart-matching', label: 'Matching', icon: Search, section: 'MARKET' },
          { id: 'hubs', label: 'Hubs', icon: MapPin, section: 'LOGISTICS' },
          { id: 'route-optimization', label: 'Route Optimization', icon: Navigation, section: 'LOGISTICS' },
          { id: 'shipments', label: 'Shipments', icon: Truck, section: 'LOGISTICS' },
          { id: 'traceability', label: 'Traceability', icon: QrCode, section: 'OPERATIONS' },
          { id: 'reports', label: 'Analytics', icon: FileText, section: 'OPERATIONS' },
          { id: 'profile', label: 'Profile', icon: User, section: 'SETTINGS' }
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md text-slate-800 border-r border-emerald-900/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between bg-white/40">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-medium tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Uzhavan Connect
                  </span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.5 rounded border border-emerald-200">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal tracking-normal -mt-0.5">
                  Agricultural Intelligence
                </p>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Role Indicator Pill */}
          <div className="px-4 py-2 bg-emerald-50/70 border-b border-emerald-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-medium text-emerald-900 uppercase tracking-wider text-[10px]">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-medium">Live</span>
          </div>

          {/* Sidebar Menu Groups */}
          <nav className="p-3 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
            {sections.map((secName) => (
              <div key={secName} className="space-y-1">
                <div className="px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1 mt-2">
                  {secName}
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-xs font-medium'
                            : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: User & Quick Switch */}
        <div className="p-3 border-t border-emerald-900/10 bg-emerald-50/40 space-y-2">
          <div
            onClick={() => handleSelect('profile')}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/80 border border-transparent hover:border-emerald-200/60 cursor-pointer transition"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300/70 flex items-center justify-center text-sm font-medium text-emerald-800 shadow-2xs">
              {currentUser.avatar || '👨‍🌾'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-normal">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
