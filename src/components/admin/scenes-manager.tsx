'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SceneRow } from '@/components/admin/scene-row'
import { SceneEditor } from '@/components/admin/scene-editor'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, RefreshCw } from 'lucide-react'
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

export function ScenesManager({ scenes: initialScenes }: { scenes: Scene[] }) {
  const [scenes, setScenes] = useState(initialScenes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = scenes.findIndex(s => s.id === active.id)
    const newIdx = scenes.findIndex(s => s.id === over.id)
    const updated = arrayMove(scenes, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }))
    setScenes(updated)
    try {
      await fetch('/api/admin/scenes/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: updated.map(s => s.id) }),
      })
      toast.success('Order saved')
    } catch {
      toast.error('Could not save order')
    }
  }

  const onDeleted = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id))
    setEditingId(null)
  }

  const onSaved = (updated: Scene) => {
    setScenes(prev => prev.map(s => (s.id === updated.id ? updated : s)))
    setEditingId(null)
  }

  const onCreated = (newScene: Scene) => {
    setScenes(prev => [...prev, newScene])
    setCreating(false)
  }

  const editing = scenes.find(s => s.id === editingId)

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setCreating(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" /> New scene
        </Button>
        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gold/40 text-gold text-sm hover:bg-gold/10 rounded-sm"
        >
          <RefreshCw className="h-3 w-3" /> Preview site
        </a>
      </div>

      {/* Editor for editing/creating */}
      {(editing || creating) && (
        <SceneEditor
          scene={editing ?? undefined}
          isNew={creating}
          onClose={() => { setEditingId(null); setCreating(false) }}
          onSaved={(s) => editing ? onSaved(s) : onCreated(s)}
          onDeleted={() => editing && onDeleted(editing.id)}
        />
      )}

      {/* Scene list */}
      {!editing && !creating && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={scenes.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {scenes.map((s) => (
                <SceneRow
                  key={s.id}
                  scene={s}
                  onEdit={() => setEditingId(s.id)}
                  onTogglePublish={async () => {
                    const next = !s.isPublished
                    setScenes(prev => prev.map(p => p.id === s.id ? { ...p, isPublished: next } : p))
                    await fetch(`/api/admin/scenes/${s.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ isPublished: next }),
                    })
                  }}
                  onToggleHero={async () => {
                    if (!s.isHero) {
                      // Unset all others, set this one
                      setScenes(prev => prev.map(p => ({ ...p, isHero: p.id === s.id })))
                      await fetch('/api/admin/scenes/hero', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: s.id }),
                      })
                    } else {
                      setScenes(prev => prev.map(p => p.id === s.id ? { ...p, isHero: false } : p))
                      await fetch(`/api/admin/scenes/${s.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isHero: false }),
                      })
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {scenes.length === 0 && !creating && (
        <p className="text-muted-foreground italic text-center py-12">
          No scenes yet. Click &ldquo;New scene&rdquo; to begin.
        </p>
      )}
    </div>
  )
}
