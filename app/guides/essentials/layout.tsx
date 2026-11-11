import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playa Blanca Essentials: Emergencies, Health & Buses | Optima Villas',
  description:
    'The basics for your stay in Playa Blanca, Lanzarote: emergency number, health centres, pharmacies, buses, ferries and the airport. Information only.',
}

export default function EssentialsGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
