import { supabaseServer } from '@/lib/supabase-server'

// Where checkout problems go. Two channels, neither silent:
//  1. every event is written to public.checkout_events (needs_attention=true
//     for anything a human must look at) — always works.
//  2. an e-mail to ALERT_EMAIL (default enquiries@optimavillas.com) via
//     Resend, when RESEND_API_KEY + EMAIL_FROM are configured. The repo has
//     no e-mail provider today, so until those are set the e-mail step is
//     reported as NOT SENT (logged loudly and stored in the event detail).
const ALERT_EMAIL = process.env.CHECKOUT_ALERT_EMAIL || 'enquiries@optimavillas.com'

export async function recordCheckoutEvent(e: {
  stripeEventId?: string
  type: string
  paymentIntentId?: string | null
  outcome: string
  detail?: Record<string, unknown>
  needsAttention?: boolean
}): Promise<'recorded' | 'duplicate' | 'error'> {
  const { error } = await supabaseServer.from('checkout_events').insert({
    stripe_event_id: e.stripeEventId ?? null,
    event_type: e.type,
    payment_intent_id: e.paymentIntentId ?? null,
    outcome: e.outcome,
    detail: e.detail ?? {},
    needs_attention: e.needsAttention ?? false,
  })
  if (!error) return 'recorded'
  if (error.code === '23505') return 'duplicate'
  console.error('[checkout-alerts] could not record event', e.outcome, error.message)
  return 'error'
}

export async function sendCheckoutAlert(subject: string, text: string): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!key || !from) {
    console.error(`[CHECKOUT ALERT — NOT E-MAILED (no RESEND_API_KEY/EMAIL_FROM)] ${subject}\n${text}`)
    return { sent: false, reason: 'no email provider configured' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [ALERT_EMAIL], subject, text }),
    })
    if (!res.ok) {
      const reason = `resend ${res.status}`
      console.error('[CHECKOUT ALERT — E-MAIL FAILED]', subject, reason)
      return { sent: false, reason }
    }
    return { sent: true }
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown'
    console.error('[CHECKOUT ALERT — E-MAIL FAILED]', subject, reason)
    return { sent: false, reason }
  }
}
