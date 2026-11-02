'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, Sparkles, Check, X, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Inquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  category: string
  aiRouting: string | null
  aiReplyDraft: string | null
  adminReply: string | null
  isRead: boolean
  isReplied: boolean
  createdAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'text-muted-foreground bg-muted/30',
  RETAIL: 'text-blue-300 bg-blue-500/10',
  WHOLESALE: 'text-amber-300 bg-amber-500/10',
  PRESS: 'text-pink-300 bg-pink-500/10',
  APPOINTMENT: 'text-green-300 bg-green-500/10',
}

export function InquiriesManager({ inquiries: initial }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initial)
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null)
  const [reply, setReply] = useState<string>('')

  const current = inquiries.find(i => i.id === selected) ?? inquiries[0]

  if (!current) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No inquiries yet.</p>
      </div>
    )
  }

  const onSelect = async (i: Inquiry) => {
    setSelected(i.id)
    setReply(i.adminReply ?? i.aiReplyDraft ?? '')
    if (!i.isRead) {
      setInquiries(prev => prev.map(p => p.id === i.id ? { ...p, isRead: true } : p))
      await fetch('/api/admin/inquiries', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: i.id, isRead: true }),
      })
    }
  }

  const sendReply = async () => {
    if (!reply.trim()) {
      toast.error('Reply is empty')
      return
    }
    setInquiries(prev => prev.map(p => p.id === current.id ? { ...p, adminReply: reply, isReplied: true } : p))
    await fetch('/api/admin/inquiries', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: current.id, adminReply: reply, isReplied: true }),
    })
    toast.success('Reply saved. (Email sending is not enabled in this version - copy the reply into your email client.)')
  }

  const reRunAI = async () => {
    setInquiries(prev => prev.map(p => p.id === current.id ? { ...p, aiRouting: 'Re-routing...' } : p))
    try {
      const res = await fetch('/api/ai/inquiry-route', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setInquiries(prev => prev.map(p => p.id === data.inquiry.id ? {
        ...p,
        aiRouting: data.inquiry.aiRouting,
        aiReplyDraft: data.inquiry.aiReplyDraft,
        category: data.inquiry.category,
      } : p))
      toast.success('AI re-routed the inquiry')
    } catch {
      toast.error('AI failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    try {
      await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' })
      setInquiries(prev => prev.filter(p => p.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Inbox list */}
      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {inquiries.map(i => (
          <button
            key={i.id}
            onClick={() => onSelect(i)}
            className={cn(
              'w-full text-left p-3 rounded-sm border border-border/40 hover:border-gold/30 transition-colors',
              i.id === selected ? 'bg-card border-gold/40' : 'bg-card/50',
              !i.isRead && 'border-l-2 border-l-gold'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">{i.name}</span>
              <span className={cn('text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full', CATEGORY_COLORS[i.category])}>
                {i.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{i.message}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {new Date(i.createdAt).toLocaleString()} · {i.isReplied ? 'replied' : 'pending'}
            </p>
          </button>
        ))}
      </div>

      {/* Detail view */}
      <div className="bg-card border border-border/40 rounded-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl text-gold mb-1">{current.name}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <a href={`mailto:${current.email}`} className="inline-flex items-center gap-1 hover:text-gold">
                <Mail className="h-3 w-3" /> {current.email}
              </a>
              {current.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {current.phone}</span>}
              <span>{new Date(current.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={reRunAI} size="sm" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> Re-run AI
            </Button>
            <Button onClick={() => remove(current.id)} size="sm" variant="ghost" className="text-destructive text-xs">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="p-3 bg-muted/20 border border-border/40 rounded-sm">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Customer message</p>
            <p className="text-sm whitespace-pre-line">{current.message}</p>
          </div>
          <div className="p-3 bg-muted/20 border border-border/40 rounded-sm">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">AI routing</p>
            <p className="text-sm">
              <span className="text-gold uppercase tracking-widest text-xs">{current.category}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">{current.aiRouting ?? 'No AI routing yet.'}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Your reply</Label>
            <Button
              onClick={() => setReply(current.aiReplyDraft ?? '')}
              size="sm" variant="ghost"
              className="text-[10px] text-gold hover:text-gold h-6"
              disabled={!current.aiReplyDraft}
            >
              <Sparkles className="h-3 w-3 mr-1" /> Use AI draft
            </Button>
          </div>
          <Textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={6}
            placeholder="Type your reply, or click 'Use AI draft' to start with the AI suggestion..."
            className="bg-background/50 border-border/40"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-muted-foreground">
              {current.isReplied ? '✓ Marked as replied' : 'Reply not sent yet'}
            </p>
            <Button onClick={sendReply} className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Check className="h-4 w-4 mr-2" /> Mark as sent
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
