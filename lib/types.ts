export type Language = 'en' | 'es'

export type Property = {
  id: string
  name: string
  description: string
  location: string
  bedrooms: number
  bathrooms: number
  guests_max: number
  price_per_night_gbp: number
  rating: number
  reviews_count: number
  images: string[]
  amenities: string[]
  is_featured: boolean
  slug: string
}

export type Availability = {
  property_id: string
  check_in: string
  check_out: string
  available: boolean
  price_total: number
  nights: number
}

export type SearchParams = {
  from_date?: string
  to_date?: string
  guests?: number
  villa_id?: string
  location?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
}

export type SearchResult = {
  properties: Property[]
  total: number
  params: SearchParams
}

export type ApiError = {
  error: string
  status: number
}
