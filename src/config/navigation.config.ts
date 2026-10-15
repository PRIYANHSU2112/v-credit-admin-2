import {
  LayoutDashboard,
  KeyRound,
  Users2,
  UserSquare2,
  CreditCard,
  Smartphone,
  PieChart,
  ShieldAlert,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import type { Permission } from '@/types/user'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  requiredPermission?: Permission
  badge?: string | number
  badgeColor?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const NAVIGATION_CONFIG: NavSection[] = [
  {
    title: 'Core Platform',
    items: [
      {
        id: 'overview',
        label: 'Dashboard',
        path: ROUTE_PATHS.OVERVIEW,
        icon: LayoutDashboard,
        requiredPermission: 'dashboard:read',
      },
      {
        id: 'keys',
        label: 'License Keys',
        path: ROUTE_PATHS.KEYS,
        icon: KeyRound,
        requiredPermission: 'keys:read',
        badge: 'Live',
        badgeColor: 'primary',
      },
      {
        id: 'partners',
        label: 'Partner Network',
        path: ROUTE_PATHS.PARTNERS,
        icon: Users2,
        requiredPermission: 'partners:read',
      },
    ],
  },
  {
    title: 'Financing & MDM',
    items: [
      {
        id: 'customers',
        label: 'Customers',
        path: ROUTE_PATHS.CUSTOMERS,
        icon: UserSquare2,
        requiredPermission: 'customers:read',
      },
      {
        id: 'loans',
        label: 'Loans & EMIs',
        path: ROUTE_PATHS.LOANS,
        icon: CreditCard,
        requiredPermission: 'loans:read',
      },
      {
        id: 'devices',
        label: 'Devices & Lock',
        path: ROUTE_PATHS.DEVICES,
        icon: Smartphone,
        requiredPermission: 'devices:read',
      },
    ],
  },
  {
    title: 'System & Controls',
    items: [
      {
        id: 'finance',
        label: 'Financials',
        path: ROUTE_PATHS.FINANCE,
        icon: PieChart,
        requiredPermission: 'finance:read',
      },
      {
        id: 'audit',
        label: 'Audit Trail',
        path: ROUTE_PATHS.AUDIT,
        icon: ShieldAlert,
        requiredPermission: 'audit:read',
      },
      {
        id: 'settings',
        label: 'Settings',
        path: ROUTE_PATHS.SETTINGS,
        icon: Settings,
        requiredPermission: 'settings:manage',
      },
    ],
  },
]
