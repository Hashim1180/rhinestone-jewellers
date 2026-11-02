'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Save, X, Trash2, Loader2, Upload, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type Item = {
  id: string
  url: string
  caption: string | null
  type: string
  isPublished: boolean
}

export function GalleryManager({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<Item | null>(null)
  const [creating, setCreating] = useState(false)

  const uploadImage = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data = await res.json()
      // Auto-create a gallery item with this image
      const createRes = await fetch('/api/admin/gallery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url, type: 'PHOTO' }),
      })
      if (!createRes.ok) throw new Error()
      const created = await createRes.json()
      setItems(prev => [...prev, created])
      toast.success('Image added to gallery')
    } catch {
      toast.error('Upload failed')
    }
  }

  const generateCaption = async (item: Item) => {
    try {
      const res = await fetch('/api/ai/gallery-caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: item.url, context: item.caption ?? '' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: data.text }),
      })
      setItems(prev => prev.map(p => p.id === item.id ? { ...p, caption: data.text } : p))
      toast.success('Caption generated')
    } catch {
      toast.error('AI failed')
    }
  }

  const togglePublish = async (item: Item) => {
    const next = !item.isPublished
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, isPublished: next } : p))
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: next }),
    })
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return
    try {
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(p => p.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={e => Array.from(e.target.files ?? []).forEach(uploadImage)} />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-gold-foreground hover:bg-gold/90 rounded-sm text-sm">
            <Upload className="h-4 w-4" /> Upload photos
          </span>
        </label>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(item => (
          <div key={item.id} className="bg-card border border-border/40 rounded-md overflow-hidden hover:border-gold/30 transition-colors">
            <div className="aspect-square bg-muted/30">
              <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 min-h-[2em]">{item.caption ?? <span className="italic">No caption</span>}</p>
              <div className="flex gap-1 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => generateCaption(item)}
                  className="text-[10px] border-gold/40 text-gold hover:bg-gold/10 h-7">
                  <Sparkles className="h-3 w-3 mr-1" /> AI
                </Button>
                <Button size="sm" variant="outline" onClick={() => togglePublish(item)}
                  className="text-[10px] h-7">
                  {item.isPublished ? 'Published' : 'Hidden'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(item.id)}
                  className="text-[10px] text-destructive h-7">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground italic py-12 text-center">
          No gallery items yet. Click &ldquo;Upload photos&rdquo; to add.
        </p>
      )}
    </div>
  )
}
