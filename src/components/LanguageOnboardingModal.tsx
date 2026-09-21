import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { searchLanguages } from '../i18n/languages';
import { Sprout, Search, Check, ArrowRight, Globe } from 'lucide-react';

export const LanguageOnboardingModal: React.FC = () => {
  const {
    currentLanguage,
    setLanguage,
    isPostRegOnboardingOpen,
    completePostRegistrationOnboarding,
    detectedLanguage,
    setAutoDetect,
    t
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(currentLanguage.code);

  if (!isPostRegOnboardingOpen) return null;

  const filteredLanguages = searchLanguages(searchQuery);

  const handleConfirmAndProceed = () => {
    setLanguage(selectedCode);
    completePostRegistrationOnboarding();
  };

  const handleUseAutoDetect = () => {
    setAutoDetect(true);
    completePostRegistrationOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white max-w-3xl w-full rounded-[40px] border border-[#ccd5ae]/60 shadow-forest overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Welcome Header */}
        <div className="relative overflow-hidden p-7 sm:p-9 bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-[#013824] border border-[#ccd5ae]/40 text-[#fefae0] flex items-center justify-center text-3xl shadow-xl shrink-0">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#fefae0]/15 text-[#fefae0] px-3 py-0.5 rounded-full text-[11px] font-semibold mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Multilingual Agricultural Operating System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {t('onboarding.welcomeTitle', undefined, 'Welcome to UZHAVAN Connect 🌱')}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
                {t('onboarding.welcomeSubtitle', undefined, 'Choose your preferred language for the platform')}
              </p>
            </div>
          </div>
        </div>

        {/* Change Anytime Subtitle Notice */}
        <div className="px-7 py-3 bg-[#faf9f5] border-b border-[#ccd5ae]/40 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{t('onboarding.changeAnytimeNote', undefined, 'You can change this anytime from Settings.')}</span>
          <span className="text-[11px] font-bold text-[#01472e] bg-[#eaf4ec] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
            22 Languages Available
          </span>
        </div>

        {/* Device Language Auto-Detection Recommendation */}
        <div className="px-7 py-3 bg-gradient-to-r from-[#eaf4ec] to-[#f4f7f4] border-b border-[#ccd5ae]/40 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-[#01472e]">Auto-Detected Device Language: </span>
            <span className="font-semibold text-slate-800">
              {detectedLanguage.nativeName} ({detectedLanguage.nameEnglish})
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseAutoDetect}
            className="px-3.5 py-1 bg-[#01472e] hover:bg-[#025a3b] text-white text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer"
          >
            Auto-Detect & Continue
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-7 py-3.5 border-b border-[#ccd5ae]/30 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language (e.g. தமிழ், Telugu, हिन्दी, বাংলা, kn, ta)..."
              className="w-full bg-[#faf9f5] border border-[#ccd5ae] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] focus:bg-white transition"
              autoFocus
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[50vh]">
          {filteredLanguages.map((lang) => {
            const isSelected = lang.code === selectedCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedCode(lang.code)}
                className={`p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'bg-[#eaf4ec] border-[#01472e] shadow-sm ring-1 ring-[#01472e]'
                    : 'bg-white hover:bg-[#faf9f5] border-[#ccd5ae]/60 hover:border-[#01472e]/50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#01472e] leading-snug">
                      {lang.nativeName}
                    </span>
                    {lang.direction === 'rtl' && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono font-semibold">
                        RTL
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {lang.nameEnglish}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate font-normal">
                    {lang.regions.slice(0, 2).join(' • ')}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#01472e] text-[#fefae0] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[#ccd5ae] group-hover:border-[#01472e] transition" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-[#ccd5ae]/40 bg-[#faf9f5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-medium">
            Selected:{' '}
            <strong className="text-[#01472e] font-bold text-sm">
              {filteredLanguages.find((l) => l.code === selectedCode)?.nativeName || selectedCode} (
              {filteredLanguages.find((l) => l.code === selectedCode)?.nameEnglish}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleConfirmAndProceed}
            className="w-full sm:w-auto px-8 py-3 bg-[#01472e] hover:bg-[#025a3b] text-white font-bold rounded-2xl shadow-md transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <span>{t('onboarding.continueBtn', undefined, 'Continue to Platform')}</span>
            <ArrowRight className="w-4 h-4 text-[#e9edc9]" />
          </button>
        </div>
      </div>
    </div>
  );
};
