import { supabaseServer } from '@/lib/supabase-server'
import { getBalanceDueDate } from '@/lib/booking'
import { type GuestReservation } from '@/lib/guest-auth'
import { getGbpToEurRate } from '@/lib/fx-rate'

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
    .select('id, amount_gbp, amount_eur_gross, currency, payment_date, payment_reference, status')
    .eq('reservation_id', reservation.id)
    .in('status', ['succeeded', 'refund'])
    .order('payment_date', { ascending: true })

  // Payments charged in EUR have no GBP figure of their own (amount_gbp is
  // empty), so they would count as "nothing paid". Give each one a GBP
  // equivalent: the exact figure from the website's EUR checkout when we have
  // it (eur_checkout_rates, fixed at booking), otherwise today's rate.
  const rawRows = data ?? []
  const needsGbp = rawRows.some((r) => r.amount_gbp == null && r.currency === 'EUR')
  let fixedRates: { amount_eur: number; amount_gbp: number; fx_rate: number }[] = []
  let liveRate = 0
  if (needsGbp) {
    if (reservation.channel_booking_id) {
      const { data: rates } = await supabaseServer
        .from('eur_checkout_rates')
        .select('amount_eur, amount_gbp, fx_rate')
        .eq('channel_booking_id', reservation.channel_booking_id)
      fixedRates = (rates ?? []).map((r) => ({
        amount_eur: Number(r.amount_eur),
        amount_gbp: Number(r.amount_gbp),
        fx_rate: Number(r.fx_rate),
      }))
    }
    liveRate = await getGbpToEurRate()
  }
  const rows = rawRows.map((row) => {
    if (row.amount_gbp != null || row.currency !== 'EUR') return row
    const eur = Number(row.amount_eur_gross ?? 0)
    const exact = fixedRates.find((r) => Math.abs(r.amount_eur - eur) < 0.01)
    const rate = exact?.fx_rate ?? fixedRates[0]?.fx_rate ?? liveRate
    const gbp = exact ? exact.amount_gbp : rate > 0 ? Math.round((eur / rate) * 100) / 100 : 0
    return { ...row, amount_gbp: gbp }
  })
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
