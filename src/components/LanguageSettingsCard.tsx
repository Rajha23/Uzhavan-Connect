import React from 'react';
import { Globe2, ArrowRight, CheckCircle2, BookOpen, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_LANGUAGES } from '../i18n/languages';

export const LanguageSettingsCard: React.FC = () => {
  const { currentLanguage, currentLanguageDef, setLanguage, openLanguageSelector, t } = useLanguage();

  // Quick select picks for fast switching directly from the settings card
  const quickPicks = ['en', 'ta', 'hi', 'te', 'bn', 'mr'];

  return (
    <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ccd5ae]/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold shadow-inner">
            <Globe2 className="w-5 h-5 text-[#01472e]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#01472e] flex items-center gap-2">
              <span>{t('profile.languageSettings')}</span>
              <span className="text-[10px] font-semibold text-[#01472e] bg-[#e9edc9] px-2.5 py-0.5 rounded-full border border-[#ccd5ae]/80">
                22 Constitutional Languages
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Constitution of India (Eighth Schedule) certified multilingual accessibility
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openLanguageSelector}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white text-xs font-semibold shadow-sm transition hover:scale-[1.02] cursor-pointer"
        >
          <Globe2 className="w-4 h-4 text-[#fefae0]" />
          <span>{t('profile.changeLanguage')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Language Spotlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#faf9f5] to-[#f4f7f4] border border-[#ccd5ae]/60 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {t('profile.currentActiveLanguage')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#01472e]">
              {currentLanguageDef.nativeName}
            </span>
            <span className="text-sm font-semibold text-slate-700">
              ({currentLanguageDef.name})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active & Persistent across sessions</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Script & Linguistic Profile
          </span>
          <p className="text-xs font-semibold text-slate-800">
            {currentLanguageDef.script} Script
            <span className="ml-1 text-slate-500 font-normal">
              ({currentLanguageDef.direction.toUpperCase()})
            </span>
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            ISO: {currentLanguageDef.code.toUpperCase()} · ISO3: {currentLanguageDef.iso6393.toUpperCase()}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Primary Agrarian Regions
          </span>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {currentLanguageDef.regions.map((region) => (
              <span
                key={region}
                className="text-[10px] font-medium bg-white text-[#01472e] border border-[#ccd5ae]/70 px-2 py-0.5 rounded-md"
              >
                {region}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Switch Carousel/Pills */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Quick Switch Popular Agrarian Languages
          </span>
          <button
            type="button"
            onClick={openLanguageSelector}
            className="text-xs font-bold text-[#01472e] hover:underline cursor-pointer"
          >
            View all 22 Eighth Schedule languages →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {quickPicks.map((code) => {
            const lang = INDIAN_LANGUAGES[code];
            if (!lang) return null;
            const isSelected = currentLanguage.code === code;


            return (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#01472e] text-white border-[#01472e] shadow-sm scale-[1.02]'
                    : 'bg-[#faf9f5] hover:bg-white text-slate-800 border-[#ccd5ae]/60 hover:border-[#01472e]/50'
                }`}
              >
                <span className={`block text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {lang.nativeName}
                </span>
                <span className={`block text-[11px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {lang.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
