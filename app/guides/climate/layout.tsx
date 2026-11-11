import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isGuideHidden } from '@/lib/guides-config'

export const metadata: Metadata = {
  title: 'Lanzarote Climate & Weather Guide | Optima Villas',
  description:
    'Monthly temperatures and the best time to visit Lanzarote — 300+ days of sunshine a year and mild winters, explained by our local team.',
}

export default function ClimateGuideLayout({ children }: { children: React.ReactNode }) {
  // Hidden until the guide is finished — see lib/guides-config.ts.
  if (isGuideHidden('climate')) notFound()
  return children
}
