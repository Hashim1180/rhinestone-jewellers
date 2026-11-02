'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Save, X, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Item = {
  id: string
  customerName: string
  location: string | null
  quote: string
  rating: number
  image: string | null
  isPublished: boolean
}

export function TestimonialsManager({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<Item | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Item | null>(null)

  const openNew = () => {
    setEditing(null)
    setCreating(true)
    setForm({ id: '', customerName: '', location: '', quote: '', rating: 5, image: null, isPublished: true })
  }
  const openEdit = (item: Item) => {
    setEditing(item)
    setCreating(false)
    setForm(item)
  }
  const close = () => { setEditing(null); setCreating(false); setForm(null) }
  const set = (k: string, v: any) => setForm(prev => prev ? ({ ...prev, [k]: v }) : prev)

  const save = async () => {
    if (!form) return
    try {
      const isNew = creating || !editing
      const url = isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${editing!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      if (isNew) {
        setItems(prev => [saved, ...prev])
      } else {
        setItems(prev => prev.map(p => p.id === saved.id ? saved : p))
      }
      close()
      toast.success(isNew ? 'Testimonial created' : 'Testimonial saved')
    } catch {
      toast.error('Save failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(p => p.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <Button onClick={openNew} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" /> New testimonial
        </Button>
      </div>

      {form && (
        <div className="mb-8 bg-card border border-gold/30 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-gold">{creating ? 'New testimonial' : `Edit: ${editing?.customerName}`}</h3>
            <Button variant="ghost" size="sm" onClick={close}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Customer name</Label>
                <Input value={form.customerName} onChange={e => set('customerName', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Rating (1-5)</Label>
                <Input type="number" min="1" max="5" value={form.rating} onChange={e => set('rating', parseInt(e.target.value || '5'))} className="mt-1 bg-background/50 border-border/40" />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Location</Label>
              <Input value={form.location ?? ''} onChange={e => set('location', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Quote</Label>
              <Textarea value={form.quote} onChange={e => set('quote', e.target.value)} rows={4} className="mt-1 bg-background/50 border-border/40" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={c => set('isPublished', c)} />
              <Label className="text-xs">Published</Label>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border/40">
              <Button onClick={save} className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
              <Button variant="ghost" onClick={close}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {items.map(t => (
          <div key={t.id} className="bg-card border border-border/40 rounded-md p-4 flex items-start gap-4 hover:border-gold/30 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">{t.customerName}</span>
                <span className="text-gold">{'\u2605'.repeat(t.rating)}</span>
                {!t.isPublished && <span className="text-[10px] text-muted-foreground uppercase">Hidden</span>}
              </div>
              {t.location && <p className="text-xs text-muted-foreground mb-2">{t.location}</p>}
              <p className="text-sm text-foreground/80 italic line-clamp-3">&ldquo;{t.quote}&rdquo;</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(t)} className="text-xs border-gold/40 text-gold hover:bg-gold/10">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(t.id)} className="text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
