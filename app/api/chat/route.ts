import { type NextRequest } from 'next/server'

const FAQ: Record<string, string> = {
  wifi: 'All our villas include high-speed WiFi at no extra cost.',
  'check-in': 'Standard check-in is from 4:00 PM. Early check-in may be available on request.',
  checkout: 'Check-out is by 10:00 AM. Late check-out can sometimes be arranged.',
  pool: 'Most of our villas feature private heated pools. Each listing specifies pool details.',
  pets: 'Some villas are pet-friendly. Please check the specific listing or contact us.',
  parking: 'Free private parking is available at almost all our villas.',
  cleaning: 'A mid-stay cleaning service is available on request for stays over 7 nights.',
  deposit: 'A security deposit of £500 is required and fully refunded after checkout.',
  payment: 'We accept all major credit cards, bank transfer, and PayPal.',
  cancel: 'Our standard cancellation policy allows a full refund up to 14 days before arrival.',
}

// TODO: Replace with real Claude API call:
// import Anthropic from '@anthropic-ai/sdk'
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function mockReply(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, answer] of Object.entries(FAQ)) {
    if (lower.includes(key)) return answer
  }
  return "Thanks for your question! Our team will get back to you shortly. You can also reach us at +44 (0)20 34 111 999 or info@optimavillas.com."
}

export async function POST(request: NextRequest) {
  try {
    const { message } = (await request.json()) as { message: string }

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const reply = mockReply(message)

    return Response.json({ reply })
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return Response.json({ error: 'Chat failed' }, { status: 500 })
  }
}
