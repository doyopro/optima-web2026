'use client'

import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

// Internal admin tool — no PIN/auth yet (dashboard-wide, later phase),
// consistent with /web/guides. Talks to /api/properties* rather than
// Supabase directly, so the service-role key stays server-side.

interface PropertyRow {
  id: string
  name: string
  status: string | null
  is_featured: boolean
  is_bookable: boolean
  is_tina_partner: boolean
  guesty_synced_at: string | null
}

function formatSyncedAt(value: string | null): string {
  if (!value) return 'Never synced'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PropertiesAdminPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((d) => setProperties(d.properties ?? []))
      .catch(() => toast.error('Failed to load properties'))
      .finally(() => setLoading(false))
  }, [])

  async function toggle(id: string, field: 'is_featured' | 'is_bookable', value: boolean) {
    setSaving(id)
    const previous = properties
    setProperties((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      setProperties(previous)
      toast.error('Failed to save — please try again.')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <div className="p-8 text-dark/50">Loading properties…</div>
  }

  return (
    <div className="p-6 sm:p-8">
      <Toaster position="top-center" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dark mb-1">Properties</h1>
        <p className="text-sm text-dark/60">
          Choose which villas appear in the homepage&apos;s Featured Villas section, and mark any
          villa as not bookable (e.g. Parque del Rey 24, Villa Medina, Villa Mi Casa). Tina/SunBeach
          partner properties are excluded from Featured automatically, even if toggled on here.
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-neutral-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-dark/60 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Guesty synced</th>
              <th className="text-left px-4 py-3">Featured</th>
              <th className="text-left px-4 py-3">Bookable</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium text-dark">
                  {p.name}
                  {p.is_tina_partner && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-dark/40 bg-neutral-100 px-1.5 py-0.5 rounded">
                      Partner
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === 'active' ? 'bg-green/10 text-green-700' : 'bg-neutral-100 text-dark/50'
                    }`}
                  >
                    {p.status ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark/50 text-xs">{formatSyncedAt(p.guesty_synced_at)}</td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={p.is_featured}
                    disabled={saving === p.id}
                    onChange={(e) => toggle(p.id, 'is_featured', e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-orange focus:ring-orange"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={p.is_bookable}
                    disabled={saving === p.id}
                    onChange={(e) => toggle(p.id, 'is_bookable', e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-orange focus:ring-orange"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
