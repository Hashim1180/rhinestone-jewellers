'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Msg = {
  role: 'user' | 'assistant'
  content: string
  ts: number
}

const GREETING = "Hi there — I'm Rían, the jeweller here at Rhinestone. What brings you to our corner of Dublin today?"

export function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: GREETING, ts: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Hide on /admin/* routes — admin doesn't need the chat bot
  const isAdmin = pathname?.startsWith('/admin')
  const isAuth = pathname?.startsWith('/api/auth')

  // Generate or load visitor ID
  useEffect(() => {
    if (isAdmin) return
    let id = localStorage.getItem('rh-visitor-id')
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('rh-visitor-id', id)
    }
    setVisitorId(id)

    // Load previous conversation if any
    const saved = localStorage.getItem('rh-chat-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Msg[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      } catch {}
    }
  }, [isAdmin])

  // Persist messages
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('rh-chat-history', JSON.stringify(messages.slice(-50)))
    }
  }, [messages])

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const send = async () => {
    if (!input.trim() || loading || !visitorId) return
    const userMsg: Msg = { role: 'user', content: input.trim(), ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, message: userMsg.content }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, ts: Date.now() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, the chat's acting up just now. Could you try again, or email hello@rhinestonejewellers.ie?",
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Hide widget on admin and auth routes
  if (isAdmin || isAuth) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-4 left-4 z-40 h-12 w-12 rounded-full bg-gold/15 backdrop-blur-md border border-gold/50 flex items-center justify-center hover:bg-gold/25 transition-colors group"
      >
        {open ? (
          <X className="h-5 w-5 text-gold" />
        ) : (
          <MessageCircle className="h-5 w-5 text-gold group-hover:scale-110 transition-transform" />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gold animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 left-4 z-40 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-card border border-gold/30 rounded-md shadow-2xl backdrop-blur-md flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-background/80 rounded-t-md">
            <div className="h-9 w-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-display text-sm">
              R
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gold tracking-wider">Rían</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Jeweller · Rhinestone Jewellers
              </p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-green-500/80">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> Online
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col max-w-[85%]',
                  m.role === 'user' ? 'ml-auto items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'px-3 py-2 rounded-md text-sm whitespace-pre-wrap leading-relaxed',
                    m.role === 'user'
                      ? 'bg-gold/20 text-foreground rounded-br-sm'
                      : 'bg-muted/30 text-foreground/90 rounded-bl-sm border border-border/40'
                  )}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
                  {new Date(m.ts).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-3 w-3 animate-spin text-gold" />
                <span className="italic">Rían is typing…</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 p-3 flex gap-2 items-end bg-background/80 rounded-b-md">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Type a message…"
              className="flex-1 bg-background/50 border border-border/40 rounded-md px-3 py-2 text-sm resize-none focus:border-gold/40 focus:outline-none max-h-24"
              style={{ minHeight: '38px' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="p-2 rounded-md bg-gold text-gold-foreground hover:bg-gold/90 disabled:opacity-30 transition-colors"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-1.5 text-[10px] text-muted-foreground/60 text-center border-t border-border/40">
            Powered by Z.ai · Replies can take a few seconds
          </div>
        </div>
      )}
    </>
  )
}
