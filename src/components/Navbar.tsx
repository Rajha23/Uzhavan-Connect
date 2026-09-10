import React from 'react';
import { useApp } from '../context/AppContext';
import { Sprout } from 'lucide-react';
import { ROLE_DISPLAY_LABELS, ROLE_BADGE_STYLES } from '../services/routeGuard';

export const Navbar: React.FC = () => {
  const {
    isAuthenticated,
    currentRole,
    currentUser,
    setActiveTab
  } = useApp();

  const displayRole = ROLE_DISPLAY_LABELS[currentRole] || currentRole;
  const badgeStyle = ROLE_BADGE_STYLES[currentRole] || ROLE_BADGE_STYLES.FARMER;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
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
            {/* Authenticated session or Sign In / Register Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                </button>
                {/* Authenticated Role Indicator Badge (Informational, Non-Clickable) */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider select-none shadow-2xs border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
                  title={`Authenticated Role: ${displayRole} (Enforced by backend session)`}
                  aria-label={`Current Role: ${displayRole}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} animate-pulse shrink-0`} />
                  <span>{displayRole}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="btn-primary text-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="btn-secondary text-xs hidden sm:block"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
