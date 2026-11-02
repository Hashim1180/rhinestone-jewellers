'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TiltCard } from '@/components/site/animations'

type Collection = {
  id: string
  slug: string
  name: string
  description: string | null
  coverImage: string | null
  order: number
  products: { id: string }[]
}

export function CollectionsGrid({ collections }: { collections: Collection[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <TiltCard maxTilt={6} className="h-full">
            <Link
              href={`/collections/${c.slug}`}
              className="group relative block overflow-hidden rounded-md bg-card border border-border/40 hover:border-gold/40 transition-all h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="aspect-[4/5] overflow-hidden" style={{ transform: 'translateZ(40px)' }}>
                {c.coverImage ? (
                  <motion.img
                    src={c.coverImage}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{ transform: 'translateZ(25px)' }}
              >
                <motion.p
                  className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i % 3) * 0.1 }}
                >
                  {c.products.length} piece{c.products.length === 1 ? '' : 's'}
                </motion.p>
                <motion.h2
                  className="font-display text-2xl sm:text-3xl text-foreground mb-2 group-hover:text-gold transition-colors"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i % 3) * 0.1 }}
                >
                  {c.name}
                </motion.h2>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {c.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  View collection
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </motion.span>
                </span>
              </div>
            </Link>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  )
}
