import { redirect } from 'next/navigation'
import { requireLegacyReservationSession } from '@/lib/guest-auth'
import GuestFormClient from '../../GuestFormClient'

// Legacy path: `key` here is a reservation id, for a guest whose session
// isn't tied to a contact_id yet (see lib/guest-auth.ts). The contact-scoped
// equivalent is app/my-booking/[key]/[reservationId]/form/page.tsx.
export default async function LegacyGuestFormPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const reservation = await requireLegacyReservationSession(key)

  if (!reservation) {
    redirect('/guest-login')
  }

  return <GuestFormClient reservationId={key} numGuests={reservation.num_guests ?? 1} />
}
