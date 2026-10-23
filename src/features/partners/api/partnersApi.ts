/**
 * Partners API — RTK Query (thin delegator — main logic in enterpriseApi.ts)
 * Mock data removed. All queries delegate to /enterprise/* endpoints.
 * Follows optimize.md: transformResponse, providesTags/invalidatesTags, pagination
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { HierarchyPartnerRow } from '../types'
import type { ApiResponse } from '@/types/common'

export interface CreatePartnerPayload {
  name: string
  agencyName?: string
  email: string
  phone: string
  password?: string
  city?: string
  state?: string
  district?: string
  pincode?: string
  gstNumber?: string
  address?: string
  territory?: string
  parentStockistId?: string
  status?: string
}

export interface PartnersListResponse {
  success: boolean
  data: HierarchyPartnerRow[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
  }
}

function normalisePartnerRow(raw: any): HierarchyPartnerRow {
  return {
    id: raw._id || raw.id || raw.entityCode || '',
    _id: raw._id || raw.id || '',
    name: raw.name || raw.agencyName || '—',
    agencyName: raw.agencyName || raw.name || '—',
    email: raw.email || '—',
    phone: raw.phone || '—',
    city: raw.city || '—',
    state: raw.state || raw.territory || '',
    territory: raw.territory || raw.state || '',
    entityCode: raw.entityCode || raw.id || '',
    status: raw.status || raw.enterpriseStatus || 'Active',
    keys: raw.keys || 0,
    available: raw.available || 0,
    allocatedKeys: raw.keys || 0,
    availableKeys: raw.available || 0,
    activeDevices: raw.activeDevices || raw.users || 0,
    walletBalance: raw.walletBalance || 0,
    role: raw.enterpriseRole || 'dealer',
    parentName: raw.stockist || raw.distributor || raw.parentName || '',
    joinedAt: raw.createdAt || raw.onboarded || '',
    lastActive: raw.lastActive || '',
    distributors: raw.distributors || 0,
    dealers: raw.dealers || 0,
    users: raw.users || raw.activeDevices || 0,
    gst: raw.gstNumber || raw.gst || '',
    revenue: raw.revenue || 0,
  }
}

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Stockists ──────────────────────────────────────────────────────────
    getStockists: builder.query<PartnersListResponse, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: '/enterprise/stockists',
        params: params || {},
      }),
      transformResponse: (raw: any): PartnersListResponse => ({
        success: raw?.success ?? true,
        data: Array.isArray(raw?.data) ? raw.data.map(normalisePartnerRow) : [],
        pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, limit: 50 },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load stockists',
      }),
      providesTags: [API_TAGS.PARTNERS],
    }),

    createStockist: builder.mutation<ApiResponse<HierarchyPartnerRow>, CreatePartnerPayload>({
      query: (body) => ({
        url: '/enterprise/stockists',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to create stockist',
      }),
      invalidatesTags: [API_TAGS.PARTNERS, API_TAGS.DASHBOARD],
    }),

    // ── Distributors ───────────────────────────────────────────────────────
    getDistributors: builder.query<PartnersListResponse, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: '/enterprise/distributors',
        params: params || {},
      }),
      transformResponse: (raw: any): PartnersListResponse => ({
        success: raw?.success ?? true,
        data: Array.isArray(raw?.data) ? raw.data.map(normalisePartnerRow) : [],
        pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, limit: 50 },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load distributors',
      }),
      providesTags: [API_TAGS.PARTNERS],
    }),

    createDistributor: builder.mutation<ApiResponse<HierarchyPartnerRow>, CreatePartnerPayload>({
      query: (body) => ({
        url: '/enterprise/distributors',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to create distributor',
      }),
      invalidatesTags: [API_TAGS.PARTNERS, API_TAGS.DASHBOARD],
    }),

    // ── Dealers ────────────────────────────────────────────────────────────
    getDealers: builder.query<PartnersListResponse, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: '/enterprise/dealers',
        params: params || {},
      }),
      transformResponse: (raw: any): PartnersListResponse => ({
        success: raw?.success ?? true,
        data: Array.isArray(raw?.data) ? raw.data.map(normalisePartnerRow) : [],
        pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, limit: 50 },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load dealers',
      }),
      providesTags: [API_TAGS.PARTNERS],
    }),

    createDealer: builder.mutation<ApiResponse<HierarchyPartnerRow>, CreatePartnerPayload>({
      query: (body) => ({
        url: '/enterprise/dealers',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to create dealer',
      }),
      invalidatesTags: [API_TAGS.PARTNERS, API_TAGS.DASHBOARD],
    }),

    // ── Reset Partner Password ─────────────────────────────────────────────
    resetPartnerPassword: builder.mutation<
      ApiResponse<{ id: string }>,
      { userId: string; password: string }
    >({
      query: ({ userId, password }) => ({
        url: `/enterprise/users/${userId}/password`,
        method: 'PATCH',
        body: { password },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Password reset failed',
      }),
      invalidatesTags: [API_TAGS.PARTNERS],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetStockistsQuery,
  useCreateStockistMutation,
  useGetDistributorsQuery,
  useCreateDistributorMutation,
  useGetDealersQuery,
  useCreateDealerMutation,
  useResetPartnerPasswordMutation,
} = partnersApi
