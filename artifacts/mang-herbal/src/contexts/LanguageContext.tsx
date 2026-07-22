import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ckb' | 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ckb: string, ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ckb');

  useEffect(() => {
    const saved = localStorage.getItem('mang_lang') as Language;
    if (saved && ['ckb', 'ar', 'en'].includes(saved)) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mang_lang', lang);
    if (lang === 'en') {
      document.documentElement.dir = 'ltr';
    } else {
      document.documentElement.dir = 'rtl';
    }
    document.documentElement.lang = lang === 'ckb' ? 'ku' : lang;
  }, [lang]);

  const t = (ckb: string, ar: string, en: string) => {
    if (lang === 'ckb') return ckb;
    if (lang === 'ar') return ar;
    return en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
