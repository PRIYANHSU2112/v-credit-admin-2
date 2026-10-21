import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { LicenseKey, GenerateKeysRequest, TransferKeysRequest } from '../types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common'

export const MOCK_KEYS: LicenseKey[] = [
  {
    id: 'key_1',
    _id: '6708ab9e1234567890key001',
    keyCode: 'VC-8921-9842-1082',
    keyNumber: 'VC-8921-9842-1082',
    batchNumber: 'BATCH-2026-001',
    batchId: 'BATCH-2026-001',
    keyType: 'standard',
    status: 'Activated',
    holderTier: 'dealer',
    holderName: 'Metro Telecom',
    assignedCustomer: 'Rohan Sharma',
    assignedImei: '864501041234567',
    generatedAt: '2026-03-01T10:00:00Z',
    activatedAt: '2026-03-05T14:30:00Z',
  },
  {
    id: 'key_2',
    _id: '6708ab9e1234567890key002',
    keyCode: 'VC-7721-3910-8812',
    keyNumber: 'VC-7721-3910-8812',
    batchNumber: 'BATCH-2026-001',
    batchId: 'BATCH-2026-001',
    keyType: 'standard',
    status: 'Allocated',
    holderTier: 'dealer',
    holderName: 'Shiv Mobiles',
    generatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'key_3',
    _id: '6708ab9e1234567890key003',
    keyCode: 'VC-5412-1928-3381',
    keyNumber: 'VC-5412-1928-3381',
    batchNumber: 'BATCH-2026-002',
    batchId: 'BATCH-2026-002',
    keyType: 'iphone',
    status: 'Generated',
    holderTier: 'distributor',
    holderName: 'Delhi Hub Distribution',
    generatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'key_4',
    _id: '6708ab9e1234567890key004',
    keyCode: 'VC-1902-8821-4412',
    keyNumber: 'VC-1902-8821-4412',
    batchNumber: 'BATCH-2026-002',
    batchId: 'BATCH-2026-002',
    keyType: 'standard',
    status: 'Activated',
    holderTier: 'dealer',
    holderName: 'City Cell Care',
    assignedCustomer: 'Sunita Devi',
    assignedImei: '358921098234120',
    generatedAt: '2026-03-10T12:00:00Z',
    activatedAt: '2026-03-12T09:15:00Z',
  },
  {
    id: 'key_5',
    _id: '6708ab9e1234567890key005',
    keyCode: 'VC-9921-0029-7712',
    keyNumber: 'VC-9921-0029-7712',
    batchNumber: 'BATCH-2026-003',
    batchId: 'BATCH-2026-003',
    keyType: 'standard',
    status: 'Transferred',
    holderTier: 'stockist',
    holderName: 'North Regional Stockist',
    generatedAt: '2026-03-15T16:00:00Z',
  },
  {
    id: 'key_6',
    _id: '6708ab9e1234567890key006',
    keyCode: 'VC-6612-3341-9920',
    keyNumber: 'VC-6612-3341-9920',
    batchNumber: 'BATCH-2026-003',
    batchId: 'BATCH-2026-003',
    keyType: 'standard',
    status: 'Generated',
    holderTier: 'super_admin',
    holderName: 'Platform Central Vault',
    generatedAt: '2026-03-15T16:00:00Z',
  },
]

export const keysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKeys: builder.query<ApiResponse<PaginatedResponse<LicenseKey>>, PaginationParams | void>({
      query: (params) => ({
        url: '/keys',
        params: params || {},
      }),
      providesTags: [API_TAGS.KEYS],
    }),
    generateKeys: builder.mutation<ApiResponse<{ generatedCount: number }>, GenerateKeysRequest>({
      query: (body) => ({
        url: '/keys/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.DASHBOARD],
    }),
    transferKeys: builder.mutation<ApiResponse<null>, TransferKeysRequest>({
      query: (body) => ({
        url: '/keys/transfer',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.PARTNERS],
    }),
    reclaimKeys: builder.mutation<ApiResponse<null>, { keyId: string; reason?: string }>({
      query: ({ keyId, reason }) => ({
        url: `/keys/${keyId}/reclaim`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [API_TAGS.KEYS],
    }),
  }),
})

export const {
  useGetKeysQuery,
  useGenerateKeysMutation,
  useTransferKeysMutation,
  useReclaimKeysMutation,
} = keysApi
