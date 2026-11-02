'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Save, X, Trash2, Loader2, Upload, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  coverImage: string | null
  isPublished: boolean
  order: number
  productsCount: number
}

export function CollectionsManager({ collections: initial }: { collections: Collection[] }) {
  const [collections, setCollections] = useState(initial)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [creating, setCreating] = useState(false)

  const onUpload = async (file: File, setUrl: (url: string) => void) => {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUrl(data.url)
      toast.success('Uploaded')
    } catch {
      toast.error('Upload failed')
    }
  }

  const save = async (form: any, isNew: boolean, id?: string) => {
    try {
      const url = isNew ? '/api/admin/collections' : `/api/admin/collections/${id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      if (isNew) {
        setCollections(prev => [...prev, { ...saved, productsCount: 0 }])
      } else {
        setCollections(prev => prev.map(c => c.id === saved.id ? { ...c, ...saved, productsCount: c.productsCount } : c))
      }
      setEditing(null)
      setCreating(false)
      toast.success(isNew ? 'Collection created' : 'Collection saved')
    } catch {
      toast.error('Save failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this collection? Products will also be deleted.')) return
    try {
      await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' })
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <Button onClick={() => setCreating(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" /> New collection
        </Button>
      </div>

      {(editing || creating) && (
        <CollectionEditor
          collection={editing ?? undefined}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSave={save}
          onUpload={onUpload}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map(c => (
          <div key={c.id} className="bg-card border border-border/40 rounded-md p-4 hover:border-gold/30 transition-colors">
            <div className="aspect-[4/3] bg-muted/30 rounded-sm overflow-hidden mb-3">
              {c.coverImage ? (
                <img src={c.coverImage} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
              )}
            </div>
            <h3 className="font-medium text-foreground mb-1">{c.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{c.productsCount} products</span>
              <span>/collections/{c.slug}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => setEditing(c)} className="text-xs border-gold/40 text-gold hover:bg-gold/10">
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)} className="text-xs text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CollectionEditor({
  collection, isNew, onClose, onSave, onUpload,
}: {
  collection?: Collection
  isNew?: boolean
  onClose: () => void
  onSave: (form: any, isNew: boolean, id?: string) => void
  onUpload: (file: File, setUrl: (url: string) => void) => void
}) {
  const [form, setForm] = useState({
    name: collection?.name ?? '',
    slug: collection?.slug ?? '',
    description: collection?.description ?? '',
    coverImage: collection?.coverImage ?? '',
    isPublished: collection?.isPublished ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    setSaving(true)
    onSave(form, !!isNew, collection?.id)
    setSaving(false)
  }

  return (
    <div className="mb-8 bg-card border border-gold/30 rounded-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-gold">{isNew ? 'New collection' : `Edit: ${collection?.name}`}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Slug</Label>
            <Input value={form.slug} onChange={e => set('slug', e.target.value)} className="mt-1 bg-background/50 border-border/40 font-mono text-xs" />
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="mt-1 bg-background/50 border-border/40" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Cover image URL</Label>
          <div className="flex gap-2 mt-1">
            <Input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} className="flex-1 bg-background/50 border-border/40 font-mono text-xs" />
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && onUpload(e.target.files[0], (url) => set('coverImage', url))} />
              <span className="inline-flex items-center gap-1 px-3 py-2 border border-gold/40 text-gold text-xs hover:bg-gold/10 rounded-sm">
                <Upload className="h-3 w-3" /> Upload
              </span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isPublished} onCheckedChange={c => set('isPublished', c)} />
          <Label className="text-xs">Published</Label>
        </div>
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <Button onClick={save} disabled={saving} className="bg-gold text-gold-foreground hover:bg-gold/90">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
