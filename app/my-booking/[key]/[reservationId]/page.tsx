import { redirect } from 'next/navigation'
import { requireGuestReservation } from '@/lib/guest-auth'
import { getPaymentSummary } from '@/lib/guest-payments'
import MyBookingClient from '../MyBookingClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Contact-scoped reservation detail — `key` is the logged-in contact's id,
// `reservationId` one of their bookings. requireGuestReservation verifies
// both that the session belongs to `key` AND that this reservation actually
// belongs to that contact.
export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ key: string; reservationId: string }>
}) {
  const { key, reservationId } = await params
  const reservation = await requireGuestReservation(key, reservationId)

  if (!reservation) {
    redirect('/guest-login')
  }

  const paymentSummary = await getPaymentSummary(reservation)

  return (
    <MyBookingClient
      reservation={reservation}
      paymentSummary={paymentSummary}
      basePath={`/my-booking/${key}/${reservationId}`}
      backHref={`/my-booking/${key}`}
    />
  )
}
