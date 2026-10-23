import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { FinancedDevice, DeviceCommandPayload } from '../types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common'



export const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query<ApiResponse<PaginatedResponse<FinancedDevice>>, PaginationParams | void>({
      query: (params) => ({
        url: '/devices',
        params: params || {},
      }),
      providesTags: [API_TAGS.DEVICES],
    }),
    sendCommand: builder.mutation<ApiResponse<{ status: string }>, DeviceCommandPayload>({
      query: (body) => ({
        url: `/devices/${body.deviceId}/command`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.DEVICES, API_TAGS.DASHBOARD],
    }),
  }),
})

export const { useGetDevicesQuery, useSendCommandMutation } = devicesApi
