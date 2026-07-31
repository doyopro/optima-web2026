export interface BookedRange {
  checkIn: string
  checkOut: string
}

/**
 * True if [from, to) overlaps any booked range, using the standard
 * hotel-nights convention: a checkout date is not itself a booked night, so
 * a new stay may start the same day another one ends.
 */
export function rangeOverlapsBooking(from: string, to: string, bookedRanges: BookedRange[]): boolean {
  return bookedRanges.some((r) => from < r.checkOut && to > r.checkIn)
}
