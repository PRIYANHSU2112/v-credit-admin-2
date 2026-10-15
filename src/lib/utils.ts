import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names safely with tailwind-merge and clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Generate a random UUID string for mock entities or client keys.
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
}

/**
 * Truncate long strings safely.
 */
export function truncate(text: string, length = 30): string {
  if (!text || text.length <= length) return text
  return `${text.substring(0, length)}...`
}

/**
 * Copy text to clipboard with promise feedback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard', err)
    return false
  }
}

export function formatDate(dateStr?: string | Date, includeTime = false): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return String(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

/**
 * Mask IMEI for privacy and compliance.
 */
export function maskImei(imei?: string): string {
  if (!imei) return '—'
  if (imei.length <= 8) return imei
  return `${imei.slice(0, 4)}••••${imei.slice(-4)}`
}

/**
 * Mask Phone number for privacy.
 */
export function maskPhone(phone?: string): string {
  if (!phone) return '—'
  if (phone.length <= 4) return phone
  return `${phone.slice(0, 3)}••••${phone.slice(-3)}`
}

/**
 * Format currency amount as Indian Rupee (₹).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

