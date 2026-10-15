import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { DashboardKPIs, RevenueDataPoint, KeyDistributionDataPoint } from '../types'
import type { ApiResponse } from '@/types/common'

// Mock seed data for instant visual excellence
export const MOCK_KPIS: DashboardKPIs = {
  totalKeysInOrbit: 16250,
  activeDevices: 12480,
  lockedDevices: 432,
  totalFinancedAmount: 48500000,
  totalCollectedAmount: 39200000,
  pendingOverdueAmount: 2450000,
  activePartners: 348,
  keysChange: 24.8,
  devicesChange: 18.2,
  collectionRate: 94.2,
}

export const MOCK_REVENUE_TREND: RevenueDataPoint[] = [
  { month: 'Jan', disbursed: 3200000, collected: 2900000 },
  { month: 'Feb', disbursed: 4100000, collected: 3600000 },
  { month: 'Mar', disbursed: 4800000, collected: 4200000 },
  { month: 'Apr', disbursed: 5200000, collected: 4900000 },
  { month: 'May', disbursed: 6100000, collected: 5800000 },
  { month: 'Jun', disbursed: 7400000, collected: 6950000 },
]

export const MOCK_KEY_DISTRIBUTION: KeyDistributionDataPoint[] = [
  { tier: 'Stockists', allocated: 8200, active: 6400, available: 1800 },
  { tier: 'Distributors', allocated: 5100, active: 4200, available: 900 },
  { tier: 'Dealers', allocated: 2950, active: 1880, available: 1070 },
]

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardKPIs: builder.query<ApiResponse<DashboardKPIs>, void>({
      query: () => '/dashboard/kpis',
      providesTags: [API_TAGS.DASHBOARD],
      // Fallback transform / mock
      transformResponse: (response: ApiResponse<DashboardKPIs>) => response,
    }),
    getRevenueTrend: builder.query<ApiResponse<RevenueDataPoint[]>, void>({
      query: () => '/dashboard/revenue-trend',
      providesTags: [API_TAGS.DASHBOARD],
    }),
    getKeyDistribution: builder.query<ApiResponse<KeyDistributionDataPoint[]>, void>({
      query: () => '/dashboard/key-distribution',
      providesTags: [API_TAGS.DASHBOARD],
    }),
  }),
})

export const {
  useGetDashboardKPIsQuery,
  useGetRevenueTrendQuery,
  useGetKeyDistributionQuery,
} = dashboardApi
