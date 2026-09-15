import { TranslationDictionary } from '../../types/i18n';
import { enTranslations } from './en';
import { taTranslations } from './ta';
import { hiTranslations } from './hi';
import { teTranslations } from './te';
import { knTranslations } from './kn';
import { mlTranslations } from './ml';
import { bnTranslations } from './bn';
import { mrTranslations } from './mr';
import { guTranslations } from './gu';
import { paTranslations } from './pa';
import { orTranslations } from './or';
import { asTranslations } from './as';
import { urTranslations } from './ur';
import { saTranslations } from './sa';
import { satTranslations } from './sat';
import { neTranslations } from './ne';
import { maiTranslations } from './mai';
import { kokTranslations } from './kok';
import { doiTranslations } from './doi';
import { brTranslations } from './br';
import { mniTranslations } from './mni';
import { sdTranslations } from './sd';
import { ksTranslations } from './ks';

export {
  enTranslations,
  taTranslations,
  hiTranslations,
  teTranslations,
  knTranslations,
  mlTranslations,
  bnTranslations,
  mrTranslations,
  guTranslations,
  paTranslations,
  orTranslations,
  asTranslations,
  urTranslations,
  saTranslations,
  satTranslations,
  neTranslations,
  maiTranslations,
  kokTranslations,
  doiTranslations,
  brTranslations,
  mniTranslations,
  sdTranslations,
  ksTranslations
};

/**
 * Complete translations master registry mapping language codes to dictionaries.
 */
export const TRANSLATIONS_REGISTRY: Record<string, Partial<TranslationDictionary>> = {
  en: enTranslations,
  ta: taTranslations,
  hi: hiTranslations,
  te: teTranslations,
  kn: knTranslations,
  ml: mlTranslations,
  bn: bnTranslations,
  mr: mrTranslations,
  gu: guTranslations,
  pa: paTranslations,
  or: orTranslations,
  as: asTranslations,
  ur: urTranslations,
  sa: saTranslations,
  sat: satTranslations,
  ne: neTranslations,
  mai: maiTranslations,
  kok: kokTranslations,
  doi: doiTranslations,
  br: brTranslations,
  mni: mniTranslations,
  sd: sdTranslations,
  ks: ksTranslations
};

/**
 * Common system status display translation map
 */
const STATUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  ta: {
    OPEN: 'திறந்துள்ளது',
    PENDING: 'நிலுவையில்',
    APPROVED: 'ஒப்புதல் அளிக்கப்பட்டது',
    REJECTED: 'நிராகரிக்கப்பட்டது',
    MATCHING: 'பொருத்தப்படுகிறது',
    IN_TRANSIT: 'போக்குவரத்தில்',
    DELIVERED: 'டெலிவரி செய்யப்பட்டது',
    COMPLETED: 'நிறைவடைந்தது',
    PAID: 'பணம் செலுத்தப்பட்டது',
    FAILED: 'தோல்வியடைந்தது',
    READY: 'தயாராக உள்ளது',
    CANCELLED: 'ரத்து செய்யப்பட்டது',
    ESCROW_LOCKED: 'எஸ்க்ரோவில் வைக்கப்பட்டுள்ளது',
    RELEASED: 'விடுவிக்கப்பட்டது',
    DISBURSED: 'பட்டுவாடா செய்யப்பட்டது'
  },
  hi: {
    OPEN: 'खुला',
    PENDING: 'लंबित',
    APPROVED: 'स्वीकृत',
    REJECTED: 'अस्वीकृत',
    MATCHING: 'सुमेलन जारी',
    IN_TRANSIT: 'परिवहन में',
    DELIVERED: 'वितरित',
    COMPLETED: 'पूर्ण',
    PAID: 'भुगतान संपन्न',
    FAILED: 'विफल',
    READY: 'तैयार',
    CANCELLED: 'रद्द',
    ESCROW_LOCKED: 'एस्क्रो में सुरक्षित',
    RELEASED: 'जारी किया गया',
    DISBURSED: 'हस्तांतरित'
  },
  te: {
    OPEN: 'తెరిచి ఉంది',
    PENDING: 'పెండింగ్‌లో ఉంది',
    APPROVED: 'ఆమోదించబడింది',
    REJECTED: 'తిరస్కరించబడింది',
    MATCHING: 'సరిపోల్చబడుతోంది',
    IN_TRANSIT: 'రవాణాలో ఉంది',
    DELIVERED: 'డెలివరీ చేయబడింది',
    COMPLETED: 'పూర్తయింది',
    PAID: 'చెల్లించబడింది',
    FAILED: 'విఫలమైంది',
    READY: 'సిద్ధంగా ఉంది',
    CANCELLED: 'రద్దు చేయబడింది',
    ESCROW_LOCKED: 'ఎస్క్రో లాక్ చేయబడింది',
    RELEASED: 'విడుదల చేయబడింది',
    DISBURSED: 'పంపిణీ చేయబడింది'
  },
  kn: {
    OPEN: 'ತೆರೆದಿದೆ',
    PENDING: 'ಬಾಕಿ ಉಳಿದಿದೆ',
    APPROVED: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    REJECTED: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    MATCHING: 'ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿದೆ',
    IN_TRANSIT: 'ಸಾರಿಗೆಯಲ್ಲಿದೆ',
    DELIVERED: 'ತಲುಪಿಸಲಾಗಿದೆ',
    COMPLETED: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    PAID: 'ಪಾವತಿಸಲಾಗಿದೆ',
    FAILED: 'ವಿಫಲವಾಗಿದೆ',
    READY: 'ಸಿದ್ಧವಾಗಿದೆ',
    CANCELLED: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
    ESCROW_LOCKED: 'ಎಸ್ಕ್ರೋ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ',
    RELEASED: 'ಬಿಡುಗಡೆ ಮಾಡಲಾಗಿದೆ',
    DISBURSED: 'ವಿತರಿಸಲಾಗಿದೆ'
  },
  ml: {
    OPEN: 'തുറന്നത്',
    PENDING: 'തീർപ്പുകൽപ്പിക്കാത്തത്',
    APPROVED: 'അംഗീകരിച്ചു',
    REJECTED: 'നിരസിച്ചു',
    MATCHING: 'പൊരുത്തപ്പെടുത്തുന്നു',
    IN_TRANSIT: 'വഴിയിലാണ് / ട്രാൻസിറ്റിൽ',
    DELIVERED: 'ഡെലിവറി ചെയ്തു',
    COMPLETED: 'പൂർത്തിയായി',
    PAID: 'പണം നൽകി',
    FAILED: 'പരാജയപ്പെട്ടു',
    READY: 'തയ്യാറാണ്',
    CANCELLED: 'റദ്ദാക്കി',
    ESCROW_LOCKED: 'എസ്ക്രോ ലോക്ക് ചെയ്തു',
    RELEASED: 'റിലീസ് ചെയ്തു',
    DISBURSED: 'വിതരണം ചെയ്തു'
  },
  bn: {
    OPEN: 'উন্মুক্ত',
    PENDING: 'মুলতুবি',
    APPROVED: 'অনুমোদিত',
    REJECTED: 'প্রত্যাখ্যাত',
    MATCHING: 'মিলানো হচ্ছে',
    IN_TRANSIT: 'পরিবহনে',
    DELIVERED: 'বিতরণ করা হয়েছে',
    COMPLETED: 'সম্পন্ন',
    PAID: 'পরিশোধিত',
    FAILED: 'ব্যর্থ',
    READY: 'প্রস্তুত',
    CANCELLED: 'বাতিল',
    ESCROW_LOCKED: 'এসক্রোতে সংরক্ষিত',
    RELEASED: 'ছাড়পত্র দেওয়া হয়েছে',
    DISBURSED: 'প্রদান করা হয়েছে'
  },
  mr: {
    OPEN: 'उघडे',
    PENDING: 'प्रलंबित',
    APPROVED: 'मंजूर',
    REJECTED: 'नाकारले',
    MATCHING: 'जुळवणी सुरू',
    IN_TRANSIT: 'वाहतुकीमध्ये',
    DELIVERED: 'वितरित',
    COMPLETED: 'पूर्ण',
    PAID: 'पेड / दिलेले',
    FAILED: 'अयशस्वी',
    READY: 'तयार',
    CANCELLED: 'रद्द',
    ESCROW_LOCKED: 'एस्क्रोमध्ये सुरक्षित',
    RELEASED: 'मुक्त केले',
    DISBURSED: 'वितरित केले'
  },
  gu: {
    OPEN: 'ખુલ્લું',
    PENDING: 'બાકી',
    APPROVED: 'મંજૂર',
    REJECTED: 'નકારાયેલ',
    MATCHING: 'મેળવણી ચાલુ',
    IN_TRANSIT: 'ટ્રાન્સિટમાં',
    DELIVERED: 'વિતરિત',
    COMPLETED: 'પૂર્ણ',
    PAID: 'ચૂકવેલ',
    FAILED: 'નિષ્ફળ',
    READY: 'તૈયાર',
    CANCELLED: 'રદ કરેલ',
    ESCROW_LOCKED: 'એસ્ક્રોમાં સુરક્ષિત',
    RELEASED: 'છોડવામાં આવેલ',
    DISBURSED: 'વિતરિત'
  },
  pa: {
    OPEN: 'ਖੁੱਲ੍ਹਾ',
    PENDING: 'ਬਕਾਇਆ',
    APPROVED: 'ਮਨਜ਼ੂਰ',
    REJECTED: 'ਰੱਦ ਕੀਤਾ ਗਿਆ',
    MATCHING: 'ਮੇਲ ਜਾਰੀ',
    IN_TRANSIT: 'ਰਸਤੇ ਵਿੱਚ',
    DELIVERED: 'ਡਿਲੀਵਰ ਕੀਤਾ ਗਿਆ',
    COMPLETED: 'ਮੁਕੰਮਲ',
    PAID: 'ਭੁਗਤਾਨ ਕੀਤਾ',
    FAILED: 'ਅਸਫਲ',
    READY: 'ਤਿਆਰ',
    CANCELLED: 'ਰੱਦ',
    ESCROW_LOCKED: 'ਐਸਕਰੋ ਵਿੱਚ ਸੁਰੱਖਿਅਤ',
    RELEASED: 'ਜਾਰੀ ਕੀਤਾ ਗਿਆ',
    DISBURSED: 'ਵੰਡਿਆ ਗਿਆ'
  },
  or: {
    OPEN: 'ଖୋଲା',
    PENDING: 'ବାକି ଅଛି',
    APPROVED: 'ଅନୁମୋଦିତ',
    REJECTED: 'ପ୍ରତ୍ୟାଖ୍ୟାତ',
    MATCHING: 'ମେଳକ ଚାଲିଛି',
    IN_TRANSIT: 'ପରିବହନରେ',
    DELIVERED: 'ବିତରଣ ହୋଇଛି',
    COMPLETED: 'ସମ୍ପୂର୍ଣ୍ଣ',
    PAID: 'ପୈଠ ହୋଇଛି',
    FAILED: 'ବିଫଳ',
    READY: 'ପ୍ରସ୍ତୁତ',
    CANCELLED: 'ବାତିଲ',
    ESCROW_LOCKED: 'ଏସ୍କ୍ରୋରେ ଲକ୍',
    RELEASED: 'ମୁକ୍ତ',
    DISBURSED: 'ବଣ୍ଟନ କରାଯାଇଛି'
  },
  as: {
    OPEN: 'মুকলি',
    PENDING: 'মুলতবি',
    APPROVED: 'অনুমোদিত',
    REJECTED: 'প্ৰত্যাখ্যান',
    MATCHING: 'মিলাই থকা হৈছে',
    IN_TRANSIT: 'পৰিবহনত',
    DELIVERED: 'বিতৰণ কৰা হ’ল',
    COMPLETED: 'সম্পূৰ্ণ',
    PAID: 'পৰিশোধিত',
    FAILED: 'ব্যৰ্থ',
    READY: 'প্ৰস্তুত',
    CANCELLED: 'বাতিল',
    ESCROW_LOCKED: 'এছক্ৰ’ত সুৰক্ষিত',
    RELEASED: 'মুক্তি দিয়া হ’ল',
    DISBURSED: 'বিতৰণ কৰা হ’ল'
  },
  ur: {
    OPEN: 'کھلا',
    PENDING: 'زیر التواء',
    APPROVED: 'منظور شدہ',
    REJECTED: 'مسترد',
    MATCHING: 'مماثلت جاری',
    IN_TRANSIT: 'راستے میں',
    DELIVERED: 'پہنچا دیا گیا',
    COMPLETED: 'مکمل',
    PAID: 'ادا شدہ',
    FAILED: 'ناکام',
    READY: 'تیار',
    CANCELLED: 'منسوخ',
    ESCROW_LOCKED: 'ایسکرو میں محفوظ',
    RELEASED: 'جاری کیا گیا',
    DISBURSED: 'ادا کیا گیا'
  }
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

  // Smart resolution of arguments because of mixed usage in the codebase
  // Some call t(key, defaultText, params)
  // Some call t(key, params, defaultText)
  // Some call t(key, undefined, defaultText)
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

  // Check if key is a raw status enum (e.g. READY, PENDING, IN_TRANSIT, etc.)
  if (STATUS_TRANSLATIONS[langCode]?.[key]) {
    return STATUS_TRANSLATIONS[langCode][key];
  }

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
      translated = resolve(enTranslations, parts);
    }
  } else {
    // Check common section or root
    translated = targetDict?.common?.[key] || (targetDict as any)?.[key];
    if (!translated) {
      translated = targetDict?.stages?.[key] || targetDict?.nav?.[key];
    }
    if (!translated && langCode !== 'en') {
      translated = enTranslations?.common?.[key] || (enTranslations as any)?.[key];
    }
  }

  let result = translated || defaultText || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return result;
};
