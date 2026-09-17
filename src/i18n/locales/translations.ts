import { TranslationDictionary } from '../../types/i18n';
import { asTranslations } from './as';
import { bnTranslations } from './bn';
import { brTranslations } from './br';
import { doiTranslations } from './doi';
import { enTranslations } from './en';
import { guTranslations } from './gu';
import { hiTranslations } from './hi';
import { knTranslations } from './kn';
import { kokTranslations } from './kok';
import { ksTranslations } from './ks';
import { maiTranslations } from './mai';
import { mlTranslations } from './ml';
import { mniTranslations } from './mni';
import { mrTranslations } from './mr';
import { neTranslations } from './ne';
import { orTranslations } from './or';
import { paTranslations } from './pa';
import { saTranslations } from './sa';
import { satTranslations } from './sat';
import { sdTranslations } from './sd';
import { taTranslations } from './ta';
import { teTranslations } from './te';
import { urTranslations } from './ur';

export const TRANSLATIONS_REGISTRY: Record<string, any> = {
  as: asTranslations,
  bn: bnTranslations,
  br: brTranslations,
  doi: doiTranslations,
  en: enTranslations,
  gu: guTranslations,
  hi: hiTranslations,
  kn: knTranslations,
  kok: kokTranslations,
  ks: ksTranslations,
  mai: maiTranslations,
  ml: mlTranslations,
  mni: mniTranslations,
  mr: mrTranslations,
  ne: neTranslations,
  or: orTranslations,
  pa: paTranslations,
  sa: saTranslations,
  sat: satTranslations,
  sd: sdTranslations,
  ta: taTranslations,
  te: teTranslations,
  ur: urTranslations,
};

/**
 * Resolves a translation key with deep fallback:
 * Selected Language -> English Dictionary -> Fallback Text -> Raw Key
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

  const targetDict = TRANSLATIONS_REGISTRY[langCode] || TRANSLATIONS_REGISTRY.en;

  const resolve = (dict: any, path: string[]): string | undefined => {
    let curr = dict;
    for (const seg of path) {
      if (!curr || typeof curr !== 'object') return undefined;
      curr = curr[seg];
    }
    return typeof curr === 'string' ? curr : undefined;
  };

  const parts = key.split('.');
  let translated: string | undefined;

  if (parts.length >= 2) {
    translated = resolve(targetDict, parts);
    if (!translated && langCode !== 'en') {
      translated = resolve(TRANSLATIONS_REGISTRY.en, parts);
    }
  } else {
    translated = targetDict?.common?.[key] || (targetDict as any)?.[key];
    if (!translated && langCode !== 'en') {
      translated = TRANSLATIONS_REGISTRY.en?.common?.[key] || (TRANSLATIONS_REGISTRY.en as any)?.[key];
    }
  }

  let result = translated || defaultText || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      result = result.replace(new RegExp('\\{' + paramKey + '\\}', 'g'), String(val));
    });
  }

  return result;
};
