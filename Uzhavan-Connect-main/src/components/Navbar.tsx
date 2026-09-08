import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sprout,
  QrCode,
  ChevronDown,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isAuthenticated,
    currentRole,
    currentUser,
    switchRole,
    setActiveTab,
    openPassportModal
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'FARMER', label: 'Farmer Portal', icon: Sprout, color: 'text-emerald-700 bg-emerald-50' },
    { role: 'RETAIL_BUYER', label: 'Buyer', icon: ShoppingBag, color: 'text-blue-700 bg-blue-50' },
    { role: 'ADMIN', label: 'Operations & Admin', icon: ShieldCheck, color: 'text-slate-800 bg-slate-100' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-olive/30 shadow-forest">
      {/* Top Ministry & Announcement Banner */}
      <div className="bg-gradient-to-r from-forest to-[#023120] text-cream text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-sage/20 text-sage font-semibold px-2 py-0.5 rounded text-[11px] border border-sage/30">
              • SIH26033
            </span>
            <span className="text-sage/70 hidden sm:inline">
              Ministry of Consumer Affairs, Food & Public Distribution
            </span>
            <span className="text-sage/40 hidden md:inline">|</span>
            <span className="text-olive font-medium italic hidden md:inline">
              "Don't wait for the market. Let the market tell the farmer what to grow."
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-[1.2rem] bg-forest flex items-center justify-center text-cream shadow-forest group-hover:scale-105 transition">
                <Sprout className="w-6 h-6 text-cream" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl lg:text-2xl font-anton tracking-wide text-forest group-hover:text-forest/80 transition whitespace-nowrap">
                    Uzhavan Connect
                  </span>
                  <span className="text-[10px] bg-sage/20 text-forest font-bold px-1.5 py-0.5 rounded border border-sage/40">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-forest/60 -mt-1 font-medium tracking-wide">
                  Demand-First Agricultural Marketplace
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Digital Passport QR Viewer */}
            <button
              onClick={() => openPassportModal()}
              className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest bg-olive/30 hover:bg-sage/40 border border-olive px-3.5 py-2 rounded-[1rem] transition shadow-xs"
              title="View Live QR Produce Passport"
            >
              <QrCode className="w-4 h-4 text-forest" />
              <span>Batch QR</span>
            </button>

            {/* Role Switcher Dropdown (Authenticated) or Sign In Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 bg-olive/20 hover:bg-olive/40 border border-olive/50 text-forest px-3 py-1.5 rounded-[1rem] text-xs font-medium transition"
                >
                  <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                  <span className="font-semibold text-forest">
                    {currentRole}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-forest/60" />
                </button>

                {/* Role Dropdown Menu */}
                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-cream rounded-[1.5rem] shadow-forest border border-olive/30 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 text-[10px] font-bold text-forest/50 uppercase tracking-widest border-b border-olive/20">
                      Switch Active Role
                    </div>
                    <div className="p-1 space-y-0.5">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isSelected = currentRole === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              switchRole(r.role);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[1rem] text-xs transition ${
                              isSelected ? 'bg-sage/20 text-forest font-bold' : 'text-forest/80 hover:bg-olive/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-[0.8rem] ${isSelected ? 'bg-sage text-forest' : 'bg-olive/50 text-forest/70'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span>{r.label}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-forest" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-olive/20 bg-olive/10 text-[11px] text-forest/60">
                      Logged in as: <span className="font-medium text-forest">{currentUser.name || 'User'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="btn-organic flex items-center gap-1.5 bg-forest text-cream text-[10px] sm:text-xs px-5 py-2 hover:bg-[#023120]"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
