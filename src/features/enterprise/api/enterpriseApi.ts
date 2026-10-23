import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type {
  StockistItem,
  TerritoryItem,
  InventoryKpis,
  StockistInventoryItem,
  CommissionItem,
  CommissionTrendItem,
  CommissionRates,
  AuditLogItem,
  NotificationItem,
  SearchResultData,
} from '../types'
import type { ApiResponse } from '@/types/common'

export const enterpriseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Dashboard Overview ──
    getDashboard: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/enterprise/dashboard',
      providesTags: [API_TAGS.DASHBOARD],
    }),

    // ── Stockists ──
    getStockists: builder.query<
      { success: boolean; data: StockistItem[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number } },
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: '/enterprise/stockists',
        params: params || {},
      }),
      providesTags: [API_TAGS.PARTNERS],
    }),

    createStockist: builder.mutation<ApiResponse<any>, Partial<StockistItem> & { password?: string }>({
      query: (body) => ({
        url: '/enterprise/stockists',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.PARTNERS, API_TAGS.DASHBOARD],
    }),

    // ── Territories ──
    getTerritories: builder.query<{ success: boolean; data: TerritoryItem[] }, void>({
      query: () => '/enterprise/territories',
      providesTags: [API_TAGS.TERRITORIES, API_TAGS.PARTNERS],
    }),

    // ── Inventory ──
    getInventory: builder.query<
      { success: boolean; data: { kpis: InventoryKpis; stockists: StockistInventoryItem[] } },
      void
    >({
      query: () => '/enterprise/inventory',
      providesTags: [API_TAGS.INVENTORY, API_TAGS.KEYS],
    }),

    // ── Commissions ──
    getCommissions: builder.query<
      { success: boolean; data: { commissions: CommissionItem[]; commissionTrend: CommissionTrendItem[]; rates?: CommissionRates } },
      void
    >({
      query: () => '/enterprise/commissions',
      providesTags: [API_TAGS.COMMISSIONS],
    }),

    updateCommissionRates: builder.mutation<ApiResponse<CommissionRates>, Partial<CommissionRates>>({
      query: (body) => ({
        url: '/enterprise/commissions/rates',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.COMMISSIONS, API_TAGS.SETTINGS, API_TAGS.DASHBOARD],
    }),

    // ── Analytics ──
    getAnalytics: builder.query<
      { success: boolean; data: { cities: Array<{ city: string; value: number }> } },
      void
    >({
      query: () => '/enterprise/analytics',
    }),

    // ── Audit Logs ──
    getAuditLogs: builder.query<
      { success: boolean; data: AuditLogItem[]; pagination: { currentPage: number; totalPages: number; totalItems: number } },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/enterprise/audit',
        params: params || {},
      }),
      providesTags: [API_TAGS.AUDIT],
    }),

    // ── Notifications ──
    getNotifications: builder.query<{ success: boolean; data: NotificationItem[] }, void>({
      query: () => '/enterprise/notifications',
      providesTags: [API_TAGS.NOTIFICATIONS],
    }),

    // ── Global Search ──
    globalSearch: builder.query<{ success: boolean; data: SearchResultData }, string>({
      query: (q) => ({
        url: '/enterprise/search',
        params: { q },
      }),
    }),

    // ── User Password Reset ──
    resetPassword: builder.mutation<ApiResponse<any>, { userId: string; password?: string }>({
      query: ({ userId, password }) => ({
        url: `/enterprise/users/${userId}/password`,
        method: 'PATCH',
        body: { password },
      }),
      invalidatesTags: [API_TAGS.PARTNERS],
    }),

    // ── Impersonation ──
    impersonateUser: builder.mutation<
      { success: boolean; token: string; user: any; message?: string },
      { targetUserId: string }
    >({
      query: (body) => ({
        url: '/enterprise/login-as',
        method: 'POST',
        body,
      }),
    }),

    // ── Key Actions ──
    bulkGenerateKeys: builder.mutation<
      ApiResponse<{ count: number; batchId?: string }>,
      { count: number; keyType?: string; description?: string }
    >({
      query: (body) => ({
        url: '/enterprise/keys/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.DASHBOARD, API_TAGS.INVENTORY],
    }),

    transferKeyBatch: builder.mutation<
      ApiResponse<any>,
      { toUserId: string; quantity: number; note?: string }
    >({
      query: (body) => ({
        url: '/enterprise/keys/transfer',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.PARTNERS, API_TAGS.INVENTORY, API_TAGS.DASHBOARD],
    }),

    reclaimKeyBatch: builder.mutation<
      ApiResponse<any>,
      { fromUserId: string; quantity: number; note?: string }
    >({
      query: (body) => ({
        url: '/enterprise/keys/reclaim',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.KEYS, API_TAGS.PARTNERS, API_TAGS.INVENTORY, API_TAGS.DASHBOARD],
    }),

    getKeys: builder.query<
      { success: boolean; data: any[]; pagination: { currentPage: number; totalPages: number; totalItems: number } },
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/enterprise/keys',
        params: params || {},
      }),
      providesTags: [API_TAGS.KEYS],
    }),
  }),
})

export const {
  useGetDashboardQuery,
  useGetStockistsQuery,
  useCreateStockistMutation,
  useGetTerritoriesQuery,
  useGetInventoryQuery,
  useGetCommissionsQuery,
  useUpdateCommissionRatesMutation,
  useGetAnalyticsQuery,
  useGetAuditLogsQuery,
  useGetNotificationsQuery,
  useLazyGlobalSearchQuery,
  useResetPasswordMutation,
  useImpersonateUserMutation,
  useBulkGenerateKeysMutation,
  useTransferKeyBatchMutation,
  useReclaimKeyBatchMutation,
  useGetKeysQuery,
} = enterpriseApi
