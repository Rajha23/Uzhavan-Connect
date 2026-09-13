import { LanguageDefinition } from '../types/i18n';

/**
 * UZHAVAN CONNECT — Central Language Registry
 * Supports all 22 official languages listed in the Eighth Schedule
 * of the Constitution of India, plus English as standard fallback.
 */
export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  // ── Default / Fallback ────────────────────────────────────
  {
    code: 'en',
    nameEnglish: 'English',
    nativeName: 'English',
    iso6391: 'en',
    iso6393: 'eng',
    script: 'Latin',
    direction: 'ltr',
    regions: ['Pan-India', 'National']
  },

  // ── 22 Eighth Schedule Languages ──────────────────────────
  {
    code: 'as',
    nameEnglish: 'Assamese',
    nativeName: 'অসমীয়া',
    iso6391: 'as',
    iso6393: 'asm',
    script: 'Assamese',
    direction: 'ltr',
    regions: ['Assam']
  },
  {
    code: 'bn',
    nameEnglish: 'Bengali',
    nativeName: 'বাংলা',
    iso6391: 'bn',
    iso6393: 'ben',
    script: 'Bengali',
    direction: 'ltr',
    regions: ['West Bengal', 'Tripura', 'Assam']
  },
  {
    code: 'br',
    nameEnglish: 'Bodo',
    nativeName: 'बड़ो',
    iso6391: 'br',
    iso6393: 'brx',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Assam']
  },
  {
    code: 'doi',
    nameEnglish: 'Dogri',
    nativeName: 'डोगरी',
    iso6391: 'doi',
    iso6393: 'doi',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Jammu & Kashmir', 'Himachal Pradesh']
  },
  {
    code: 'gu',
    nameEnglish: 'Gujarati',
    nativeName: 'ગુજરાતી',
    iso6391: 'gu',
    iso6393: 'guj',
    script: 'Gujarati',
    direction: 'ltr',
    regions: ['Gujarat']
  },
  {
    code: 'hi',
    nameEnglish: 'Hindi',
    nativeName: 'हिन्दी',
    iso6391: 'hi',
    iso6393: 'hin',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Delhi']
  },
  {
    code: 'kn',
    nameEnglish: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    iso6391: 'kn',
    iso6393: 'kan',
    script: 'Kannada',
    direction: 'ltr',
    regions: ['Karnataka']
  },
  {
    code: 'ks',
    nameEnglish: 'Kashmiri',
    nativeName: 'कॉशुर / کٲشُر',
    iso6391: 'ks',
    iso6393: 'kas',
    script: 'Devanagari / Perso-Arabic',
    direction: 'ltr', // Supports both scripts, defaults to LTR with script-toggle capability
    regions: ['Jammu & Kashmir']
  },
  {
    code: 'kok',
    nameEnglish: 'Konkani',
    nativeName: 'कोंकणी',
    iso6391: 'kok',
    iso6393: 'kok',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Goa', 'Maharashtra', 'Karnataka']
  },
  {
    code: 'mai',
    nameEnglish: 'Maithili',
    nativeName: 'मैथिली',
    iso6391: 'mai',
    iso6393: 'mai',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Bihar', 'Jharkhand']
  },
  {
    code: 'ml',
    nameEnglish: 'Malayalam',
    nativeName: 'മലയാളം',
    iso6391: 'ml',
    iso6393: 'mal',
    script: 'Malayalam',
    direction: 'ltr',
    regions: ['Kerala', 'Lakshadweep']
  },
  {
    code: 'mni',
    nameEnglish: 'Manipuri / Meitei',
    nativeName: 'মৈতৈলোন',
    iso6391: 'mni',
    iso6393: 'mni',
    script: 'Meitei Mayek / Bengali',
    direction: 'ltr',
    regions: ['Manipur']
  },
  {
    code: 'mr',
    nameEnglish: 'Marathi',
    nativeName: 'मराठी',
    iso6391: 'mr',
    iso6393: 'mar',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Maharashtra', 'Goa']
  },
  {
    code: 'ne',
    nameEnglish: 'Nepali',
    nativeName: 'नेपाली',
    iso6391: 'ne',
    iso6393: 'nep',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Sikkim', 'West Bengal', 'Assam']
  },
  {
    code: 'or',
    nameEnglish: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    iso6391: 'or',
    iso6393: 'ory',
    script: 'Odia',
    direction: 'ltr',
    regions: ['Odisha']
  },
  {
    code: 'pa',
    nameEnglish: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    iso6391: 'pa',
    iso6393: 'pan',
    script: 'Gurmukhi',
    direction: 'ltr',
    regions: ['Punjab', 'Chandigarh', 'Haryana', 'Delhi']
  },
  {
    code: 'sa',
    nameEnglish: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    iso6391: 'sa',
    iso6393: 'san',
    script: 'Devanagari',
    direction: 'ltr',
    regions: ['Pan-India', 'Classical Language']
  },
  {
    code: 'sat',
    nameEnglish: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    iso6391: 'sat',
    iso6393: 'sat',
    script: 'Ol Chiki',
    direction: 'ltr',
    regions: ['Jharkhand', 'West Bengal', 'Odisha', 'Bihar']
  },
  {
    code: 'sd',
    nameEnglish: 'Sindhi',
    nativeName: 'सिन्धी / سنڌي',
    iso6391: 'sd',
    iso6393: 'snd',
    script: 'Devanagari / Perso-Arabic',
    direction: 'ltr',
    regions: ['Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh']
  },
  {
    code: 'ta',
    nameEnglish: 'Tamil',
    nativeName: 'தமிழ்',
    iso6391: 'ta',
    iso6393: 'tam',
    script: 'Tamil',
    direction: 'ltr',
    regions: ['Tamil Nadu', 'Puducherry']
  },
  {
    code: 'te',
    nameEnglish: 'Telugu',
    nativeName: 'తెలుగు',
    iso6391: 'te',
    iso6393: 'tel',
    script: 'Telugu',
    direction: 'ltr',
    regions: ['Andhra Pradesh', 'Telangana']
  },
  {
    code: 'ur',
    nameEnglish: 'Urdu',
    nativeName: 'اردو',
    iso6391: 'ur',
    iso6393: 'urd',
    script: 'Perso-Arabic',
    direction: 'rtl',
    regions: ['Uttar Pradesh', 'Bihar', 'Telangana', 'Jammu & Kashmir', 'Jharkhand']
  }
];

