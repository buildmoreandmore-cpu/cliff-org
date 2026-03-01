import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion } from '@/lib/minimax'

export async function POST(request: NextRequest) {
  const { trigger_type, profileId, billSlug } = await request.json() as {
    trigger_type: 'legislative_scan' | 'generate_advocacy_email'
    profileId?: string
    billSlug?: string
  }

  if (trigger_type === 'legislative_scan') {
    return handleLegislativeScan(request)
  } else if (trigger_type === 'generate_advocacy_email') {
    return handleGenerateEmail(request, profileId!, billSlug!)
  }

  return NextResponse.json({ error: 'Invalid trigger_type' }, { status: 400 })
}

async function handleLegislativeScan(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const searchTerms = [
    'Georgia bill disability waiver',
    'Georgia bill DBHDD funding',
    'Georgia bill Medicaid eligibility disability',
    'Georgia bill SSI disability',
    'Georgia bill special education',
    'Georgia bill guardianship disability',
    'Georgia bill ABLE account',
  ]

  const allResults: { title: string; url: string; snippet: string }[] = []

  for (const term of searchTerms) {
    try {
      const searchRes = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(term + ' 2025 2026')}&count=3`,
        {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || '',
          },
        }
      )
      if (searchRes.ok) {
        const data = await searchRes.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = (data.web?.results || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          snippet: r.description,
        }))
        allResults.push(...results)
      }
    } catch {
      // Continue with other searches
    }
  }

  if (allResults.length === 0) {
    return NextResponse.json({ message: 'No results found', bills: [] })
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  const uniqueResults = allResults.filter((r) => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })

  // Analyze with MiniMax
  const response = await chatCompletion([
    {
      role: 'system',
      content: `You are analyzing web search results for Georgia legislative activity related to disability services. For each RELEVANT bill or legislative action, output a JSON array:
[{
  "bill_number": "HB/SB number",
  "title": "short title",
  "summary": "2-3 sentence summary of what the bill does",
  "impact": "how this affects Georgia families of children with disabilities",
  "impact_level": "high" | "medium" | "low",
  "status": "introduced/committee/passed_house/passed_senate/signed/dead",
  "source_url": "URL",
  "slug": "bill-hb123-2026 format"
}]

Only include items that are ACTUAL Georgia legislation. Skip news articles that don't reference specific bills. If nothing relevant is found, return an empty array [].`,
    },
    {
      role: 'user',
      content: `Search results:\n${uniqueResults.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join('\n')}`,
    },
  ])

  let content = response.choices[0]?.message?.content || '[]'
  content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/(\[[\s\S]*\])/)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bills: any[] = []
  try {
    bills = JSON.parse(jsonMatch?.[1] || '[]')
  } catch {
    bills = []
  }

  // Save relevant bills to content_blocks and notify users
  let newBillCount = 0
  for (const bill of bills) {
    if (!bill.slug) continue

    // Check if already exists
    const { data: existing } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('slug', bill.slug)
      .single()

    if (existing) continue

    // Save to content_blocks
    await supabase.from('content_blocks').insert({
      slug: bill.slug,
      title: `${bill.bill_number}: ${bill.title}`,
      body: JSON.stringify({
        bill_number: bill.bill_number,
        summary: bill.summary,
        impact: bill.impact,
        impact_level: bill.impact_level,
        status: bill.status,
      }),
      source_url: bill.source_url,
      source_name: 'Legislative Scan',
      is_published: true,
      last_verified: new Date().toISOString(),
    })

    newBillCount++

    // Notify users who opted in to breaking news
    if (bill.impact_level === 'high' || bill.impact_level === 'medium') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('notification_breaking_news', true)

      if (profiles) {
        for (const profile of profiles) {
          await supabase.from('notifications').insert({
            profile_id: profile.id,
            trigger_type: 'legislative_alert',
            subject: `Legislative Alert: ${bill.bill_number} — ${bill.title}`,
            body: `${bill.summary}\n\nImpact: ${bill.impact}`,
          })
        }
      }
    }
  }

  return NextResponse.json({ message: `Scan complete. ${newBillCount} new bills found.`, bills })
}

async function handleGenerateEmail(request: NextRequest, profileId: string, billSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!profileId || !billSlug) {
    return NextResponse.json({ error: 'Missing profileId or billSlug' }, { status: 400 })
  }

  // Get bill info
  const { data: block } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('slug', billSlug)
    .single()

  if (!block) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let billData: any = {}
  try {
    billData = JSON.parse(block.body)
  } catch {
    billData = { summary: block.body }
  }

  // Get child benefits for context
  const { data: benefits } = await supabase
    .from('child_benefits')
    .select('benefit_name, status')
    .eq('profile_id', profileId)

  const response = await chatCompletion([
    {
      role: 'system',
      content: `You are helping a Georgia parent write a compelling advocacy email to their state legislator about a bill affecting disability services.

Write a personal, heartfelt but professional email from the parent's perspective. Include:
1. Brief personal introduction (parent of a child with a disability in [county] County)
2. Reference the specific bill number and what it does
3. How this bill would personally affect their family
4. A clear ask (support/oppose the bill)
5. Thank the legislator for their time

Keep it under 300 words. Make it personal and compelling, not generic.

Output as JSON:
{
  "subject": "email subject line",
  "body": "full email text",
  "suggested_recipients": "e.g., State Representative, State Senator"
}`,
    },
    {
      role: 'user',
      content: `Parent: ${profile.parent_name || 'A concerned parent'}
Child: ${profile.child_name || 'their child'}
County: ${profile.county || 'Georgia'}
Current benefits: ${benefits?.map((b: { benefit_name: string }) => b.benefit_name).join(', ') || 'Unknown'}

Bill: ${block.title}
Bill Number: ${billData.bill_number || 'Unknown'}
Summary: ${billData.summary || block.body}
Impact: ${billData.impact || 'Affects disability services in Georgia'}`,
    },
  ])

  let content = response.choices[0]?.message?.content || ''
  content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/(\{[\s\S]*\})/)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let emailData: any = {}
  try {
    emailData = JSON.parse(jsonMatch?.[1] || '{}')
  } catch {
    emailData = { subject: `Regarding ${block.title}`, body: content, suggested_recipients: 'Your State Representative' }
  }

  // Save to saved_documents
  await supabase.from('saved_documents').insert({
    profile_id: profileId,
    doc_type: 'other',
    title: `Advocacy Email: ${emailData.subject}`,
    subject: emailData.subject,
    content: emailData.body,
  })

  return NextResponse.json({
    success: true,
    email: emailData,
    bill: {
      slug: billSlug,
      title: block.title,
      ...billData,
    },
  })
}
