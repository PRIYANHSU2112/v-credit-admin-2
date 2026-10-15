import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { LoanAccount, RecordPaymentRequest } from '../types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common'

export const MOCK_LOANS: LoanAccount[] = [
  {
    id: 'ln_1',
    loanNumber: 'LN-2026-9041',
    customerName: 'Rohan Sharma',
    customerPhone: '9876543210',
    deviceModel: 'Samsung Galaxy A15 5G',
    imei: '864501041234567',
    dealerName: 'Metro Telecom',
    totalLoanAmount: 18500,
    downPayment: 3500,
    monthlyEmi: 2500,
    totalEmis: 6,
    paidEmis: 3,
    nextDueDate: '2026-04-10T00:00:00Z',
    status: 'current',
    overdueDays: 0,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ln_2',
    loanNumber: 'LN-2026-8812',
    customerName: 'Sunita Devi',
    customerPhone: '9811234567',
    deviceModel: 'Xiaomi Redmi Note 13',
    imei: '358921098234120',
    dealerName: 'City Cell Care',
    totalLoanAmount: 16000,
    downPayment: 3000,
    monthlyEmi: 2166,
    totalEmis: 6,
    paidEmis: 1,
    nextDueDate: '2026-03-01T00:00:00Z',
    status: 'overdue',
    overdueDays: 14,
    createdAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'ln_3',
    loanNumber: 'LN-2026-7734',
    customerName: 'Mukesh Kumar',
    customerPhone: '9822334455',
    deviceModel: 'Vivo Y28 5G',
    imei: '869012049182371',
    dealerName: 'Metro Telecom',
    totalLoanAmount: 14500,
    downPayment: 2500,
    monthlyEmi: 2000,
    totalEmis: 6,
    paidEmis: 6,
    nextDueDate: '2026-03-15T00:00:00Z',
    status: 'settled',
    overdueDays: 0,
    createdAt: '2025-09-15T14:00:00Z',
  },
  {
    id: 'ln_4',
    loanNumber: 'LN-2026-6641',
    customerName: 'Amit Joshi',
    customerPhone: '9899887766',
    deviceModel: 'Realme 12 Pro',
    imei: '863291048192038',
    dealerName: 'Shiv Mobiles',
    totalLoanAmount: 24000,
    downPayment: 5000,
    monthlyEmi: 3166,
    totalEmis: 6,
    paidEmis: 2,
    nextDueDate: '2026-02-25T00:00:00Z',
    status: 'overdue',
    overdueDays: 21,
    createdAt: '2025-12-25T11:30:00Z',
  },
]

export const loansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoans: builder.query<ApiResponse<PaginatedResponse<LoanAccount>>, PaginationParams | void>({
      query: (params) => ({
        url: '/loans',
        params: params || {},
      }),
      providesTags: [API_TAGS.LOANS],
    }),
    recordPayment: builder.mutation<ApiResponse<null>, RecordPaymentRequest>({
      query: (body) => ({
        url: `/loans/${body.loanId}/payments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.LOANS, API_TAGS.DEVICES, API_TAGS.DASHBOARD],
    }),
  }),
})

export const { useGetLoansQuery, useRecordPaymentMutation } = loansApi
