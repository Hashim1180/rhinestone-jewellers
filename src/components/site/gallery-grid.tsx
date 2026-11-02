'use client'

import { motion } from 'framer-motion'

type Item = {
  id: string
  url: string
  caption: string | null
  order: number
}

export function GalleryGrid({ items }: { items: Item[] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 mb-20">
      {items.map((g, i) => (
        <motion.figure
          key={g.id}
          className="break-inside-avoid relative overflow-hidden rounded-md bg-card border border-border/40"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: (i % 6) * 0.05, ease: 'easeOut' }}
        >
          <img src={g.url} alt={g.caption ?? 'Gallery image'} className="w-full h-auto" loading="lazy" />
          {g.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent text-xs text-foreground/80">
              {g.caption}
            </figcaption>
          )}
        </motion.figure>
      ))}
    </div>
  )
}
