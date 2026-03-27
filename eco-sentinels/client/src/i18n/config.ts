import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

const getInitialLanguage = () => {
  const saved = localStorage.getItem('econode-lang');
  if (saved) return saved;
  
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'hi' ? 'hi' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
