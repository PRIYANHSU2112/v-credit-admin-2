/**
 * Keys API — RTK Query
 * All endpoints use correct /enterprise/keys/* prefix.
 * Mock data removed — backend is single source of truth.
 * Follows optimize.md: pagination, transformResponse, providesTags/invalidatesTags
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { LicenseKey, GenerateKeysRequest, TransferKeysRequest } from '../types'

export interface KeysResponse {
  success: boolean
  data: LicenseKey[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export interface KeysQueryParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export const keysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── List Keys (server-side pagination + filters) ────────────────────────
    getEnterpriseKeys: builder.query<KeysResponse, KeysQueryParams | void>({
      query: (params) => ({
        url: '/enterprise/keys',
        params: params || {},
      }),
      transformResponse: (raw: any): KeysResponse => {
        const list = Array.isArray(raw?.data) ? raw.data : []
        return {
          success: raw?.success ?? true,
          data: list.map((k: any) => ({
            id: k._id || k.id,
            _id: k._id || k.id,
            keyCode: k.keyNumber || k.keyCode || k.key || '',
            keyNumber: k.keyNumber || k.keyCode || k.key || '',
            batchNumber: k.batch || k.batchId || k.batchNumber || '',
            batchId: k.batch || k.batchId || '',
            keyType: k.keyType || 'standard',
            status: k.status || 'Generated',
            holderTier: k.ownerRole || k.holderTier || '',
            holderName: k.owner || k.holderName || '',
            assignedCustomer: k.customer || k.assignedCustomer,
            assignedImei: k.imei || k.assignedImei,
            generatedAt: k.createdAt || k.generatedAt || '',
            activatedAt: k.activatedAt,
            updated: k.updated,
          })),
          pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: list.length },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load keys',
      }),
      providesTags: [API_TAGS.KEYS],
    }),

    // ── Generate Key Batch (super_admin only) ──────────────────────────────
    generateKeys: builder.mutation<
      { success: boolean; data: { count: number; batchId: string } },
      GenerateKeysRequest
    >({
      query: (body) => ({
        url: '/enterprise/keys/generate',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: any) => ({
        success: raw?.success ?? true,
        data: {
          count: raw?.data?.count || raw?.data?.keys?.length || 0,
          batchId: raw?.data?.batchId || '',
        },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to generate keys',
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.DASHBOARD, API_TAGS.INVENTORY],
    }),

    // ── Transfer Keys Downstream ───────────────────────────────────────────
    transferKeys: builder.mutation<
      { success: boolean; data: { quantity: number; batchId: string } },
      TransferKeysRequest
    >({
      query: (body) => ({
        url: '/enterprise/keys/transfer',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: any) => ({
        success: raw?.success ?? true,
        data: { quantity: raw?.data?.quantity || 0, batchId: raw?.data?.batchId || '' },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to transfer keys',
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.PARTNERS, API_TAGS.DASHBOARD, API_TAGS.INVENTORY],
    }),

    // ── Reclaim Keys Upstream ──────────────────────────────────────────────
    reclaimKeys: builder.mutation<
      { success: boolean; data: { quantity: number } },
      { fromUserId: string; quantity: number; note?: string }
    >({
      query: (body) => ({
        url: '/enterprise/keys/reclaim',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: any) => ({
        success: raw?.success ?? true,
        data: { quantity: raw?.data?.quantity || 0 },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to reclaim keys',
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.PARTNERS, API_TAGS.DASHBOARD, API_TAGS.INVENTORY],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetEnterpriseKeysQuery,
  useGenerateKeysMutation,
  useTransferKeysMutation,
  useReclaimKeysMutation,
} = keysApi
