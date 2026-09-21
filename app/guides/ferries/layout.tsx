import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ferries from Lanzarote: Schedules & Prices | Optima Villas',
  description:
    'Ferry schedules and prices from Lanzarote to Fuerteventura and La Graciosa, kept up to date by our local team at Optima Villas.',
}

export default function FerriesGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
