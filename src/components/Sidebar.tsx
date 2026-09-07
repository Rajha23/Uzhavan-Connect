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

      case 'BUYER':
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

      case 'OPERATIONS_ADMIN':
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-forest text-cream/90 border-r border-[#023120] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="p-4 border-b border-[#023120] flex items-center justify-between">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-[1rem] bg-sage flex items-center justify-center text-forest shadow-md shadow-black/20 group-hover:bg-cream transition">
                <Sprout className="w-5 h-5 text-forest" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-anton tracking-wide text-cream">
                    Uzhavan Connect
                  </span>
                </div>
                <p className="text-[10px] text-sage/70 font-medium tracking-wide -mt-0.5">
                  Demand-First Marketplace
                </p>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-sage/60 hover:text-sage rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Role Indicator Pill */}
          <div className="px-4 py-2.5 bg-[#023120] border-b border-[#012518] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="font-bold text-cream uppercase tracking-widest text-[10px]">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <span className="text-[10px] text-sage/80 font-mono">Verified</span>
          </div>

          {/* Sidebar Menu Groups */}
          <nav className="p-3 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
            {sections.map((secName) => (
              <div key={secName} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-sage/50 mb-1 mt-2">
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[1rem] text-xs font-medium transition ${
                          isActive
                            ? 'bg-sage text-forest font-bold shadow-sm'
                            : 'text-cream/70 hover:bg-[#023120] hover:text-cream'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-forest' : 'text-sage/70'}`} />
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
        <div className="p-3 border-t border-[#023120] bg-[#023120] space-y-2">
          <div
            onClick={() => handleSelect('profile')}
            className="flex items-center gap-2.5 p-2 rounded-[1rem] hover:bg-forest cursor-pointer transition"
          >
            <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-sm font-bold text-forest shadow-xs">
              {currentUser.avatar || '👨‍🌾'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-cream truncate">{currentUser.name}</p>
              <p className="text-[10px] text-sage/80 truncate uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
