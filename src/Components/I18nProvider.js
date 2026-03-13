'use client';

import { useEffect } from 'react';
import i18n from '../i18n';

export default function I18nProvider({ children }) {
  useEffect(() => {
    // i18n initialize
    i18n.changeLanguage(i18n.language);
  }, []);

  return <>{children}</>;
}