'use client';

import { useEffect } from 'react';
import i18n from '../i18n';

export default function I18nProvider({ children }) {
  useEffect(() => {
    // Browser/system language detect karo:
    // French → 'fr', baaki sab (English, Spanish, etc.) → 'en'
    const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    const targetLang = browserLang.startsWith('fr') ? 'fr' : 'en';
    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
  }, []);

  return <>{children}</>;
}