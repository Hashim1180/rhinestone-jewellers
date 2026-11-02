import { db } from '@/lib/db'
import { InquiriesManager } from '@/components/admin/inquiries-manager'

export const dynamic = 'force-dynamic'

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-gold mb-1">Inquiries</h1>
        <p className="text-sm text-muted-foreground">
          Contact form submissions. AI auto-routes each one (retail / wholesale / press / appointment)
          and drafts a reply you can approve and send.
        </p>
      </header>
      <InquiriesManager inquiries={inquiries.map(i => ({
        id: i.id, name: i.name, email: i.email, phone: i.phone,
        message: i.message, category: i.category, aiRouting: i.aiRouting,
        aiReplyDraft: i.aiReplyDraft, adminReply: i.adminReply,
        isRead: i.isRead, isReplied: i.isReplied,
        createdAt: i.createdAt.toISOString(),
      }))} />
    </div>
  )
}
