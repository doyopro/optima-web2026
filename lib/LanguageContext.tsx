'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { type Language, getLanguage, setLanguage as persistLanguage } from './i18n'
import { applyContentOverlay, fetchAndApplySiteContent, type SiteContentRow } from './content'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({
  children,
  initialContentRows = [],
}: {
  children: ReactNode
  initialContentRows?: SiteContentRow[]
}) {
  const [lang, setLangState] = useState<Language>('en')
  // Bumped once the client-side fetch below lands, purely to change the
  // context value's identity so every useLanguage() consumer re-renders and
  // re-reads the now-mutated `translations` object.
  const [, setContentVersion] = useState(0)
  const appliedInitialRows = useRef(false)

  // Applied synchronously during render (not in an effect) so the database
  // overlay is already in place for the very first SSR render pass of this
  // client-component tree — every page reads `translations[lang]` directly
  // at render time via useLanguage(), so this has to land before they do.
  // Guarded to run once per mount; root layout persists for the life of the
  // browser tab, so "once" here means once per session, same as the static
  // file it's overlaying.
  if (!appliedInitialRows.current && initialContentRows.length > 0) {
    applyContentOverlay(initialContentRows)
    appliedInitialRows.current = true
  }

  useEffect(() => {
    setLangState(getLanguage())
    // Safety net: re-fetches and re-applies client-side too, covering the
    // case where the server-side fetch in the root layout came back empty
    // (e.g. a transient failure) — a real fetch here can still recover it
    // without a full page reload.
    fetchAndApplySiteContent().then(() => setContentVersion((v) => v + 1))
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
