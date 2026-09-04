import { redirect } from 'next/navigation'

const VALID_TABS = new Set(['faqs', 'properties', 'guides', 'content'])

interface Props {
  searchParams: Promise<{ tab?: string }>
}

// Bare /web, and the /web?tab=x query-param form some docs in this project
// reference, both resolve to the matching nested route so either URL style
// works — the nested routes (/web/guides etc.) are the ones that actually
// render.
export default async function WebIndexPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const target = tab && VALID_TABS.has(tab) ? tab : 'faqs'
  redirect(`/web/${target}`)
}
