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

      case 'BULK_BUYER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'MAIN' },
          { id: 'demand-pool', label: 'Demand Pools', icon: Layers, section: 'MARKET' },
          { id: 'reverse-auction', label: 'Reverse Auction', icon: Gavel, section: 'MARKET' },
          { id: 'smart-matching', label: 'Marketplace', icon: Search, section: 'MARKET' },
          { id: 'orders', label: 'Orders', icon: Package, section: 'OPERATIONS' },
          { id: 'traceability', label: 'Traceability (QR)', icon: QrCode, section: 'OPERATIONS' },
          { id: 'quality-assessment', label: 'Quality Assessment', icon: Sparkles, section: 'OPERATIONS' },
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
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-emerald-950 text-emerald-50 border-r border-emerald-900/50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="p-4 border-b border-emerald-900/50 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm group-hover:bg-white transition-all duration-300">
                <Sprout className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">
                    Uzhavan Connect
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wide -mt-0.5">
                  Demand-First Marketplace
                </p>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-emerald-400/60 hover:text-emerald-400 rounded-lg lg:hidden transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Role Indicator Pill */}
          <div className="px-4 py-2.5 bg-emerald-900/40 border-b border-emerald-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white uppercase tracking-widest text-[10px]">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono font-medium">Verified</span>
          </div>

          {/* Sidebar Menu Groups */}
          <nav className="p-3 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
            {sections.map((secName) => (
              <div key={secName} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400/50 mb-2 mt-2">
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400/70'}`} />
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
        <div className="p-3 border-t border-emerald-900/50 bg-emerald-900/20 space-y-2">
          <div
            onClick={() => handleSelect('profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-900/60 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-800 shadow-sm">
              {currentUser.avatar || '👨‍🌾'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-400/80 truncate uppercase tracking-widest font-medium">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
