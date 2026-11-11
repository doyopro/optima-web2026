import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isGuideHidden } from '@/lib/guides-config'

export const metadata: Metadata = {
  title: 'Playa Blanca Guide: Beaches & Things to Do | Optima Villas',
  description:
    'Beaches, things to do and practical info for Playa Blanca, Lanzarote — from the local team at Optima Villas.',
}

export default function PlayaBlancaGuideLayout({ children }: { children: React.ReactNode }) {
  // Hidden until the guide is finished — see lib/guides-config.ts.
  if (isGuideHidden('playa-blanca')) notFound()
  return children
}
