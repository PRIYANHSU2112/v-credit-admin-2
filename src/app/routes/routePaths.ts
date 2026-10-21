/**
 * Exact Application Route Paths matching Enterprise Role Hierarchy & Workflows
 */

export const ROUTE_PATHS = {
  // Public
  LOGIN: '/login',

  // Authenticated Workspace Root
  APP: '/app',

  // Main Navigation
  OVERVIEW: '/app/overview',
  DASHBOARD: '/app/overview', // alias
  ANALYTICS: '/app/analytics',

  // Partner Management (User List submenu)
  PARTNERS: '/app/partners',
  STOCKISTS: '/app/stockists',
  DISTRIBUTORS: '/app/distributors',
  DEALERS: '/app/dealers',
  EDIT_DEALER: '/app/dealers/edit/:id',
  USERS: '/app/users',
  PENDING_USERS: '/app/pending-users',
  USER_SEARCH: '/app/user-search',

  // Distribution Network & Operations
  TERRITORIES: '/app/territories',
  INVENTORY: '/app/inventory',
  COMMISSIONS: '/app/commissions',
  NOTIFICATIONS: '/app/notifications',

  // Actions
  ADD_PARTNER: '/app/add-partner',
  ADD_DISTRIBUTOR: '/app/add-distributor',
  ADD_DEALER: '/app/add-dealer',
  KEYS_RETURN: '/app/keys-return',

  // Customer & Finance
  CUSTOMERS: '/app/customers',
  EMI_SAFE: '/app/emi-safe',
  LOANS: '/app/loans',
  DEVICES: '/app/devices',
  DEVICE_CONTROL: '/app/users/:id/device-control',
  DEVICE_CONTROL_GENERIC: '/app/device-control',
  KEYS: '/app/keys',
  FINANCE: '/app/finance',

  // Reports Submenu
  REPORTS: '/app/reports',
  REPORT_STOCKIST_LOW_KEY: '/app/reports/stockist-low-key',
  REPORT_DISTRIBUTOR_LOW_KEY: '/app/reports/distributor-low-key',
  REPORT_DEALER_LOW_KEY: '/app/reports/dealer-low-key',
  REPORT_TRANSFER: '/app/reports/transfer',
  REPORT_RECEIVED_KEY: '/app/reports/received-key',
  REPORT_IPHONE_TRANSFER: '/app/reports/iphone-transfer',
  REPORT_IPHONE_RECEIVED: '/app/reports/iphone-received',

  // System Settings Submenu
  SETTINGS: '/app/settings',
  SETTING_KEY_PRICE: '/app/settings/key-price',
  SETTING_IPHONE_KEY_PRICE: '/app/settings/iphone-key-price',

  // Audit
  AUDIT: '/app/audit',

  // Documents
  DOWNLOAD_AGREEMENT: '/app/download-agreement',

  // Wildcard
  NOT_FOUND: '*',
} as const
