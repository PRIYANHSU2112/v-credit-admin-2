/**
 * Loans API — RTK Query
 * Endpoints: getAllLoans, getLoanById, recordPayment, lockDevice, unlockDevice, markBounce
 * Mock data removed — backend /api/customerLoan is single source of truth.
 * Follows optimize.md: server-side pagination, transformResponse, providesTags/invalidatesTags
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { LoanAccount, RecordPaymentRequest } from '../types'

export interface LoansQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  deviceFilter?: string
}

export interface LoansResponse {
  success: boolean
  data: LoanAccount[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

/** Normalise raw backend loan document → LoanAccount shape used by LoansPage */
function normaliseLoan(raw: any): LoanAccount {
  const installments = Array.isArray(raw.installments) ? raw.installments : []
  const paid = installments.filter((i: any) => i.status === 'PAID').length
  const pending = installments.find((i: any) => i.status === 'PENDING' || i.status === 'OVERDUE')
  const isOverdue = installments.some((i: any) => i.status === 'OVERDUE')
  const isClosed = raw.loanStatus === 'CLOSED'

  return {
    id: raw._id || raw.id,
    _id: raw._id || raw.id,
    loanNumber: raw.loanNumber || raw._id?.slice(-8)?.toUpperCase() || 'LN-UNKNOWN',
    customerName: raw.customerId?.customerName || raw.customerName || '—',
    customerPhone: raw.customerId?.customerMobileNumber || raw.customerPhone || '—',
    installationType: raw.installationType || 'New Phone',
    mobileBrand: raw.mobileBrand || '',
    mobileModel: raw.mobileModel || '',
    deviceModel: `${raw.mobileBrand || ''} ${raw.mobileModel || ''}`.trim(),
    imei: raw.imeiNumber1 || raw.imei || '—',
    imeiNumber1: raw.imeiNumber1 || '',
    dealerName: raw.createdBy?.name || raw.shopName || '—',
    dealerPhone: raw.createdBy?.phone || '',
    mobilePrice: raw.mobilePrice || 0,
    totalLoanAmount: raw.loanAmount || 0,
    loanAmount: raw.loanAmount || 0,
    downPayment: raw.downPayment || 0,
    processingFees: raw.processingFees || 0,
    monthlyEmi: raw.emiAmount || 0,
    emiAmount: raw.emiAmount || 0,
    totalEmis: raw.numberOfEMIs || 6,
    numberOfEMIs: raw.numberOfEMIs || 6,
    paidEmis: paid,
    installmentsPaid: raw.installmentsPaid ?? paid,
    amountLeft: raw.amountLeft ?? 0,
    frequency: raw.frequency || 'monthly',
    firstEmiDate: raw.firstEmiDate || raw.emiStartDate || '',
    nextDueDate: pending?.dueDate || '',
    financer: raw.financer || 'admin',
    paymentOptions: raw.paymentOptions || 'upi',
    loanStatus: raw.loanStatus || 'APPROVED',
    deviceUnlockStatus: raw.deviceUnlockStatus || 'UNLOCKED',
    status: isClosed ? 'settled' : isOverdue ? 'overdue' : 'current',
    overdueDays: isOverdue ? (pending ? Math.max(0, Math.floor((Date.now() - new Date(pending.dueDate).getTime()) / 86400000)) : 0) : 0,
    createdAt: raw.createdAt || '',
    installments,
  }
}

export const loansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Get All Loans (admin scoped, server-side pagination) ────────────────
    getLoans: builder.query<LoansResponse, LoansQueryParams | void>({
      query: (params) => ({
        url: '/customerLoan',
        params: params
          ? {
              page: params.page || 1,
              limit: params.limit || 10,
              ...(params.search ? { search: params.search } : {}),
              ...(params.status ? { status: params.status } : {}),
            }
          : {},
      }),
      transformResponse: (raw: any): LoansResponse => {
        const list = Array.isArray(raw?.data) ? raw.data : []
        return {
          success: raw?.success ?? true,
          data: list.map(normaliseLoan),
          pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: list.length },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load loans',
      }),
      providesTags: [API_TAGS.LOANS],
    }),

    // ── Get Loans by Customer ID ───────────────────────────────────────────
    getLoansByCustomer: builder.query<LoansResponse, { customerId: string }>({
      query: ({ customerId }) => `/customerLoan/${customerId}`,
      transformResponse: (raw: any): LoansResponse => {
        const list = Array.isArray(raw?.data) ? raw.data : []
        return {
          success: raw?.success ?? true,
          data: list.map(normaliseLoan),
          pagination: { currentPage: 1, totalPages: 1, totalItems: list.length },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load customer loans',
      }),
      providesTags: [API_TAGS.LOANS],
    }),

    // ── Record Full Payment ─────────────────────────────────────────────────
    recordPayment: builder.mutation<
      { success: boolean; message: string },
      RecordPaymentRequest & { loanId: string }
    >({
      query: ({ loanId, ...body }) => ({
        url: `/customerLoan/pay/${loanId}`,
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Payment recording failed',
      }),
      invalidatesTags: [API_TAGS.LOANS, API_TAGS.DEVICES, API_TAGS.DASHBOARD],
    }),

    // ── Lock Device ─────────────────────────────────────────────────────────
    lockDeviceByLoan: builder.mutation<{ success: boolean; message: string }, { loanId: string }>({
      query: ({ loanId }) => ({
        url: `/customerLoan/lock/${loanId}`,
        method: 'POST',
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Lock command failed',
      }),
      invalidatesTags: [API_TAGS.LOANS, API_TAGS.DEVICES],
    }),

    // ── Unlock Device ───────────────────────────────────────────────────────
    unlockDeviceByLoan: builder.mutation<{ success: boolean; message: string }, { loanId: string }>({
      query: ({ loanId }) => ({
        url: `/customerLoan/unlock/${loanId}`,
        method: 'POST',
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Unlock command failed',
      }),
      invalidatesTags: [API_TAGS.LOANS, API_TAGS.DEVICES],
    }),

    // ── Mark Auto-Debit Bounce ──────────────────────────────────────────────
    markBounce: builder.mutation<{ success: boolean; message: string }, { loanId: string; bounceCharge?: number }>({
      query: ({ loanId, bounceCharge }) => ({
        url: `/customerLoan/bounce/${loanId}`,
        method: 'POST',
        body: { bounceCharge: bounceCharge || 400 },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Bounce mark failed',
      }),
      invalidatesTags: [API_TAGS.LOANS],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetLoansQuery,
  useGetLoansByCustomerQuery,
  useRecordPaymentMutation,
  useLockDeviceByLoanMutation,
  useUnlockDeviceByLoanMutation,
  useMarkBounceMutation,
} = loansApi
