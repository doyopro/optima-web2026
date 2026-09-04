'use client'

import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import ComingSoon from '../_components/ComingSoon'

export default function FaqsAdminPage() {
  const { lang } = useLanguage()
  return <ComingSoon title={translations[lang].dashboard.tabs.faqs} />
}
