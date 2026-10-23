/**
 * RTK Query Cache Tag Types
 * Enables granular and predictable cache invalidation across all features.
 */

export const API_TAGS = {
  AUTH: 'Auth',
  USER: 'User',
  DASHBOARD: 'Dashboard',
  KEYS: 'Keys',
  PARTNERS: 'Partners',
  CUSTOMERS: 'Customers',
  LOANS: 'Loans',
  DEVICES: 'Devices',
  FINANCE: 'Finance',
  AUDIT: 'Audit',
  TERRITORIES: 'Territories',
  COMMISSIONS: 'Commissions',
  NOTIFICATIONS: 'Notifications',
  INVENTORY: 'Inventory',
  SETTINGS: 'Settings',
} as const

export type ApiTagType = (typeof API_TAGS)[keyof typeof API_TAGS]

export const ALL_API_TAGS: ApiTagType[] = Object.values(API_TAGS)
