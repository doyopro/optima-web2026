// Hand-drawn line icons for "The Optima Difference" — deliberately not
// pulled from lucide-react (too generic per feedback). Same visual
// conventions throughout (24x24 viewBox, stroke-based, round caps/joins)
// so the three sit together as a set. Redrawn with clearer, chunkier
// silhouettes so they read at a glance even when scaled up large inside
// the icon circle (first pass was too thin/small and the house read as an
// odd shape rather than a door).

interface IconProps {
  className?: string
}

export function VillaIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Clear two-slope pitched roof */}
      <path d="M2.5 11 12 3.5 21.5 11" />
      {/* Walls */}
      <path d="M5 9.5V20h14V9.5" />
      {/* Rectangular door */}
      <path d="M9.5 20v-6h5v6" />
      {/* Windows */}
      <rect x="7" y="12" width="2.2" height="2.2" rx="0.4" />
      <rect x="14.8" y="12" width="2.2" height="2.2" rx="0.4" />
    </svg>
  )
}

export function VolcanoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Smoke */}
      <path d="M9.6 4c.7.6.7 1.6 0 2.2" />
      <path d="M11.8 2.6c.7.6.7 1.6 0 2.2" />
      {/* Recognisable mountain silhouette with a crater notch at the peak */}
      <path d="M2.5 20 8 12l1.5 1.8L11 10l1.5 2.4L14 11l7.5 9" />
      {/* Rocky texture / snow-line style contour across the slope */}
      <path d="M6 16.5 8.3 15l1.7 1.3 2-1.6 2 1.6 1.7-1.3 2.3 1.5" />
      {/* Base */}
      <path d="M2 20h20" />
    </svg>
  )
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.3S3 15 3 8.9C3 6 5.4 3.7 8.2 3.7c1.7 0 3.2.9 3.8 2.3.6-1.4 2.1-2.3 3.8-2.3C18.6 3.7 21 6 21 8.9c0 6.1-9 11.4-9 11.4z" />
    </svg>
  )
}
