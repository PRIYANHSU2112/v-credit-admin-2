/**
 * V-Credit Domain Formatters
 */

/**
 * Format Indian Rupees (INR)
 * e.g., 25000 -> ₹25,000
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

/**
 * Format Number with commas (Indian numbering format)
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || isNaN(Number(num))) {
    return '0'
  }
  return new Intl.NumberFormat('en-IN').format(Number(num))
}

/**
 * Format Date into user-friendly string
 */
export function formatDate(dateString: string | Date | null | undefined, includeTime = false): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return String(dateString)

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  }
  return new Intl.DateTimeFormat('en-IN', options).format(date)
}

/**
 * Mask Phone number for privacy
 * e.g. 9876543210 -> 98765*****
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const clean = phone.replace(/\D/g, '')
  if (clean.length < 5) return phone
  return `${clean.slice(0, 5)}*****`
}

/**
 * Mask IMEI for security
 * e.g. 864501041234567 -> 864501******567
 */
export function maskImei(imei: string | null | undefined): string {
  if (!imei) return '—'
  if (imei.length <= 8) return imei
  const start = imei.substring(0, 6)
  const end = imei.substring(imei.length - 3)
  return `${start}******${end}`
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0%'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}%`
}
