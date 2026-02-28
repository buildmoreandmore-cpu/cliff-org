import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { anthropic } from '@/lib/claude'

type TriggerType = 'content_change' | 'breaking_news' | 'milestone_check'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { trigger_type, content_change_id } = await request.json() as {
    trigger_type: TriggerType
    content_change_id?: string
  }

  const supabase = createAdminClient()
  let notificationsCreated = 0

  try {
    switch (trigger_type) {
      // ─────────────────────────────────────────────
      // Trigger 1: Content change approved → notify affected families
      // ─────────────────────────────────────────────
      case 'content_change': {
        if (!content_change_id) {
          return NextResponse.json({ error: 'content_change_id required' }, { status: 400 })
        }

        const { data: change } = await supabase
          .from('content_changes')
          .select('*, content_blocks(*)')
          .eq('id', content_change_id)
          .single()

        if (!change) {
          return NextResponse.json({ error: 'Content change not found' }, { status: 404 })
        }

        // Find families with benefits matching this content topic
        const topic = change.topic || change.content_blocks?.title || ''
        const { data: matchingBenefits } = await supabase
          .from('child_benefits')
          .select('profile_id, benefit_name')
          .ilike('benefit_name', `%${topic}%`)

        const profileIds = [...new Set((matchingBenefits || []).map((b) => b.profile_id))]

        // Also get profiles subscribed to breaking news
        const { data: subscribedProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('notification_breaking_news', true)

        const allProfileIds = [...new Set([
          ...profileIds,
          ...(subscribedProfiles || []).map((p) => p.id),
        ])]

        // Generate personalized notifications
        for (const pid of allProfileIds) {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 512,
            messages: [{
              role: 'user',
              content: `Write a brief, friendly notification for a Georgia family about this policy update. Keep it under 200 words.

Topic: ${topic}
Change: ${change.proposed_text || change.current_text}
Source: ${change.source_name || 'Official source'}

Be specific about what changed and what action (if any) they should take. Be empathetic and clear.`,
            }],
          })

          const body = response.content.filter((b) => b.type === 'text').map((b) => (b as any).text).join('')

          await supabase.from('notifications').insert({
            profile_id: pid,
            trigger_type: 'content_change',
            trigger_id: content_change_id,
            subject: `Policy Update: ${topic}`,
            body,
          })
          notificationsCreated++
        }
        break
      }

      // ─────────────────────────────────────────────
      // Trigger 2: Breaking news scan
      // ─────────────────────────────────────────────
      case 'breaking_news': {
        // Call research agent for GA disability news
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        let researchResult: any = null

        try {
          const res = await fetch(`${baseUrl}/api/agents/research`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.AGENT_API_KEY || '',
            },
            body: JSON.stringify({ query: 'Georgia disability benefits policy changes news this week' }),
          })
          if (res.ok) researchResult = await res.json()
        } catch {
          // Research unavailable
        }

        if (!researchResult?.answer) {
          return NextResponse.json({ message: 'No research results', notifications: 0 })
        }

        // Use Claude to determine if news is actionable
        const analysisResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `Analyze this research about Georgia disability policy news. Determine if any items are urgent/actionable for families.

Research:
${researchResult.answer}

Respond in JSON:
{
  "is_actionable": boolean,
  "subject": "notification subject if actionable",
  "summary": "brief family-friendly summary if actionable",
  "affected_programs": ["list of program names affected"]
}`,
          }],
        })

        const analysisText = analysisResponse.content.filter((b) => b.type === 'text').map((b) => (b as any).text).join('')
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) break

        const analysis = JSON.parse(jsonMatch[0])
        if (!analysis.is_actionable) break

        // Get profiles subscribed to breaking news
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('notification_breaking_news', true)

        for (const profile of profiles || []) {
          await supabase.from('notifications').insert({
            profile_id: profile.id,
            trigger_type: 'breaking_news',
            subject: analysis.subject,
            body: analysis.summary,
          })
          notificationsCreated++
        }
        break
      }

      // ─────────────────────────────────────────────
      // Trigger 3: Milestone check (approaching 18 or 21)
      // ─────────────────────────────────────────────
      case 'milestone_check': {
        const now = new Date()
        const in24Months = new Date(now)
        in24Months.setMonth(in24Months.getMonth() + 24)

        // Find profiles with children approaching 18 or 21
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, child_name, child_dob, parent_name')
          .not('child_dob', 'is', null)
          .eq('notification_milestones', true)

        for (const profile of allProfiles || []) {
          if (!profile.child_dob) continue
          const dob = new Date(profile.child_dob)

          // Check 18th and 21st birthdays
          for (const milestone of [18, 21]) {
            const milestoneDate = new Date(dob)
            milestoneDate.setFullYear(milestoneDate.getFullYear() + milestone)

            // Within 24 months and in the future
            if (milestoneDate > now && milestoneDate <= in24Months) {
              const monthsAway = Math.round((milestoneDate.getTime() - now.getTime()) / (30.44 * 24 * 60 * 60 * 1000))

              // Check if we already sent a notification recently for this milestone
              const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('profile_id', profile.id)
                .eq('trigger_type', 'milestone_check')
                .ilike('subject', `%${milestone}%`)
                .gte('sent_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .limit(1)

              if (existing?.length) continue

              // Get their benefits and reminders for personalized message
              const [{ data: benefits }, { data: reminders }] = await Promise.all([
                supabase.from('child_benefits').select('benefit_name, status').eq('profile_id', profile.id),
                supabase.from('reminders').select('title, due_date').eq('profile_id', profile.id).eq('is_complete', false).order('due_date').limit(5),
              ])

              const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 512,
                messages: [{
                  role: 'user',
                  content: `Write a personalized, empathetic notification for a Georgia family about their child's approaching ${milestone}th birthday milestone.

Child: ${profile.child_name || 'their child'}
Parent: ${profile.parent_name || 'Parent'}
Months until ${milestone}th birthday: ${monthsAway}
Current benefits: ${(benefits || []).map((b) => `${b.benefit_name} (${b.status})`).join(', ') || 'None tracked'}
Upcoming reminders: ${(reminders || []).map((r) => `${r.title} (${r.due_date})`).join(', ') || 'None'}

${milestone === 18 ? 'Key actions: Apply for SSI 3 months before birthday, prepare for Katie Beckett transition, ensure on DBHDD Planning List.' : 'Key actions: Prepare for EPSDT/GAPP/IDEA ending, ensure adult Medicaid pathway, check Planning List status.'}

Keep under 200 words. Be warm and actionable.`,
                }],
              })

              const body = response.content.filter((b) => b.type === 'text').map((b) => (b as any).text).join('')

              await supabase.from('notifications').insert({
                profile_id: profile.id,
                trigger_type: 'milestone_check',
                subject: `${profile.child_name || 'Your child'}'s ${milestone}th birthday is ${monthsAway} months away`,
                body,
              })
              notificationsCreated++
            }
          }
        }
        break
      }

      default:
        return NextResponse.json({ error: `Unknown trigger_type: ${trigger_type}` }, { status: 400 })
    }

    return NextResponse.json({
      trigger_type,
      notifications_created: notificationsCreated,
    })
  } catch (err) {
    console.error('Proactive agent error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proactive agent failed' },
      { status: 500 }
    )
  }
}
