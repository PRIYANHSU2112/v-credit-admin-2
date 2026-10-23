/**
 * Dashboard API — RTK Query
 * Single endpoint: GET /enterprise/dashboard (role-scoped by backend)
 * Returns: kpis, activationTrend, keyStatusBreakdown, recentKeys, auditLogs, notifications,
 *          stockists[], distributors[], dealers[]
 * Removes all MOCK_* data — backend is single source of truth.
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'

export interface DashboardKpis {
  totalKeys: number
  availableKeys: number
  allocatedKeys: number
  activatedKeys: number
  activeDevices: number
  lockedDevices: number
  networkStockists: number
  networkDistributors: number
  networkDealers: number
  users: number
  // Legacy field aliases (DashboardPage.tsx card mapping)
  stockistCount?: number
  distributorCount?: number
  dealerCount?: number
  stockists?: number
  distributors?: number
  dealers?: number
  userCount?: number
  removeUserCount?: number
  today30UserCount?: number
  todayRunningUserCount?: number
  todayIphoneUserCount?: number
  totalIphoneKeys?: number
  transferIphoneKeys?: number
  balanceIphoneKeys?: number
  transferedKeys?: number
  transferredKeys?: number
  balanceKeys?: number
}

export interface ActivationTrendPoint {
  month: string
  activations: number
  transfers: number
  revenue: number
}

export interface KeyStatusBreakdownPoint {
  name: string
  value: number
  color: string
}

export interface RecentKeyEntry {
  key: string
  owner: string
  status: string
  updated: string
}

export interface AuditLogEntry {
  time: string
  actor: string
  role: string
  action: string
  target: string
  severity: 'info' | 'warning' | 'critical'
}

export interface NotificationEntry {
  title: string
  desc: string
  time: string
  type: 'info' | 'warning' | 'error'
}

export interface DashboardData {
  kpis: DashboardKpis
  activationTrend: ActivationTrendPoint[]
  keyStatusBreakdown: KeyStatusBreakdownPoint[]
  recentKeys: RecentKeyEntry[]
  auditLogs: AuditLogEntry[]
  notifications: NotificationEntry[]
  stockists: any[]
  distributors: any[]
  dealers: any[]
}

export interface DashboardResponse {
  success: boolean
  data: DashboardData
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Enterprise Dashboard (role-scoped) ─────────────────────────────────
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => '/enterprise/dashboard',
      transformResponse: (raw: any): DashboardResponse => {
        const d = raw?.data || {}
        const kpis = d.kpis || {}

        const stockists = kpis.stockists ?? kpis.stockistCount ?? kpis.networkStockists ?? 0
        const distributors = kpis.distributors ?? kpis.distributorCount ?? kpis.networkDistributors ?? 0
        const dealers = kpis.dealers ?? kpis.dealerCount ?? kpis.networkDealers ?? 0
        const users = kpis.users ?? kpis.userCount ?? 0
        const totalKeys = kpis.totalKeys ?? kpis.myKeys ?? kpis.networkKeys ?? 0
        const availableKeys = kpis.availableKeys ?? kpis.myAvailable ?? 0
        const transferredKeys = kpis.transferredKeys ?? kpis.allocatedKeys ?? kpis.transferedKeys ?? kpis.networkTransferred ?? 0

        return {
          success: raw?.success ?? true,
          data: {
            kpis: {
              ...kpis,
              stockists,
              stockistCount: stockists,
              networkStockists: stockists,
              distributors,
              distributorCount: distributors,
              networkDistributors: distributors,
              dealers,
              dealerCount: dealers,
              networkDealers: dealers,
              users,
              userCount: users,
              totalKeys,
              availableKeys,
              balanceKeys: availableKeys,
              transferredKeys,
              transferedKeys: transferredKeys,
              allocatedKeys: transferredKeys,
              removeUserCount: kpis.removeUserCount ?? 0,
              today30UserCount: kpis.today30UserCount ?? 0,
              todayRunningUserCount: kpis.todayRunningUserCount ?? 0,
              todayIphoneUserCount: kpis.todayIphoneUserCount ?? 0,
              totalIphoneKeys: kpis.totalIphoneKeys ?? 0,
              transferIphoneKeys: kpis.transferIphoneKeys ?? 0,
              balanceIphoneKeys: kpis.balanceIphoneKeys ?? 0,
            },
            activationTrend: Array.isArray(d.activationTrend) ? d.activationTrend : [],
            keyStatusBreakdown: Array.isArray(d.keyStatusBreakdown) ? d.keyStatusBreakdown : [],
            recentKeys: Array.isArray(d.recentKeys) ? d.recentKeys : [],
            auditLogs: Array.isArray(d.auditLogs) ? d.auditLogs : [],
            notifications: Array.isArray(d.notifications) ? d.notifications : [],
            stockists: Array.isArray(d.stockists) ? d.stockists : [],
            distributors: Array.isArray(d.distributors) ? d.distributors : [],
            dealers: Array.isArray(d.dealers) ? d.dealers : [],
          },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load dashboard',
      }),
      providesTags: [API_TAGS.DASHBOARD],
    }),
  }),
  overrideExisting: true,
})

export const { useGetDashboardQuery } = dashboardApi
