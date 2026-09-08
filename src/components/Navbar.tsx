import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sprout,
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
    setActiveTab
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
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors shrink-0">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-medium tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
                    Uzhavan Connect
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-0.5 font-normal tracking-normal hidden sm:block">
                  Demand-First Agricultural Intelligence
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Role Switcher Dropdown (Authenticated) or Sign In Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-medium text-slate-900">
                    {currentRole.replace('_', ' ')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Role Dropdown Menu */}
                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-slate-200/90 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                              isSelected ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span>{r.label}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 font-normal">
                      Logged in as: <span className="font-medium text-slate-800">{currentUser.name || 'User'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="btn-primary text-xs"
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
