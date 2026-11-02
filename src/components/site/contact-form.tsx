'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Send, Check } from 'lucide-react'

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      message: data.get('message'),
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
      toast.success('Message sent. We will be in touch shortly.')
      form.reset()
    } catch (err) {
      toast.error('Could not send message. Try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-card border border-gold/30 rounded-md p-8 text-center">
        <Check className="h-10 w-10 text-gold mx-auto mb-4" />
        <h2 className="font-display text-2xl text-gold mb-2">Message received</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Thank you for reaching out. We respond within one working day.
        </p>
        <Button
          variant="outline"
          onClick={() => setSent(false)}
          className="border-gold/40 text-gold hover:bg-gold/10"
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-card border border-border/40 rounded-md p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
          <Input id="name" name="name" required className="mt-1 bg-background/50 border-border/40" />
        </div>
        <div>
          <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1 bg-background/50 border-border/40" />
        </div>
      </div>
      <div>
        <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" className="mt-1 bg-background/50 border-border/40" />
      </div>
      <div>
        <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Message</Label>
        <Textarea id="message" name="message" required rows={5} className="mt-1 bg-background/50 border-border/40" />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gold text-gold-foreground hover:bg-gold/90 uppercase tracking-widest text-xs"
      >
        {loading ? 'Sending...' : 'Send message'}
        {!loading && <Send className="ml-2 h-3 w-3" />}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        Your message will be routed automatically (retail / wholesale / press) by our AI assistant
        and answered within one working day.
      </p>
    </form>
  )
}
