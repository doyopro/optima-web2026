import { redirect } from 'next/navigation'
import { requireGuestSession } from '@/lib/guest-auth'
import MyBookingClient from './MyBookingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MyBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reservation = await requireGuestSession(id)

  if (!reservation) {
    redirect('/guest-login')
  }

  return <MyBookingClient reservation={reservation} />
}
