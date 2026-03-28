import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = {
  translation: {
    "app_name": "Econode",
    "tagline": "Hyper-Local Air & Waste Intelligence",
    "aqi_label": "Air Quality Index",
    "ward_label": "Your Ward",
    "advisory_title": "Today's Advisory",
    "scan_button": "Scan Waste",
    "scan_placeholder": "Take a photo or type an item name",
    "score_title": "Your Eco Score",
    "report_button": "Report an Issue",
    "commute_title": "Today's Commute",
    "mcd_title": "MCD Officer Portal",
    "citizen_title": "Citizen Mode",
    "login_button": "Sign In",
    "logout_button": "Sign Out",
    "loading": "Loading...",
    "error_retry": "Tap to retry",
    "no_data": "No data available"
  }
};

const hi = {
  translation: {
    "app_name": "Econode",
    "tagline": "वार्ड-स्तरीय वायु एवं कचरा प्रबंधन",
    "aqi_label": "वायु गुणवत्ता सूचकांक",
    "ward_label": "आपका वार्ड",
    "advisory_title": "आज की सलाह",
    "scan_button": "कचरा स्कैन करें",
    "scan_placeholder": "फ़ोटो लें या वस्तु का नाम टाइप करें",
    "score_title": "आपका इको स्कोर",
    "report_button": "समस्या रिपोर्ट करें",
    "commute_title": "आज की यात्रा",
    "mcd_title": "MCD अधिकारी पोर्टल",
    "citizen_title": "नागरिक मोड",
    "login_button": "साइन इन करें",
    "logout_button": "साइन आउट",
    "loading": "लोड हो रहा है...",
    "error_retry": "पुनः प्रयास करें",
    "no_data": "कोई डेटा उपलब्ध नहीं"
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: { en, hi },
    lng: localStorage.getItem('econode-lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });

export default i18n;
