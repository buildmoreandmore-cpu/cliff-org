import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatCompletion } from '@/lib/minimax'
import { GEORGIA_PROGRAM_KNOWLEDGE } from '@/data/program-knowledge'
import { notify } from '@/lib/notify'

type TriggerType = 'content_change' | 'breaking_news' | 'milestone_check'

function stripThink(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

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

        const topic = change.topic || change.content_blocks?.title || ''
        const { data: matchingBenefits } = await supabase
          .from('child_benefits')
          .select('profile_id, benefit_name')
          .ilike('benefit_name', `%${topic}%`)

        const profileIds = [...new Set((matchingBenefits || []).map((b: { profile_id: string }) => b.profile_id))]

        const { data: subscribedProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('notification_breaking_news', true)

        const allProfileIds = [...new Set([
          ...profileIds,
          ...(subscribedProfiles || []).map((p: { id: string }) => p.id),
        ])]

        for (const pid of allProfileIds) {
          const response = await chatCompletion([{
            role: 'user',
            content: `Write a brief, friendly notification for a Georgia family about this policy update. Keep it under 200 words.

Topic: ${topic}
Change: ${change.proposed_text || change.current_text}
Source: ${change.source_name || 'Official source'}

Be specific about what changed and what action (if any) they should take. Be empathetic and clear.`,
          }])

          const body = stripThink(response.choices[0]?.message?.content || '')

          await notify({
            profileId: pid,
            triggerType: 'content_change',
            triggerId: content_change_id,
            subject: `Policy Update: ${topic}`,
            body,
          })
          notificationsCreated++
        }
        break
      }

      case 'breaking_news': {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        } catch { /* research unavailable */ }

        if (!researchResult?.answer) {
          return NextResponse.json({ message: 'No research results', notifications: 0 })
        }

        const analysisResponse = await chatCompletion([{
          role: 'user',
          content: `Analyze this research about Georgia disability policy news. Determine if any items are urgent/actionable for families.

Research:
${researchResult.answer}

Respond in JSON only (no other text):
{
  "is_actionable": boolean,
  "subject": "notification subject if actionable",
  "summary": "brief family-friendly summary if actionable",
  "affected_programs": ["list of program names affected"]
}`,
        }])

        const analysisText = stripThink(analysisResponse.choices[0]?.message?.content || '')
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) break

        const analysis = JSON.parse(jsonMatch[0])
        if (!analysis.is_actionable) break

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('notification_breaking_news', true)

        for (const profile of profiles || []) {
          await notify({
            profileId: profile.id,
            triggerType: 'breaking_news',
            subject: analysis.subject,
            body: analysis.summary,
          })
          notificationsCreated++
        }
        break
      }

      case 'milestone_check': {
        const now = new Date()
        const in24Months = new Date(now)
        in24Months.setMonth(in24Months.getMonth() + 24)

        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, child_name, child_dob, parent_name')
          .not('child_dob', 'is', null)
          .eq('notification_milestones', true)

        for (const profile of allProfiles || []) {
          if (!profile.child_dob) continue
          const dob = new Date(profile.child_dob)

          // HIPAA transition alert at age 17 (1 year before 18)
          const age17Date = new Date(dob)
          age17Date.setFullYear(age17Date.getFullYear() + 17)
          const monthsTo17 = Math.round((age17Date.getTime() - now.getTime()) / (30.44 * 24 * 60 * 60 * 1000))
          
          if (age17Date > now && monthsTo17 <= 12 && monthsTo17 >= 0) {
            // Check for existing HIPAA notification in last 60 days
            const { data: existingHipaa } = await supabase
              .from('notifications')
              .select('id')
              .eq('profile_id', profile.id)
              .ilike('subject', '%HIPAA%')
              .gte('created_at', new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString())
              .limit(1)

            if (!existingHipaa?.length) {
              const monthsTo18 = monthsTo17 + 12
              await notify({
                profileId: profile.id,
                triggerType: 'milestone_check',
                subject: `⚠️ HIPAA Alert: ${profile.child_name || 'Your child'} turns 18 in ~${monthsTo18} months`,
                body: `Important: When ${profile.child_name || 'your child'} turns 18, YOU WILL LOSE automatic access to their medical records under HIPAA — even if they have a disability.\n\n**Action needed NOW:**\n1. **Healthcare Power of Attorney** — Have your child sign one while they're still a minor or discuss at 18 if they have capacity\n2. **HIPAA Authorization Form** — Your child can sign this at 18 to give you access to specific providers\n3. **Guardianship** (last resort) — Requires Probate Court, start the process now if needed\n\nWithout one of these documents, providers are LEGALLY REQUIRED to refuse sharing medical information with you after the 18th birthday.\n\n📞 Georgia Legal Services: 1-800-498-9469 (free help with guardianship and POA)\n📞 Georgia Advocacy Office: 1-800-537-2329\n\nDon't wait — this catches families off guard every time.`,
              })
              notificationsCreated++
            }
          }

          for (const milestone of [18, 21]) {
            const milestoneDate = new Date(dob)
            milestoneDate.setFullYear(milestoneDate.getFullYear() + milestone)

            if (milestoneDate > now && milestoneDate <= in24Months) {
              const monthsAway = Math.round((milestoneDate.getTime() - now.getTime()) / (30.44 * 24 * 60 * 60 * 1000))

              const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('profile_id', profile.id)
                .eq('trigger_type', 'milestone_check')
                .ilike('subject', `%${milestone}%`)
                .gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .limit(1)

              if (existing?.length) continue

              const [{ data: benefits }, { data: reminders }] = await Promise.all([
                supabase.from('child_benefits').select('benefit_name, status').eq('profile_id', profile.id),
                supabase.from('reminders').select('title, due_date').eq('profile_id', profile.id).eq('is_complete', false).order('due_date').limit(5),
              ])

              const response = await chatCompletion([{
                role: 'user',
                content: `You are a proactive intelligence agent for CLIFF, a Georgia disability benefits nonprofit. You have complete knowledge of all Georgia disability programs.

PROGRAM KNOWLEDGE:
${GEORGIA_PROGRAM_KNOWLEDGE}

Write a personalized, empathetic notification for a Georgia family about their child's approaching ${milestone}th birthday milestone.

Child: ${profile.child_name || 'their child'}
Parent: ${profile.parent_name || 'Parent'}
Months until ${milestone}th birthday: ${monthsAway}
Current benefits: ${(benefits || []).map((b: { benefit_name: string; status: string }) => `${b.benefit_name} (${b.status})`).join(', ') || 'None tracked'}
Upcoming reminders: ${(reminders || []).map((r: { title: string; due_date: string }) => `${r.title} (${r.due_date})`).join(', ') || 'None'}

Based on their current benefits and the milestone, recommend SPECIFIC programs they should apply for NOW. Use the diagnosis-to-program routing map. Include exact phone numbers and contacts. Don't just say "apply for adult services" — name the specific waiver (ICWP vs NOW/COMP vs SOURCE/EDWP) based on what you know about them.

Also remind them about: ABLE account, Section 8/811 housing waitlist, GVRA employment services, guardianship planning.

Keep under 250 words. Be warm and actionable.`,
              }])

              const body = stripThink(response.choices[0]?.message?.content || '')

              await notify({
                profileId: profile.id,
                triggerType: 'milestone_check',
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
