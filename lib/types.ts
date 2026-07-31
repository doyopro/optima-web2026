export type Language = 'en' | 'es'

export type Property = {
  id: string
  name: string
  description: string
  description_es?: string
  vv_license?: string
  guesty_listing_id?: string
  type?: string
  latitude?: number
  longitude?: number
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
  owner_name?: string | null
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  title_es?: string
  excerpt: string
  excerpt_es?: string
  content?: string
  content_es?: string
  cover_image: string | null
  category: string | null
  author_name: string | null
  published_at: string | null
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
