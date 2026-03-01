import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatCompletion } from '@/lib/minimax'
import { GEORGIA_PROGRAM_KNOWLEDGE } from '@/data/program-knowledge'

function stripThink(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Get all profiles with digest enabled
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, parent_name, child_name, child_dob, county')
      .eq('notification_digest', true)

    if (!profiles?.length) {
      return NextResponse.json({ message: 'No profiles subscribed to digest', digests: 0 })
    }

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    let digestsCreated = 0

    for (const profile of profiles) {
      // Gather this profile's week: notifications, reminders due soon, benefit changes
      const [
        { data: recentNotifications },
        { data: upcomingReminders },
        { data: benefits },
        { data: pendingApps },
      ] = await Promise.all([
        supabase
          .from('notifications')
          .select('subject, body, trigger_type, created_at')
          .eq('profile_id', profile.id)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('reminders')
          .select('title, due_date, description')
          .eq('profile_id', profile.id)
          .eq('is_complete', false)
          .lte('due_date', new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString())
          .order('due_date')
          .limit(10),
        supabase
          .from('child_benefits')
          .select('benefit_name, status, renewal_date')
          .eq('profile_id', profile.id),
        supabase
          .from('applications')
          .select('program_name, status, submitted_date')
          .eq('profile_id', profile.id)
          .in('status', ['pending', 'submitted', 'in_review']),
      ])

      // Calculate child age
      let ageInfo = ''
      if (profile.child_dob) {
        const dob = new Date(profile.child_dob)
        const ageMs = now.getTime() - dob.getTime()
        const ageYears = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000))
        const ageMonths = Math.floor((ageMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
        ageInfo = `${ageYears} years, ${ageMonths} months old`

        // Check proximity to 18 or 21
        for (const milestone of [18, 21]) {
          const milestoneDate = new Date(dob)
          milestoneDate.setFullYear(milestoneDate.getFullYear() + milestone)
          const monthsAway = Math.round((milestoneDate.getTime() - now.getTime()) / (30.44 * 24 * 60 * 60 * 1000))
          if (monthsAway > 0 && monthsAway <= 24) {
            ageInfo += ` — ${milestone}th birthday in ${monthsAway} months!`
          }
        }
      }

      // Check for benefits nearing renewal
      const renewalsSoon = (benefits || []).filter(b => {
        if (!b.renewal_date) return false
        const rd = new Date(b.renewal_date)
        return rd > now && rd <= new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      })

      // Skip if absolutely nothing to report
      const hasContent =
        (recentNotifications?.length || 0) > 0 ||
        (upcomingReminders?.length || 0) > 0 ||
        (pendingApps?.length || 0) > 0 ||
        renewalsSoon.length > 0

      if (!hasContent) {
        // Still send a brief "all clear" digest with a proactive tip
        const tipResponse = await chatCompletion([{
          role: 'user',
          content: `You're writing a brief weekly digest for a Georgia family using CLIFF (disability benefits platform). They had no activity this week.

Family: ${profile.parent_name || 'Parent'}, child: ${profile.child_name || 'their child'} (${ageInfo || 'age unknown'}), county: ${profile.county || 'Georgia'}
Current benefits: ${(benefits || []).map(b => b.benefit_name).join(', ') || 'None tracked'}

Write a short, warm "all quiet this week" message (under 150 words). Include ONE useful proactive tip — something they should look into or a program they might be missing based on what you know. Reference the program knowledge below.

${GEORGIA_PROGRAM_KNOWLEDGE.slice(0, 3000)}

Don't be generic. Be specific to their situation.`,
        }])

        const body = stripThink(tipResponse.choices[0]?.message?.content || '')

        await supabase.from('notifications').insert({
          profile_id: profile.id,
          trigger_type: 'weekly_digest',
          subject: `Your CLIFF Weekly Summary`,
          body,
        })
        digestsCreated++
        continue
      }

      // Build the digest with MiniMax
      const response = await chatCompletion([{
        role: 'user',
        content: `You are the CLIFF Weekly Digest agent. Compile a personalized weekly summary for this Georgia family.

FAMILY:
- Parent: ${profile.parent_name || 'Parent'}
- Child: ${profile.child_name || 'their child'} (${ageInfo || 'age unknown'})
- County: ${profile.county || 'Georgia'}
- Current benefits: ${(benefits || []).map(b => `${b.benefit_name} (${b.status})`).join(', ') || 'None tracked'}

THIS WEEK'S NOTIFICATIONS (${recentNotifications?.length || 0}):
${(recentNotifications || []).map(n => `- [${n.trigger_type}] ${n.subject}`).join('\n') || 'None'}

UPCOMING REMINDERS (next 2 weeks):
${(upcomingReminders || []).map(r => `- ${r.title} — due ${r.due_date}`).join('\n') || 'None due soon'}

PENDING APPLICATIONS:
${(pendingApps || []).map(a => `- ${a.program_name} (${a.status}, submitted ${a.submitted_date || 'unknown'})`).join('\n') || 'None pending'}

BENEFITS NEARING RENEWAL (next 60 days):
${renewalsSoon.map(b => `- ${b.benefit_name} — renews ${b.renewal_date}`).join('\n') || 'None'}

PROGRAM KNOWLEDGE:
${GEORGIA_PROGRAM_KNOWLEDGE.slice(0, 3000)}

Write a warm, organized weekly digest (under 300 words). Sections:
1. 📋 This Week's Updates (summarize notifications)
2. ⏰ Coming Up (reminders + renewals)
3. 📝 Application Status (if any pending)
4. 💡 Proactive Tip (one specific action they should take this week)

Be specific. Use real program names and phone numbers. Don't be generic.`,
      }])

      const body = stripThink(response.choices[0]?.message?.content || '')

      await supabase.from('notifications').insert({
        profile_id: profile.id,
        trigger_type: 'weekly_digest',
        subject: `Your CLIFF Weekly Summary — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        body,
      })
      digestsCreated++
    }

    return NextResponse.json({
      profiles_checked: profiles.length,
      digests_created: digestsCreated,
    })
  } catch (err) {
    console.error('Digest agent error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Digest agent failed' },
      { status: 500 }
    )
  }
}
