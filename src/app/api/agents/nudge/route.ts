import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notify } from '@/lib/notify'

/**
 * Smart Nudge Engine — runs daily via cron
 * Checks for documents and plan steps that are "ready" but not submitted,
 * sends escalating nudges based on how long they've been sitting.
 */

interface NudgeableDoc {
  id: string
  profile_id: string
  title: string
  submission_status: string
  submission_deadline: string | null
  last_nudge_at: string | null
  nudge_count: number
  snoozed_until: string | null
  filing_url: string | null
  created_at: string
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function buildNudgeMessage(doc: NudgeableDoc, nudgeLevel: number): { subject: string; body: string } {
  const daysReady = daysSince(doc.last_nudge_at || doc.created_at)
  const deadlineDays = doc.submission_deadline ? daysUntil(doc.submission_deadline) : null

  const deadlineWarning = deadlineDays !== null && deadlineDays > 0
    ? `\n\n⏰ **Deadline: ${deadlineDays} days remaining** to submit.`
    : deadlineDays !== null && deadlineDays <= 0
      ? `\n\n🚨 **Deadline has passed.** Contact the agency to see if late submissions are accepted.`
      : ''

  const filingInfo = doc.filing_url
    ? `\n\n📋 Submit here: ${doc.filing_url}`
    : ''

  switch (nudgeLevel) {
    case 1:
      return {
        subject: `📝 Ready to submit: ${doc.title}`,
        body: `Your "${doc.title}" is complete and ready to go. Just needs to be submitted.${deadlineWarning}${filingInfo}\n\nOpen your CLIFF dashboard to sign and send it — or snooze this reminder if now isn't a good time. No pressure. 💛`,
      }
    case 2:
      return {
        subject: `📋 Quick reminder: ${doc.title} is waiting`,
        body: `Just checking in — your "${doc.title}" has been ready for ${daysReady} days. Here's exactly what to do:\n\n1. Open your CLIFF Documents\n2. Click "Sign & Submit"\n3. Choose "Email to Agency" or "I Filed It Myself"${deadlineWarning}${filingInfo}\n\nThe whole thing takes about 2 minutes. You've already done the hard part! 💪`,
      }
    case 3:
      return {
        subject: `⚠️ Don't lose this: ${doc.title}`,
        body: `Your "${doc.title}" has been sitting ready for ${daysReady} days.${deadlineWarning}\n\nWe know life gets busy. Here are your options:\n• **Submit now** — takes 2 minutes from your dashboard${filingInfo ? `\n• **File online** — ${doc.filing_url}` : ''}\n• **Snooze** — we'll remind you in a few days, no judgment\n\nThis document represents your family's rights. We don't want it to expire unused. 💛`,
      }
    default:
      return {
        subject: `🔔 Final reminder: ${doc.title}`,
        body: `This is a gentle final reminder about "${doc.title}" — it's been ready for ${daysReady} days.${deadlineWarning}\n\nIf you need help submitting, talk to the Navigator — it can walk you through it step by step.\n\nIf you've already submitted this elsewhere, just mark it as "Submitted" in your dashboard to clear this reminder.${filingInfo}`,
      }
  }
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  let nudgesSent = 0

  try {
    // Find documents that are "ready" or "draft" with deadlines but NOT submitted
    const { data: docs } = await supabase
      .from('saved_documents')
      .select('id, profile_id, title, submission_status, submission_deadline, last_nudge_at, nudge_count, snoozed_until, filing_url, created_at')
      .in('submission_status', ['ready', 'draft'])
      .or('submission_deadline.not.is.null,submission_status.eq.ready')

    for (const doc of (docs || []) as NudgeableDoc[]) {
      // Skip if snoozed
      if (doc.snoozed_until && new Date(doc.snoozed_until) > now) continue

      // Determine nudge cadence based on count
      const lastNudge = doc.last_nudge_at ? new Date(doc.last_nudge_at) : null
      const daysSinceLastNudge = lastNudge ? daysSince(doc.last_nudge_at!) : daysSince(doc.created_at)

      // Nudge schedule: Day 1, Day 3, Day 7, Day 14, then every 7 days
      let shouldNudge = false
      if (doc.nudge_count === 0 && daysSinceLastNudge >= 1) shouldNudge = true
      else if (doc.nudge_count === 1 && daysSinceLastNudge >= 2) shouldNudge = true  // Day 3
      else if (doc.nudge_count === 2 && daysSinceLastNudge >= 4) shouldNudge = true  // Day 7
      else if (doc.nudge_count === 3 && daysSinceLastNudge >= 7) shouldNudge = true  // Day 14
      else if (doc.nudge_count >= 4 && daysSinceLastNudge >= 7) shouldNudge = true   // Weekly after

      // If deadline is within 3 days, nudge regardless
      if (doc.submission_deadline) {
        const daysLeft = daysUntil(doc.submission_deadline)
        if (daysLeft <= 3 && daysLeft > 0 && daysSinceLastNudge >= 1) shouldNudge = true
        if (daysLeft <= 0) {
          // Mark as expired
          await supabase.from('saved_documents').update({ submission_status: 'expired' }).eq('id', doc.id)
          continue
        }
      }

      if (!shouldNudge) continue

      // Cap at 4 nudge levels for message style
      const nudgeLevel = Math.min(doc.nudge_count + 1, 4)
      const { subject, body } = buildNudgeMessage(doc, nudgeLevel)

      await notify({
        profileId: doc.profile_id,
        triggerType: 'submission_nudge',
        triggerId: doc.id,
        subject,
        body,
      })

      await supabase.from('saved_documents').update({
        last_nudge_at: now.toISOString(),
        nudge_count: doc.nudge_count + 1,
        // Clear snooze after nudging
        snoozed_until: null,
      }).eq('id', doc.id)

      nudgesSent++
    }

    return NextResponse.json({ nudges_sent: nudgesSent })
  } catch (err) {
    console.error('Nudge engine error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Nudge engine failed' },
      { status: 500 }
    )
  }
}