export const DEFAULT_LANGUAGE: LanguageDefinition = {
  ...SUPPORTED_LANGUAGES[0],
  name: SUPPORTED_LANGUAGES[0].nameEnglish
};

export const INDIAN_LANGUAGES: Record<string, LanguageDefinition> = SUPPORTED_LANGUAGES.reduce(
  (acc, lang) => {
    const enriched = { ...lang, name: lang.nameEnglish };
    acc[lang.code] = enriched;
    return acc;
  },
  {} as Record<string, LanguageDefinition>
);

/**
 * Searches and filters languages by English name, Native name, ISO 639-1, or ISO 639-3 code.
 */
export const searchLanguages = (query: string): LanguageDefinition[] => {
  const clean = query.trim().toLowerCase();
  const list = clean ? SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesEnglish = lang.nameEnglish.toLowerCase().includes(clean);
    const matchesNative = lang.nativeName.toLowerCase().includes(clean);
    const matchesIso1 = lang.iso6391.toLowerCase() === clean;
    const matchesIso3 = lang.iso6393.toLowerCase() === clean;
    const matchesCode = lang.code.toLowerCase() === clean;
    const matchesRegion = lang.regions.some((r) => r.toLowerCase().includes(clean));

    return matchesEnglish || matchesNative || matchesIso1 || matchesIso3 || matchesCode || matchesRegion;
  }) : SUPPORTED_LANGUAGES;

  return list.map((l) => ({ ...l, name: l.nameEnglish }));
};

/**
 * Finds language by code (checks code, ISO 639-1, or ISO 639-3).
 */
export const getLanguageByCode = (code: string): LanguageDefinition => {
  const clean = code.trim().toLowerCase();
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === clean || l.iso6391.toLowerCase() === clean || l.iso6393.toLowerCase() === clean
  );
  if (found) {
    return { ...found, name: found.nameEnglish };
  }
  return DEFAULT_LANGUAGE;
};

