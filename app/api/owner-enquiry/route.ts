import { type NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

interface OwnerEnquiryBody {
  name: string
  email: string
  phone?: string
  property_location?: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OwnerEnquiryBody

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    const { error } = await supabasePublic.from('owner_enquiries').insert({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      property_location: body.property_location || null,
      message: body.message,
    })

    if (error) {
      // 42P01 = undefined_table: owner_enquiries hasn't been created yet.
      console.error('[POST /api/owner-enquiry] Supabase insert failed:', error.message)
      return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/owner-enquiry]', errorMessage)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
