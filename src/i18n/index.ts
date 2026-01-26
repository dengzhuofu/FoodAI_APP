import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import zh from './locales/zh.json';

// 获取设备语言
const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode;
  }
  return 'zh';
};

const deviceLanguage = getDeviceLanguage();

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage === 'zh' ? 'zh' : 'en', // 如果设备语言是中文则用中文，否则用英文
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

export default i18n;
