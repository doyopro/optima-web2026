'use client'

import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { translations } from '@/lib/i18n'
import { useLanguage } from '@/lib/LanguageContext'

// Internal admin tool — no PIN/auth yet (to be added dashboard-wide in a
// later phase). Talks to our own /api/guides* routes rather than Supabase
// directly, so the service-role key stays server-side.

interface GuideRow {
  id: string
  slug: string
  section: string
  content_en: string
  content_es: string
  metadata: { icon?: string; order?: number; hero_image?: string }
  is_published: boolean
}

interface BeachRow {
  id: string
  name_en: string
  name_es: string
  description_en: string
  description_es: string
  location: string
  distance_km: string | number | null
  sand_type: string
  difficulty: number
  beach_type: Record<string, boolean>
  amenities: Record<string, boolean>
  latitude: string | number | null
  longitude: string | number | null
  image_url: string | null
  rating: string | number | null
  is_published: boolean
}

interface FerryRow {
  id: string
  name: string
  name_es: string
  route_from: string
  route_to: string
  duration_minutes: number | null
  frequency_daily: number | null
  price_eur: string | number | null
  website: string
  contact_phone: string
  amenities: Record<string, boolean>
  luggage_limit_kg: number | null
  notes_en: string
  notes_es: string
  is_published: boolean
}

type Tab = 'content' | 'beaches' | 'ferries'

