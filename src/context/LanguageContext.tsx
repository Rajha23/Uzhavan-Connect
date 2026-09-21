import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { LanguageDefinition, LanguageContextType, ScriptDirection } from '../types/i18n';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode } from '../i18n/languages';
import { getTranslation } from '../i18n/locales/translations';
import {
  detectBrowserLanguage,
  detectTextLanguage,
  translateText,
  getCachedTranslation,
  startDOMTranslation,
  stopDOMTranslation,
  addTranslationListener
} from '../services/translationService';

const LANGUAGE_STORAGE_KEY = 'uzhavan_language';
const AUTODETECT_STORAGE_KEY = 'uzhavan_autodetect_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 1. Detect browser / device language automatically
  const [detectedLanguage] = useState<LanguageDefinition>(() => {
    return detectBrowserLanguage(SUPPORTED_LANGUAGES);
  });

  // 2. Track whether auto-detection is active (defaults to true if user hasn't explicitly set a preference)
  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const autoStored = localStorage.getItem(AUTODETECT_STORAGE_KEY);
        if (autoStored !== null) {
          return autoStored === 'true';
        }
        // If there's no saved manual language, enable auto-detect by default
        const savedCode = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return !savedCode;
      }
    } catch {
      // Default to auto-detect
    }
    return true;
  });

  // 3. Initialize active language based on auto-detection or saved preference
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageDefinition>(() => {
    try {
      if (typeof window !== 'undefined') {
        const autoStored = localStorage.getItem(AUTODETECT_STORAGE_KEY);
        const savedCode = localStorage.getItem(LANGUAGE_STORAGE_KEY);

        // If explicitly set to manual and valid savedCode exists
        if (autoStored === 'false' && savedCode) {
          return getLanguageByCode(savedCode);
        }

        // If no explicit manual lock, use detected browser language
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
  const [translationRevision, setTranslationRevision] = useState<number>(0);

  // Subscribe to dynamic translation events so the UI reactively updates when translations arrive
  useEffect(() => {
    const unsubscribe = addTranslationListener(() => {
      setTranslationRevision((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  // Synchronize document direction, lang attributes, and whole-DOM dynamic translation
  const applyDocumentLocale = useCallback((lang: LanguageDefinition) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang.code;
      document.documentElement.dir = lang.direction;
      if (lang.direction === 'rtl') {
        document.documentElement.classList.add('rtl-layout');
      } else {
        document.documentElement.classList.remove('rtl-layout');
      }
      // Trigger continuous whole-page dynamic DOM translation
      startDOMTranslation(lang.code);
    }
  }, []);

  // Update language manually, persist preference, disable auto-detect
  const setLanguage = useCallback((code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguageState(lang);
    setDirection(lang.direction);
    setIsAutoDetect(false);
    applyDocumentLocale(lang);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang.code);
        localStorage.setItem(AUTODETECT_STORAGE_KEY, 'false');
      }
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }, [applyDocumentLocale]);

  // Toggle Auto-Detect mode
  const setAutoDetect = useCallback((enable: boolean) => {
    setIsAutoDetect(enable);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTODETECT_STORAGE_KEY, enable ? 'true' : 'false');
      }
    } catch (e) {
      console.warn('Failed to save auto-detect setting:', e);
    }

    if (enable) {
      const detected = detectBrowserLanguage(SUPPORTED_LANGUAGES);
      setCurrentLanguageState(detected);
      setDirection(detected.direction);
      applyDocumentLocale(detected);
    }
  }, [applyDocumentLocale]);

  // Initial sync on mount and cleanup on unmount
  useEffect(() => {
    applyDocumentLocale(currentLanguage);
    return () => {
      stopDOMTranslation();
    };
  }, [currentLanguage, applyDocumentLocale]);

  // Translation helper with parameters and reactive dynamic translation
  const t = useCallback((
    key: string,
    arg2?: Record<string, string | number> | string | any,
    arg3?: Record<string, string | number> | string | any
  ): string => {
    return getTranslation(currentLanguage.code, key, arg2, arg3);
  }, [currentLanguage.code, translationRevision]);

  // Dynamic text translation for arbitrary user content or API responses
  const handleTranslateText = useCallback(
    async (text: string, targetLang?: string, sourceLang?: string): Promise<string> => {
      return translateText(text, targetLang || currentLanguage.code, sourceLang || 'auto');
    },
    [currentLanguage.code]
  );

  // Dynamic text language detector
  const handleDetectTextLanguage = useCallback((text: string): LanguageDefinition | null => {
    return detectTextLanguage(text, SUPPORTED_LANGUAGES);
  }, []);

  // Indian Numbering Currency Formatter (₹1,25,000)
  const formatCurrency = useCallback((amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
    try {
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
      return formatted;
    } catch {
      return `₹${amount.toLocaleString()}`;
    }
  }, []);

  // Indian Locale Number Formatter (1,25,000)
  const formatNumber = useCallback((value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num === null || num === undefined) return String(value || '0');
    try {
      return new Intl.NumberFormat('en-IN').format(num);
    } catch {
      return num.toLocaleString();
    }
  }, []);

  // Locale-aware Date Formatter
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

  const openLanguageSelector = useCallback(() => {
    setIsLanguageSelectorOpen(true);
  }, []);

  const closeLanguageSelector = useCallback(() => {
    setIsLanguageSelectorOpen(false);
  }, []);

  const startPostRegistrationOnboarding = useCallback(() => {
    setIsPostRegOnboardingOpen(true);
  }, []);

  const completePostRegistrationOnboarding = useCallback(() => {
    setIsPostRegOnboardingOpen(false);
  }, []);

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

    // Language Detection & Dynamic Translation extensions
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

// Convenient alias
export const useTranslation = () => {
  return useLanguage();
};
