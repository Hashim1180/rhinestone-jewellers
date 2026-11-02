'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Diamond, LogOut, LayoutGrid, Image, FolderTree, Sparkles, Settings, MessageSquare, Coins, Images, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ReactNode, useState } from 'react'

const NAV = [
  { href: '/admin/scenes', label: 'Scenes', icon: LayoutGrid },
  { href: '/admin/collections', label: 'Collections', icon: FolderTree },
  { href: '/admin/products', label: 'Products', icon: Sparkles },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Image },
  { href: '/admin/chat', label: 'Chat', icon: MessageCircle },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/admin/gold-rate', label: 'Gold Rate', icon: Coins },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  // Login page bypasses the shell
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!session) {
    // Render the children (which will be the redirect-triggering admin home, or just push to login)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">You need to sign in.</p>
        <Link href="/admin/login">
          <Button className="bg-gold text-gold-foreground hover:bg-gold/90">Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-5 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center gap-2">
            <Diamond className="h-5 w-5 text-gold" />
            <span className="font-display text-lg text-gold tracking-wider">RHINESTONE</span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-gold border-l-2 border-gold'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-gold'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground mb-2 px-3">
            Signed in as<br/>
            <span className="text-gold">{session.user?.email}</span>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-gold"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
          <Link
            href="/"
            target="_blank"
            className="block mt-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-gold px-3 py-2"
          >
            View public site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-background min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40">
          <button onClick={() => setOpen(!open)} className="text-foreground">
            <Diamond className="h-5 w-5 text-gold" />
          </button>
          <span className="font-display text-sm text-gold">Admin</span>
          <div />
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
