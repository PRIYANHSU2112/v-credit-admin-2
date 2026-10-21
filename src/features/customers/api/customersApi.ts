import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type {
  EndUserRecord,
  GetEndUsersParams,
  DeviceControlRequest,
  DeviceControlResponse,
} from '../types'
import type { ApiResponse } from '@/types/common'

export interface BackendEndUsersResponse {
  success: boolean
  data: EndUserRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEndUsers: builder.query<
      BackendEndUsersResponse,
      GetEndUsersParams | void
    >({
      query: (params) => ({
        url: '/enterprise/users',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response?.data) ? response.data : []
        const normalized = rawList.map((item: any) => ({
          ...item,
          userName: item.name || item.userName || '—',
          userPhone: item.phone || item.userPhone || '—',
          activationDate: item.activatedAt || item.activationDate || '—',
          userFeature: item.device || item.userFeature || 'Android Device',
          keyCode: item.keyId || item.keyCode || '—',
          imei1: item.imei || item.imei1 || '—',
          lockStatus:
            item.lockStatus ||
            (String(item.status).toLowerCase().includes('lock')
              ? 'locked'
              : 'unlocked'),
        }))
        return {
          success: response?.success ?? true,
          data: normalized,
          pagination: response?.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: normalized.length,
          },
        }
      },
      providesTags: [API_TAGS.CUSTOMERS],
    }),

    lockDevice: builder.mutation<DeviceControlResponse, DeviceControlRequest>({
      query: (body) => ({
        url: '/device/lock',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS, API_TAGS.DEVICES],
    }),

    unlockDevice: builder.mutation<DeviceControlResponse, DeviceControlRequest>({
      query: (body) => ({
        url: '/device/unlock',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS, API_TAGS.DEVICES],
    }),

    getCustomersDirectory: builder.query<ApiResponse<any>, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: '/customers',
        params: params || {},
      }),
      providesTags: [API_TAGS.CUSTOMERS],
    }),
  }),
})

export const {
  useGetEndUsersQuery,
  useLockDeviceMutation,
  useUnlockDeviceMutation,
  useGetCustomersDirectoryQuery,
} = customersApi
