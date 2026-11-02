/**
 * Rhinestone Jewellers — shared lib helpers
 * Currency, gold rate pricing, site settings fetch.
 */
import { db } from '@/lib/db'

export const CURRENCIES = [
  { code: 'EUR', symbol: '\u20ac', label: 'Euro' },
  { code: 'USD', symbol: '$',    label: 'US Dollar' },
  { code: 'GBP', symbol: '\u00a3', label: 'British Pound' },
  { code: 'AED', symbol: 'AED ',  label: 'UAE Dirham' },
  { code: 'PKR', symbol: 'Rs ',   label: 'Pakistani Rupee' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

/** Get symbol for a currency code */
export function currencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code
}

/** Format a number as currency for the visitor */
export function formatPrice(amount: number, currency: string): string {
  const symbol = currencySymbol(currency)
  return `${symbol}${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Karat → purity factor (relative to 24K) */
export function purityFactor(karat: number): number {
  return karat / 24
}

/** Convert troy-ounce price to per-gram price */
export const OZ_TO_GRAM = 31.1035

/**
 * Compute the live EUR price of a gold-weighted product.
 * price = (weight_g × gold_rate_per_gram_eur × purity_factor) + making_charge_eur
 */
export function computeGoldWeightedEurPrice(
  weightG: number,
  karat: number,
  makingCharge: number,
  goldEurPerOz: number
): number {
  const perGram = goldEurPerOz / OZ_TO_GRAM
  return weightG * perGram * purityFactor(karat) + makingCharge
}

/** Fetch cached gold rate from DB */
export async function getGoldRate() {
  const rate = await db.goldRate.findUnique({ where: { id: 'global' } })
  if (!rate) return null
  return {
    usdPerOz: rate.priceUsdPerOz.toNumber(),
    eurPerOz: rate.priceEurPerOz.toNumber(),
    gbpPerOz: rate.priceGbpPerOz.toNumber(),
    aedPerOz: rate.priceAedPerOz.toNumber(),
    pkrPerOz: rate.pricePkrPerOz.toNumber(),
    source: rate.source,
    isOverridden: rate.isOverridden,
    fetchedAt: rate.fetchedAt,
  }
}

/** Fetch live exchange rates from exchangerate.host (free, no key). 1h cache. */
export async function getExchangeRates(base = 'EUR'): Promise<Record<string, number>> {
  const url = `https://api.exchangerate.host/latest?base=${base}`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.rates ?? {}
  } catch (e) {
    console.error('exchange rate fetch failed:', e)
    return {}
  }
}

/** Fetch site settings (cached 60s) */
export async function getSiteSettings() {
  return db.siteSetting.findUnique({ where: { id: 'site' } })
}
