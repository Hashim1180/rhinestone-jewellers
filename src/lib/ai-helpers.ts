/**
 * Rhinestone Jewellers — AI helpers (server-side only).
 * Six automations, all powered by OpenRouter (any LLM you configure):
 *   1. sceneText         — accurate descriptive paragraph for a scene from a photo
 *   2. productDescription — product specs/description from a photo
 *   3. draftReply         — draft a contact-form reply for admin approval
 *   4. altText            — alt text + SEO meta for an uploaded image
 *   5. galleryCaption     — short caption for a gallery photo
 *   6. routeInquiry       — classify a contact message into retail/wholesale/press/appointment
 *
 * Model: OPENROUTER_MODEL env var (default: openai/gpt-4o-mini).
 * Switch to anthropic/claude-3.5-sonnet, google/gemini-flash-1.5, etc. any time.
 */
import { openrouterChat } from '@/lib/openrouter'

const BRAND_CONTEXT = `You are writing for Rhinestone Jewellers, a Dublin, Ireland-based jewellery house that specialises
in rhinestone and crystal-embellished pieces, alongside a curated gold heritage line.
Voice: ACCURATE, DESCRIPTIVE, FACTUAL. Never poetic. Never flowery.
No "where light meets legacy" or similar. State materials, weights, dimensions, finishes plainly.
Plain English. No exclamation marks.`.trim()

async function chat(prompt: string, systemPrompt?: string): Promise<string> {
  const messages = [
    { role: 'system' as const, content: systemPrompt ?? 'You are a helpful factual copywriter.' },
    { role: 'user' as const, content: prompt },
  ]
  return (await openrouterChat(messages, { temperature: 0.4 })).trim()
}

/* ────────────────────────────────────────────────────────────────────
 * 1. Scene text — accurate descriptive paragraph
 * ──────────────────────────────────────────────────────────────────── */
export async function generateSceneText({
  title,
  imageUrl,
  materialHint,
}: {
  title: string
  imageUrl?: string
  materialHint?: string
}): Promise<string> {
  const prompt = `Write a single descriptive paragraph (50-80 words) about a jewellery scene titled "${title}".
${imageUrl ? `An image has been provided for visual context.` : ''}
${materialHint ? `Known facts: ${materialHint}` : 'No specific material facts are available — write a general but accurate descriptive paragraph that any jeweller could verify by looking at the piece.'}

Constraints:
- Plain factual English. No poetic language.
- Mention visible materials, colours, forms, setting style if applicable.
- No exclamation marks, no marketing fluff, no invented brand history.
- End with a clean full stop, no trailing quotation marks.`

  return chat(prompt, BRAND_CONTEXT)
}

/* ────────────────────────────────────────────────────────────────────
 * 2. Product description — specs + description from photo
 * ──────────────────────────────────────────────────────────────────── */
export async function generateProductDescription({
  name,
  imageUrl,
  pricingModel,
  goldWeightG,
  goldPurity,
}: {
  name: string
  imageUrl?: string
  pricingModel?: string
  goldWeightG?: number
  goldPurity?: number
}): Promise<string> {
  const prompt = `Write a product description for a jewellery piece named "${name}".
${pricingModel === 'GOLD_WEIGHTED' ? `It is gold-weighted: ${goldWeightG ?? '?'}g of ${goldPurity ?? '?'}K gold.` : 'It is a fixed-price piece.'}
${imageUrl ? 'A reference image has been provided.' : ''}

Format:
- 2 short sentences describing the visible design (60-90 words total).
- End with a separate line "Specs:" listing inferred attributes (e.g. metal, setting type, stones).
- Plain English. No superlatives. No invented measurements.`

  return chat(prompt, BRAND_CONTEXT)
}

/* ────────────────────────────────────────────────────────────────────
 * 3. Contact auto-reply — draft for admin approval
 * ──────────────────────────────────────────────────────────────────── */
export async function draftReplyWithAI({
  name,
  message,
  category,
}: {
  name: string
  message: string
  category: string
}): Promise<string> {
  const prompt = `Draft a reply to a customer enquiry.

Customer name: ${name}
Inquiry category: ${category}
Customer message:
"""
${message.slice(0, 1000)}
"""

Reply constraints:
- Plain, professional email tone. Greet by name, acknowledge the message, request any obvious missing info (e.g. preferred date for appointment), and close with the Rhinestone Jewellers signature.
- 4-6 sentences max. No invented prices, dates, or commitments.
- Sign off as "The Rhinestone Jewellers team"`

  return chat(prompt, BRAND_CONTEXT + '\n\nYou write professional customer-service email drafts.')
}

/* ────────────────────────────────────────────────────────────────────
 * 4. Image alt text + SEO meta
 * ──────────────────────────────────────────────────────────────────── */
export async function generateAltText({
  imageUrl,
  context,
}: {
  imageUrl?: string
  context?: string
}): Promise<{ alt: string; metaTitle: string; metaDescription: string }> {
  const prompt = `Generate accessibility alt text and SEO metadata for an image.${context ? ` Context: ${context}` : ''}

Return JSON only, no markdown:
{
  "alt": "Concise factual alt text (under 100 chars). No 'image of' prefix.",
  "metaTitle": "SEO page title (50-60 chars) for Rhinestone Jewellers.",
  "metaDescription": "SEO meta description (140-160 chars), factual."
}`

  const text = await chat(prompt, BRAND_CONTEXT + '\n\nReturn only valid JSON.')
  try {
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      alt: text.slice(0, 100),
      metaTitle: 'Rhinestone Jewellers',
      metaDescription: text.slice(0, 160),
    }
  }
}

/* ────────────────────────────────────────────────────────────────────
 * 5. Gallery caption
 * ──────────────────────────────────────────────────────────────────── */
export async function generateGalleryCaption({
  imageUrl,
  context,
}: {
  imageUrl?: string
  context?: string
}): Promise<string> {
  const prompt = `Write a single-sentence caption (under 120 chars) for a jewellery gallery photo.${context ? ` Context: ${context}` : ''}
Plain, factual, no hashtags, no emojis.`

  return chat(prompt, BRAND_CONTEXT)
}

/* ────────────────────────────────────────────────────────────────────
 * 6. Inquiry routing — classify a contact message
 * ──────────────────────────────────────────────────────────────────── */
const ROUTING_MAP: Record<string, string> = {
  WHOLESALE: 'WHOLESALE',
  RETAIL: 'RETAIL',
  PRESS: 'PRESS',
  APPOINTMENT: 'APPOINTMENT',
  GENERAL: 'GENERAL',
}

export async function routeInquiryWithAI({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}): Promise<{ category: string; reasoning: string }> {
  const prompt = `Classify this customer enquiry into exactly one category: WHOLESALE, RETAIL, PRESS, APPOINTMENT, or GENERAL.

Customer: ${name} <${email}>
Message:
"""
${message.slice(0, 1000)}
"""

Return JSON only, no markdown:
{
  "category": "WHOLESALE|RETAIL|PRESS|APPOINTMENT|GENERAL",
  "reasoning": "One short sentence explaining why."
}`

  const text = await chat(prompt, 'You classify customer enquiries for a Dublin jeweller. Return only valid JSON.', )
  try {
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      category: ROUTING_MAP[parsed.category?.toUpperCase()] ?? 'GENERAL',
      reasoning: parsed.reasoning ?? 'No reasoning returned.',
    }
  } catch {
    return { category: 'GENERAL', reasoning: 'Routing failed; defaulted to general.' }
  }
}
