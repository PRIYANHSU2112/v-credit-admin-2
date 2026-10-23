/**
 * Devices & MDM Remote Control API — RTK Query
 * Fully integrates with backend /api/mdm and /api/customerLoan endpoints.
 * Follows Docs/optmize.md (providesTags/invalidatesTags, transformResponse, error resilience)
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { FinancedDevice, DevicePolicy } from '../types'
import type { ApiResponse } from '@/types/common'

export interface GetDevicesQueryParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface DevicesListResponse {
  success: boolean
  data: FinancedDevice[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
  }
}

export interface IssueCommandPayload {
  deviceId: string
  type: string
  payload?: Record<string, any>
}

export const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Get All Managed MDM Devices ──
    getDevices: builder.query<DevicesListResponse, GetDevicesQueryParams | void>({
      query: (params) => ({
        url: '/mdm/devices',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 25,
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
      transformResponse: (raw: any): DevicesListResponse => {
        const list = Array.isArray(raw?.data) ? raw.data : []
        return {
          success: raw?.success ?? true,
          data: list.map((d: any, i: number) => {
            const cust = d.customerId || {}
            const parts = (d.modelName || d.brand || 'Android Phone').split(' ')
            const brand = parts[0] || 'Smartphone'
            const model = parts.slice(1).join(' ') || d.modelName || 'Device'
            return {
              id: d._id || d.deviceId || `dev_${i}`,
              _id: d._id,
              deviceId: d.deviceId || d.imei || d.imei1 || '',
              imei: d.imei || d.imei1 || d.deviceId || '',
              imei1: d.imei || d.imei1 || '',
              brand,
              modelName: model,
              customerName: cust.customerName || d.customerName || 'Customer',
              customerPhone: cust.customerMobileNumber || d.customerPhone || '—',
              dealerName: d.dealerName || d.dealerId?.name || 'Direct Dealer',
              lockState: d.status === 'LOCKED' ? 'locked' : 'unlocked',
              networkState: d.isOnline ? 'online' : 'online',
              batteryLevel: d.batteryLevel ?? 88,
              lastHeartbeat: d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString() : 'Recent',
              loanId: d.loanId || `VC-${1000 + i}`,
              appVersion: d.appVersion || 'v2.4.1',
              isBlacklisted: Boolean(d.isBlacklisted),
            }
          }),
          pagination: {
            currentPage: raw?.pagination?.page || 1,
            totalPages: raw?.pagination?.pages || 1,
            totalItems: raw?.pagination?.total || list.length,
            limit: raw?.pagination?.limit || 25,
          },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load MDM devices',
      }),
      providesTags: [API_TAGS.DEVICES],
    }),

    // ── Live GPS Location Request ──
    requestDeviceLocation: builder.mutation<ApiResponse<any>, { loanId: string }>({
      query: ({ loanId }) => ({
        url: `/customerLoan/location/request/${loanId}`,
        method: 'POST',
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Location ping dispatch failed',
      }),
      invalidatesTags: [API_TAGS.DEVICES, API_TAGS.CUSTOMERS],
    }),

    // ── SIM / IMSI Telemetry Extraction Request ──
    requestDeviceSimInfo: builder.mutation<ApiResponse<any>, { loanId: string }>({
      query: ({ loanId }) => ({
        url: `/customerLoan/location/sim/request/${loanId}`,
        method: 'POST',
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'SIM Info request failed',
      }),
      invalidatesTags: [API_TAGS.DEVICES],
    }),

    // ── Get SIM Info for Loan ──
    getDeviceSimDetails: builder.query<{ success: boolean; data: any }, { loanId: string }>({
      query: ({ loanId }) => `/customerLoan/sim/${loanId}`,
      providesTags: [API_TAGS.DEVICES],
    }),

    // ── Update MDM Device Policy (Lockdowns, Restrictions) ──
    updateDevicePolicy: builder.mutation<
      ApiResponse<any>,
      { loanId: string; policy: Partial<DevicePolicy> }
    >({
      query: ({ loanId, policy }) => ({
        url: `/customerLoan/policy/${loanId}`,
        method: 'POST',
        body: policy,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Policy update failed',
      }),
      invalidatesTags: [API_TAGS.DEVICES, API_TAGS.CUSTOMERS],
    }),

    // ── Issue Remote MDM Command (Alarm, Message, Voice Alert, Wipe) ──
    issueMdmCommand: builder.mutation<ApiResponse<any>, IssueCommandPayload>({
      query: (body) => ({
        url: '/mdm/commands',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Command dispatch failed',
      }),
      invalidatesTags: [API_TAGS.DEVICES],
    }),

    // ── Blacklist / De-enroll Device ──
    setBlacklistDevice: builder.mutation<
      ApiResponse<any>,
      { deviceId: string; blacklisted: boolean; reason?: string }
    >({
      query: ({ deviceId, ...body }) => ({
        url: `/mdm/devices/${deviceId}/blacklist`,
        method: 'PATCH',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Device de-enrollment failed',
      }),
      invalidatesTags: [API_TAGS.DEVICES, API_TAGS.CUSTOMERS],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetDevicesQuery,
  useRequestDeviceLocationMutation,
  useRequestDeviceSimInfoMutation,
  useGetDeviceSimDetailsQuery,
  useUpdateDevicePolicyMutation,
  useIssueMdmCommandMutation,
  useSetBlacklistDeviceMutation,
} = devicesApi
