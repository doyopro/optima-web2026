import { type Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import PrivacyClient from './PrivacyClient'

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabaseServer
    .from('site_content')
    .select('key, value_en')
    .eq('company_id', 'optima')
    .eq('section', 'privacy')
    .in('key', ['title', 'section1.body'])

  const title = data?.find((r) => r.key === 'title')?.value_en || 'Privacy Policy'
  const intro = data?.find((r) => r.key === 'section1.body')?.value_en || ''
  const description = intro
    ? intro.replace(/\\n/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().slice(0, 155)
    : 'How Optima Villas collects, uses and protects your personal data.'

  return {
    title: `${title} | Optima Villas`,
    description,
    robots: { index: true, follow: true },
  }
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
