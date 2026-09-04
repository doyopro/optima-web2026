import { redirect } from 'next/navigation'
import { requireGuestSession } from '@/lib/guest-auth'
import GuestFormClient from './GuestFormClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GuestFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reservation = await requireGuestSession(id)

  if (!reservation) {
    redirect('/guest-login')
  }

  return <GuestFormClient reservationId={id} numGuests={reservation.num_guests ?? 1} />
}
