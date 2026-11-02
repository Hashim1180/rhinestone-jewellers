'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Sparkles, Save, X, Trash2, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Scene = {
  id: string
  order: number
  title: string
  paragraph: string
  mediaType: string
  mediaUrl: string | null
  animationType: string
  isHero: boolean
  isPublished: boolean
  proceduralType: string | null
  embedCode: string | null
}

const MEDIA_TYPES = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'THREE_GLB', label: '3D model (GLB file)' },
  { value: 'THREE_PROCEDURAL', label: '3D model (procedural)' },
  { value: 'THREE_EMBED', label: '3D model (Sketchfab embed)' },
  { value: 'TEXT_ONLY', label: 'Text only (no media)' },
]

const ANIMATIONS = [
  { value: 'FADE', label: 'Fade in' },
  { value: 'SLIDE_UP', label: 'Slide up' },
  { value: 'SLIDE_LEFT', label: 'Slide from left' },
  { value: 'PARALLAX', label: 'Parallax' },
  { value: 'ZOOM', label: 'Zoom in' },
  { value: 'REVEAL', label: 'Reveal' },
  { value: 'ROTATE_3D', label: '3D rotate' },
]

const PROCEDURAL_TYPES = [
  { value: 'solitaire-ring', label: 'Solitaire ring' },
  { value: 'halo-pendant', label: 'Halo pendant' },
  { value: 'bangle', label: 'Bangle' },
]

export function SceneEditor({
  scene,
  isNew,
  onClose,
  onSaved,
  onDeleted,
}: {
  scene?: Scene
  isNew?: boolean
  onClose: () => void
  onSaved: (s: Scene) => void
  onDeleted?: () => void
}) {
  const [form, setForm] = useState({
    title: scene?.title ?? '',
    paragraph: scene?.paragraph ?? '',
    mediaType: scene?.mediaType ?? 'PHOTO',
    mediaUrl: scene?.mediaUrl ?? '',
    animationType: scene?.animationType ?? 'FADE',
    isHero: scene?.isHero ?? false,
    isPublished: scene?.isPublished ?? true,
    proceduralType: scene?.proceduralType ?? 'solitaire-ring',
    embedCode: scene?.embedCode ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const onUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      set('mediaUrl', data.url)
      toast.success('Uploaded')
    } catch (e) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onGenerateAI = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, imageUrl: form.mediaUrl }),
      })
      if (!res.ok) throw new Error('AI failed')
      const data = await res.json()
      set('paragraph', data.text)
      toast.success('AI generated scene text')
    } catch (e) {
      toast.error('AI generation failed - check API key')
    } finally {
      setAiLoading(false)
    }
  }

  const onSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const url = isNew ? '/api/admin/scenes' : `/api/admin/scenes/${scene!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const body = {
        ...form,
        mediaUrl: form.mediaUrl || null,
        embedCode: form.embedCode || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Save failed')
      const saved = await res.json()
      onSaved(saved)
      toast.success(isNew ? 'Scene created' : 'Scene saved')
    } catch (e) {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm('Delete this scene? This cannot be undone.')) return
    setSaving(true)
    try {
      await fetch(`/api/admin/scenes/${scene!.id}`, { method: 'DELETE' })
      toast.success('Scene deleted')
      onDeleted?.()
    } catch {
      toast.error('Delete failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-8 bg-card border border-gold/30 rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-gold">
          {isNew ? 'New scene' : `Edit: ${scene?.title}`}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-gold">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="mt-1 bg-background/50 border-border/40"
            placeholder="e.g. Hand-Set Crystals"
          />
        </div>

        {/* Paragraph with AI button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Paragraph (accurate, factual)
            </Label>
            <Button
              type="button"
              onClick={onGenerateAI}
              disabled={aiLoading || !form.title}
              size="sm"
              variant="outline"
              className="border-gold/40 text-gold hover:bg-gold/10 h-7 text-[10px] uppercase tracking-widest"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
              {aiLoading ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <Textarea
            value={form.paragraph}
            onChange={(e) => set('paragraph', e.target.value)}
            rows={4}
            className="bg-background/50 border-border/40"
            placeholder="A descriptive paragraph about this scene..."
          />
          {!form.title && (
            <p className="text-[10px] text-muted-foreground mt-1">Enter a title first to enable AI generation.</p>
          )}
        </div>

        {/* Media type */}
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Media type</Label>
          <Select value={form.mediaType} onValueChange={(v) => set('mediaType', v)}>
            <SelectTrigger className="mt-1 bg-background/50 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDIA_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Media URL + Upload */}
        {form.mediaType !== 'TEXT_ONLY' && form.mediaType !== 'THREE_PROCEDURAL' && form.mediaType !== 'THREE_EMBED' && (
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              {form.mediaType === 'THREE_GLB' ? 'GLB file URL' : 'Media URL'}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={form.mediaUrl ?? ''}
                onChange={(e) => set('mediaUrl', e.target.value)}
                className="flex-1 bg-background/50 border-border/40 font-mono text-xs"
                placeholder="/media/..."
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={form.mediaType === 'THREE_GLB' ? '.glb,.gltf' : 'image/*,video/*'}
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center gap-1 px-3 py-2 border border-gold/40 text-gold text-xs hover:bg-gold/10 rounded-sm">
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  Upload
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Procedural type selector */}
        {form.mediaType === 'THREE_PROCEDURAL' && (
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Procedural model</Label>
            <Select value={form.proceduralType ?? 'solitaire-ring'} onValueChange={(v) => set('proceduralType', v)}>
              <SelectTrigger className="mt-1 bg-background/50 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROCEDURAL_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sketchfab embed code */}
        {form.mediaType === 'THREE_EMBED' && (
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Sketchfab embed code</Label>
            <Textarea
              value={form.embedCode ?? ''}
              onChange={(e) => set('embedCode', e.target.value)}
              rows={4}
              className="mt-1 bg-background/50 border-border/40 font-mono text-xs"
              placeholder='<iframe src="https://sketchfab.com/models/.../embed" ... ></iframe>'
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              On Sketchfab, click the Embed button and paste the full HTML here.
            </p>
          </div>
        )}

        {/* Animation */}
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Scroll animation</Label>
          <Select value={form.animationType} onValueChange={(v) => set('animationType', v)}>
            <SelectTrigger className="mt-1 bg-background/50 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANIMATIONS.map(a => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isHero}
              onCheckedChange={(c) => set('isHero', c)}
            />
            <Label className="text-xs">Set as opening hero</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isPublished}
              onCheckedChange={(c) => set('isPublished', c)}
            />
            <Label className="text-xs">Published</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border/40">
          <Button onClick={onSave} disabled={saving} className="bg-gold text-gold-foreground hover:bg-gold/90">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving...' : 'Save scene'}
          </Button>
          {!isNew && onDeleted && (
            <Button
              onClick={onDelete}
              disabled={saving}
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
          <Button onClick={onClose} variant="ghost" className="text-muted-foreground">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
