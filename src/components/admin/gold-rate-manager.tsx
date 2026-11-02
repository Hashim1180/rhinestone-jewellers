'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Save, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Rate = {
  usdPerOz: number
  eurPerOz: number
  gbpPerOz: number
  aedPerOz: number
  pkrPerOz: number
  source: string
  isOverridden: boolean
  fetchedAt: string
}

export function GoldRateManager({ rate: initial }: { rate: Rate | null }) {
  const [rate, setRate] = useState<Rate | null>(initial)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    usd: initial?.usdPerOz ?? 2600,
    eur: initial?.eurPerOz ?? 2400,
    gbp: initial?.gbpPerOz ?? 2050,
    aed: initial?.aedPerOz ?? 9550,
    pkr: initial?.pkrPerOz ?? 720000,
  })

  const refresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/gold-rate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRate(data.rate)
      setForm({
        usd: data.rate.usdPerOz, eur: data.rate.eurPerOz,
        gbp: data.rate.gbpPerOz, aed: data.rate.aedPerOz, pkr: data.rate.pkrPerOz,
      })
      toast.success('Rate refreshed from goldapi.io')
    } catch {
      toast.error('Refresh failed (free tier limit or network). Use override.')
    } finally {
      setRefreshing(false)
    }
  }

  const override = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/gold-rate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'override', ...form }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRate(data.rate)
      toast.success('Override saved')
    } catch {
      toast.error('Override failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current rate display */}
      <div className="bg-card border border-border/40 rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-gold">Current Rate (per troy ounce)</h3>
          <Button onClick={refresh} disabled={refreshing} variant="outline"
            className="border-gold/40 text-gold hover:bg-gold/10">
            {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh from API
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { code: 'USD', val: rate?.usdPerOz ?? 0, sym: '$' },
            { code: 'EUR', val: rate?.eurPerOz ?? 0, sym: '\u20ac' },
            { code: 'GBP', val: rate?.gbpPerOz ?? 0, sym: '\u00a3' },
            { code: 'AED', val: rate?.aedPerOz ?? 0, sym: 'AED ' },
            { code: 'PKR', val: rate?.pkrPerOz ?? 0, sym: 'Rs ' },
          ].map(c => (
            <div key={c.code} className="p-3 bg-muted/20 border border-border/40 rounded-sm text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.code}</p>
              <p className="font-mono text-sm text-gold mt-1">{c.sym}{c.val.toLocaleString('en-IE', { maximumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-muted-foreground">Source: {rate?.source ?? 'unknown'}</span>
          <span className="text-muted-foreground">Fetched: {rate ? new Date(rate.fetchedAt).toLocaleString() : 'never'}</span>
          {rate?.isOverridden && (
            <span className="inline-flex items-center gap-1 text-amber-500">
              <AlertCircle className="h-3 w-3" /> Admin override
            </span>
          )}
        </div>
      </div>

      {/* Override form */}
      <div className="bg-card border border-border/40 rounded-md p-6">
        <h3 className="font-display text-lg text-gold mb-4">Override Rate</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Use this to set a custom rate (e.g. local Irish market premium). All gold-weighted product prices use this rate.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { k: 'usd', code: 'USD', sym: '$' },
            { k: 'eur', code: 'EUR', sym: '\u20ac' },
            { k: 'gbp', code: 'GBP', sym: '\u00a3' },
            { k: 'aed', code: 'AED', sym: 'AED ' },
            { k: 'pkr', code: 'PKR', sym: 'Rs ' },
          ].map(c => (
            <div key={c.k}>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">{c.code}</Label>
              <Input
                type="number" step="0.01"
                value={form[c.k as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [c.k]: parseFloat(e.target.value || '0') }))}
                className="mt-1 bg-background/50 border-border/40 font-mono text-sm"
              />
            </div>
          ))}
        </div>
        <Button onClick={override} disabled={saving} className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save override
        </Button>
      </div>
    </div>
  )
}
