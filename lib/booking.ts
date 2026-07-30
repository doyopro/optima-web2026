// Deposit rule (replicates the legacy optimavillaslanzarote.com checkout flow):
//
// - If check-in is MORE than 45 days away: guest can choose either
//   - Pay a 20% deposit now, with the remaining 80% balance due 45 days
//     before check-in, OR
//   - Pay the full amount now.
// - If check-in is 45 days away or closer: only "Pay in full" is offered
//   (there's no time left for a separate balance payment before arrival).
//
// DEPOSIT_THRESHOLD_DAYS and DEPOSIT_PERCENTAGE are the two knobs if this
// rule needs to change later.

export const DEPOSIT_THRESHOLD_DAYS = 45
export const DEPOSIT_PERCENTAGE = 0.2

export interface PaymentOptions {
  daysUntilCheckIn: number
  depositAllowed: boolean
  depositAmount: number
  depositBalanceAmount: number
  balanceDueDate: string | null // YYYY-MM-DD
  fullAmount: number
}

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * @param checkInDate YYYY-MM-DD
 * @param totalPrice total stay price, in the listing's currency's minor-less units (e.g. GBP pounds, not pence)
 * @param today defaults to the real current date — overridable for tests
 */
export function getPaymentOptions(
  checkInDate: string,
  totalPrice: number,
  today: Date = new Date(),
): PaymentOptions {
  const checkIn = toDateOnly(new Date(checkInDate))
  const now = toDateOnly(today)
  const daysUntilCheckIn = Math.round((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const depositAllowed = daysUntilCheckIn > DEPOSIT_THRESHOLD_DAYS

  const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENTAGE * 100) / 100
  const depositBalanceAmount = Math.round((totalPrice - depositAmount) * 100) / 100

  let balanceDueDate: string | null = null
  if (depositAllowed) {
    const due = new Date(checkIn)
    due.setDate(due.getDate() - DEPOSIT_THRESHOLD_DAYS)
    balanceDueDate = formatDateOnly(due)
  }

  return {
    daysUntilCheckIn,
    depositAllowed,
    depositAmount,
    depositBalanceAmount,
    balanceDueDate,
    fullAmount: totalPrice,
  }
}
