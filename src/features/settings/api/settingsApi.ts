/**
 * Settings API — RTK Query
 * Manages platform configuration, key prices, and administrator profile settings.
 * Adheres strictly to Docs/optmize.md (tag invalidation, error handling, normalization)
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { ApiResponse } from '@/types/common'

export interface UserProfileSettings {
  name: string
  email: string
  phone: string
  role: string
  entityCode: string
  territory?: string
  city?: string
}

export interface PlatformConfigSettings {
  keyPrice: number
  iphoneKeyPrice: number
  stockistCommissionRate?: number
  distributorCommissionRate?: number
  dealerCommissionRate?: number
  autoLockOnOverdue: boolean
  gracePeriodDays: number
  smsGatewayActive: boolean
  whatsappAlerts: boolean
}

export interface SettingsStats {
  totalKeys: number
  networkUsers: number
  auditEvents: number
}

export interface SettingsData {
  profile: UserProfileSettings
  platform: PlatformConfigSettings
  stats?: SettingsStats
}

export interface UpdateSettingsPayload {
  name?: string
  phone?: string
  city?: string
  territory?: string
  keyPrice?: number
  iphoneKeyPrice?: number
  stockistCommissionRate?: number
  distributorCommissionRate?: number
  dealerCommissionRate?: number
  autoLockOnOverdue?: boolean
  gracePeriodDays?: number
  smsGatewayActive?: boolean
  whatsappAlerts?: boolean
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<{ success: boolean; data: SettingsData }, void>({
      query: () => '/enterprise/settings',
      transformResponse: (raw: any) => {
        return {
          success: raw?.success ?? true,
          data: {
            profile: raw?.data?.profile || {
              name: '',
              email: '',
              phone: '',
              role: 'super_admin',
              entityCode: '',
              territory: '',
              city: '',
            },
            platform: {
              keyPrice: raw?.data?.platform?.keyPrice ?? 350,
              iphoneKeyPrice: raw?.data?.platform?.iphoneKeyPrice ?? 600,
              autoLockOnOverdue: raw?.data?.platform?.autoLockOnOverdue ?? true,
              gracePeriodDays: raw?.data?.platform?.gracePeriodDays ?? 3,
              smsGatewayActive: raw?.data?.platform?.smsGatewayActive ?? true,
              whatsappAlerts: raw?.data?.platform?.whatsappAlerts ?? true,
            },
            stats: raw?.data?.stats,
          },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to fetch settings from server',
      }),
      providesTags: [API_TAGS.SETTINGS],
    }),

    updateSettings: builder.mutation<ApiResponse<SettingsData>, UpdateSettingsPayload>({
      query: (body) => ({
        url: '/enterprise/settings',
        method: 'PATCH',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to update settings',
      }),
      invalidatesTags: [API_TAGS.SETTINGS, API_TAGS.DASHBOARD],
    }),
  }),
  overrideExisting: true,
})

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi
