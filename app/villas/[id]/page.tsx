import { type Metadata } from 'next'
import { supabaseServer } from '@/lib/supabase-server'
import { extractVvLicense } from '@/lib/property'
import VillaDetailClient from './VillaDetailClient'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SEARCH_PARAM_KEYS = ['adults', 'children', 'infants', 'from', 'to']

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params
  const sp = await searchParams
  const canonicalPath = `/villas/${id}`
  const canonicalUrl = `${siteUrl()}${canonicalPath}`

  const hasSearchParams = SEARCH_PARAM_KEYS.some((key) => sp[key] !== undefined)

  const { data } = await supabaseServer
    .from('properties')
    .select('name, description_en')
    .eq('id', id)
    .maybeSingle()

  const title = data?.name ? `${data.name} | Optima Villas` : 'Villa | Optima Villas'
  const description = data?.description_en
    ? extractVvLicense(data.description_en).text.slice(0, 155)
    : 'Handpicked holiday villa in Lanzarote with personalised service from Optima Villas.'

  return {
    title,
    description,
    alternates: {
      // Query-param variants (date/guest search state) always canonicalize
      // to the clean villa URL — they're the same page, not a distinct one.
      canonical: canonicalUrl,
    },
    robots: hasSearchParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

export default async function VillaDetailPage({ params }: Props) {
  return <VillaDetailClient params={params} />
}
