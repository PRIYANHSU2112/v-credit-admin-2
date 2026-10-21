import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type {
  TransferReportItem,
  LowKeyPartnerItem,
  GetTransferReportsParams,
  GetLowKeyReportsParams,
  ReportsApiResponse,
} from '../types'
import type { ApiResponse } from '@/types/common'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransferReports: builder.query<
      ReportsApiResponse<TransferReportItem>,
      GetTransferReportsParams | void
    >({
      query: (params) => ({
        url: '/enterprise/reports/transfers',
        params: params || {},
      }),
      providesTags: [API_TAGS.KEYS],
    }),

    getLowKeyReports: builder.query<
      ReportsApiResponse<LowKeyPartnerItem>,
      GetLowKeyReportsParams | void
    >({
      query: (params) => ({
        url: '/enterprise/reports/low-keys',
        params: params || {},
      }),
      providesTags: [API_TAGS.PARTNERS, API_TAGS.KEYS],
    }),

    getReportsSummary: builder.query<ApiResponse<any>, void>({
      query: () => '/enterprise/reports',
      providesTags: [API_TAGS.DASHBOARD],
    }),
  }),
})

export const {
  useGetTransferReportsQuery,
  useGetLowKeyReportsQuery,
  useGetReportsSummaryQuery,
} = reportsApi
