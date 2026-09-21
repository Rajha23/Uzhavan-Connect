import React, { useState } from 'react';
import { Globe2, ArrowRight, CheckCircle2, Sparkles, Compass, Languages, Loader2, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_LANGUAGES } from '../i18n/languages';

export const LanguageSettingsCard: React.FC = () => {
  const {
    currentLanguage,
    currentLanguageDef,
    setLanguage,
    openLanguageSelector,
    isAutoDetect,
    detectedLanguage,
    setAutoDetect,
    translateText,
    detectTextLanguage,
    t
  } = useLanguage();

  // Quick select picks for fast switching directly from the settings card
  const quickPicks = ['en', 'ta', 'hi', 'te', 'bn', 'mr', 'kn', 'ml'];

  // Real-time live translation test state
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedInputLang, setDetectedInputLang] = useState<string | null>(null);

  const handleTestTranslate = async () => {
    if (!testInput.trim()) return;
    setIsTranslating(true);
    try {
      const detected = detectTextLanguage(testInput);
      if (detected) {
        setDetectedInputLang(detected.nameEnglish);
      }
      const res = await translateText(testInput, currentLanguage.code);
      setTestOutput(res);
    } catch {
      setTestOutput(testInput);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ccd5ae]/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold shadow-inner">
            <Globe2 className="w-5 h-5 text-[#01472e]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#01472e] flex items-center gap-2">
              <span>{t('profile.languageSettings', 'Language & Script Preferences')}</span>
              <span className="text-[10px] font-semibold text-[#01472e] bg-[#e9edc9] px-2.5 py-0.5 rounded-full border border-[#ccd5ae]/80">
                {t('profile.constitutionalLanguages', '22 Constitutional Languages')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('profile.eighthSchedule', 'Automatic device detection & real-time multilingual translation')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openLanguageSelector}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white text-xs font-semibold shadow-sm transition hover:scale-[1.02] cursor-pointer"
        >
          <Globe2 className="w-4 h-4 text-[#fefae0]" />
          <span>{t('profile.changeLanguage', 'All 22 Languages')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Automatic Language Detection Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#eaf4ec] via-[#f7f9f7] to-white border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#01472e] text-[#fefae0] flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#01472e]">
                Device Language Auto-Detection
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  isAutoDetect
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {isAutoDetect ? 'Active & Auto-Syncing' : 'Manual Override'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Browser / System Locale detected:{' '}
              <strong className="text-[#01472e] font-bold">
                {detectedLanguage.nativeName} ({detectedLanguage.nameEnglish})
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAutoDetect ? (
            <button
              type="button"
              onClick={() => setAutoDetect(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#ccd5ae] text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Lock to Current Language
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAutoDetect(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#01472e] text-white hover:bg-[#025a3b] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Use Auto-Detection</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Language Spotlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#faf9f5] to-[#f4f7f4] border border-[#ccd5ae]/60 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {t('profile.currentActiveLanguage', 'Current Active Language')}
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
            <span>
              {isAutoDetect ? 'Auto-detected from your device' : t('profile.activePersistent', 'Active & Persistent across sessions')}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            {t('profile.scriptProfile', 'Script & Linguistic Profile')}
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
            {t('profile.primaryRegions', 'Primary Agrarian Regions')}
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
            {t('profile.quickSwitch', 'Quick Switch Popular Agrarian Languages')}
          </span>
          <button
            type="button"
            onClick={openLanguageSelector}
            className="text-xs font-bold text-[#01472e] hover:underline cursor-pointer"
          >
            {t('profile.viewAll22', 'View all 22 languages →')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
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

      {/* Real-Time Live Translation Utility */}
      <div className="pt-2 border-t border-[#ccd5ae]/40">
        <div className="p-5 rounded-2xl bg-white border border-[#ccd5ae]/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#01472e]" />
              <span className="text-xs font-bold text-[#01472e]">
                Live Dynamic Translation & Detection Engine
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Translates any custom query into {currentLanguageDef.nativeName}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestTranslate()}
              placeholder="Type any message, produce name, or question in any language..."
              className="flex-1 px-4 py-2.5 bg-[#faf9f5] border border-[#ccd5ae] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#01472e]"
            />
            <button
              type="button"
              onClick={handleTestTranslate}
              disabled={isTranslating || !testInput.trim()}
              className="px-4 py-2.5 bg-[#01472e] hover:bg-[#025a3b] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>

          {testOutput && (
            <div className="p-3 bg-[#eaf4ec] rounded-xl border border-emerald-200 text-xs flex flex-col gap-1 animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                <span>
                  {detectedInputLang ? `Detected Source: ${detectedInputLang}` : 'Source: Auto'} → Target: {currentLanguageDef.nativeName}
                </span>
                <span className="text-emerald-700">Dynamic Translation Ready</span>
              </div>
              <p className="text-sm font-bold text-[#01472e]">{testOutput}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
