'use client'

import { DayPicker, type DateRange } from 'react-day-picker'
import { es, enGB } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { type Language } from '@/lib/i18n'
import { type BookedRange } from '@/lib/availability'

interface Props {
  lang: Language
  bookedRanges: BookedRange[]
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromISO(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function DateRangePicker({ lang, bookedRanges, from, to, onChange }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // checkOut itself isn't a booked night (hotel-nights convention, same as
  // the rest of the app) — the last actually-booked night is the day before.
  const disabledRanges = bookedRanges
    .map((r) => {
      const checkIn = fromISO(r.checkIn)
      const checkOut = fromISO(r.checkOut)
      if (!checkIn || !checkOut) return null
      const lastBookedNight = new Date(checkOut)
      lastBookedNight.setDate(lastBookedNight.getDate() - 1)
      if (lastBookedNight < checkIn) return null
      return { from: checkIn, to: lastBookedNight }
    })
    .filter((r): r is { from: Date; to: Date } => r !== null)

  const selected: DateRange | undefined = from
    ? { from: fromISO(from), to: to ? fromISO(to) : undefined }
    : undefined

  function handleSelect(range: DateRange | undefined) {
    onChange(range?.from ? toISO(range.from) : '', range?.to ? toISO(range.to) : '')
  }

  return (
    <div className="optima-daypicker">
      <DayPicker
        mode="range"
        locale={lang === 'es' ? es : enGB}
        selected={selected}
        onSelect={handleSelect}
        disabled={[{ before: today }, ...disabledRanges]}
        excludeDisabled
        numberOfMonths={1}
        defaultMonth={selected?.from ?? today}
        showOutsideDays
      />
    </div>
  )
}
