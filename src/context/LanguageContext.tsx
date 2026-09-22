import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { LanguageDefinition, LanguageContextType, ScriptDirection } from '../types/i18n';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode } from '../i18n/languages';
import { loadLanguageResources } from '../i18n/i18n';
import {
  detectBrowserLanguage,
  detectTextLanguage,
  translateText,
} from '../services/translationService';

const LANGUAGE_STORAGE_KEY = 'uzhavan_language';
const AUTODETECT_STORAGE_KEY = 'uzhavan_autodetect_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t: i18nT, i18n } = useI18nTranslation();

  const [detectedLanguage] = useState<LanguageDefinition>(() => detectBrowserLanguage(SUPPORTED_LANGUAGES));

  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const autoStored = localStorage.getItem(AUTODETECT_STORAGE_KEY);
        if (autoStored !== null) {
          return autoStored === 'true';
        }
        const savedCode = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return !savedCode;
      }
    } catch { }
    return true;
  });

  const [currentLanguage, setCurrentLanguageState] = useState<LanguageDefinition>(() => {
    try {
      if (typeof window !== 'undefined') {
        const autoStored = localStorage.getItem(AUTODETECT_STORAGE_KEY);
        const savedCode = localStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (autoStored === 'false' && savedCode) {
          return getLanguageByCode(savedCode);
        }

        const detected = detectBrowserLanguage(SUPPORTED_LANGUAGES);
        if (detected && detected.code) {
          return detected;
        }

        if (savedCode) {
          return getLanguageByCode(savedCode);
        }
      }
    } catch (e) {
      console.warn('Failed to restore language preference:', e);
    }
    return detectedLanguage || DEFAULT_LANGUAGE;
  });

  const [direction, setDirection] = useState<ScriptDirection>(currentLanguage.direction);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState<boolean>(false);
  const [isPostRegOnboardingOpen, setIsPostRegOnboardingOpen] = useState<boolean>(false);

  const applyDocumentLocale = useCallback((lang: LanguageDefinition) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang.code;
      document.documentElement.dir = lang.direction;
      if (lang.direction === 'rtl') {
        document.documentElement.classList.add('rtl-layout');
      } else {
        document.documentElement.classList.remove('rtl-layout');
      }
    }
  }, []);

  const setLanguage = useCallback(async (code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguageState(lang);
    setDirection(lang.direction);
    setIsAutoDetect(false);
    
    await loadLanguageResources(lang.code);
    await i18n.changeLanguage(lang.code);
    applyDocumentLocale(lang);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang.code);
        localStorage.setItem(AUTODETECT_STORAGE_KEY, 'false');
      }
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }, [applyDocumentLocale, i18n]);

  const setAutoDetect = useCallback(async (enable: boolean) => {
    setIsAutoDetect(enable);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTODETECT_STORAGE_KEY, enable ? 'true' : 'false');
      }
    } catch (e) {}

    if (enable) {
      const detected = detectBrowserLanguage(SUPPORTED_LANGUAGES);
      setCurrentLanguageState(detected);
      setDirection(detected.direction);
      await loadLanguageResources(detected.code);
      await i18n.changeLanguage(detected.code);
      applyDocumentLocale(detected);
    }
  }, [applyDocumentLocale, i18n]);

  useEffect(() => {
    // Initial sync
    loadLanguageResources(currentLanguage.code).then(() => {
      i18n.changeLanguage(currentLanguage.code);
    });
    applyDocumentLocale(currentLanguage);
  }, []);

  const t = useCallback((
    key: string,
    arg2?: Record<string, string | number> | string | any,
    arg3?: Record<string, string | number> | string | any
  ): string => {
    let params: Record<string, string | number> | undefined;
    let defaultText: string | undefined;

    if (typeof arg2 === 'string') {
      defaultText = arg2;
      if (typeof arg3 === 'object' && arg3 !== null) {
        params = arg3 as Record<string, string | number>;
      }
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      params = arg2 as Record<string, string | number>;
      if (typeof arg3 === 'string') {
        defaultText = arg3;
      }
    } else if (typeof arg3 === 'string') {
      defaultText = arg3;
    }
    
    // i18next interpolates {param} tags by default just like the old custom system
    const options = { ...params, defaultValue: defaultText || key };
    return i18nT(key, options);
  }, [i18nT]);

  const handleTranslateText = useCallback(
    async (text: string, targetLang?: string, sourceLang?: string): Promise<string> => {
      return translateText(text, targetLang || currentLanguage.code, sourceLang || 'auto');
    },
    [currentLanguage.code]
  );

  const handleDetectTextLanguage = useCallback((text: string): LanguageDefinition | null => {
    return detectTextLanguage(text, SUPPORTED_LANGUAGES);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `₹${amount.toLocaleString()}`;
    }
  }, []);

  const formatNumber = useCallback((value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num === null || num === undefined) return String(value || '0');
    try {
      return new Intl.NumberFormat('en-IN').format(num);
    } catch {
      return num.toLocaleString();
    }
  }, []);

  const formatDate = useCallback((date: string | Date): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return String(date);
      return d.toLocaleDateString(currentLanguage.code === 'en' ? 'en-IN' : `${currentLanguage.code}-IN`, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return String(date);
    }
  }, [currentLanguage.code]);

  const openLanguageSelector = useCallback(() => setIsLanguageSelectorOpen(true), []);
  const closeLanguageSelector = useCallback(() => setIsLanguageSelectorOpen(false), []);
  const startPostRegistrationOnboarding = useCallback(() => setIsPostRegOnboardingOpen(true), []);
  const completePostRegistrationOnboarding = useCallback(() => setIsPostRegOnboardingOpen(false), []);

  const contextValue: LanguageContextType = {
    currentLanguage,
    currentLanguageDef: currentLanguage,
    direction,
    setLanguage,
    t,
    formatCurrency,
    formatNumber,
    formatDate,
    isLanguageSelectorOpen,
    openLanguageSelector,
    closeLanguageSelector,
    isPostRegOnboardingOpen,
    startPostRegistrationOnboarding,
    completePostRegistrationOnboarding,

    isAutoDetect,
    detectedLanguage,
    setAutoDetect,
    translateText: handleTranslateText,
    detectTextLanguage: handleDetectTextLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  return useLanguage();
};
