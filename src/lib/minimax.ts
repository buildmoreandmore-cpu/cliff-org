const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID || '2023916550506951616'
const MINIMAX_ENDPOINT = 'https://api.minimax.io/v1/chat/completions'

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_call_id?: string
  tool_calls?: MiniMaxToolCall[]
}

export interface MiniMaxToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface MiniMaxTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface MiniMaxResponse {
  id: string
  choices: {
    index: number
    message: MiniMaxMessage
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatCompletion(
  messages: MiniMaxMessage[],
  tools?: MiniMaxTool[],
  model = 'MiniMax-Text-01'
): Promise<MiniMaxResponse> {
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.7,
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const res = await fetch(MINIMAX_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      'X-MiniMax-Group-Id': MINIMAX_GROUP_ID,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MiniMax API error ${res.status}: ${text}`)
  }

  return res.json()
}
