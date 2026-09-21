import { supabaseServer } from '@/lib/supabase-server'
import { getBalanceDueDate } from '@/lib/booking'
import { type GuestReservation } from '@/lib/guest-auth'

export interface GuestPaymentEntry {
  id: string
  amountGbp: number
  date: string | null
  reference: string | null
}

export interface PaymentSummary {
  totalPriceGbp: number
  paidSoFarGbp: number
  balanceDueGbp: number
  balanceDueDate: string | null
  payments: GuestPaymentEntry[]
}

// Balance math is done entirely in GBP:
//   - paid_so_far sums payments.amount_gbp, which is always the real
//     Stripe-charged amount regardless of a reservation's display currency
//     (confirmed elsewhere in this codebase: Stripe/Guesty pricing is
//     always GBP; reservations.amount_eur is a converted display figure,
//     not a separately charged amount).
//   - includes status='refund' rows, not just 'succeeded': tested against
//     real data (reservation 5a944e7f-...) where a guest paid in full then
//     received a partial refund — summing only 'succeeded' rows produced a
//     balance_due of -378 (reads as "overpaid") when the true remaining
//     balance was 0. Refund rows already carry a negative amount_gbp, so
//     including them nets correctly.
//   - rows with an empty/unknown status are excluded — safer than assuming
//     they succeeded.
// totalPriceGbp always uses reservations.amount_gbp for the same reason —
// mixing a GBP-summed paid total against a EUR-denominated total would be
// comparing different currencies. If a reservation's display currency is
// EUR, convert totalPriceGbp/paidSoFarGbp/balanceDueGbp for display only,
// the same way the rest of the site converts GBP for display (lib/currency.ts).
export async function getPaymentSummary(reservation: GuestReservation): Promise<PaymentSummary> {
  const totalPriceGbp = Number(reservation.amount_gbp ?? 0)

  const { data } = await supabaseServer
    .from('payments')
    .select('id, amount_gbp, payment_date, payment_reference, status')
    .eq('reservation_id', reservation.id)
    .in('status', ['succeeded', 'refund'])
    .order('payment_date', { ascending: true })

  const rows = data ?? []
  const paidSoFarGbp = rows.reduce((sum, row) => sum + Number(row.amount_gbp ?? 0), 0)
  const balanceDueGbp = Math.round((totalPriceGbp - paidSoFarGbp) * 100) / 100

  const balanceDueDate =
    balanceDueGbp > 0 && reservation.check_in ? getBalanceDueDate(reservation.check_in) : null

  return {
    totalPriceGbp,
    paidSoFarGbp: Math.round(paidSoFarGbp * 100) / 100,
    balanceDueGbp,
    balanceDueDate,
    payments: rows
      // Refund rows are already netted into paidSoFarGbp above; the
      // itemized list below is "payments the guest made", so only the
      // positive/succeeded ones are worth listing individually.
      .filter((row) => Number(row.amount_gbp ?? 0) > 0)
      .map((row) => ({
        id: row.id,
        amountGbp: Number(row.amount_gbp ?? 0),
        date: row.payment_date,
        reference: row.payment_reference,
      })),
  }
}
