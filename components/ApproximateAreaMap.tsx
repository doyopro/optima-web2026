'use client'

import { MapContainer, TileLayer, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Privacy: no marker is ever placed at the property's exact coordinates —
// only a wide shaded circle, so guests see "this general area" and never
// the exact building. Matches the team's existing approximate-location
// policy (previously enforced via a rounded-coordinate bounding box with
// no pin at all); this replaces that static embed with a real map so the
// circle radius is explicit and consistent regardless of container size.
const RADIUS_METERS = 300

interface Props {
  latitude: number
  longitude: number
}

export default function ApproximateAreaMap({ latitude, longitude }: Props) {
  const center: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      dragging={true}
      doubleClickZoom={false}
      zoomControl={true}
      attributionControl={true}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Circle
        center={center}
        radius={RADIUS_METERS}
        pathOptions={{ color: '#E26620', fillColor: '#E26620', fillOpacity: 0.15, weight: 2 }}
      />
    </MapContainer>
  )
}
