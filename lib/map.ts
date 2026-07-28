// Approximate-only location map: coordinates are rounded to ~1km precision and
// shown as a wide bounding box with no pin marker, so the exact address is
// never exposed — matches the team's privacy feedback (approximate area only).
export function getApproximateMapEmbedUrl(
  latitude?: number | null,
  longitude?: number | null,
): string | null {
  if (latitude == null || longitude == null) return null

  const lat = Math.round(latitude * 100) / 100
  const lon = Math.round(longitude * 100) / 100
  const delta = 0.02

  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`
}