export default function GuidesDashboardPage() {
  const { lang } = useLanguage()
  const t = translations[lang].guidesAdmin
  const [tab, setTab] = useState<Tab>('content')

  return (
    <div className="py-8 px-4 sm:px-6">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-dark mb-6">{t.title}</h1>

        <div className="flex gap-2 mb-6 border-b border-neutral-200">
          {(['content', 'beaches', 'ferries'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-orange text-orange' : 'border-transparent text-dark/50 hover:text-dark'
              }`}
            >
              {t.tabs[key]}
            </button>
          ))}
        </div>

        {tab === 'content' && <ContentTab />}
        {tab === 'beaches' && <BeachesTab />}
        {tab === 'ferries' && <FerriesTab />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------

function LoadError({ onRetry, label, retryLabel }: { onRetry: () => void; label: string; retryLabel: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
      <p className="text-dark/60 mb-4">{label}</p>
      <button
        type="button"
        onClick={onRetry}
        className="bg-orange text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange/90 transition-colors text-sm"
      >
        {retryLabel}
      </button>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-14 border-b border-neutral-100 last:border-0" />
      ))}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-dark">{title}</h2>
          <button type="button" onClick={onClose} className="text-dark/40 hover:text-dark text-lg leading-none">✕</button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-dark/50 mb-1">{label}</span>
      {children}
    </label>
  )
}

const inputClass = 'w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/40'

// ---------------------------------------------------------------------
// Guides Content tab
// ---------------------------------------------------------------------

function ContentTab() {
  const { lang } = useLanguage()
  const t = translations[lang].guidesAdmin
  const f = t.fields

  const [guides, setGuides] = useState<GuideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState<GuideRow | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    setError(false)
    fetch('/api/guides?all=true')
      .then((r) => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((d) => setGuides(d.guides ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function togglePublished(guide: GuideRow) {
    try {
      const res = await fetch(`/api/guides/${guide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !guide.is_published }),
      })
      if (!res.ok) throw new Error('failed')
      setGuides((prev) => prev.map((g) => (g.id === guide.id ? { ...g, is_published: !g.is_published } : g)))
      toast.success(t.saveSuccess)
    } catch {
      toast.error(t.saveError)
    }
  }

  async function save(updated: GuideRow) {
    setSaving(true)
    try {
      const res = await fetch(`/api/guides/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_en: updated.content_en,
          content_es: updated.content_es,
          is_published: updated.is_published,
        }),
      })
      if (!res.ok) throw new Error('failed')
      setGuides((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
      toast.success(t.saveSuccess)
      setEditing(null)
    } catch {
      toast.error(t.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <TableSkeleton />
  if (error) return <LoadError onRetry={load} label={t.loadError} retryLabel={t.retry} />

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-neutral-50 text-dark/60 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">{t.columns.section}</th>
              <th className="text-left px-4 py-3">{t.columns.slug}</th>
              <th className="text-left px-4 py-3">{t.columns.published}</th>
              <th className="text-right px-4 py-3">{t.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium text-dark">{guide.metadata?.icon} {guide.section}</td>
                <td className="px-4 py-3 text-dark/60">{guide.slug}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => togglePublished(guide)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                      guide.is_published ? 'bg-green/10 text-green-700' : 'bg-neutral-100 text-dark/50'
                    }`}
                  >
                    {guide.is_published ? t.published : t.unpublished}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setEditing(guide)} className="text-orange font-semibold hover:underline">
                    {t.edit}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`${t.edit}: ${editing.section}`} onClose={() => setEditing(null)}>
          <Field label={f.contentEn}>
            <textarea
              className={inputClass}
              rows={5}
              value={editing.content_en}
              onChange={(e) => setEditing({ ...editing, content_en: e.target.value })}
            />
          </Field>
          <Field label={f.contentEs}>
            <textarea
              className={inputClass}
              rows={5}
              value={editing.content_es}
              onChange={(e) => setEditing({ ...editing, content_es: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.is_published}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
            />
            {t.published}
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-dark/60 hover:text-dark">
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(editing)}
              className="bg-orange text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange/90 transition-colors text-sm disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---------------------------------------------------------------------
// Beaches tab
// ---------------------------------------------------------------------

const EMPTY_BEACH: Omit<BeachRow, 'id'> = {
  name_en: '', name_es: '', description_en: '', description_es: '', location: '',
  distance_km: '', sand_type: '', difficulty: 1, beach_type: {}, amenities: {},
  latitude: '', longitude: '', image_url: '', rating: '', is_published: false,
}

function BeachesTab() {
  const { lang } = useLanguage()
  const t = translations[lang].guidesAdmin
  const f = t.fields

  const [beaches, setBeaches] = useState<BeachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState<BeachRow | (Omit<BeachRow, 'id'> & { id?: string }) | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    setError(false)
    fetch('/api/guides/beaches?all=true')
      .then((r) => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((d) => setBeaches(d.beaches ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function remove(id: string) {
    if (!window.confirm(t.confirmDelete)) return
    try {
      const res = await fetch(`/api/guides/beaches/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      setBeaches((prev) => prev.filter((b) => b.id !== id))
      toast.success(t.deleteSuccess)
    } catch {
      toast.error(t.deleteError)
    }
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    const isNew = !('id' in editing) || !editing.id
    try {
      const payload = {
        ...editing,
        distance_km: editing.distance_km === '' ? null : Number(editing.distance_km),
        latitude: editing.latitude === '' ? null : Number(editing.latitude),
        longitude: editing.longitude === '' ? null : Number(editing.longitude),
        rating: editing.rating === '' ? null : Number(editing.rating),
        difficulty: Number(editing.difficulty),
      }
      const res = await fetch(isNew ? '/api/guides/beaches' : `/api/guides/beaches/${(editing as BeachRow).id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      const saved: BeachRow = data.beach
      setBeaches((prev) => (isNew ? [...prev, saved] : prev.map((b) => (b.id === saved.id ? saved : b))))
      toast.success(t.saveSuccess)
      setEditing(null)
    } catch {
      toast.error(t.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <TableSkeleton />
  if (error) return <LoadError onRetry={load} label={t.loadError} retryLabel={t.retry} />

  return (
    <>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_BEACH })}
          className="bg-orange text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors text-sm"
        >
          + {t.newBeach}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-neutral-50 text-dark/60 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">{t.columns.nameEn}</th>
              <th className="text-left px-4 py-3">{t.columns.nameEs}</th>
              <th className="text-left px-4 py-3">{t.columns.location}</th>
              <th className="text-left px-4 py-3">{t.columns.difficulty}</th>
              <th className="text-left px-4 py-3">{t.columns.rating}</th>
              <th className="text-right px-4 py-3">{t.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {beaches.map((beach) => (
              <tr key={beach.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium text-dark">{beach.name_en}</td>
                <td className="px-4 py-3 text-dark/60">{beach.name_es}</td>
                <td className="px-4 py-3 text-dark/60">{beach.location}</td>
                <td className="px-4 py-3 text-dark/60">{beach.difficulty}</td>
                <td className="px-4 py-3 text-dark/60">{beach.rating}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <button type="button" onClick={() => setEditing(beach)} className="text-orange font-semibold hover:underline">
                    {t.edit}
                  </button>
                  <button type="button" onClick={() => remove(beach.id)} className="text-red-600 font-semibold hover:underline">
                    {t.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={'id' in editing && editing.id ? `${t.edit}: ${editing.name_en}` : t.newBeach} onClose={() => setEditing(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={f.nameEn}>
              <input className={inputClass} value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} />
            </Field>
            <Field label={f.nameEs}>
              <input className={inputClass} value={editing.name_es} onChange={(e) => setEditing({ ...editing, name_es: e.target.value })} />
            </Field>
          </div>
          <Field label={f.descriptionEn}>
            <textarea className={inputClass} rows={2} value={editing.description_en} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
          </Field>
          <Field label={f.descriptionEs}>
            <textarea className={inputClass} rows={2} value={editing.description_es} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} />
          </Field>
          <Field label={f.location}>
            <input className={inputClass} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label={f.distanceKm}>
              <input type="number" className={inputClass} value={editing.distance_km ?? ''} onChange={(e) => setEditing({ ...editing, distance_km: e.target.value })} />
            </Field>
            <Field label={f.sandType}>
              <input className={inputClass} value={editing.sand_type} onChange={(e) => setEditing({ ...editing, sand_type: e.target.value })} />
            </Field>
            <Field label={f.difficulty}>
              <input type="number" min={1} max={3} className={inputClass} value={editing.difficulty} onChange={(e) => setEditing({ ...editing, difficulty: Number(e.target.value) })} />
            </Field>
            <Field label={f.rating}>
              <input type="number" step="0.5" min={0} max={5} className={inputClass} value={editing.rating ?? ''} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={f.beachType}>
              <JsonTextarea value={editing.beach_type} onChange={(v) => setEditing({ ...editing, beach_type: v })} />
            </Field>
            <Field label={f.amenities}>
              <JsonTextarea value={editing.amenities} onChange={(v) => setEditing({ ...editing, amenities: v })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label={f.latitude}>
              <input type="number" className={inputClass} value={editing.latitude ?? ''} onChange={(e) => setEditing({ ...editing, latitude: e.target.value })} />
            </Field>
            <Field label={f.longitude}>
              <input type="number" className={inputClass} value={editing.longitude ?? ''} onChange={(e) => setEditing({ ...editing, longitude: e.target.value })} />
            </Field>
            <Field label={f.imageUrl}>
              <input className={inputClass} value={editing.image_url ?? ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            {t.published}
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-dark/60 hover:text-dark">
              {t.cancel}
            </button>
            <button type="button" disabled={saving} onClick={save} className="bg-orange text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange/90 transition-colors text-sm disabled:opacity-50">
              {t.save}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---------------------------------------------------------------------
// Ferries tab
// ---------------------------------------------------------------------

const EMPTY_FERRY: Omit<FerryRow, 'id'> = {
  name: '', name_es: '', route_from: '', route_to: '', duration_minutes: null, frequency_daily: null,
  price_eur: '', website: '', contact_phone: '', amenities: {}, luggage_limit_kg: null,
  notes_en: '', notes_es: '', is_published: false,
}

function FerriesTab() {
  const { lang } = useLanguage()
  const t = translations[lang].guidesAdmin
  const f = t.fields

  const [ferries, setFerries] = useState<FerryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState<FerryRow | (Omit<FerryRow, 'id'> & { id?: string }) | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    setError(false)
    fetch('/api/guides/ferries?all=true')
      .then((r) => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((d) => setFerries(d.ferries ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function remove(id: string) {
    if (!window.confirm(t.confirmDelete)) return
    try {
      const res = await fetch(`/api/guides/ferries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      setFerries((prev) => prev.filter((f2) => f2.id !== id))
      toast.success(t.deleteSuccess)
    } catch {
      toast.error(t.deleteError)
    }
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    const isNew = !('id' in editing) || !editing.id
    try {
      const payload = {
        ...editing,
        duration_minutes: editing.duration_minutes == null ? null : Number(editing.duration_minutes),
        frequency_daily: editing.frequency_daily == null ? null : Number(editing.frequency_daily),
        luggage_limit_kg: editing.luggage_limit_kg == null ? null : Number(editing.luggage_limit_kg),
        price_eur: editing.price_eur === '' ? null : Number(editing.price_eur),
      }
      const res = await fetch(isNew ? '/api/guides/ferries' : `/api/guides/ferries/${(editing as FerryRow).id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      const saved: FerryRow = data.ferry
      setFerries((prev) => (isNew ? [...prev, saved] : prev.map((f2) => (f2.id === saved.id ? saved : f2))))
      toast.success(t.saveSuccess)
      setEditing(null)
    } catch {
      toast.error(t.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <TableSkeleton />
  if (error) return <LoadError onRetry={load} label={t.loadError} retryLabel={t.retry} />

  return (
    <>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_FERRY })}
          className="bg-orange text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange/90 transition-colors text-sm"
        >
          + {t.newFerry}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-neutral-50 text-dark/60 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">{t.columns.company}</th>
              <th className="text-left px-4 py-3">{t.columns.route}</th>
              <th className="text-left px-4 py-3">{t.columns.duration}</th>
              <th className="text-left px-4 py-3">{t.columns.price}</th>
              <th className="text-right px-4 py-3">{t.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {ferries.map((ferry) => (
              <tr key={ferry.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium text-dark">{ferry.name}</td>
                <td className="px-4 py-3 text-dark/60">{ferry.route_from} → {ferry.route_to}</td>
                <td className="px-4 py-3 text-dark/60">{ferry.duration_minutes} min</td>
                <td className="px-4 py-3 text-dark/60">€{ferry.price_eur}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <button type="button" onClick={() => setEditing(ferry)} className="text-orange font-semibold hover:underline">
                    {t.edit}
                  </button>
                  <button type="button" onClick={() => remove(ferry.id)} className="text-red-600 font-semibold hover:underline">
                    {t.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={'id' in editing && editing.id ? `${t.edit}: ${editing.name}` : t.newFerry} onClose={() => setEditing(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={f.name}>
              <input className={inputClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label={f.nameEs}>
              <input className={inputClass} value={editing.name_es} onChange={(e) => setEditing({ ...editing, name_es: e.target.value })} />
            </Field>
            <Field label={f.routeFrom}>
              <input className={inputClass} value={editing.route_from} onChange={(e) => setEditing({ ...editing, route_from: e.target.value })} />
            </Field>
            <Field label={f.routeTo}>
              <input className={inputClass} value={editing.route_to} onChange={(e) => setEditing({ ...editing, route_to: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label={f.durationMinutes}>
              <input type="number" className={inputClass} value={editing.duration_minutes ?? ''} onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value === '' ? null : Number(e.target.value) })} />
            </Field>
            <Field label={f.frequencyDaily}>
              <input type="number" className={inputClass} value={editing.frequency_daily ?? ''} onChange={(e) => setEditing({ ...editing, frequency_daily: e.target.value === '' ? null : Number(e.target.value) })} />
            </Field>
            <Field label={f.priceEur}>
              <input type="number" step="0.01" className={inputClass} value={editing.price_eur ?? ''} onChange={(e) => setEditing({ ...editing, price_eur: e.target.value })} />
            </Field>
            <Field label={f.luggageLimitKg}>
              <input type="number" className={inputClass} value={editing.luggage_limit_kg ?? ''} onChange={(e) => setEditing({ ...editing, luggage_limit_kg: e.target.value === '' ? null : Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={f.website}>
              <input className={inputClass} value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
            </Field>
            <Field label={f.contactPhone}>
              <input className={inputClass} value={editing.contact_phone} onChange={(e) => setEditing({ ...editing, contact_phone: e.target.value })} />
            </Field>
          </div>
          <Field label={f.amenities}>
            <JsonTextarea value={editing.amenities} onChange={(v) => setEditing({ ...editing, amenities: v })} />
          </Field>
          <Field label={f.notesEn}>
            <textarea className={inputClass} rows={2} value={editing.notes_en} onChange={(e) => setEditing({ ...editing, notes_en: e.target.value })} />
          </Field>
          <Field label={f.notesEs}>
            <textarea className={inputClass} rows={2} value={editing.notes_es} onChange={(e) => setEditing({ ...editing, notes_es: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            {t.published}
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-dark/60 hover:text-dark">
              {t.cancel}
            </button>
            <button type="button" disabled={saving} onClick={save} className="bg-orange text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange/90 transition-colors text-sm disabled:opacity-50">
              {t.save}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ---------------------------------------------------------------------
// JSON field editor — beach_type / amenities are jsonb columns; edited as
// raw JSON text since these are open-ended key/value flags, not a fixed
// field set worth building dedicated controls for.
// ---------------------------------------------------------------------

function JsonTextarea({ value, onChange }: { value: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [invalid, setInvalid] = useState(false)

  function handleChange(next: string) {
    setText(next)
    try {
      const parsed = JSON.parse(next)
      setInvalid(false)
      onChange(parsed)
    } catch {
      setInvalid(true)
    }
  }

  return (
    <div>
      <textarea
        className={`${inputClass} font-mono text-xs ${invalid ? 'border-red-400' : ''}`}
        rows={4}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
      />
      {invalid && <p className="text-xs text-red-600 mt-1">Invalid JSON</p>}
    </div>
  )
}
