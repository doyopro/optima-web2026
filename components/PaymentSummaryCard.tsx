'use client'

import { useState } from 'react'
import { type Language, translations } from '@/lib/i18n'
import GuestPayBalanceForm from './GuestPayBalanceForm'
import type { PaymentSummary } from '@/lib/guest-payments'

function formatDate(value: string | null, lang: Language) {
  if (!value) return '—'
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(value: string | null, lang: Language) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function PaymentSummaryCard({
  lang,
  reservationId,
  summary,
  isPastStay = false,
}: {
  lang: Language
  reservationId: string
  summary: PaymentSummary
  // True once check_out has passed. Suppresses the "pay balance" CTA:
  // tested against real data, some old reservations (pre-dating this
  // `payments` ledger, e.g. a 2018 booking) show a nonzero balance_due here
  // purely because that era's payment was never recorded in this table —
  // not because money is actually still owed for a stay years in the past.
  // The summary/history above still renders as-is either way.
  isPastStay?: boolean
}) {
  const t = translations[lang].guestPortal.payments
  const [paying, setPaying] = useState(false)
  const [justPaid, setJustPaid] = useState(false)
  // Reflects payments made in this session immediately, without a full
  // page reload — re-fetching the real server-computed summary is still
  // worth doing on next visit, this is just for instant feedback.
  const [balanceDueGbp, setBalanceDueGbp] = useState(summary.balanceDueGbp)

  const fullyPaid = balanceDueGbp <= 0.005

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-5">
      <h2 className="text-sm font-bold text-dark uppercase tracking-wide">{t.title}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold mb-1">{t.totalPrice}</p>
          <p className="text-sm font-medium text-dark">£{summary.totalPriceGbp.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold mb-1">{t.paidSoFar}</p>
          <p className="text-sm font-medium text-dark">£{summary.paidSoFarGbp.toFixed(2)}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-100">
        {fullyPaid ? (
          <p className="text-sm font-semibold text-green-700">{t.fullyPaid}</p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold mb-1">{t.balanceDue}</p>
              <p className="text-lg font-bold text-orange">£{balanceDueGbp.toFixed(2)}</p>
            </div>
            {summary.balanceDueDate && (
              <div className="text-right">
                <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold mb-1">{t.balanceDueDate}</p>
                <p className="text-sm text-dark">{formatDate(summary.balanceDueDate, lang)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {summary.payments.length > 0 && (
        <div className="pt-4 border-t border-neutral-100">
          <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold mb-2">{t.history}</p>
          <ul className="space-y-1.5">
            {summary.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-dark/60">{formatDateTime(p.date, lang)}</span>
                <span className="font-medium text-dark">£{p.amountGbp.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!fullyPaid && !justPaid && !isPastStay && (
        <div className="pt-4 border-t border-neutral-100">
          {paying ? (
            <GuestPayBalanceForm
              lang={lang}
              reservationId={reservationId}
              balanceDueGbp={balanceDueGbp}
              onSuccess={() => {
                setJustPaid(true)
                setPaying(false)
                setBalanceDueGbp(0)
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setPaying(true)}
              className="w-full bg-orange text-white font-semibold py-3 rounded-lg hover:bg-orange/90 transition-colors text-sm"
            >
              {t.payBalanceCta}
            </button>
          )}
        </div>
      )}

      {justPaid && (
        <p className="text-sm font-semibold text-green-700 pt-4 border-t border-neutral-100">
          {t.payBalanceSuccess}
        </p>
      )}
    </div>
  )
}
