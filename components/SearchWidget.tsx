'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Villa {
  id: string
  name: string
}

export default function SearchWidget({ lang: _lang }: { lang?: string }) {
  const router = useRouter()

  const [isGuestOpen, setIsGuestOpen] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [villaId, setVillaId] = useState('')
  const [villas, setVillas] = useState<Villa[]>([])
  const [loadingVillas, setLoadingVillas] = useState(true)

  const guestDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setIsGuestOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
  const guestLabel = `${totalGuests} Guest${totalGuests !== 1 ? 's' : ''}${infants > 0 ? `, ${infants} Infant${infants !== 1 ? 's' : ''}` : ''}`

  function handleSearch() {
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (totalGuests > 1) params.set('guests', String(totalGuests))
    if (villaId) params.set('villa', villaId)
    router.push(`/villas/search?${params}`)
  }

  return (
    <div className="rounded-2xl bg-white shadow-xl border border-neutral-100 p-4 sm:p-6">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200">

        {/* DATES */}
        <div className="flex w-full md:w-auto flex-1 gap-4">
          <div className="flex w-full flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-dark/70">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full text-sm text-dark font-medium bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          <div className="flex w-full flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-dark/70">To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-sm text-dark font-medium bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* GUESTS POPOVER */}
        <div
          className="relative flex w-full md:w-auto flex-1 flex-col gap-1.5 pt-4 md:pt-0 md:pl-6"
          ref={guestDropdownRef}
        >
          <label className="text-xs font-bold uppercase tracking-wide text-dark/70">Guests</label>
          <button
            type="button"
            onClick={() => setIsGuestOpen(!isGuestOpen)}
            className="w-full text-left text-sm text-dark font-medium bg-transparent focus:outline-none flex justify-between items-center"
          >
            {guestLabel}
            <span className={`text-xs transition-transform duration-200 ${isGuestOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isGuestOpen && (
            <div className="absolute top-full left-0 mt-4 w-72 rounded-xl bg-white p-5 shadow-2xl border border-neutral-100 z-50">
              {/* Adults */}
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-bold text-dark">Adults</p>
                  <p className="text-xs text-dark/60">Over 18 years</p>
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
                  <p className="text-sm font-bold text-dark">Children</p>
                  <p className="text-xs text-dark/60">2 to 18 years</p>
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
                  <p className="text-sm font-bold text-dark">Infants</p>
                  <p className="text-xs text-dark/60">Using a cot</p>
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
        <div className="flex w-full md:w-auto flex-1 flex-col gap-1.5 pt-4 md:pt-0 md:pl-6">
          <label className="text-xs font-bold uppercase tracking-wide text-dark/70">
            Villa (optional)
          </label>
          <select
            value={villaId}
            onChange={(e) => setVillaId(e.target.value)}
            disabled={loadingVillas}
            className="w-full text-sm text-dark font-medium bg-transparent focus:outline-none cursor-pointer appearance-none disabled:opacity-50"
          >
            <option value="">{loadingVillas ? 'Loading...' : 'Select a property'}</option>
            {villas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH BUTTON */}
        <div className="w-full md:w-auto pt-4 md:pt-0 md:pl-4 flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full md:w-32 rounded-xl bg-orange px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-orange/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange/50 active:scale-95"
          >
            Search
          </button>
        </div>

      </div>
    </div>
  )
}
