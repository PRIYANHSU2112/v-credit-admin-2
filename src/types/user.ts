/**
 * User & Authentication Models
 */

export type UserRole = 'super_admin' | 'sub_admin' | 'stockist' | 'distributor' | 'dealer'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  parentId?: string | null
  parentName?: string | null
  status: 'active' | 'suspended' | 'pending'
  walletBalance?: number
  availableKeys?: number
  allocatedKeys?: number
  createdAt: string
  lastLoginAt?: string
}

export type Permission =
  | 'dashboard:read'
  | 'keys:read'
  | 'keys:generate'
  | 'keys:transfer'
  | 'keys:reclaim'
  | 'partners:read'
  | 'partners:create:stockist'
  | 'partners:create:distributor'
  | 'partners:create:dealer'
  | 'customers:read'
  | 'customers:create'
  | 'loans:read'
  | 'loans:create'
  | 'loans:pay'
  | 'devices:read'
  | 'devices:command:lock'
  | 'devices:command:unlock'
  | 'devices:command:alarm'
  | 'devices:command:wipe'
  | 'finance:read'
  | 'reports:export'
  | 'audit:read'
  | 'settings:manage'
