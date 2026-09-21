import { redirect } from 'next/navigation'
import { requireGuestContact, requireLegacyReservationSession, getReservationsForContact } from '@/lib/guest-auth'
import { getPaymentSummary } from '@/lib/guest-payments'
import MyBookingClient from './MyBookingClient'
import BookingsDashboardClient from './BookingsDashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// `key` is either a contact_id (the normal, 2026-09-redesign path — shows
// every reservation linked to that guest) or, for the ~23% of reservations
// that predate the contacts sync and have no contact_id, a reservation id
// under a legacy single-reservation session (see lib/guest-auth.ts). Which
// one it is depends entirely on what the session cookie actually contains,
// not on the URL — a contact-session guest can't view a legacy reservation
// this way and vice versa.
export default async function MyBookingPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params

  const contact = await requireGuestContact(key)
  if (contact) {
    const reservations = await getReservationsForContact(key)
    // A guest with exactly one real booking goes straight to its detail —
    // same one-click experience as before this redesign, rather than an
    // extra list-of-one they'd have to click through every time.
    if (reservations.length === 1) {
      redirect(`/my-booking/${key}/${reservations[0].id}`)
    }
    return <BookingsDashboardClient contact={contact} reservations={reservations} />
  }

  const legacyReservation = await requireLegacyReservationSession(key)
  if (legacyReservation) {
    const paymentSummary = await getPaymentSummary(legacyReservation)
    return (
      <MyBookingClient
        reservation={legacyReservation}
        paymentSummary={paymentSummary}
        basePath={`/my-booking/${key}`}
      />
    )
  }

  redirect('/guest-login')
}
