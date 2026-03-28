import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "app_name": "Econode",
          "tagline": "Hyper-Local Air & Waste Intelligence",
          "aqi_label": "Air Quality Index",
          "ward_label": "Your Ward",
          "advisory_title": "Today's Advisory",
          "scan_button": "Scan Waste",
          "score_title": "Your Eco Score",
          "loading": "Loading...",
          "error_retry": "Tap to retry"
        }
      },
      hi: {
        translation: {
          "app_name": "Econode",
          "tagline": "वार्ड-स्तरीय वायु एवं कचरा प्रबंधन",
          "aqi_label": "वायु गुणवत्ता सूचकांक",
          "ward_label": "आपका वार्ड",
          "advisory_title": "आज की सलाह",
          "scan_button": "कचरा स्कैन करें",
          "score_title": "आपका इको स्कोर",
          "loading": "लोड हो रहा है...",
          "error_retry": "पुनः प्रयास करें"
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });

export default i18n;
