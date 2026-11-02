import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildChatSystemPrompt } from '@/lib/chat-system-prompt'
import { openrouterChat } from '@/lib/openrouter'

export const dynamic = 'force-dynamic'
// Chat can take a while with the LLM
export const maxDuration = 60

/**
 * Parse the bot's response and extract the [ADMIN:tag|note] prefix.
 * The customer never sees the prefix. Admin does.
 */
function parseBotResponse(text: string): { tag: string | null; adminNote: string | null; customerText: string } {
  const match = text.match(/^\s*\[ADMIN:\s*([a-zA-Z_]+)\s*(?:\|([^\]]*))?\]\s*([\s\S]*)$/i)
  if (match) {
    return {
      tag: match[1].toLowerCase(),
      adminNote: match[2]?.trim() ?? null,
      customerText: match[3].trim(),
    }
  }
  return { tag: null, adminNote: null, customerText: text.trim() }
}

/**
 * Try to extract a captured name or email from the admin note field.
 * Format expectation: "Name: John, Email: john@x.com"
 */
function extractCapture(adminNote: string | null): { name?: string; email?: string; phone?: string } {
  if (!adminNote) return {}
  const out: { name?: string; email?: string; phone?: string } = {}
  const nameMatch = adminNote.match(/name\s*:\s*([^,;\n]+)/i)
  if (nameMatch) out.name = nameMatch[1].trim()
  const emailMatch = adminNote.match(/email\s*:\s*([^\s,;\n]+)/i)
  if (emailMatch) out.email = emailMatch[1].trim()
  const phoneMatch = adminNote.match(/phone\s*:\s*([^\s,;\n]+)/i)
  if (phoneMatch) out.phone = phoneMatch[1].trim()
  return out
}

// POST /api/chat — body { visitorId, message }
export async function POST(req: NextRequest) {
  try {
    const { visitorId, message } = await req.json()
    if (!visitorId || !message?.trim()) {
      return NextResponse.json({ error: 'visitorId and message required' }, { status: 400 })
    }

    // Find or create the conversation
    let conversation = await db.chatConversation.findFirst({
      where: { visitorId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!conversation) {
      conversation = await db.chatConversation.create({
        data: { visitorId, topic: null },
        include: { messages: true },
      })
    }

    // Save the user's message
    await db.chatMessage.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    })

    // Build the conversation history for the LLM
    const systemPrompt = await buildChatSystemPrompt()

    const historyMessages = [
      { role: 'system' as const, content: systemPrompt },
      // Include up to last 20 messages to stay under token budget
      ...conversation.messages.slice(-20).map(m => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as const,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Call OpenRouter
    let botRaw: string
    try {
      botRaw = await openrouterChat(historyMessages, { temperature: 0.8 })
      if (!botRaw) {
        console.error('OpenRouter chat empty response')
        botRaw = "[ADMIN:off_topic|AI returned empty]\nSorry, I didn't catch that — say again?"
      }
    } catch (e: any) {
      console.error('OpenRouter chat error:', e?.message ?? e)
      const errMsg = e?.message ?? 'unknown'
      botRaw = `[ADMIN:off_topic|OpenRouter error: ${errMsg.slice(0, 100)}]\nApologies, the chat's acting up just now. Could you email us at hello@rhinestonejewellers.ie and we'll pick it up from there?`
    }

    // Parse the [ADMIN:...] prefix
    const { tag, adminNote, customerText } = parseBotResponse(botRaw)

    // Save the assistant's customer-visible message
    await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: customerText,
        tag,
      },
    })

    // Update conversation metadata
    const updateData: any = { updatedAt: new Date() }
    // Always try to extract captured name/email/phone from any admin note,
    // not just from "capture"-tagged messages (the bot might capture on closing too).
    if (adminNote) {
      const captured = extractCapture(adminNote)
      if (captured.name && !conversation.customerName) updateData.customerName = captured.name
      if (captured.email && !conversation.customerEmail) updateData.customerEmail = captured.email
      if (captured.phone && !conversation.customerPhone) updateData.customerPhone = captured.phone
    }
    if (tag === 'closing' || tag === 'congratulations') {
      updateData.status = 'won'
    }
    if (tag && adminNote) {
      const existingNotes = conversation.adminNotes ?? ''
      const timestamp = new Date().toISOString().slice(11, 19)
      updateData.adminNotes = existingNotes + `[${timestamp}] [${tag}] ${adminNote}\n`
    }
    if (tag === 'recommendation' && !conversation.topic && adminNote) {
      updateData.topic = adminNote.slice(0, 100)
    }

    await db.chatConversation.update({ where: { id: conversation.id }, data: updateData })

    return NextResponse.json({
      reply: customerText,
      tag,
      conversationId: conversation.id,
    })
  } catch (e: any) {
    console.error('chat route error:', e)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
