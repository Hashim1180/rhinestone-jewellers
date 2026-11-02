import { db } from '@/lib/db'
import { ChatViewer } from '@/components/admin/chat-viewer'

export const dynamic = 'force-dynamic'

export default async function AdminChatPage() {
  const conversations = await db.chatConversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    take: 100,
  })

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Live Chat — Rían</h1>
        <p className="text-sm text-muted-foreground">
          The AI sales bot. Every conversation is logged here with the bot&apos;s
          own notes (which you can see at the bottom of each transcript).
          Tags show what the bot was doing at each step: rapport, discovery,
          recommendation, comparison, margin defence, closing, congratulations,
          off-topic, capture.
        </p>
      </header>
      <ChatViewer
        conversations={conversations.map(c => ({
          id: c.id,
          visitorId: c.visitorId,
          customerName: c.customerName,
          customerEmail: c.customerEmail,
          customerPhone: c.customerPhone,
          status: c.status,
          topic: c.topic,
          adminNotes: c.adminNotes,
          messageCount: c.messages.length,
          lastActivity: c.updatedAt.toISOString(),
          createdAt: c.createdAt.toISOString(),
          messages: c.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            tag: m.tag,
            createdAt: m.createdAt.toISOString(),
          })),
        }))}
      />
    </div>
  )
}
