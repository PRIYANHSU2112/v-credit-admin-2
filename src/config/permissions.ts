import type { Permission, UserRole } from '@/types/user'

/**
 * Role-Based Capability Matrix
 * Server is authoritative; frontend uses this to adapt UI, navigation, and action buttons.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'dashboard:read',
    'keys:read',
    'keys:generate',
    'keys:transfer',
    'keys:reclaim',
    'partners:read',
    'partners:create:stockist',
    'partners:create:distributor',
    'partners:create:dealer',
    'customers:read',
    'customers:create',
    'loans:read',
    'loans:create',
    'loans:pay',
    'devices:read',
    'devices:command:lock',
    'devices:command:unlock',
    'devices:command:alarm',
    'devices:command:wipe',
    'finance:read',
    'reports:export',
    'audit:read',
    'settings:manage',
  ],
  sub_admin: [
    'dashboard:read',
    'keys:read',
    'partners:read',
    'customers:read',
    'loans:read',
    'devices:read',
    'audit:read',
  ],
  stockist: [
    'dashboard:read',
    'keys:read',
    'keys:transfer',
    'keys:reclaim',
    'partners:read',
    'partners:create:distributor',
    'finance:read',
    'reports:export',
  ],
  distributor: [
    'dashboard:read',
    'keys:read',
    'keys:transfer',
    'keys:reclaim',
    'partners:read',
    'partners:create:dealer',
    'finance:read',
    'reports:export',
  ],
  dealer: [
    'dashboard:read',
    'keys:read',
    'customers:read',
    'customers:create',
    'loans:read',
    'loans:create',
    'loans:pay',
    'devices:read',
    'finance:read',
  ],
}

/**
 * Check if a role possesses a specific permission.
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role possesses all specified permissions.
 */
export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.every((p) => hasPermission(role, p))
}

/**
 * Check if a role possesses at least one of the specified permissions.
 */
export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.some((p) => hasPermission(role, p))
}
