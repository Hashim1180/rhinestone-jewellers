'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Save, X, Trash2, Loader2, Upload, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type Collection = { id: string, name: string }
type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  images: string[]
  pricingModel: string
  priceEur: number | null
  goldWeightG: number | null
  goldPurity: number | null
  makingCharge: number | null
  stock: number
  isPublished: boolean
  featured: boolean
  collectionId: string
  collectionName?: string
}

export function ProductsManager({
  products: initial, collections,
}: {
  products: Product[]
  collections: Collection[]
}) {
  const [products, setProducts] = useState(initial)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  const save = async (form: any, isNew: boolean, id?: string) => {
    try {
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      if (isNew) {
        setProducts(prev => [{ ...saved, collectionName: collections.find(c => c.id === saved.collectionId)?.name }, ...prev])
      } else {
        setProducts(prev => prev.map(p => p.id === saved.id ? { ...p, ...saved, collectionName: collections.find(c => c.id === saved.collectionId)?.name } : p))
      }
      setEditing(null)
      setCreating(false)
      toast.success(isNew ? 'Product created' : 'Product saved')
    } catch {
      toast.error('Save failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <Button onClick={() => setCreating(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" /> New product
        </Button>
      </div>

      {(editing || creating) && (
        <ProductEditor
          product={editing ?? undefined}
          isNew={creating}
          collections={collections}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSave={save}
        />
      )}

      {products.length === 0 && !creating && (
        <p className="text-muted-foreground italic py-12 text-center">No products yet.</p>
      )}

      <div className="grid gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-card border border-border/40 rounded-md p-4 flex items-center gap-4 hover:border-gold/30 transition-colors">
            <div className="w-14 h-14 bg-muted/30 rounded-sm overflow-hidden flex-shrink-0">
              {p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{p.name} {p.featured && <span className="text-gold text-[10px] uppercase ml-2">Featured</span>}</p>
              <p className="text-xs text-muted-foreground">{p.collectionName} - {p.pricingModel === 'GOLD_WEIGHTED' ? `${p.goldWeightG}g ${p.goldPurity}K + making` : `EUR ${p.priceEur ?? 0}`}</p>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Stock: {p.stock}</span>
            <Button size="sm" variant="outline" onClick={() => setEditing(p)} className="text-xs border-gold/40 text-gold hover:bg-gold/10">Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-xs text-destructive"><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductEditor({
  product, isNew, collections, onClose, onSave,
}: {
  product?: Product
  isNew?: boolean
  collections: Collection[]
  onClose: () => void
  onSave: (form: any, isNew: boolean, id?: string) => void
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    images: product?.images ?? [],
    pricingModel: product?.pricingModel ?? 'FIXED',
    priceEur: product?.priceEur ?? 0,
    goldWeightG: product?.goldWeightG ?? 0,
    goldPurity: product?.goldPurity ?? 22,
    makingCharge: product?.makingCharge ?? 0,
    stock: product?.stock ?? 0,
    isPublished: product?.isPublished ?? true,
    featured: product?.featured ?? false,
    collectionId: product?.collectionId ?? collections[0]?.id ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data = await res.json()
      set('images', [...form.images, data.url])
      toast.success('Image added')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (i: number) => {
    set('images', form.images.filter((_, idx) => idx !== i))
  }

  const generateAI = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/product', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, imageUrl: form.images[0],
          pricingModel: form.pricingModel, goldWeightG: form.goldWeightG, goldPurity: form.goldPurity,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      set('description', data.text)
      toast.success('AI generated description')
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const save = async () => {
    if (!form.name?.trim() || !form.slug?.trim() || !form.collectionId) {
      toast.error('Name, slug, and collection are required')
      return
    }
    setSaving(true)
    onSave(form, !!isNew, product?.id)
    setSaving(false)
  }

  return (
    <div className="mb-8 bg-card border border-gold/30 rounded-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-gold">{isNew ? 'New product' : `Edit: ${product?.name}`}</h3>
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
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
            <Button type="button" onClick={generateAI} disabled={aiLoading || !form.name}
              size="sm" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 h-7 text-[10px] uppercase tracking-widest">
              {aiLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
              {aiLoading ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="bg-background/50 border-border/40" />
        </div>

        {/* Image gallery */}
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Images</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-sm overflow-hidden border border-border/40">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-background/80 rounded-full p-1 text-destructive hover:bg-background">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-sm border border-dashed border-gold/40 flex items-center justify-center cursor-pointer hover:bg-gold/10">
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              {uploading ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <Upload className="h-4 w-4 text-gold" />}
            </label>
          </div>
        </div>

        {/* Collection + Pricing model */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Collection</Label>
            <Select value={form.collectionId} onValueChange={v => set('collectionId', v)}>
              <SelectTrigger className="mt-1 bg-background/50 border-border/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {collections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Pricing model</Label>
            <Select value={form.pricingModel} onValueChange={v => set('pricingModel', v)}>
              <SelectTrigger className="mt-1 bg-background/50 border-border/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">Fixed price (EUR)</SelectItem>
                <SelectItem value="GOLD_WEIGHTED">Gold-weighted (live rate)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fixed price */}
        {form.pricingModel === 'FIXED' && (
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Price (EUR)</Label>
            <Input type="number" step="0.01" value={form.priceEur} onChange={e => set('priceEur', parseFloat(e.target.value))} className="mt-1 bg-background/50 border-border/40" />
          </div>
        )}

        {/* Gold-weighted fields */}
        {form.pricingModel === 'GOLD_WEIGHTED' && (
          <div className="grid sm:grid-cols-3 gap-4 p-4 bg-muted/30 border border-border/40 rounded-md">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Weight (g)</Label>
              <Input type="number" step="0.01" value={form.goldWeightG} onChange={e => set('goldWeightG', parseFloat(e.target.value))} className="mt-1 bg-background/50 border-border/40" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Purity (karat)</Label>
              <Select value={String(form.goldPurity)} onValueChange={v => set('goldPurity', parseInt(v))}>
                <SelectTrigger className="mt-1 bg-background/50 border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9K</SelectItem>
                  <SelectItem value="14">14K</SelectItem>
                  <SelectItem value="18">18K</SelectItem>
                  <SelectItem value="22">22K</SelectItem>
                  <SelectItem value="24">24K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Making charge (EUR)</Label>
              <Input type="number" step="0.01" value={form.makingCharge} onChange={e => set('makingCharge', parseFloat(e.target.value))} className="mt-1 bg-background/50 border-border/40" />
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Stock</Label>
            <Input type="number" value={form.stock} onChange={e => set('stock', parseInt(e.target.value || '0'))} className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div className="flex items-end gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={c => set('featured', c)} />
              <Label className="text-xs">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={c => set('isPublished', c)} />
              <Label className="text-xs">Published</Label>
            </div>
          </div>
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
