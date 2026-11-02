'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Diamond, LogIn } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)
    const res = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error('Invalid credentials')
    } else if (res?.ok) {
      toast.success('Welcome back')
      router.push('/admin/scenes')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Diamond className="h-10 w-10 text-gold mx-auto mb-4" />
          <h1 className="font-display text-3xl text-gold tracking-wider">RHINESTONE</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
            Admin Login
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-card border border-border/40 rounded-md p-6">
          <div>
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue="admin@rhinestonejewellers.ie"
              required
              className="mt-1 bg-background/50 border-border/40"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              defaultValue="Rhinestone2026!"
              required
              className="mt-1 bg-background/50 border-border/40"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90 uppercase tracking-widest text-xs"
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <LogIn className="ml-2 h-3 w-3" />}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center pt-2">
            Default credentials are pre-filled. Change password in Settings after first login.
          </p>
        </form>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-muted-foreground hover:text-gold uppercase tracking-widest">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  )
}
