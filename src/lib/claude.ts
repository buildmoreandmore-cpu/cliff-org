import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export { anthropic }

export async function createChatStream(
  systemPrompt: string,
  messages: Anthropic.Messages.MessageParam[],
  tools: Anthropic.Messages.Tool[]
) {
  return anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    tools,
    stream: true,
  })
}
