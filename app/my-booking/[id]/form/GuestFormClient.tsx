'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import { COUNTRIES } from '@/lib/countries'
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

export default function GuestFormClient({
  reservationId,
  numGuests,
  guestName,
  guestEmail,
  guestPhone,
}: {
  reservationId: string
  numGuests: number
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
}) {
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
  const isPrimaryGuest = step === 1
  const displayName = isPrimaryGuest ? guestName || '' : current.full_name
  const canProceed = current.age.trim() !== '' && current.nationality.trim() !== '' && current.passport_number.trim() !== ''

  function updateCurrent(field: keyof GuestEntry, value: string) {
    setGuests((prev) => prev.map((g, i) => (i === step - 1 ? { ...g, [field]: value } : g)))
  }

  async function saveCurrent(): Promise<boolean> {
    setSaving(true)
    setError('')
    try {
      const payload = isPrimaryGuest ? { ...current, full_name: guestName || '' } : current
      const res = await fetch(`/api/my-booking/${reservationId}/form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    if (!canProceed) return
    const ok = await saveCurrent()
    if (!ok) return
    if (step < numGuests) {
      setStep(step + 1)
    } else {
      setAllSaved(true)
    }
  }

  const progressPct = Math.round((step / numGuests) * 100)

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
              <p className="text-xs text-dark/50 mb-3">
                {displayName
                  ? t.step.replace('{current}', String(step)).replace('{total}', String(numGuests)).replace('{name}', displayName)
                  : t.stepUnnamed.replace('{current}', String(step)).replace('{total}', String(numGuests))}
              </p>

              <div className="h-1.5 w-full rounded-full bg-neutral-200 mb-6 overflow-hidden">
                <div className="h-full rounded-full bg-orange transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-4">
                {isPrimaryGuest ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">{t.fullName}</label>
                    <p className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-dark/50">
                      {guestName || '—'}
                    </p>
                  </div>
                ) : (
                  <Field
                    label={`${t.fullName} (${t.optional})`}
                    value={current.full_name}
                    onChange={(v) => updateCurrent('full_name', v)}
                    placeholder={t.fullNamePlaceholder}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field label={t.age} value={current.age} onChange={(v) => updateCurrent('age', v)} type="number" required />
                  <SelectField
                    label={t.nationality}
                    value={current.nationality}
                    onChange={(v) => updateCurrent('nationality', v)}
                    placeholder={t.selectNationality}
                    required
                  />
                </div>
                <Field
                  label={t.passport}
                  value={current.passport_number}
                  onChange={(v) => updateCurrent('passport_number', v)}
                  required
                />
                <Field
                  label={`${t.email} (${t.optional})`}
                  value={current.email}
                  onChange={(v) => updateCurrent('email', v)}
                  type="email"
                  placeholder={guestEmail ? t.sameAsBooking : undefined}
                />
                <Field
                  label={`${t.phone} (${t.optional})`}
                  value={current.phone}
                  onChange={(v) => updateCurrent('phone', v)}
                  type="tel"
                  placeholder={guestPhone ? t.sameAsBooking : undefined}
                />

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
                    disabled={saving || !canProceed}
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
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">
        {label}
        {required && <span className="text-orange"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-dark placeholder:text-dark/30 focus:outline-none focus:ring-2 focus:ring-orange/40"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-dark/40 mb-1.5">
        {label}
        {required && <span className="text-orange"> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-orange/40 bg-white"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}
