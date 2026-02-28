import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatCompletion } from '@/lib/minimax'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { query } = await request.json()
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    // Step 1: Search content_blocks
    const { data: contentResults } = await supabase
      .from('content_blocks')
      .select('id, slug, title, body, source_url, source_name, last_verified')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,body.ilike.%${query}%,slug.ilike.%${query}%`)
      .limit(5)

    // Step 2: Web search for real-time info
    let webResults: { title: string; url: string; snippet: string }[] = []
    try {
      const searchQuery = `Georgia disability ${query} site:gov OR site:org`
      const searchRes = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&count=5`,
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || '',
          },
        }
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        webResults = (searchData.web?.results || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          snippet: r.description,
        }))
      }
    } catch {
      // Web search failed, continue with content results only
    }

    // Step 3: Synthesize with MiniMax
    const synthesisPrompt = `You are a research assistant for CLIFF, a nonprofit helping Georgia families navigate disability benefits.

Query: "${query}"

Content Library Results:
${contentResults?.length ? contentResults.map((c) => `- ${c.title}: ${c.body?.substring(0, 500)}${c.source_url ? ` (Source: ${c.source_url})` : ''}`).join('\n') : 'No results found in content library.'}

Web Search Results:
${webResults.length ? webResults.map((w) => `- ${w.title}: ${w.snippet} (${w.url})`).join('\n') : 'No web results.'}

Synthesize these into a clear, concise answer with sources. Focus on actionable information for Georgia families. If info is outdated or uncertain, say so.`

    const response = await chatCompletion([
      { role: 'user', content: synthesisPrompt },
    ])

    let answer = response.choices[0]?.message?.content || 'No answer generated.'
    answer = answer.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    return NextResponse.json({
      answer,
      sources: {
        content_blocks: contentResults || [],
        web_results: webResults,
      },
    })
  } catch (err) {
    console.error('Research agent error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Research failed' },
      { status: 500 }
    )
  }
}
