import { TranslationDictionary } from '../../types/i18n';
import { enTranslations } from './en';
import { getCachedTranslation, translateText } from '../../services/translationService';

/**
 * UZHAVAN CONNECT — Dynamic Multilingual Translation Registry
 * Eliminates statically hardcoded 23 language files in favor of
 * canonical English base definitions and automated real-time translation.
 */
export const TRANSLATIONS_REGISTRY: Record<string, any> = {
  en: enTranslations
};

const resolvePath = (dict: any, path: string[]): string | undefined => {
  let curr = dict;
  for (const seg of path) {
    if (!curr || typeof curr !== 'object') return undefined;
    curr = curr[seg];
  }
  return typeof curr === 'string' ? curr : undefined;
};

// Pending translation queue to avoid duplicate dynamic requests
const pendingTranslationKeys = new Set<string>();

/**
 * Resolves a translation key dynamically:
 * - English is resolved from canonical base vocabulary
 * - Other languages check dynamic memory/localStorage translation cache
 * - Misses trigger real-time background dynamic translation and notify context
 */
export const getTranslation = (
  langCode: string,
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

  if (!key) return defaultText || '';

  // 1. Resolve base English text from canonical dictionary
  const parts = key.split('.');
  let englishText: string | undefined;

  if (parts.length >= 2) {
    englishText = resolvePath(enTranslations, parts);
  } else {
    englishText = (enTranslations as any)?.common?.[key] || (enTranslations as any)?.[key];
  }

  const baseText = englishText || defaultText || key;

  // 2. If target is English or already translated
  if (langCode === 'en' || !langCode) {
    let res = baseText;
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        res = res.replace(new RegExp('\\{' + paramKey + '\\}', 'g'), String(val));
      });
    }
    return res;
  }

  // 3. Look up dynamic real-time translation cache
  const cached = getCachedTranslation(baseText, langCode);
  if (cached) {
    let res = cached;
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        res = res.replace(new RegExp('\\{' + paramKey + '\\}', 'g'), String(val));
      });
    }
    return res;
  }

  // 4. Trigger asynchronous real-time translation if not yet queued
  const queueKey = `${langCode}:${baseText}`;
  if (!pendingTranslationKeys.has(queueKey)) {
    pendingTranslationKeys.add(queueKey);
    translateText(baseText, langCode)
      .catch(() => {
        // Fallback silently
      })
      .finally(() => {
        pendingTranslationKeys.delete(queueKey);
      });
  }

  // Return base text while dynamic translation completes
  let res = baseText;
  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      res = res.replace(new RegExp('\\{' + paramKey + '\\}', 'g'), String(val));
    });
  }
  return res;
};
