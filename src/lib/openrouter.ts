/**
 * Rhinestone Jewellers — OpenRouter API client (server-side only).
 * Used by all AI features: scene text, product description, contact reply,
 * alt text, gallery caption, inquiry routing, and the live chat sales bot.
 *
 * OpenRouter is a unified API gateway to many LLMs (OpenAI, Anthropic, Google,
 * Meta, etc.). Switch models by changing OPENROUTER_MODEL in .env.
 *
 * Docs: https://openrouter.ai/docs
 */

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

let _model: string | null = null

function getModel(): string {
  if (_model) return _model
  _model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
  return _model
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY not set in .env')
  return key
}

/**
 * Send a chat completion request to OpenRouter.
 * Returns the assistant message text.
 * Retries once if the response is empty (some models occasionally return empty on the first try).
 */
export async function openrouterChat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  let lastErr: Error | null = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callOpenRouter(messages, opts)
      if (text.trim()) return text
      console.warn(`OpenRouter returned empty text on attempt ${attempt + 1}, retrying...`)
    } catch (e: any) {
      lastErr = e
      // If it's a 4xx error, don't retry
      if (e.message?.includes('API 4')) throw e
      console.warn(`OpenRouter call failed on attempt ${attempt + 1}: ${e.message}, retrying...`)
    }
  }
  throw lastErr ?? new Error('OpenRouter returned no text after retry')
}

async function callOpenRouter(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = getApiKey()
  const model = getModel()

  const body: any = {
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
    // Cap at 800 tokens to keep within free-tier / small-budget limits
    max_tokens: opts.maxTokens ?? 800,
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('OpenRouter full error response:', errText)
    throw new Error(`OpenRouter API ${res.status}: ${errText.slice(0, 500)}`)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    console.error('OpenRouter empty content. Full response:', JSON.stringify(data, null, 2).slice(0, 800))
    throw new Error('OpenRouter returned no text')
  }
  return text
}
