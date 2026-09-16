import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, searchLanguages } from '../i18n/languages';
import { Search, Globe, Check, X } from 'lucide-react';

export const LanguageSelectorModal: React.FC = () => {
  const { currentLanguage, setLanguage, isLanguageSelectorOpen, closeLanguageSelector, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLanguageSelectorOpen) return null;

  const filteredLanguages = searchLanguages(searchQuery);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    closeLanguageSelector();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white max-w-2xl w-full rounded-[36px] border border-[#ccd5ae]/60 shadow-forest overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#ccd5ae]/40 flex items-center justify-between bg-gradient-to-r from-[#faf9f5] to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#01472e] flex items-center justify-center text-[#fefae0] shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="language-modal-title" className="text-xl font-bold tracking-tight text-[#01472e]">
                {t('onboarding.chooseLanguage', undefined, 'Choose Language / மொழி தேர்வு')}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                22 Eighth Schedule Indian Languages Supported
              </p>
            </div>
          </div>
          <button
            onClick={closeLanguageSelector}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-[#01472e] hover:bg-[#faf9f5] border border-transparent hover:border-[#ccd5ae]/50 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3.5 border-b border-[#ccd5ae]/30 bg-[#faf9f5]/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, script, or ISO code (e.g. Tamil, தமிழ், hi, kn)..."
              className="w-full bg-white border border-[#ccd5ae] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#01472e] shadow-2xs transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Language Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh]">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`p-4 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer group ${
                    isSelected
                      ? 'bg-[#eaf4ec] border-[#01472e] shadow-xs'
                      : 'bg-white hover:bg-[#faf9f5] border-[#ccd5ae]/60 hover:border-[#01472e]/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#01472e] leading-snug">
                        {lang.nativeName}
                      </span>
                      {lang.direction === 'rtl' && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-semibold">
                          RTL
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {lang.nameEnglish}
                      <span className="text-slate-400 font-normal ml-1 font-mono text-[10px]">
                        ({lang.iso6391 || lang.iso6393})
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 truncate font-normal">
                      {lang.regions.slice(0, 2).join(' • ')}
                    </p>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#01472e] text-[#fefae0] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-[#ccd5ae] group-hover:border-[#01472e] transition" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-2 py-10 text-center text-xs text-slate-500">
              No language matches "{searchQuery}". Try searching by English name, native script, or ISO code.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#ccd5ae]/40 bg-[#faf9f5] flex items-center justify-between text-xs text-slate-500">
          <span>Current: <strong className="text-[#01472e] font-bold">{currentLanguage.nativeName} ({currentLanguage.nameEnglish})</strong></span>
          <button
            onClick={closeLanguageSelector}
            className="px-5 py-2 bg-white hover:bg-slate-100 border border-[#ccd5ae] text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
