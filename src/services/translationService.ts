import { LanguageDefinition } from '../types/i18n';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getLanguageByCode } from '../i18n/languages';

const TRANSLATION_CACHE_KEY = 'uzhavan_translation_cache_v1';
const MAX_CACHE_SIZE = 1500;

// In-memory translation cache initialized from localStorage
const memoryCache = new Map<string, string>();

const loadCache = (): void => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TRANSLATION_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([k, v]) => {
          if (typeof v === 'string') {
            memoryCache.set(k, v);
          }
        });
      }
    }
  } catch (e) {
    console.warn('[TranslationService] Failed to load translation cache:', e);
  }
};

const saveCache = (): void => {
  try {
    if (typeof window !== 'undefined') {
      // Trim if cache size exceeds limit
      if (memoryCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(memoryCache.entries()).slice(-MAX_CACHE_SIZE);
        memoryCache.clear();
        entries.forEach(([k, v]) => memoryCache.set(k, v));
      }
      const obj: Record<string, string> = {};
      memoryCache.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(obj));
    }
  } catch (e) {
    console.warn('[TranslationService] Failed to persist translation cache:', e);
  }
};

// Initialize cache on import
loadCache();

/**
 * Automatically detects the user's preferred language from browser and system settings.
 * Checks navigator.languages, navigator.language, and matches ISO codes against supported languages.
 */
export const detectBrowserLanguage = (
  supportedLanguages: LanguageDefinition[] = SUPPORTED_LANGUAGES
): LanguageDefinition => {
  if (typeof window === 'undefined' || !navigator) {
    return DEFAULT_LANGUAGE;
  }

  const browserLocales: string[] = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    browserLocales.push(...navigator.languages);
  }
  if (navigator.language) {
    browserLocales.push(navigator.language);
  }

  for (const rawLocale of browserLocales) {
    if (!rawLocale) continue;
    const clean = rawLocale.trim().toLowerCase();
    const primaryTag = clean.split('-')[0].split('_')[0];

    // Check exact match on code, iso6391, or iso6393
    const exactMatch = supportedLanguages.find(
      (l) =>
        l.code.toLowerCase() === clean ||
        l.iso6391.toLowerCase() === clean ||
        l.iso6393.toLowerCase() === clean
    );
    if (exactMatch) {
      return { ...exactMatch, name: exactMatch.nameEnglish };
    }

    // Check primary 2-letter or 3-letter tag match
    const primaryMatch = supportedLanguages.find(
      (l) =>
        l.code.toLowerCase() === primaryTag ||
        l.iso6391.toLowerCase() === primaryTag ||
        l.iso6393.toLowerCase() === primaryTag
    );
    if (primaryMatch) {
      return { ...primaryMatch, name: primaryMatch.nameEnglish };
    }
  }

  return DEFAULT_LANGUAGE;
};

/**
 * Detects the script and language of any arbitrary text using Unicode character ranges.
 */
export const detectTextLanguage = (
  text: string,
  supportedLanguages: LanguageDefinition[] = SUPPORTED_LANGUAGES
): LanguageDefinition | null => {
  if (!text || typeof text !== 'string') return null;
  const sample = text.slice(0, 300);

  // Tamil script: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(sample)) {
    return getLanguageByCode('ta');
  }
  // Telugu script: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(sample)) {
    return getLanguageByCode('te');
  }
  // Kannada script: \u0C80-\u0CFF
  if (/[\u0C80-\u0CFF]/.test(sample)) {
    return getLanguageByCode('kn');
  }
  // Malayalam script: \u0D00-\u0D7F
  if (/[\u0D00-\u0D7F]/.test(sample)) {
    return getLanguageByCode('ml');
  }
  // Bengali / Assamese: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(sample)) {
    if (/[\u09F0\u09F1]/.test(sample)) {
      return getLanguageByCode('as');
    }
    return getLanguageByCode('bn');
  }
  // Gujarati: \u0A80-\u0AFF
  if (/[\u0A80-\u0AFF]/.test(sample)) {
    return getLanguageByCode('gu');
  }
  // Gurmukhi (Punjabi): \u0A00-\u0A7F
  if (/[\u0A00-\u0A7F]/.test(sample)) {
    return getLanguageByCode('pa');
  }
  // Odia: \u0B00-\u0B7F
  if (/[\u0B00-\u0B7F]/.test(sample)) {
    return getLanguageByCode('or');
  }
  // Arabic / Urdu / Kashmiri / Sindhi: \u0600-\u06FF
  if (/[\u0600-\u06FF\u0750-\u077F]/.test(sample)) {
    return getLanguageByCode('ur');
  }
  // Ol Chiki (Santali): \u1C50-\u1C7F
  if (/[\u1C50-\u1C7F]/.test(sample)) {
    return getLanguageByCode('sat');
  }
  // Devanagari (Hindi, Marathi, Sanskrit, Dogri, Bodo, Maithili, Nepali): \u0900-\u097F
  if (/[\u0900-\u097F]/.test(sample)) {
    return getLanguageByCode('hi');
  }
  // Latin / English
  if (/[a-zA-Z]/.test(sample)) {
    return getLanguageByCode('en');
  }

  return null;
};

/**
 * Real-time dynamic translation API with persistent memory and localStorage cache.
 * Translates any string dynamically on the fly into the target language.
 */
export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang: string = 'auto'
): Promise<string> => {
  const trimmed = text?.trim();
  if (!trimmed) return text;
  if (targetLang === 'en' && /^[a-zA-Z0-9\s.,!?:;'"()\/\-%₹]+$/.test(trimmed)) {
    return text;
  }
  if (sourceLang === targetLang) {
    return text;
  }

  const cacheKey = `${sourceLang}_${targetLang}_${trimmed}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 1. Attempt Google GTX Translation Endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('');
        if (translated && typeof translated === 'string') {
          memoryCache.set(cacheKey, translated);
          saveCache();
          return translated;
        }
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Attempt MyMemory Translation Fallback API
  try {
    const sl = sourceLang === 'auto' ? 'en' : sourceLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${sl}|${targetLang}`;
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && typeof translated === 'string' && !translated.startsWith('MYMEMORY WARNING')) {
        memoryCache.set(cacheKey, translated);
        saveCache();
        return translated;
      }
    }
  } catch {
    // Ignore and fallback
  }

  return text;
};

/**
 * Helper to get synchronously cached translation if available.
 */
export const getCachedTranslation = (
  text: string,
  targetLang: string,
  sourceLang: string = 'auto'
): string | undefined => {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  const cacheKey = `${sourceLang}_${targetLang}_${trimmed}`;
  return memoryCache.get(cacheKey);
};

/**
 * Initializes Google Translate full-DOM auto-translation integration.
 * Enables whole-page dynamic translation for any language.
 */
export const syncGoogleTranslateDOM = (targetLang: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const lang = targetLang.toLowerCase();
    // Set google translate cookie for auto-translation
    const cookieVal = targetLang === 'en' ? '' : `/auto/${lang}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;

    // Ensure hidden container exists
    let container = document.getElementById('google_translate_element');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    // Load Google Translate script if not yet loaded
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      };

      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // Trigger select change on google translate combo if mounted
    setTimeout(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }
    }, 400);
  } catch (e) {
    console.warn('[TranslationService] DOM translation sync warning:', e);
  }
};
