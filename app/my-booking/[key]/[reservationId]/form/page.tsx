import { redirect } from 'next/navigation'
import { requireGuestReservation } from '@/lib/guest-auth'
import GuestFormClient from '../../../GuestFormClient'

export default async function ReservationGuestFormPage({
  params,
}: {
  params: Promise<{ key: string; reservationId: string }>
}) {
  const { key, reservationId } = await params
  const reservation = await requireGuestReservation(key, reservationId)

  if (!reservation) {
    redirect('/guest-login')
  }

  return <GuestFormClient reservationId={reservationId} numGuests={reservation.num_guests ?? 1} />
}
