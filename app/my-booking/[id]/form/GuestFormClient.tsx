'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

interface GuestEntry {
  guest_number: number
  full_name: string
  age: string
  nationality: string
  passport_number: string
  email: string
  phone: string
}

function emptyGuest(guestNumber: number): GuestEntry {
  return { guest_number: guestNumber, full_name: '', age: '', nationality: '', passport_number: '', email: '', phone: '' }
}

export default function GuestFormClient({ reservationId, numGuests }: { reservationId: string; numGuests: number }) {
  const { lang } = useLanguage()
  const t = translations[lang].guestPortal.form
  const dashboardT = translations[lang].guestPortal.dashboard

  const [step, setStep] = useState(1)
  const [guests, setGuests] = useState<GuestEntry[]>(() =>
    Array.from({ length: numGuests }, (_, i) => emptyGuest(i + 1))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [allSaved, setAllSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/my-booking/${reservationId}/form`)
      .then((res) => res.json())
      .then((data) => {
        const entries: { guest_number: number; full_name: string | null; age: number | null; nationality: string | null; passport_number: string | null; email: string | null; phone: string | null }[] =
          data.entries ?? []
        if (entries.length > 0) {
          setGuests((prev) =>
            prev.map((g) => {
              const existing = entries.find((e) => e.guest_number === g.guest_number)
              if (!existing) return g
              return {
                guest_number: g.guest_number,
                full_name: existing.full_name ?? '',
                age: existing.age != null ? String(existing.age) : '',
                nationality: existing.nationality ?? '',
                passport_number: existing.passport_number ?? '',
                email: existing.email ?? '',
                phone: existing.phone ?? '',
              }
            })
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId])

  const current = guests[step - 1]

  function updateCurrent(field: keyof GuestEntry, value: string) {
    setGuests((prev) => prev.map((g, i) => (i === step - 1 ? { ...g, [field]: value } : g)))
  }

  async function saveCurrent(): Promise<boolean> {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/my-booking/${reservationId}/form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      return true
    } catch {
      setError(t.error)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleNext() {
    const ok = await saveCurrent()
    if (!ok) return
    if (step < numGuests) {
      setStep(step + 1)
    } else {
      setAllSaved(true)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-lg px-4 sm:px-6 py-12 sm:py-16">
          {loading ? (
            <p className="text-sm text-dark/50 text-center py-12">…</p>
          ) : allSaved ? (
            <div className="text-center py-12">
              <p className="text-dark text-sm font-medium mb-6">{t.allSaved}</p>
              <Link href={`/my-booking/${reservationId}`} className="text-sm text-orange font-semibold hover:underline">
                {dashboardT.back}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-dark mb-2">{t.title}</h1>
              <p className="text-xs text-dark/50 mb-6">
                {t.step.replace('{current}', String(step)).replace('{total}', String(numGuests))}
              </p>

              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-4">
                <Field label={t.fullName} value={current.full_name} onChange={(v) => updateCurrent('full_name', v)} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t.age} value={current.age} onChange={(v) => updateCurrent('age', v)} type="number" />
                  <Field label={t.nationality} value={current.nationality} onChange={(v) => updateCurrent('nationality', v)} />
                </div>
                <Field label={t.passport} value={current.passport_number} onChange={(v) => updateCurrent('passport_number', v)} />
                <Field label={t.email} value={current.email} onChange={(v) => updateCurrent('email', v)} type="email" />
                <Field label={t.phone} value={current.phone} onChange={(v) => updateCurrent('phone', v)} type="tel" />

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="text-xs text-dark/40 hover:text-orange disabled:opacity-0 transition-colors"
                  >
                    ← {t.back}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={saving}
                    className="bg-orange text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange/90 disabled:opacity-50 transition-colors text-sm"
                  >
                    {saving ? '…' : step < numGuests ? t.next : t.submit}
                  </button>
                </div>
              </div>

              <Link href={`/my-booking/${reservationId}`} className="inline-block mt-6 text-xs text-dark/40 hover:text-orange transition-colors">
                {dashboardT.back}
              </Link>
            </>
          )}
        </div>
      </div>

      <Footer lang={lang} />
      <WhatsAppWidget lang={lang} />
    </>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-orange/40"
      />
    </div>
  )
}
