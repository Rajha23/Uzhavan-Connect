import { LanguageDefinition } from '../types/i18n';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getLanguageByCode } from '../i18n/languages';

const TRANSLATION_CACHE_KEY = 'uzhavan_translation_cache_v1';
const MAX_CACHE_SIZE = 3000;

// In-memory translation cache initialized from localStorage
const memoryCache = new Map<string, string>();

// Subscribed listeners for reactive re-renders when async translations complete
const translationListeners = new Set<() => void>();

export const addTranslationListener = (cb: () => void): (() => void) => {
  translationListeners.add(cb);
  return () => {
    translationListeners.delete(cb);
  };
};

export const notifyTranslationListeners = (): void => {
  translationListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.warn('[TranslationService] Error in listener callback:', e);
    }
  });
};

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
 * Automatically detects the user's preferred language from browser, system, and locale settings.
 * Checks navigator.languages, navigator.language, Intl API, and matches against supported languages.
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
  if ((navigator as any).userLanguage) {
    browserLocales.push((navigator as any).userLanguage);
  }

  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (intlLocale) {
      browserLocales.push(intlLocale);
    }
  } catch {
    // Ignore Intl resolution failure
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

    // Check primary 2-letter or 3-letter tag match (e.g. 'ta-IN' -> 'ta')
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
          notifyTranslationListeners();
          return translated;
        }
      }
    }
  } catch {
    // Fallback to secondary service
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
        notifyTranslationListeners();
        return translated;
      }
    }
  } catch {
    // Ignore and return original
  }

  return text;
};

/**
 * Batch translation helper for efficiently translating multiple texts concurrently.
 */
export const translateBatch = async (
  texts: string[],
  targetLang: string,
  sourceLang: string = 'auto'
): Promise<Map<string, string>> => {
  const result = new Map<string, string>();
  if (!texts || texts.length === 0) return result;

  const uniqueTexts = Array.from(new Set(texts.map((t) => t.trim()))).filter(Boolean);
  const uncached: string[] = [];

  for (const text of uniqueTexts) {
    const cached = getCachedTranslation(text, targetLang, sourceLang);
    if (cached) {
      result.set(text, cached);
    } else {
      uncached.push(text);
    }
  }

  if (uncached.length === 0 || targetLang === 'en') {
    return result;
  }

  // Translate uncached in chunks of 5
  const chunkSize = 5;
  for (let i = 0; i < uncached.length; i += chunkSize) {
    const chunk = uncached.slice(i, i + chunkSize);
    await Promise.allSettled(
      chunk.map(async (text) => {
        try {
          const trans = await translateText(text, targetLang, sourceLang);
          result.set(text, trans);
        } catch {
          result.set(text, text);
        }
      })
    );
  }

  return result;
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

// ── Whole-App Dynamic DOM Translator ──────────────────────────────────────────
// Automatically scans, detects, and translates text nodes in the DOM into target language

const originalTextMap = new WeakMap<Node, string>();
let currentDomTargetLang = 'en';
let domMutationObserver: MutationObserver | null = null;
let domDebounceTimer: any = null;

const shouldSkipNode = (node: Node): boolean => {
  const parent = node.parentElement;
  if (!parent) return true;

  const tag = parent.tagName.toUpperCase();
  if (
    tag === 'SCRIPT' ||
    tag === 'STYLE' ||
    tag === 'NOSCRIPT' ||
    tag === 'CODE' ||
    tag === 'PRE' ||
    tag === 'TEXTAREA' ||
    tag === 'INPUT' ||
    tag === 'SVG' ||
    tag === 'PATH'
  ) {
    return true;
  }

  if (
    parent.getAttribute('data-no-translate') === 'true' ||
    parent.getAttribute('translate') === 'no' ||
    parent.classList.contains('notranslate') ||
    parent.isContentEditable
  ) {
    return true;
  }

  return false;
};

const isTranslatableText = (val: string): boolean => {
  const trimmed = val.trim();
  if (!trimmed || trimmed.length < 2) return false;
  // Skip pure numbers, punctuation, currency codes without text
  if (/^[0-9₹$,.:;!?/\\\-+%*#@()\[\]{}|'"\s]+$/.test(trimmed)) {
    return false;
  }
  return true;
};

const processDOMSubtree = (root: Node, targetLang: string) => {
  if (typeof document === 'undefined') return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodesToTranslate: { node: Node; originalText: string }[] = [];

  let currentNode = walker.nextNode();
  while (currentNode) {
    const rawVal = currentNode.nodeValue || '';
    if (isTranslatableText(rawVal)) {
      if (!originalTextMap.has(currentNode)) {
        originalTextMap.set(currentNode, rawVal);
      }
      const orig = originalTextMap.get(currentNode)!;

      if (targetLang === 'en') {
        if (currentNode.nodeValue !== orig) {
          currentNode.nodeValue = orig;
        }
      } else {
        const cached = getCachedTranslation(orig.trim(), targetLang);
        if (cached) {
          // Replace matching trimmed portion while preserving edge spaces
          const leadingSpace = orig.match(/^\s*/)?.[0] || '';
          const trailingSpace = orig.match(/\s*$/)?.[0] || '';
          currentNode.nodeValue = leadingSpace + cached + trailingSpace;
        } else {
          textNodesToTranslate.push({ node: currentNode, originalText: orig.trim() });
        }
      }
    }
    currentNode = walker.nextNode();
  }

  if (targetLang !== 'en' && textNodesToTranslate.length > 0) {
    const texts = textNodesToTranslate.map((item) => item.originalText);
    translateBatch(texts, targetLang).then((transMap) => {
      textNodesToTranslate.forEach(({ node, originalText }) => {
        const trans = transMap.get(originalText);
        if (trans && node.parentElement) {
          const origFull = originalTextMap.get(node) || originalText;
          const leadingSpace = origFull.match(/^\s*/)?.[0] || '';
          const trailingSpace = origFull.match(/\s*$/)?.[0] || '';
          node.nodeValue = leadingSpace + trans + trailingSpace;
        }
      });
    });
  }
};

/**
 * Starts continuous dynamic DOM auto-translation for the entire application.
 * Listens for new DOM nodes and translates them automatically into targetLang.
 */
export const startDOMTranslation = (targetLang: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  currentDomTargetLang = targetLang.toLowerCase();

  // Initial pass on document.body
  processDOMSubtree(document.body, currentDomTargetLang);

  if (!domMutationObserver) {
    domMutationObserver = new MutationObserver((mutations) => {
      if (currentDomTargetLang === 'en') return;

      clearTimeout(domDebounceTimer);
      domDebounceTimer = setTimeout(() => {
        for (const mut of mutations) {
          if (mut.type === 'childList') {
            mut.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                processDOMSubtree(node, currentDomTargetLang);
              }
            });
          }
        }
      }, 100);
    });

    domMutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Also trigger Google Translate DOM sync if enabled
  syncGoogleTranslateDOM(targetLang);
};

export const stopDOMTranslation = (): void => {
  if (domMutationObserver) {
    domMutationObserver.disconnect();
    domMutationObserver = null;
  }
};

/**
 * Initializes Google Translate full-DOM auto-translation integration as a fallback.
 */
export const syncGoogleTranslateDOM = (targetLang: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const lang = targetLang.toLowerCase();
    const cookieVal = targetLang === 'en' ? '' : `/auto/${lang}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;

    let container = document.getElementById('google_translate_element');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      document.body.appendChild(container);
    }

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

