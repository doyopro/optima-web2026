// Guesty's hosted Booking Engine (not built or maintained by us).
// Recovered from git history (commit cefc14a / 6878a33). Verified live
// 2026-10-21: /properties/{guesty_listing_id}?checkIn&checkOut&adults loads the
// villa with the same total as our quote and reaches the Guesty/Stripe payment
// form; dates that are already booked show no "Book now".
export const GUESTY_BOOKING_ENGINE_HOST = 'optimavillas.guestybookings.com'

export function getGuestyBookingUrl(
  guestyListingId: string,
  opts: { checkIn?: string; checkOut?: string; guests?: number } = {},
): string {
  const q = new URLSearchParams()
  if (opts.checkIn) q.set('checkIn', opts.checkIn)
  if (opts.checkOut) q.set('checkOut', opts.checkOut)
  q.set('minOccupancy', String(opts.guests ?? 2))
  q.set('adults', String(opts.guests ?? 2))
  return `https://${GUESTY_BOOKING_ENGINE_HOST}/properties/${guestyListingId}?${q.toString()}`
}
