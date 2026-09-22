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

/**
 * Lazily load translation chunks using Vite's dynamic import 
 * so we don't bundle 22 languages (~1.1MB JSON) into the main app chunk.
 */
export const loadLanguageResources = async (lang: string) => {
  if (lang === 'en' || i18n.hasResourceBundle(lang, 'translation')) {
    return;
  }
  try {
    const localeModule = await import(`./locales/${lang}/translation.json`);
    i18n.addResourceBundle(lang, 'translation', localeModule.default, true, true);
  } catch (e) {
    console.warn(`[i18n] Could not load translations for ${lang}`, e);
  }
};

export default i18n;
