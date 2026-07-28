// Guesty-synced description text sometimes has the VV tourist license number
// jammed at the start (e.g. "VV-35-3-0003333\n\nVilla del Ajache Grande is..."),
// followed by one or two newlines before the actual readable description.
const VV_LICENSE_PATTERN = /^(VV-[\d-]+)\s*\n+/

export function extractVvLicense(description: string): { license: string | null; text: string } {
  const match = description.match(VV_LICENSE_PATTERN)
  if (!match) {
    return { license: null, text: description }
  }
  return { license: match[1], text: description.slice(match[0].length) }
}
