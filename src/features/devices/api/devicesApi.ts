import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { FinancedDevice, DeviceCommandPayload } from '../types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common'

export const MOCK_DEVICES: FinancedDevice[] = [
  {
    id: 'dev_1',
    imei: '864501041234567',
    modelName: 'Galaxy A15 5G',
    brand: 'Samsung',
    customerName: 'Rohan Sharma',
    customerPhone: '9876543210',
    dealerName: 'Metro Telecom',
    lockState: 'unlocked',
    networkState: 'online',
    batteryLevel: 82,
    lastHeartbeat: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    loanId: 'LN-2026-9041',
    overdueDays: 0,
    appVersion: 'v2.4.1',
  },
  {
    id: 'dev_2',
    imei: '358921098234120',
    modelName: 'Redmi Note 13',
    brand: 'Xiaomi',
    customerName: 'Sunita Devi',
    customerPhone: '9811234567',
    dealerName: 'City Cell Care',
    lockState: 'locked',
    networkState: 'online',
    batteryLevel: 45,
    lastHeartbeat: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    loanId: 'LN-2026-8812',
    overdueDays: 14,
    appVersion: 'v2.4.1',
  },
  {
    id: 'dev_3',
    imei: '869012049182371',
    modelName: 'Vivo Y28 5G',
    brand: 'Vivo',
    customerName: 'Mukesh Kumar',
    customerPhone: '9822334455',
    dealerName: 'Metro Telecom',
    lockState: 'unlocked',
    networkState: 'offline',
    batteryLevel: 12,
    lastHeartbeat: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    loanId: 'LN-2026-7734',
    overdueDays: 0,
    appVersion: 'v2.3.9',
  },
  {
    id: 'dev_4',
    imei: '863291048192038',
    modelName: 'Realme 12 Pro',
    brand: 'Realme',
    customerName: 'Amit Joshi',
    customerPhone: '9899887766',
    dealerName: 'Shiv Mobiles',
    lockState: 'locked',
    networkState: 'online',
    batteryLevel: 94,
    lastHeartbeat: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    loanId: 'LN-2026-6641',
    overdueDays: 21,
    appVersion: 'v2.4.1',
  },
]

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
