/**
 * Global Application Configuration
 */

export const APP_CONFIG = {
  name: 'V-Credit',
  fullName: 'V-Credit Enterprise Admin',
  description: 'Device Finance & Digital License Distribution Console',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  isMockEnabled: import.meta.env.VITE_ENABLE_MOCK === 'true',
  storageKeys: {
    token: 'v_credit_auth_token',
    user: 'v_credit_user_profile',
    theme: 'v_credit_theme_mode',
    sidebar: 'v_credit_sidebar_collapsed',
  },
  pagination: {
    defaultLimit: 10,
    limits: [10, 25, 50, 100],
  },
  roles: [
    { value: 'super_admin', label: 'Super Admin', badgeVariant: 'destructive' },
    { value: 'sub_admin', label: 'Sub Admin', badgeVariant: 'secondary' },
    { value: 'stockist', label: 'Stockist (Regional)', badgeVariant: 'default' },
    { value: 'distributor', label: 'Distributor (City)', badgeVariant: 'purple' },
    { value: 'dealer', label: 'Dealer (Retail)', badgeVariant: 'success' },
  ],
} as const
