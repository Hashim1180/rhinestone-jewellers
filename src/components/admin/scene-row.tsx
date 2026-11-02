'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, Eye, EyeOff, Image as ImageIcon, Video, Box, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const ICONS: Record<string, any> = {
  PHOTO: ImageIcon,
  VIDEO: Video,
  THREE_GLB: Box,
  THREE_PROCEDURAL: Box,
  THREE_EMBED: Box,
  TEXT_ONLY: FileText,
}

export function SceneRow({
  scene,
  onEdit,
  onTogglePublish,
  onToggleHero,
}: {
  scene: Scene
  onEdit: () => void
  onTogglePublish: () => void
  onToggleHero: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: scene.id })
  const Icon = ICONS[scene.mediaType] ?? FileText

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 p-3 bg-card border border-border/40 rounded-sm hover:border-gold/30 transition-colors',
        isDragging && 'opacity-50 shadow-lg',
        !scene.isPublished && 'opacity-60'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-sm bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
        {scene.mediaUrl && (scene.mediaType === 'PHOTO' || scene.mediaType === 'VIDEO') ? (
          <img src={scene.mediaUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon className="h-4 w-4 text-gold/60" />
        )}
      </div>

      {/* Order number */}
      <span className="text-[10px] font-mono text-muted-foreground w-6">
        {String(scene.order).padStart(2, '0')}
      </span>

      {/* Title + paragraph preview */}
      <div className="flex-1 min-w-0">
        <button onClick={onEdit} className="text-left block w-full">
          <p className="font-medium text-sm text-foreground hover:text-gold truncate">
            {scene.title}
            {scene.isHero && <span className="ml-2 text-[10px] text-gold uppercase tracking-widest">[hero]</span>}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {scene.paragraph || 'No description'}
          </p>
        </button>
      </div>

      {/* Animation type */}
      <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-muted-foreground/70 font-mono">
        {scene.animationType.replace('_', ' ').toLowerCase()}
      </span>

      {/* Toggles */}
      <button
        onClick={onToggleHero}
        className={cn(
          'p-2 rounded-sm hover:bg-gold/10 transition-colors',
          scene.isHero ? 'text-gold' : 'text-muted-foreground/40'
        )}
        title={scene.isHero ? 'Unset as hero' : 'Set as hero'}
      >
        <Star className="h-4 w-4" fill={scene.isHero ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={onTogglePublish}
        className={cn(
          'p-2 rounded-sm hover:bg-gold/10 transition-colors',
          scene.isPublished ? 'text-gold' : 'text-muted-foreground/40'
        )}
        title={scene.isPublished ? 'Unpublish' : 'Publish'}
      >
        {scene.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      <button
        onClick={onEdit}
        className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-gold border border-gold/40 hover:bg-gold/10 rounded-sm"
      >
        Edit
      </button>
    </div>
  )
}
