/**
 * Common shared interfaces for API responses, pagination, filtering
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data: T
  error?: string
  timestamp?: string
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type SortDirection = 'asc' | 'desc' | null

export interface QueryFilter {
  field: string
  value: string | number | boolean
  operator?: 'eq' | 'ne' | 'contains' | 'in' | 'gt' | 'lt'
}

export type StatusVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline'
  | 'purple'
  | 'cyan'
