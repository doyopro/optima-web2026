import axios from 'axios'
import { type Property, type Availability, type SearchParams, type SearchResult } from './types'

const BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

const client = axios.create({ baseURL: BASE, timeout: 10_000 })

export async function fetchProperties(filters?: SearchParams): Promise<Property[]> {
  const params = new URLSearchParams()
  if (filters?.location) params.set('location', filters.location)
  if (filters?.min_price) params.set('min_price', String(filters.min_price))
  if (filters?.max_price) params.set('max_price', String(filters.max_price))
  if (filters?.bedrooms) params.set('bedrooms', String(filters.bedrooms))
  if (filters?.guests) params.set('guests', String(filters.guests))
  const { data } = await client.get<{ properties: Property[] }>(`/api/properties?${params}`)
  return data.properties
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    const { data } = await client.get<{ property: Property }>(`/api/properties/${id}`)
    return data.property
  } catch {
    return null
  }
}

export async function checkAvailability(
  villa_id: string,
  check_in: string,
  check_out: string,
): Promise<Availability> {
  const { data } = await client.post<Availability>('/api/availability', {
    villa_id,
    check_in,
    check_out,
  })
  return data
}

export async function searchVillas(params: SearchParams): Promise<SearchResult> {
  const { data } = await client.post<SearchResult>('/api/search', params)
  return data
}

export async function sendChatMessage(message: string): Promise<{ reply: string }> {
  const { data } = await client.post<{ reply: string }>('/api/chat', { message })
  return data
}
