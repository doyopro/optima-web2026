import { type NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

interface PropertyEnquiryBody {
  name: string
  email: string
  phone?: string
  property_interest?: string
  check_in?: string
  check_out?: string
  guests?: number
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PropertyEnquiryBody

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    const { error } = await supabasePublic.from('property_enquiries').insert({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      property_interest: body.property_interest || null,
      check_in: body.check_in || null,
      check_out: body.check_out || null,
      guests: body.guests || null,
      message: body.message,
    })

    if (error) {
      console.error('[POST /api/property-enquiry] Supabase insert failed:', error.message)
      return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/property-enquiry]', errorMessage)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
