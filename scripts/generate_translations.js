import fs from 'fs';
import path from 'path';

const enTsContent = fs.readFileSync(path.join(process.cwd(), 'src', 'i18n', 'locales', 'en', 'translation.json'), 'utf-8');
const enTranslations = JSON.parse(enTsContent);

const languages = [
  'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai', 'ml', 
  'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'
];

function translateObject(obj, targetLang) {
  if (targetLang === 'en') return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = `[${targetLang}] ${value}`;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = translateObject(value, targetLang);
    }
  }
  return result;
}

function generateAll() {
  const baseDir = path.join(process.cwd(), 'src', 'i18n', 'locales');
  
  for (const lang of languages) {
    const langDir = path.join(baseDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    console.log(`Generating translations for: ${lang}...`);
    const translated = translateObject(enTranslations, lang);
    
    fs.writeFileSync(
      path.join(langDir, 'translation.json'),
      JSON.stringify(translated, null, 2)
    );
    console.log(`Saved ${lang}/translation.json`);
  }
  console.log('All translations generated successfully.');
}

generateAll();
