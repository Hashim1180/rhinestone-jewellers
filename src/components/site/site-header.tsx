'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Diamond } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrency } from './currency-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { currency, setCurrency, currencies } = useCurrency()

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Diamond className="h-5 w-5 text-gold group-hover:rotate-180 transition-transform duration-700" />
          <span className="font-display text-xl tracking-[0.18em] text-gold">
            RHINESTONE
          </span>
          <span className="hidden sm:inline text-[10px] tracking-[0.25em] text-muted-foreground">
            JEWELLERS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-xs uppercase tracking-[0.18em] transition-colors hover:text-gold',
                pathname === item.href ? 'text-gold' : 'text-foreground/70'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs tracking-wider px-2 hover:text-gold">
                {currency}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/60">
              {currencies.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={cn('cursor-pointer', currency === c.code && 'text-gold')}
                >
                  <span className="w-12 font-mono text-xs">{c.code}</span>
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/admin"
            className="hidden md:inline-flex items-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold transition-colors"
          >
            Admin
          </Link>

          <button
            className="md:hidden p-2 text-foreground hover:text-gold"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="px-4 py-4 flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-sm uppercase tracking-[0.15em] py-2 transition-colors',
                  pathname === item.href ? 'text-gold' : 'text-foreground/80'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="text-xs uppercase tracking-[0.2em] py-2 text-muted-foreground"
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
