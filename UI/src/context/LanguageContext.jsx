import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = 'app_language';

const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const languageAliases = {
  hi: 'hi',
  'hi-IN': 'hi',
  ta: 'ta',
  'ta-IN': 'ta',
  te: 'te',
  'te-IN': 'te',
  kn: 'kn',
  'kn-IN': 'kn',
  ml: 'ml',
  'ml-IN': 'ml',
  mr: 'mr',
  'mr-IN': 'mr',
  bn: 'bn',
  'bn-IN': 'bn',
  gu: 'gu',
  'gu-IN': 'gu',
  pa: 'pa',
  'pa-IN': 'pa',
  en: 'en',
  'en-IN': 'en',
  'en-US': 'en',
  'en-GB': 'en',
};

const translations = {
  en: {
    nav_home: 'Home',
    nav_astro_shop: 'Astro Shop',
    nav_live: 'Live',
    nav_history: 'History',
    auth_login: 'Login',
    auth_signup: 'Signup',
    wallet_title: 'My Wallet',
    home_live_astrologers: 'Live Astrologers',
    home_explore_features: 'Explore Features',
    home_astro_shop: 'Astro Shop',
    home_latest_news: 'Latest News',
  },
  hi: {
    nav_home: 'होम',
    nav_astro_shop: 'एस्ट्रो शॉप',
    nav_live: 'लाइव',
    nav_history: 'इतिहास',
    auth_login: 'लॉगिन',
    auth_signup: 'साइन अप',
    wallet_title: 'मेरा वॉलेट',
    home_live_astrologers: 'लाइव ज्योतिषी',
    home_explore_features: 'फ़ीचर्स खोजें',
    home_astro_shop: 'एस्ट्रो शॉप',
    home_latest_news: 'ताज़ा खबरें',
  },
  ta: {
    nav_home: 'முகப்பு',
    nav_astro_shop: 'அஸ்ட்ரோ கடை',
    nav_live: 'நேரலை',
    nav_history: 'வரலாறு',
    auth_login: 'உள் நுழை',
    auth_signup: 'பதிவு செய்',
    wallet_title: 'என் பணப்பை',
    home_live_astrologers: 'நேரலை ஜோதிடர்கள்',
    home_explore_features: 'அம்சங்களை ஆராய்க',
    home_astro_shop: 'அஸ்ட்ரோ கடை',
    home_latest_news: 'சமீபத்திய செய்திகள்',
  },
  te: {
    nav_home: 'హోమ్',
    nav_astro_shop: 'అస్ట్రో షాప్',
    nav_live: 'లైవ్',
    nav_history: 'చరిత్ర',
    auth_login: 'లాగిన్',
    auth_signup: 'సైన్ అప్',
    wallet_title: 'నా వాలెట్',
    home_live_astrologers: 'లైవ్ జ్యోతిష్కులు',
    home_explore_features: 'ఫీచర్లను అన్వేషించండి',
    home_astro_shop: 'అస్ట్రో షాప్',
    home_latest_news: 'తాజా వార్తలు',
  },
  kn: {
    nav_home: 'ಮುಖಪುಟ',
    nav_astro_shop: 'ಆಸ್ಟ್ರೋ ಅಂಗಡಿ',
    nav_live: 'ಲೈವ್',
    nav_history: 'ಇತಿಹಾಸ',
    auth_login: 'ಲಾಗಿನ್',
    auth_signup: 'ಸೈನ್ ಅಪ್',
    wallet_title: 'ನನ್ನ ವಾಲೆಟ್',
    home_live_astrologers: 'ಲೈವ್ ಜ್ಯೋತಿಷಿಗಳು',
    home_explore_features: 'ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    home_astro_shop: 'ಆಸ್ಟ್ರೋ ಅಂಗಡಿ',
    home_latest_news: 'ತಾಜಾ ಸುದ್ದಿ',
  },
  ml: {
    nav_home: 'ഹോം',
    nav_astro_shop: 'ആസ്ട്രോ ഷോപ്പ്',
    nav_live: 'ലൈവ്',
    nav_history: 'ചരിത്രം',
    auth_login: 'ലോഗിൻ',
    auth_signup: 'സൈൻ അപ്പ്',
    wallet_title: 'എന്റെ വാലറ്റ്',
    home_live_astrologers: 'ലൈവ് ജ്യോതിഷന്മാർ',
    home_explore_features: 'ഫീച്ചറുകൾ അന്വേഷിക്കുക',
    home_astro_shop: 'ആസ്ട്രോ ഷോപ്പ്',
    home_latest_news: 'പുതിയ വാർത്തകൾ',
  },
  mr: {
    nav_home: 'मुख्यपृष्ठ',
    nav_astro_shop: 'अ‍ॅस्ट्रो शॉप',
    nav_live: 'लाईव्ह',
    nav_history: 'इतिहास',
    auth_login: 'लॉगिन',
    auth_signup: 'साइन अप',
    wallet_title: 'माझे वॉलेट',
    home_live_astrologers: 'लाईव्ह ज्योतिषी',
    home_explore_features: 'फीचर्स एक्सप्लोर करा',
    home_astro_shop: 'अ‍ॅस्ट्रो शॉप',
    home_latest_news: 'ताज्या बातम्या',
  },
  bn: {
    nav_home: 'হোম',
    nav_astro_shop: 'অ্যাস্ট্রো শপ',
    nav_live: 'লাইভ',
    nav_history: 'ইতিহাস',
    auth_login: 'লগইন',
    auth_signup: 'সাইন আপ',
    wallet_title: 'আমার ওয়ালেট',
    home_live_astrologers: 'লাইভ জ্যোতিষী',
    home_explore_features: 'ফিচার এক্সপ্লোর করুন',
    home_astro_shop: 'অ্যাস্ট্রো শপ',
    home_latest_news: 'সর্বশেষ খবর',
  },
  gu: {
    nav_home: 'હોમ',
    nav_astro_shop: 'એસ્ટ્રો શોપ',
    nav_live: 'લાઇવ',
    nav_history: 'ઇતિહાસ',
    auth_login: 'લૉગિન',
    auth_signup: 'સાઇન અપ',
    wallet_title: 'મારો વૉલેટ',
    home_live_astrologers: 'લાઇવ જ્યોતિષી',
    home_explore_features: 'ફીચર્સ શોધો',
    home_astro_shop: 'એસ્ટ્રો શોપ',
    home_latest_news: 'તાજા સમાચાર',
  },
  pa: {
    nav_home: 'ਹੋਮ',
    nav_astro_shop: 'ਐਸਟਰੋ ਸ਼ਾਪ',
    nav_live: 'ਲਾਈਵ',
    nav_history: 'ਇਤਿਹਾਸ',
    auth_login: 'ਲੌਗਇਨ',
    auth_signup: 'ਸਾਈਨ ਅਪ',
    wallet_title: 'ਮੇਰਾ ਵਾਲਿਟ',
    home_live_astrologers: 'ਲਾਈਵ ਜੋਤਿਸੀ',
    home_explore_features: 'ਫੀਚਰ ਖੋਜੋ',
    home_astro_shop: 'ਐਸਟਰੋ ਸ਼ਾਪ',
    home_latest_news: 'ਤਾਜ਼ਾ ਖਬਰਾਂ',
  },
};

const detectInitialLanguage = () => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && translations[stored]) return stored;

  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const alias = languageAliases[browserLang];
  if (alias && translations[alias]) return alias;

  const short = browserLang.split('-')[0];
  if (translations[short]) return short;

  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (translations[code]) {
      setLanguageState(code);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const langTable = translations[language] || translations.en;
      return langTable[key] || translations.en[key] || key;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: supportedLanguages,
    }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

