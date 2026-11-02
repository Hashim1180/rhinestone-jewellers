'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────────────
 * 1. ScrollParallax — element moves slower than scroll (depth illusion)
 * ──────────────────────────────────────────────────────────────────── */
export function ScrollParallax({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode
  speed?: number  // 0 = no parallax, 0.3 = subtle, 0.6 = strong
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Move from -speed * 100 to speed * 100 px
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -80}px`, `${speed * 80}px`])
  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 2. ScrollImageZoom — image scales subtly as it enters viewport
 * ──────────────────────────────────────────────────────────────────── */
export function ScrollImageZoom({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Scale from 1.15 (zoomed in) to 1.0 as the image enters/centered, then back out
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.0, 1.05])
  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ scale }}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 3. StaggeredTextReveal — paragraph words reveal one at a time on scroll
 * ──────────────────────────────────────────────────────────────────── */
export function StaggeredTextReveal({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const words = text.split(' ')
  return (
    <p ref={ref} className={cn('inline-block', className)}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '120%', opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: (i * 0.03),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}{i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </p>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 4. CountUp — animates a number from 0 to target on first view
 * ──────────────────────────────────────────────────────────────────── */
export function CountUp({
  to,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setVal(v),
    })
    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{val.toLocaleString('en-IE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 5. Marquee — infinite horizontal scroll of text/items
 * ──────────────────────────────────────────────────────────────────── */
export function Marquee({
  items,
  className,
  speed = 30,
}: {
  items: string[]
  className?: string
  speed?: number  // seconds per loop
}) {
  return (
    <div className={cn('relative overflow-hidden whitespace-nowrap', className)}>
      <motion.div
        className="inline-flex gap-12 will-change-transform"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {/* Render twice so the marquee loops seamlessly */}
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-12">
            <span className="font-display text-gold tracking-[0.3em] uppercase text-sm">
              {item}
            </span>
            <span className="text-gold/40 text-lg">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 6. TiltCard — 3D tilt-on-hover effect for cards
 * ──────────────────────────────────────────────────────────────────── */
export function TiltCard({
  children,
  className,
  maxTilt = 8,
}: {
  children: ReactNode
  className?: string
  maxTilt?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth out the values
  const smoothX = useSpring(x, { stiffness: 150, damping: 20 })
  const smoothY = useSpring(y, { stiffness: 150, damping: 20 })

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt])
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt])

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 7. MagneticButton — button that follows the cursor slightly on hover
 * ──────────────────────────────────────────────────────────────────── */
export function MagneticButton({
  children,
  className,
  strength = 0.3,
  as: As = 'button',
  ...props
}: {
  children: ReactNode
  className?: string
  strength?: number
  as?: any
  [key: string]: any
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 200, damping: 15 })
  const smoothY = useSpring(y, { stiffness: 200, damping: 15 })

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const mx = e.clientX - (rect.left + rect.width / 2)
    const my = e.clientY - (rect.top + rect.height / 2)
    x.set(mx * strength)
    y.set(my * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: smoothX, y: smoothY }}
      className="inline-block"
    >
      <As className={className} {...props}>
        {children}
      </As>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 8. FadeInOnScroll — generic fade-up-on-scroll
 * ──────────────────────────────────────────────────────────────────── */
export function FadeInOnScroll({
  children,
  className,
  delay = 0,
  y = 30,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * 9. ScaleInOnScroll — fades in with a subtle scale
 * ──────────────────────────────────────────────────────────────────── */
export function ScaleInOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
