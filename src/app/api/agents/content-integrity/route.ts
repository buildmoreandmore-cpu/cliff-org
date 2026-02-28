import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { anthropic } from '@/lib/claude'
import type { ContentBlock } from '@/lib/types'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Get all published content blocks
    const { data: blocks, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('is_published', true)

    if (error) throw error
    if (!blocks?.length) {
      return NextResponse.json({ message: 'No content blocks to verify', changes: 0 })
    }

    const findings: { block_id: string; block_title: string; severity: string; topic: string }[] = []
    const now = new Date().toISOString()

    for (const block of blocks as ContentBlock[]) {
      try {
        // Fetch source URL if available
        let sourceContent = ''
        if (block.source_url) {
          try {
            const res = await fetch(block.source_url, {
              signal: AbortSignal.timeout(10000),
              headers: { 'User-Agent': 'CLIFF-ContentIntegrity/1.0' },
            })
            if (res.ok) {
              const html = await res.text()
              // Strip HTML tags for comparison
              sourceContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 5000)
            }
          } catch {
            // Source unreachable
          }
        }

        // Use Claude to compare
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are a content integrity checker for CLIFF, a Georgia disability benefits nonprofit.

Compare our stored content against the source. Identify any factual changes, outdated info, or discrepancies.

OUR CONTENT (title: "${block.title}"):
${block.body?.substring(0, 3000)}

${sourceContent ? `SOURCE CONTENT (from ${block.source_url}):\n${sourceContent}` : 'SOURCE: Not available (could not fetch). Check if the URL is still valid.'}

Respond in JSON only:
{
  "has_changes": boolean,
  "severity": "critical" | "high" | "medium" | "low",
  "topic": "brief topic of change",
  "current_text": "relevant excerpt from our content",
  "proposed_text": "what it should say based on source",
  "confidence": 0.0-1.0,
  "explanation": "brief explanation"
}

If no changes detected, set has_changes to false.`,
          }],
        })

        const text = response.content.filter((b) => b.type === 'text').map((b) => (b as any).text).join('')
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) continue

        const analysis = JSON.parse(jsonMatch[0])

        // Update last_verified
        await supabase
          .from('content_blocks')
          .update({ last_verified: now })
          .eq('id', block.id)

        if (analysis.has_changes) {
          // Insert into content_changes
          await supabase.from('content_changes').insert({
            content_block_id: block.id,
            detected_at: now,
            topic: analysis.topic,
            severity: analysis.severity,
            current_text: analysis.current_text,
            proposed_text: analysis.proposed_text,
            source_url: block.source_url,
            source_name: block.source_name,
            confidence: analysis.confidence,
            status: 'pending',
          })

          findings.push({
            block_id: block.id,
            block_title: block.title,
            severity: analysis.severity,
            topic: analysis.topic,
          })
        }
      } catch (err) {
        console.error(`Error checking block ${block.id}:`, err)
        // Continue with next block
      }
    }

    // Send admin summary email if there are findings
    if (findings.length > 0) {
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('is_admin', true)

      if (admins?.length) {
        const summary = findings
          .sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 }
            return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4)
          })
          .map((f) => `[${f.severity.toUpperCase()}] ${f.block_title}: ${f.topic}`)
          .join('\n')

        // Create notification for each admin
        for (const admin of admins) {
          await supabase.from('notifications').insert({
            profile_id: admin.user_id,
            trigger_type: 'content_integrity',
            subject: `Content Integrity Report: ${findings.length} change(s) detected`,
            body: `The monthly content integrity check found ${findings.length} potential change(s):\n\n${summary}\n\nPlease review in the admin dashboard.`,
          })
        }
      }
    }

    return NextResponse.json({
      message: `Checked ${blocks.length} content blocks`,
      changes: findings.length,
      findings,
    })
  } catch (err) {
    console.error('Content integrity agent error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Content integrity check failed' },
      { status: 500 }
    )
  }
}
