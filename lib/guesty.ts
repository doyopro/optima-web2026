// Guesty Booking Engine (Guesty's own hosted booking site — not built/maintained by us).
export const GUESTY_BOOKING_ENGINE_HOST = 'optimavillas.guestybookings.com'

// Guesty Booking Engine listing URL pattern: https://{subdomain}.guestybookings.com/properties/{listingId}
export function getGuestyPropertyUrl(guestyListingId?: string | null): string {
  const base = `https://${GUESTY_BOOKING_ENGINE_HOST}`
  return guestyListingId ? `${base}/properties/${guestyListingId}` : base
}
