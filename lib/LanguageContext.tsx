'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Language, getLanguage, setLanguage as persistLanguage } from './i18n'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    setLangState(getLanguage())
  }, [])

  function setLang(next: Language) {
    persistLanguage(next)
    setLangState(next)
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
