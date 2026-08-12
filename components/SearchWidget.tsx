'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'
import DateRangePicker from '@/components/DateRangePicker'

interface Villa {
  id: string
  name: string
}

// Displayed date format is fully controlled here via lang, not the
// browser/OS locale — the whole reason for moving off native <input
// type="date"> in the first place (its placeholder/format leaks the
// visitor's OS locale regardless of our own EN/ES toggle).
function formatShortDate(value: string, lang: string): string {
  if (!value) return ''
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export default function SearchWidget() {
  const router = useRouter()
  const { lang } = useLanguage()

  const t = translations[lang].search

  const [isGuestOpen, setIsGuestOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [villaId, setVillaId] = useState('')
  const [villas, setVillas] = useState<Villa[]>([])
  const [loadingVillas, setLoadingVillas] = useState(true)

  const guestDropdownRef = useRef<HTMLDivElement>(null)
  const dateDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setIsGuestOpen(false)
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleDateChange(from: string, to: string) {
    setFromDate(from)
    setToDate(to)
    if (from && to) setIsDateOpen(false)
  }

  useEffect(() => {
    fetch('/api/villas')
      .then((r) => r.json())
      .then((data) =>
        setVillas(
          (data.properties ?? []).map((v: Record<string, unknown>) => ({
            id: v.id as string,
            name: (v.name as string) || (v.nickname as string) || String(v.id),
          })),
        ),
      )
      .catch(() => {})
      .finally(() => setLoadingVillas(false))
  }, [])

  const totalGuests = adults + children
  const guestWord = totalGuests !== 1 ? t.guestWordPlural : t.guestWord
  const infantWord = infants !== 1 ? t.infantWordPlural : t.infantWord
  const guestLabel = `${totalGuests} ${guestWord}${infants > 0 ? `, ${infants} ${infantWord}` : ''}`

  function handleSearch() {
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (totalGuests > 1) params.set('guests', String(totalGuests))
    if (villaId) params.set('villa', villaId)
    router.push(`/villas?${params}`)
  }

  return (
    <div className="rounded-md bg-white/85 backdrop-blur-md shadow-md border border-white/50 p-2 sm:p-2.5">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200/70">

        {/* DATES — label always shown; only the value slot swaps between a
            light gray dd/mm/yyyy placeholder and the picked date once set
            (the "Add dates" wording was the only thing to remove, not the
            labels). */}
        <div className="relative flex w-full md:w-auto flex-1 gap-4" ref={dateDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="flex w-full items-center gap-2 text-left py-1.5"
          >
            <Calendar className="h-5 w-5 text-dark/50 shrink-0" aria-hidden="true" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-dark/60">{t.from}</span>
              <span className={`text-sm font-medium ${fromDate ? 'text-dark' : 'text-dark/35'}`}>
                {fromDate ? formatShortDate(fromDate, lang) : t.addDates}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="flex w-full items-center gap-2 text-left py-1.5"
          >
            <Calendar className="h-5 w-5 text-dark/50 shrink-0" aria-hidden="true" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-dark/60">{t.to}</span>
              <span className={`text-sm font-medium ${toDate ? 'text-dark' : 'text-dark/35'}`}>
                {toDate ? formatShortDate(toDate, lang) : t.addDates}
              </span>
            </span>
          </button>

          {isDateOpen && (
            <div className="absolute top-full left-0 mt-4 rounded-md bg-white p-4 shadow-lg border border-neutral-200 z-50 overflow-x-auto max-w-[calc(100vw-2rem)]">
              <DateRangePicker
                lang={lang}
                bookedRanges={[]}
                from={fromDate}
                to={toDate}
                onChange={handleDateChange}
              />
            </div>
          )}
        </div>

        {/* GUESTS POPOVER */}
        <div
          className="relative flex w-full md:w-auto flex-1 flex-col gap-1.5 pt-2 md:pt-0 md:pl-6"
          ref={guestDropdownRef}
        >
          <label className="text-xs font-bold uppercase tracking-wide text-dark/70">{t.guests}</label>
          <button
            type="button"
            onClick={() => setIsGuestOpen(!isGuestOpen)}
            className="w-full text-left text-sm text-dark font-medium bg-transparent focus:outline-none flex justify-between items-center"
          >
            {guestLabel}
            <span className={`text-xs transition-transform duration-200 ${isGuestOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isGuestOpen && (
            <div className="absolute top-full left-0 mt-4 w-72 rounded-md bg-white p-5 shadow-lg border border-neutral-200 z-50">
              {/* Adults */}
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-bold text-dark">{t.adults}</p>
                  <p className="text-xs text-dark/60">{t.adultsSub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-dark hover:border-orange hover:text-orange transition-colors disabled:opacity-30"
                  >−</button>
                  <span className="w-4 text-center text-sm font-semibold">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(adults + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-white hover:bg-orange/90 transition-colors"
                  >+</button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-bold text-dark">{t.children}</p>
                  <p className="text-xs text-dark/60">{t.childrenSub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-dark hover:border-orange hover:text-orange transition-colors disabled:opacity-30"
                  >−</button>
                  <span className="w-4 text-center text-sm font-semibold">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-white hover:bg-orange/90 transition-colors"
                  >+</button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-sm font-bold text-dark">{t.infants}</p>
                  <p className="text-xs text-dark/60">{t.infantsSub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-dark hover:border-orange hover:text-orange transition-colors disabled:opacity-30"
                  >−</button>
                  <span className="w-4 text-center text-sm font-semibold">{infants}</span>
                  <button
                    type="button"
                    onClick={() => setInfants(infants + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-white hover:bg-orange/90 transition-colors"
                  >+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* VILLA SELECT */}
        <div className="flex w-full md:w-auto flex-1 flex-col gap-1.5 pt-2 md:pt-0 md:pl-6">
          <label className="text-xs font-bold uppercase tracking-wide text-dark/70">
            {t.villaOptional}
          </label>
          <select
            value={villaId}
            onChange={(e) => setVillaId(e.target.value)}
            disabled={loadingVillas}
            className="w-full text-sm text-dark font-medium bg-transparent focus:outline-none cursor-pointer appearance-none disabled:opacity-50"
          >
            <option value="">{loadingVillas ? t.loading : t.selectProperty}</option>
            {villas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH BUTTON */}
        <div className="w-full md:w-auto pt-2 md:pt-0 md:pl-4 flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full md:w-40 rounded-md bg-blue px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue/50 active:scale-95"
          >
            {t.search}
          </button>
        </div>

      </div>
    </div>
  )
}
