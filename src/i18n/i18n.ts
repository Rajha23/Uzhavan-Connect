import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Base English translations can be loaded eagerly to prevent UI flash
import enTranslation from './locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      }
    },
    lng: 'en', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Avoid suspense boundaries breaking existing components
    }
  });

// Vite glob loader for all locale translation files
const localeLoaders: Record<string, () => Promise<any>> = import.meta.glob('./locales/*/translation.json');

/**
 * Lazily load translation chunks using Vite's glob import 
 * so we don't bundle 22 languages (~1.1MB JSON) into the main app chunk.
 */
export const loadLanguageResources = async (lang: string) => {
  const normalizedLang = lang === 'br' ? 'brx' : lang;
  if (normalizedLang === 'en' || i18n.hasResourceBundle(normalizedLang, 'translation')) {
    return;
  }
  const key = `./locales/${normalizedLang}/translation.json`;
  const loader = localeLoaders[key];
  if (loader) {
    try {
      const module = await loader();
      const bundle = module.default || module;
      i18n.addResourceBundle(normalizedLang, 'translation', bundle, true, true);
      if (normalizedLang !== lang) {
        i18n.addResourceBundle(lang, 'translation', bundle, true, true);
      }
    } catch (e) {
      console.warn(`[i18n] Could not load translations for ${lang}`, e);
    }
  } else {
    try {
      const fallbackModule = await import(`./locales/${normalizedLang}/translation.json`);
      const bundle = fallbackModule.default || fallbackModule;
      i18n.addResourceBundle(normalizedLang, 'translation', bundle, true, true);
    } catch (e) {
      console.warn(`[i18n] Loader not found for ${lang}`, e);
    }
  }
};

export default i18n;
