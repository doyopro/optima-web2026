import { supabaseServer } from '@/lib/supabase-server'
import { getBalanceDueDate } from '@/lib/booking'
import { type GuestReservation } from '@/lib/guest-auth'
import { getGbpToEurRate } from '@/lib/fx-rate'
import { EUR_CHECKOUT_ENABLED } from '@/lib/features'

export interface GuestPaymentEntry {
  id: string
  amountGbp: number
  amountEur: number | null // exact euros when the payment was charged in EUR
  date: string | null
  reference: string | null
}

export interface PaymentSummary {
  totalPriceGbp: number
  paidSoFarGbp: number
  balanceDueGbp: number
  balanceDueDate: string | null
  payments: GuestPaymentEntry[]
  // Only present for reservations booked through the EUR checkout: the
  // balance in euros at the rate fixed at booking (null otherwise).
  eur: { rate: number; totalEur: number; paidEur: number; balanceDueEur: number } | null
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
  const rawRows: NonNullable<typeof data> = [...(data ?? [])]
  const needsGbp = rawRows.some((r) => r.amount_gbp == null && r.currency === 'EUR')
  let fixedRates: { id: string; created_at: string | null; amount_eur: number; amount_gbp: number; fx_rate: number }[] = []
  let liveRate = 0
  let totalEurFixed = 0
  if ((needsGbp || EUR_CHECKOUT_ENABLED) && reservation.channel_booking_id) {
    const { data: rates } = await supabaseServer
      .from('eur_checkout_rates')
      .select('payment_intent_id, created_at, amount_eur, amount_gbp, fx_rate, total_eur')
      .eq('channel_booking_id', reservation.channel_booking_id)
    fixedRates = (rates ?? []).map((r) => ({
      id: String(r.payment_intent_id),
      created_at: r.created_at ?? null,
      amount_eur: Number(r.amount_eur),
      amount_gbp: Number(r.amount_gbp),
      fx_rate: Number(r.fx_rate),
    }))
    totalEurFixed = Math.max(0, ...(rates ?? []).map((r) => Number(r.total_eur ?? 0)))
  }
  if (needsGbp) liveRate = await getGbpToEurRate()
  // The website's EUR checkout charge is written to `payments` by an external
  // workflow that can't link it to the reservation yet (the GY- code only
  // exists after the charge). Until that row is linked, count the checkout's
  // own record (eur_checkout_rates, written by the verified webhook) so the
  // guest never sees a deposit they paid as "nothing paid".
  if (EUR_CHECKOUT_ENABLED) {
    // The external workflow labels every charge "GBP" with an approximate
    // GBP figure, so match by the euro amount instead: a linked row whose
    // euros equal a recorded checkout payment IS that payment — use the
    // exact figures from eur_checkout_rates for it.
    const used = new Set<number>()
    for (const rate of fixedRates) {
      const i = rawRows.findIndex(
        (r, idx) => !used.has(idx) && Math.abs(Number(r.amount_eur_gross ?? 0) - rate.amount_eur) < 0.01,
      )
      if (i >= 0) {
        used.add(i)
        rawRows[i] = { ...rawRows[i], currency: 'EUR', amount_gbp: rate.amount_gbp }
        continue
      }
      rawRows.push({
        id: `checkout-${rate.id}`,
        amount_gbp: rate.amount_gbp,
        amount_eur_gross: rate.amount_eur,
        currency: 'EUR',
        payment_date: rate.created_at,
        payment_reference: null,
        status: 'succeeded',
      } as (typeof rawRows)[number])
    }
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

  // EUR view: total fixed at booking minus what was actually paid in euros.
  let eur: PaymentSummary['eur'] = null
  if (EUR_CHECKOUT_ENABLED && fixedRates.length > 0 && totalEurFixed > 0) {
    const paidEur = rawRows
      .filter((r) => r.currency === 'EUR')
      .reduce((sum, r) => {
        const v = Math.abs(Number(r.amount_eur_gross ?? 0))
        return sum + (r.status === 'refund' ? -v : v)
      }, 0)
    eur = {
      rate: fixedRates[0].fx_rate,
      totalEur: totalEurFixed,
      paidEur: Math.round(paidEur * 100) / 100,
      balanceDueEur: Math.max(0, Math.round((totalEurFixed - paidEur) * 100) / 100),
    }
  }

  const balanceDueDate =
    balanceDueGbp > 0 && reservation.check_in ? getBalanceDueDate(reservation.check_in) : null

  return {
    totalPriceGbp,
    paidSoFarGbp: Math.round(paidSoFarGbp * 100) / 100,
    balanceDueGbp,
    balanceDueDate,
    eur,
    payments: rows
      // Refund rows are already netted into paidSoFarGbp above; the
      // itemized list below is "payments the guest made", so only the
      // positive/succeeded ones are worth listing individually.
      .filter((row) => Number(row.amount_gbp ?? 0) > 0)
      .map((row) => ({
        id: row.id,
        amountGbp: Number(row.amount_gbp ?? 0),
        amountEur: row.currency === 'EUR' ? Math.abs(Number(row.amount_eur_gross ?? 0)) : null,
        date: row.payment_date,
        reference: row.payment_reference,
      })),
  }
}
