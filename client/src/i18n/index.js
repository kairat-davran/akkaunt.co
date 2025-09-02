import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import ru from './ru.json';
import ky from './ky.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      ky: { translation: ky }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    pluralSeparator: '_',
    compatibilityJSON: 'v3'
  });

export default i18n;