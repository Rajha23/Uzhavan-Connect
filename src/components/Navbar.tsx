import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Globe2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    setActiveTab
  } = useApp();

  const { currentLanguageDef, openLanguageSelector, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#ccd5ae]/40 shadow-soft">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#01472e] flex items-center justify-center text-[#fefae0] shadow-soft group-hover:bg-[#003b25] transition-colors shrink-0">
                <Sprout className="w-5 h-5 text-[#fefae0]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-medium tracking-tight text-[#01472e] group-hover:text-[#003b25] transition-colors whitespace-nowrap">
                    Uzhavan Connect
                  </span>
                  <span className="text-[10px] bg-[#eaf4ec] text-[#01472e] font-medium px-2 py-0.5 rounded-full border border-[#a3b18a]/40">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-[#5c7065] -mt-0.5 font-normal tracking-normal hidden sm:block">
                  {t('auth.operationalAccess', undefined, 'Demand-First Agricultural Intelligence')}
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Multilingual 22-Language Selector Quick Pill */}
            <button
              type="button"
              onClick={openLanguageSelector}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-white/90 hover:bg-white text-[#01472e] border border-[#ccd5ae]/80 shadow-2xs hover:border-[#01472e]/60 transition hover:scale-[1.02] cursor-pointer"
              title="Change Language (22 Constitutional Languages supported)"
              aria-label="Select Language"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#01472e] shrink-0" />
              <span className="font-bold tracking-tight">{currentLanguageDef.nativeName}</span>
              <span className="hidden md:inline text-[10px] text-slate-500 font-normal">({currentLanguageDef.name})</span>
            </button>

            {/* Authenticated session or Sign In / Register Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="btn-primary text-xs flex items-center gap-1.5 shadow-soft"
                >
                  <span>{t('nav.dashboard', undefined, 'Dashboard')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('login')}
                  className="btn-primary text-xs shadow-soft"
                >
                  {t('auth.signIn', undefined, 'Sign In')}
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="btn-secondary text-xs hidden sm:block"
                >
                  {t('auth.createAccount', undefined, 'Register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
