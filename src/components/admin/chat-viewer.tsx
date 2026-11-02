'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Trash2, X, Loader2, Star, User, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'

type Message = {
  id: string
  role: string
  content: string
  tag: string | null
  createdAt: string
}

type Conversation = {
  id: string
  visitorId: string
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  status: string
  topic: string | null
  adminNotes: string | null
  messageCount: number
  lastActivity: string
  createdAt: string
  messages: Message[]
}

const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-300 bg-green-500/10',
  won: 'text-gold bg-gold/20',
  lost: 'text-red-300 bg-red-500/10',
}

const TAG_COLORS: Record<string, string> = {
  rapport: 'text-blue-300',
  discovery: 'text-purple-300',
  recommendation: 'text-gold',
  comparison: 'text-amber-300',
  margin_defence: 'text-orange-300',
  closing: 'text-green-300',
  congratulations: 'text-gold font-medium',
  off_topic: 'text-muted-foreground',
  capture: 'text-pink-300',
}

export function ChatViewer({ conversations: initial }: { conversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initial)
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'won' | 'lost'>('all')
  const [notesDraft, setNotesDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const filtered = conversations.filter(c => statusFilter === 'all' ? true : c.status === statusFilter)
  const current = conversations.find(c => c.id === selectedId) ?? filtered[0] ?? null

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No chat conversations yet. Visitors who use the chat widget on the public site will appear here.</p>
      </div>
    )
  }

  const onSelect = (c: Conversation) => {
    setSelectedId(c.id)
    setNotesDraft(c.adminNotes ?? '')
  }

  const saveNotes = async () => {
    if (!current) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/chat/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notesDraft }),
      })
      if (!res.ok) throw new Error()
      setConversations(prev => prev.map(c => c.id === current.id ? { ...c, adminNotes: notesDraft } : c))
      toast.success('Notes saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSavingNotes(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!current) return
    try {
      const res = await fetch(`/api/admin/chat/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setConversations(prev => prev.map(c => c.id === current.id ? { ...c, status: newStatus } : c))
      toast.success(`Marked as ${newStatus}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const removeConversation = async (id: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    try {
      await fetch(`/api/admin/chat/${id}`, { method: 'DELETE' })
      setConversations(prev => prev.filter(c => c.id !== id))
      if (selectedId === id) setSelectedId(null)
      toast.success('Conversation deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-4">
        {(['all', 'open', 'won', 'lost'] as const).map(s => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'text-xs uppercase tracking-widest',
              statusFilter === s
                ? 'bg-gold text-gold-foreground hover:bg-gold/90'
                : 'border-border/40 text-muted-foreground hover:text-gold'
            )}
          >
            {s === 'all' ? 'All' : s}
            <span className="ml-2 text-[10px] opacity-60">
              {s === 'all' ? conversations.length : conversations.filter(c => c.status === s).length}
            </span>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={cn(
                'w-full text-left p-3 rounded-sm border border-border/40 hover:border-gold/30 transition-colors',
                c.id === current?.id ? 'bg-card border-gold/40' : 'bg-card/50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground truncate">
                  {c.customerName ?? 'Anonymous visitor'}
                </span>
                <span className={cn('text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full', STATUS_COLORS[c.status] ?? 'text-muted-foreground')}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 italic">
                {c.messages[c.messages.length - 1]?.content ?? '(no messages)'}
              </p>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground/70">
                <span>{c.messageCount} messages</span>
                <span>{new Date(c.lastActivity).toLocaleString('en-IE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {c.topic && (
                <p className="text-[10px] text-gold/70 mt-1 italic">→ {c.topic}</p>
              )}
            </button>
          ))}
        </div>

        {/* Conversation detail */}
        {current && (
          <div className="bg-card border border-border/40 rounded-md p-6 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/40">
              <div>
                <h3 className="font-display text-2xl text-gold mb-2">
                  {current.customerName ?? 'Anonymous visitor'}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {current.customerEmail && (
                    <a href={`mailto:${current.customerEmail}`} className="inline-flex items-center gap-1 hover:text-gold">
                      <Mail className="h-3 w-3" /> {current.customerEmail}
                    </a>
                  )}
                  {current.customerPhone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {current.customerPhone}
                    </span>
                  )}
                  <span className="font-mono text-[10px]">Visitor ID: {current.visitorId.slice(0, 16)}…</span>
                  <span>Started: {new Date(current.createdAt).toLocaleString('en-IE')}</span>
                </div>
              </div>
              <Button onClick={() => removeConversation(current.id)} size="sm" variant="ghost" className="text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Status buttons */}
            <div className="flex gap-2 mb-4">
              {['open', 'won', 'lost'].map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={current.status === s ? 'default' : 'outline'}
                  onClick={() => updateStatus(s)}
                  className={cn(
                    'text-[10px] uppercase tracking-widest',
                    current.status === s
                      ? 'bg-gold text-gold-foreground hover:bg-gold/90'
                      : 'border-border/40 text-muted-foreground hover:text-gold'
                  )}
                >
                  {s === 'won' && <Star className="h-3 w-3 mr-1" />}
                  Mark as {s}
                </Button>
              ))}
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {current.messages.map(m => (
                <div
                  key={m.id}
                  className={cn(
                    'flex flex-col max-w-[90%]',
                    m.role === 'user' ? 'ml-auto items-end' : 'items-start'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {m.tag && (
                      <span className={cn('text-[10px] uppercase tracking-widest font-mono', TAG_COLORS[m.tag] ?? 'text-muted-foreground')}>
                        {m.tag.replace('_', ' ')}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {m.role === 'assistant' ? 'Rían' : 'Customer'} · {new Date(m.createdAt).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'px-3 py-2 rounded-md text-sm whitespace-pre-wrap leading-relaxed',
                      m.role === 'user'
                        ? 'bg-gold/15 text-foreground rounded-br-sm border border-gold/20'
                        : 'bg-muted/30 text-foreground/90 rounded-bl-sm border border-border/40'
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Admin notes */}
            <div className="border-t border-border/40 pt-4">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Admin notes (private — only you see these)
              </Label>
              <Textarea
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                rows={3}
                placeholder="Add your own notes about this customer or conversation…"
                className="mt-1 bg-background/50 border-border/40 text-sm"
              />
              <div className="flex justify-end mt-2">
                <Button onClick={saveNotes} disabled={savingNotes} size="sm"
                  className="bg-gold text-gold-foreground hover:bg-gold/90">
                  {savingNotes ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Save notes
                </Button>
              </div>
              {current.adminNotes && (
                <div className="mt-3 p-3 bg-muted/20 border border-border/40 rounded-sm">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Bot&apos;s auto-generated notes (read-only)
                  </p>
                  <pre className="text-xs text-foreground/70 whitespace-pre-wrap font-mono">
                    {current.adminNotes}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
