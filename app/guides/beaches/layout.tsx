import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best Beaches in Lanzarote | Optima Villas',
  description:
    'Lanzarote has 40+ named beaches for every taste — top picks and hidden gems, with year-round swimming at 18–23°C, from our local team.',
}

export default function BeachesGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
