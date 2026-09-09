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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 sm:gap-2.5 group text-left"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[1rem] sm:rounded-2xl bg-emerald-700 flex items-center justify-center shadow-soft group-hover:scale-105 transition-all duration-300 shrink-0">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition whitespace-nowrap">
                    Uzhavan Connect
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:block">
                  Demand-First Agricultural Marketplace
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Digital Passport QR Viewer */}
            <button
              onClick={() => openPassportModal()}
              className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-[0.8rem] sm:rounded-xl transition-all shadow-sm whitespace-nowrap"
              title="View Live QR Produce Passport"
            >
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Batch QR</span>
            </button>

            {/* Role Switcher Dropdown (Authenticated) or Sign In Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-[0.8rem] sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-900">
                    {currentRole}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                </button>

                {/* Role Dropdown Menu */}
                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-hover border border-slate-200 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
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
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                              isSelected ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                <Icon className="w-4 h-4" />
                              </span>
                              <span>{r.label}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 rounded-b-2xl">
                      Logged in as: <span className="font-semibold text-slate-900">{currentUser.name || 'User'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1 sm:gap-1.5 bg-emerald-700 text-white font-semibold text-[11px] sm:text-xs px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl hover:bg-emerald-800 shadow-sm transition-all whitespace-nowrap hover:-translate-y-0.5 hover:shadow-md"
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
