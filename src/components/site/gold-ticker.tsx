'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'

type Rate = {
  eurPerOz: number
  usdPerOz: number
  gbpPerOz: number
  aedPerOz: number
  pkrPerOz: number
  isOverridden: boolean
  fetchedAt: string
}

const RATE_FIELD: Record<string, keyof Rate> = {
  EUR: 'eurPerOz',
  USD: 'usdPerOz',
  GBP: 'gbpPerOz',
  AED: 'aedPerOz',
  PKR: 'pkrPerOz',
}

/** Animated number counter — counts from 0 to target when scrolled into view. */
function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const motionVal = useMotionValue(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => {
        if (ref.current) ref.current.textContent = format(v)
      },
    })
    return () => controls.stop()
  }, [inView, value, format])

  // Render final value when not animating yet
  return <span ref={ref}>{inView ? format(0) : format(value)}</span>
}

export function GoldTicker() {
  const [rate, setRate] = useState<Rate | null>(null)
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    fetch('/api/gold-rate')
      .then(r => r.json())
      .then(setRate)
      .catch(() => {})
    const c = typeof window !== 'undefined' ? localStorage.getItem('rh-currency') : null
    if (c) setCurrency(c)
    else {
      // Listen for currency changes from the header selector
      const check = setInterval(() => {
        const cur = localStorage.getItem('rh-currency')
        if (cur && cur !== currency) setCurrency(cur)
      }, 800)
      return () => clearInterval(check)
    }
    const i = setInterval(() => {
      fetch('/api/gold-rate').then(r => r.json()).then(setRate).catch(() => {})
    }, 60_000)
    return () => clearInterval(i)
  }, [])

  if (!rate) return null
  const field = RATE_FIELD[currency] ?? 'eurPerOz'
  const value = rate[field]
  const symbol = currency === 'EUR' ? '\u20ac' : currency === 'USD' ? '$' : currency === 'GBP' ? '\u00a3' : currency === 'AED' ? 'AED ' : 'Rs '
  const formatVal = (n: number) =>
    `${symbol}${n.toLocaleString('en-IE', { maximumFractionDigits: 2 })}`

  return (
    <div className="bg-gradient-to-r from-transparent via-gold/10 to-transparent border-b border-gold/20 text-center py-1.5 text-[11px] tracking-wider overflow-hidden">
      <motion.span
        className="inline-flex items-center gap-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="text-muted-foreground uppercase">Today&apos;s Gold Rate (per troy oz)</span>
        <span className="mx-2 text-gold font-mono font-medium tabular-nums">
          <AnimatedNumber value={value} format={formatVal} />
        </span>
        <span className="text-muted-foreground hidden sm:inline">· 22K purity · {currency}</span>
        {rate.isOverridden && (
          <motion.span
            className="ml-2 text-amber-500/80 text-[10px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            admin override
          </motion.span>
        )}
      </motion.span>
    </div>
  )
}
