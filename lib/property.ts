// Guesty-synced description/overview text sometimes has the VV tourist
// license number jammed at the start — followed by one or more newlines in
// `description_en` (e.g. "VV-35-3-0003333\n\nVilla del Ajache Grande is...")
// but just a single space in `overview_en` (e.g. "VV-35-3-0008695 Escape
// to..."), so this matches on any whitespace rather than newlines only.
const VV_LICENSE_PATTERN = /^(VV-[\d-]+)\s+/

export function extractVvLicense(description: string): { license: string | null; text: string } {
  const match = description.match(VV_LICENSE_PATTERN)
  if (!match) {
    return { license: null, text: description }
  }
  return { license: match[1], text: description.slice(match[0].length) }
}

// Client feedback (confirmed against the real, synced amenities data across
// all 79 active properties): most listed amenities are standard/expected
// (bed linens, towels, kitchen basics, hot water, safe, etc.) and just add
// noise — already implicitly covered by "The Space" description. This is an
// allowlist of genuine differentiators only, so the rendered Amenities
// section only ever shows what's actually distinctive about a given villa.
// A couple of common-but-still-genuinely-valued items (Wireless Internet,
// Private pool) are kept per explicit client request even though they're
// present on most properties.
const DIFFERENTIATOR_AMENITIES: Record<string, string> = {
  'Air conditioning': 'Air conditioning',
  'Wireless Internet': 'Free WiFi',
  'Sea view': 'Sea view',
  'Mountain view': 'Mountain view',
  'Garden View': 'Garden view',
  'Beach View': 'Beach view',
  'Ocean Front': 'Ocean front',
  'Near Ocean': 'Near ocean',
  'Pool table': 'Pool table',
  'Hot tub': 'Hot tub',
  'Private pool': 'Private pool',
  'Ping pong table': 'Ping pong table',
  Gym: 'Gym',
  Sauna: 'Sauna',
  'Game console': 'Game console',
  'Game room': 'Game room',
  'Wheelchair accessible': 'Wheelchair accessible',
  'Outdoor kitchen': 'Outdoor kitchen',
}

const DIFFERENTIATOR_AMENITIES_ES: Record<string, string> = {
  'Air conditioning': 'Aire acondicionado',
  'Free WiFi': 'WiFi gratuito',
  'Sea view': 'Vistas al mar',
  'Mountain view': 'Vistas a la montaña',
  'Garden view': 'Vistas al jardín',
  'Beach view': 'Vistas a la playa',
  'Ocean front': 'Primera línea de mar',
  'Near ocean': 'Cerca del mar',
  'Pool table': 'Mesa de billar',
  'Hot tub': 'Jacuzzi',
  'Private pool': 'Piscina privada',
  'Ping pong table': 'Mesa de ping-pong',
  Gym: 'Gimnasio',
  Sauna: 'Sauna',
  'Game console': 'Consola de videojuegos',
  'Game room': 'Sala de juegos',
  'Wheelchair accessible': 'Accesible para sillas de ruedas',
  'Outdoor kitchen': 'Cocina exterior',
}

export function filterDifferentiatorAmenities(amenities: string[], lang: 'en' | 'es' = 'en'): string[] {
  const labels = amenities.filter((a) => a in DIFFERENTIATOR_AMENITIES).map((a) => DIFFERENTIATOR_AMENITIES[a])
  const unique = Array.from(new Set(labels))
  return lang === 'es' ? unique.map((l) => DIFFERENTIATOR_AMENITIES_ES[l] ?? l) : unique
}

// Raw highlights come back as free text delimited by asterisks and/or
// pipes, e.g. "* New to rental market * Close to Marina Rubicon * ..." —
// split into distinct, trimmed, non-empty items for a bullet/tag list.
export function parseHighlights(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(/[*|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}
