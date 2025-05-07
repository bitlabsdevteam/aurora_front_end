"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../locales/en';
import ja from '../locales/ja';

type Language = 'en' | 'ja';

type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  ja,
};

interface LocaleContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    if (stored === 'en' || stored === 'ja') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <LocaleContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext); 