'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

type Site = {
  brandName: string
  tagline: string
  description: string | null
  musicUrl: string | null
  heroVideoUrl: string | null
  logoUrl: string | null
  email: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  city: string
  country: string
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  baseCurrency: string
  aiTone: string
}

export function SettingsManager({ site: initial }: { site: Site | null }) {
  const [form, setForm] = useState<Site>({
    brandName: initial?.brandName ?? 'Rhinestone Jewellers',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    musicUrl: initial?.musicUrl ?? '',
    heroVideoUrl: initial?.heroVideoUrl ?? '',
    logoUrl: initial?.logoUrl ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    whatsapp: initial?.whatsapp ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? 'Dublin',
    country: initial?.country ?? 'Ireland',
    instagram: initial?.instagram ?? '',
    facebook: initial?.facebook ?? '',
    tiktok: initial?.tiktok ?? '',
    baseCurrency: initial?.baseCurrency ?? 'EUR',
    aiTone: initial?.aiTone ?? 'accurate, descriptive, factual - never poetic',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const upload = async (file: File, key: 'musicUrl' | 'heroVideoUrl' | 'logoUrl') => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data = await res.json()
      set(key, data.url)
      toast.success('Uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand */}
      <section className="bg-card border border-border/40 rounded-md p-6">
        <h3 className="font-display text-lg text-gold mb-4">Brand</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Brand name</Label>
              <Input value={form.brandName} onChange={e => set('brandName', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Tagline</Label>
              <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description (SEO)</Label>
            <Textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">AI tone (system prompt context)</Label>
            <Textarea value={form.aiTone} onChange={e => set('aiTone', e.target.value)} rows={2} className="mt-1 bg-background/50 border-border/40 font-mono text-xs" />
            <p className="text-[10px] text-muted-foreground mt-1">Currently set to ensure accurate, factual copy. Edit cautiously.</p>
          </div>
        </div>
      </section>

      {/* Media */}
      <section className="bg-card border border-border/40 rounded-md p-6">
        <h3 className="font-display text-lg text-gold mb-4">Media</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Background music URL</Label>
            <div className="flex gap-2 mt-1">
              <Input value={form.musicUrl ?? ''} onChange={e => set('musicUrl', e.target.value)} className="flex-1 bg-background/50 border-border/40 font-mono text-xs" />
              <label className="cursor-pointer">
                <input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'musicUrl')} />
                <span className="inline-flex items-center gap-1 px-3 py-2 border border-gold/40 text-gold text-xs hover:bg-gold/10 rounded-sm">
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Upload
                </span>
              </label>
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Hero video URL (home scene 1)</Label>
            <div className="flex gap-2 mt-1">
              <Input value={form.heroVideoUrl ?? ''} onChange={e => set('heroVideoUrl', e.target.value)} className="flex-1 bg-background/50 border-border/40 font-mono text-xs" />
              <label className="cursor-pointer">
                <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'heroVideoUrl')} />
                <span className="inline-flex items-center gap-1 px-3 py-2 border border-gold/40 text-gold text-xs hover:bg-gold/10 rounded-sm">
                  <Upload className="h-3 w-3" /> Upload
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-card border border-border/40 rounded-md p-6">
        <h3 className="font-display text-lg text-gold mb-4">Contact</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input value={form.email} onChange={e => set('email', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</Label>
            <Input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</Label>
            <Input value={form.whatsapp ?? ''} onChange={e => set('whatsapp', e.target.value)} placeholder="+353 1 XXX XXXX" className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Address</Label>
            <Input value={form.address ?? ''} onChange={e => set('address', e.target.value)} placeholder="Grafton Street" className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">City</Label>
            <Input value={form.city} onChange={e => set('city', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Country</Label>
            <Input value={form.country} onChange={e => set('country', e.target.value)} className="mt-1 bg-background/50 border-border/40" />
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="bg-card border border-border/40 rounded-md p-6">
        <h3 className="font-display text-lg text-gold mb-4">Social</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Instagram</Label>
            <Input value={form.instagram ?? ''} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Facebook</Label>
            <Input value={form.facebook ?? ''} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/..." className="mt-1 bg-background/50 border-border/40" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">TikTok</Label>
            <Input value={form.tiktok ?? ''} onChange={e => set('tiktok', e.target.value)} placeholder="https://tiktok.com/@..." className="mt-1 bg-background/50 border-border/40" />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4 border-t border-border/40">
        <Button onClick={save} disabled={saving} className="bg-gold text-gold-foreground hover:bg-gold/90">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save all settings
        </Button>
      </div>
    </div>
  )
}
