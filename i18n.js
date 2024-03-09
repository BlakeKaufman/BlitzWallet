import 'intl-pluralrules';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import spTranslation from './locales/sp/translation.json';

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: 'en',
  supportedLngs: ['en', 'sp'],
  resources: {
    en: {
      translation: enTranslation,
    },
    sp: {
      translation: spTranslation,
    },
  },
});
