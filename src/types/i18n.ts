export type ScriptDirection = 'ltr' | 'rtl';

export interface LanguageDefinition {
  code: string;           // Primary application locale identifier (ISO 639-1 or ISO 639-3)
  nameEnglish: string;    // Standard English name
  name?: string;          // Alias for nameEnglish
  nativeName: string;     // Native script display name
  iso6391: string;        // ISO 639-1 two-letter code where applicable
  iso6393: string;        // ISO 639-3 three-letter code
  script: string;         // Script name (Tamil, Devanagari, Gurmukhi, Ol Chiki, etc.)
  direction: ScriptDirection; // 'ltr' or 'rtl'
  regions: string[];      // Primary Indian states / regions (hint only)
}

export type TranslationMap = Record<string, string>;

export interface TranslationDictionary {
  common: TranslationMap;
  nav: TranslationMap;
  farmer: TranslationMap;
  buyer: TranslationMap;
  bulkBuyer: TranslationMap;
  fpo: TranslationMap;
  logistics: TranslationMap;
  admin: TranslationMap;
  ai: TranslationMap;
  traceability: TranslationMap;
  settlement: TranslationMap;
  profile: TranslationMap;
  auth: TranslationMap;
  onboarding: TranslationMap;
  landing: TranslationMap;
}

export interface LanguageContextType {
  currentLanguage: LanguageDefinition;
  currentLanguageDef: LanguageDefinition; // Convenient alias for currentLanguage
  direction: ScriptDirection;
  setLanguage: (code: string) => void;

  t: (key: string, params?: Record<string, string | number>, defaultText?: string) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (value: number) => string;
  formatDate: (date: string | Date) => string;
  isLanguageSelectorOpen: boolean;
  openLanguageSelector: () => void;
  closeLanguageSelector: () => void;
  isPostRegOnboardingOpen: boolean;
  startPostRegistrationOnboarding: () => void;
  completePostRegistrationOnboarding: () => void;
}
