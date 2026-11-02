'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, Sparkles, ArrowRight, Diamond } from 'lucide-react'
import { GLBModel } from '@/components/three/glb-model'
import { ProceduralModel, ProceduralModelScrollDriven } from '@/components/three/procedural-models'
import { Marquee } from '@/components/site/animations'
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
  proceduralType: string | null
  embedCode: string | null
}

/* ────────────────────────────────────────────────────────────────────
 * HERO — cinematic video bg, mouse-follow spotlight, stagger text reveal,
 * scroll-driven scale on the video, scroll-driven opacity on the text.
 * ──────────────────────────────────────────────────────────────────── */
function HeroScene({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Scroll-driven video scale (1 → 1.15 as you scroll past)
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  // Scroll-driven text opacity (1 → 0) and translateY (0 → -60)
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.7], [0, -60])
  // Scroll-driven video opacity (1 → 0.4 by the end)
  const videoOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4])

  // Mouse-follow spotlight
  const onMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const spotlightStyle = {
    background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212, 175, 55, 0.18) 0%, transparent 50%)`,
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video bg with scroll-driven scale */}
      <motion.div className="absolute inset-0" style={{ scale: videoScale, opacity: videoOpacity }}>
        <video
          src={scene.mediaUrl!}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </motion.div>

      {/* Mouse-follow spotlight overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        animate={spotlightStyle}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* Floating gold dust particles */}
      <GoldDustParticles count={20} />

      {/* Stagger text reveal */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl"
        style={{ opacity: textOpacity, y: textY }}
      >
        <motion.div
          className="flex items-center justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatedGoldHairline />
          <Sparkles className="h-4 w-4 text-gold" />
          <AnimatedGoldHairline reverse />
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-7xl md:text-8xl text-gold tracking-wider mb-6"
          initial={{ opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          RHINESTONE
        </motion.h1>

        <motion.p
          className="text-xs sm:text-sm uppercase tracking-[0.4em] text-muted-foreground mb-3"
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 1, delay: 1.0 }}
        >
          Jewellers
        </motion.p>

        <motion.p
          className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {scene.paragraph}
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-6 w-6 text-gold/60 mx-auto" />
          </motion.div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Scroll to explore
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Animated gold hairline divider — width draws in from 0 → 60px.
 * ──────────────────────────────────────────────────────────────────── */
function AnimatedGoldHairline({ reverse = false }: { reverse?: boolean }) {
  return (
    <motion.div
      className="gold-hairline"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 60, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={reverse ? { transform: 'scaleX(-1)' } : {}}
    />
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Floating gold dust particles — for the hero and closing CTA.
 * Purely decorative, low overhead.
 * ──────────────────────────────────────────────────────────────────── */
function GoldDustParticles({ count = 15 }: { count?: number }) {
  // Pre-compute particles so they don't regenerate on re-render
  const particles = useRef(
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    }))
  ).current

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold/40"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: '0 0 6px rgba(212, 175, 55, 0.6)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Scroll-driven parallax + image reveal for non-hero scenes.
 * Image moves 15% slower than the scroll → parallax depth effect.
 * Image clip-path reveals from the side as it enters the viewport.
 * ──────────────────────────────────────────────────────────────────── */
function ParallaxImage({ url, alt, side }: { url: string; alt: string; side: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Parallax: image moves -8% to +8% as you scroll past
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  // Scroll-driven scale: subtle 1 → 1.08
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05])
  // Scroll-driven opacity for slow reveal
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])

  return (
    <div ref={ref} className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden rounded-md">
      <motion.img
        src={url}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ y, scale, opacity }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40 pointer-events-none" />
      {/* Side glow */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-20 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 pointer-events-none',
          side === 'left' ? 'left-0' : 'right-0 rotate-180'
        )}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Scroll-driven video (similar to parallax image, for video media).
 * ──────────────────────────────────────────────────────────────────── */
function ParallaxVideo({ url, side }: { url: string; side: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4])

  return (
    <div ref={ref} className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden rounded-md">
      <motion.video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ scale, opacity }}
      />
      <div className="absolute inset-0 bg-background/30 pointer-events-none" />
      <div
        className={cn(
          'absolute top-0 bottom-0 w-20 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 pointer-events-none',
          side === 'left' ? 'left-0' : 'right-0 rotate-180'
        )}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Animated scene number — counts up / fades in when scrolled into view.
 * ──────────────────────────────────────────────────────────────────── */
function AnimatedSceneNumber({ n }: { n: number }) {
  return (
    <motion.span
      className="text-[10px] uppercase tracking-[0.4em] text-gold/70 font-mono"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
    >
      {String(n).padStart(2, '0')}
    </motion.span>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Text column for a scene — animates in, with a draw-in hairline.
 * ──────────────────────────────────────────────────────────────────── */
function SceneTextColumn({
  scene,
  index,
  side,
}: {
  scene: Scene
  index: number
  side: 'left' | 'right'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3 mb-4">
        <AnimatedSceneNumber n={index} />
        <motion.div
          className="gold-hairline"
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 60, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      <motion.h2
        className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground mb-5 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {scene.title}
      </motion.h2>
      <motion.p
        className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 max-w-prose"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, delay: 0.35 }}
      >
        {scene.paragraph}
      </motion.p>
      {scene.mediaType === 'TEXT_ONLY' && (
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-gold-foreground text-xs uppercase tracking-widest hover:bg-gold/90 transition-colors rounded-sm group"
          >
            Book an appointment
            <motion.span
              className="inline-block"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="h-3 w-3" />
            </motion.span>
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gold/40 text-gold text-xs uppercase tracking-widest hover:bg-gold/10 transition-colors rounded-sm"
          >
            View collections
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Non-hero scene — two-column with parallax media + animated text.
 * ──────────────────────────────────────────────────────────────────── */
function StandardScene({ scene, index }: { scene: Scene; index: number }) {
  const isReverse = index % 2 === 1
  const side = isReverse ? 'right' : 'left'

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-8 py-16 sm:py-24">
      <div className="grid gap-8 sm:gap-12 w-full max-w-6xl items-center grid-cols-1 lg:grid-cols-2">
        <motion.div
          className={cn('order-1', isReverse ? 'lg:order-2' : 'lg:order-1')}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <SceneMedia scene={scene} side={side} />
        </motion.div>
        <div className={cn('order-2', isReverse ? 'lg:order-1' : 'lg:order-2')}>
          <SceneTextColumn scene={scene} index={index} side={isReverse ? 'left' : 'right'} />
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Scene media renderer — picks the right component per media type,
 * passes the side for parallax direction.
 * ──────────────────────────────────────────────────────────────────── */
function SceneMedia({ scene, side }: { scene: Scene; side: 'left' | 'right' }) {
  switch (scene.mediaType) {
    case 'PHOTO':
      return <ParallaxImage url={scene.mediaUrl!} alt={scene.title} side={side} />
    case 'VIDEO':
      return <ParallaxVideo url={scene.mediaUrl!} side={side} />
    case 'THREE_GLB':
      return (
        <div className="w-full h-[60vh] sm:h-[70vh]">
          <GLBModel url={scene.mediaUrl!} autoRotate />
        </div>
      )
    case 'THREE_PROCEDURAL':
      return (
        <div className="w-full h-[60vh] sm:h-[70vh]" data-scroll-3d>
          <ProceduralModelScrollDriven type={scene.proceduralType ?? 'solitaire-ring'} />
        </div>
      )
    case 'THREE_EMBED':
      return (
        <div
          className="w-full h-[60vh] aspect-video"
          dangerouslySetInnerHTML={{ __html: scene.embedCode ?? '' }}
        />
      )
    case 'TEXT_ONLY':
      return null
    default:
      return null
  }
}

/* ────────────────────────────────────────────────────────────────────
 * Scene progress side rail — dots on the right edge, one per scene.
 * Current scene dot grows and turns gold as you scroll past it.
 * Click any dot to scroll to that scene.
 * ──────────────────────────────────────────────────────────────────── */
function SceneRail({ scenes, activeIndex }: { scenes: Scene[]; activeIndex: number }) {
  if (scenes.length === 0) return null
  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2.5">
      {scenes.map((s, i) => (
        <button
          key={s.id}
          onClick={() => {
            const el = document.getElementById(`scene-${s.id}`)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          aria-label={`Go to scene ${i}: ${s.title}`}
          className="group flex items-center gap-2"
        >
          <span
            className={cn(
              'text-[10px] font-mono tracking-widest transition-all duration-300',
              i === activeIndex ? 'text-gold opacity-100' : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100'
            )}
          >
            {String(i).padStart(2, '0')}
          </span>
          <motion.span
            className="block rounded-full transition-all duration-300"
            animate={{
              width: i === activeIndex ? 28 : 6,
              height: 6,
              backgroundColor: i === activeIndex ? 'rgba(212, 175, 55, 1)' : 'rgba(212, 175, 55, 0.25)',
            }}
          />
        </button>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Closing CTA — magnetic buttons + gold dust + draw-in hairline.
 * ──────────────────────────────────────────────────────────────────── */
function ClosingCTA() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-20 text-center overflow-hidden">
      <GoldDustParticles count={12} />
      <motion.div
        className="relative z-10 max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            className="gold-hairline"
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <Sparkles className="h-4 w-4 text-gold" />
          <motion.div
            className="gold-hairline"
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <motion.h2
          className="font-display text-4xl sm:text-5xl text-gold mb-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          Ready to begin?
        </motion.h2>
        <motion.p
          className="text-muted-foreground mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
        >
          Browse our collections, visit our Dublin workshop by appointment, or
          contact us for custom orders and wholesale enquiries.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          <MagneticButton href="/collections" variant="primary">
            Explore collections <ArrowRight className="h-3 w-3" />
          </MagneticButton>
          <MagneticButton href="/contact" variant="outline">
            Contact us
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Magnetic button — moves toward the cursor on hover.
 * Subtle but adds an interactive feel.
 * ──────────────────────────────────────────────────────────────────── */
function MagneticButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'outline'
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - rect.left - rect.width / 2
    const relY = e.clientY - rect.top - rect.height / 2
    x.set(relX * 0.25)
    y.set(relY * 0.25)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const baseClass =
    variant === 'primary'
      ? 'inline-flex items-center gap-2 px-8 py-4 bg-gold text-gold-foreground hover:bg-gold/90'
      : 'inline-flex items-center gap-2 px-8 py-4 border border-gold/40 text-gold hover:bg-gold/10'

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className={`${baseClass} text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer`}
    >
      {children}
    </motion.a>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * Main Scrollytelling — orchestrates hero, scenes, closing CTA, and rail.
 * Tracks scroll progress and active scene index.
 * ──────────────────────────────────────────────────────────────────── */
export function Scrollytelling({
  scenes,
  brandName,
  tagline,
}: {
  scenes: Scene[]
  brandName: string
  tagline: string
}) {
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrolled = -rect.top
      const total = el.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, scrolled / total)))

      // Determine active scene based on which scene is centered in viewport
      let best = 0
      let bestDist = Infinity
      const center = window.innerHeight / 2
      scenes.forEach((s, i) => {
        const sceneEl = document.getElementById(`scene-${s.id}`)
        if (sceneEl) {
          const r = sceneEl.getBoundingClientRect()
          const sceneCenter = r.top + r.height / 2
          const dist = Math.abs(sceneCenter - center)
          if (dist < bestDist) {
            bestDist = dist
            best = i
          }
        }
      })
      setActiveIndex(best)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [scenes])

  return (
    <div ref={containerRef} className="relative">
      {/* Top progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
        <motion.div
          className="h-full bg-gold origin-left"
          style={{ scaleX: progress, transformOrigin: '0% 50%' }}
        />
      </div>

      {/* Scene side rail */}
      <SceneRail scenes={scenes} activeIndex={activeIndex} />

      {/* Hero */}
      {scenes[0]?.isHero && (
        <div id={`scene-${scenes[0].id}`}>
          <HeroScene scene={scenes[0]} />
        </div>
      )}

      {/* Brand marquee strip — moves under the hero, sets the cinematic tone */}
      <div className="border-y border-gold/20 bg-background/40 py-4 overflow-hidden">
        <Marquee
          items={[
            'Hand-set in Dublin',
            '22K gold-weighted pricing',
            'Live gold rate',
            'Custom orders welcome',
            'Rhinestone Jewellers',
            'Established 2026',
            'Grafton Street, Dublin',
            'By appointment',
          ]}
          speed={28}
        />
      </div>

      {/* Standard scenes */}
      {scenes.slice(scenes[0]?.isHero ? 1 : 0).map((s, i) => {
        const realIndex = scenes[0]?.isHero ? i + 1 : i
        return (
          <div key={s.id} id={`scene-${s.id}`}>
            <StandardScene scene={s} index={realIndex} />
          </div>
        )
      })}

      {/* Closing CTA */}
      <ClosingCTA />
    </div>
  )
}
