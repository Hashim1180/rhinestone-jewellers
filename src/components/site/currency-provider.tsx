'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CURRENCIES, CurrencyCode } from '@/lib/site'

type Ctx = {
  currency: string
  setCurrency: (c: string) => void
  currencies: typeof CURRENCIES
}

const CurrencyContext = createContext<Ctx>({
  currency: 'EUR',
  setCurrency: () => {},
  currencies: CURRENCIES,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('EUR')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('rh-currency') : null
    if (stored && CURRENCIES.some(c => c.code === stored)) {
      setCurrencyState(stored)
      return
    }
    // Auto-detect via IP (free, no key)
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, string> = {
          IE: 'EUR', US: 'USD', GB: 'GBP', AE: 'AED', PK: 'PKR',
          IN: 'EUR', DE: 'EUR', FR: 'EUR',
        }
        const code = map[d?.country_code as string] ?? 'EUR'
        setCurrencyState(code)
        localStorage.setItem('rh-currency', code)
      })
      .catch(() => setCurrencyState('EUR'))
  }, [])

  const setCurrency = (c: string) => {
    setCurrencyState(c)
    if (typeof window !== 'undefined') localStorage.setItem('rh-currency', c)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
