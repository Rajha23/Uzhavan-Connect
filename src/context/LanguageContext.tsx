import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LanguageDefinition, LanguageContextType, ScriptDirection } from '../types/i18n';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode } from '../i18n/languages';
import { getTranslation } from '../i18n/locales/translations';

const LANGUAGE_STORAGE_KEY = 'uzhavan_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize language from local persistence (or default English)
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageDefinition>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCode = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedCode) {
          return getLanguageByCode(savedCode);
        }
      }
    } catch (e) {
      console.warn('Failed to restore language preference from localStorage:', e);
    }
    return DEFAULT_LANGUAGE;
  });

  const [direction, setDirection] = useState<ScriptDirection>(currentLanguage.direction);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState<boolean>(false);
  const [isPostRegOnboardingOpen, setIsPostRegOnboardingOpen] = useState<boolean>(false);

  // Synchronize document direction and lang attributes
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

  // Update language, persist preference, and apply direction
  const setLanguage = useCallback((code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguageState(lang);
    setDirection(lang.direction);
    applyDocumentLocale(lang);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang.code);
      }
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }, [applyDocumentLocale]);

  // Initial sync on mount
  useEffect(() => {
    applyDocumentLocale(currentLanguage);
  }, [currentLanguage, applyDocumentLocale]);

  // Translation helper with parameters and fallback
  const t = useCallback((key: string, params?: Record<string, string | number>, defaultText?: string): string => {
    return getTranslation(currentLanguage.code, key, params, defaultText);
  }, [currentLanguage.code]);

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
  const formatNumber = useCallback((value: number): string => {
    if (isNaN(value) || value === null || value === undefined) return '0';
    try {
      return new Intl.NumberFormat('en-IN').format(value);
    } catch {
      return value.toLocaleString();
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
    completePostRegistrationOnboarding
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
