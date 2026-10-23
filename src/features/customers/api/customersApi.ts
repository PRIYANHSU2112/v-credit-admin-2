/**
 * Customers API — RTK Query
 * Endpoints: getEndUsers, getCustomersDirectory, getCustomerById,
 *            sendOtp, verifyAndCreateCustomer, uploadAadhaarKyc, uploadPanKyc,
 *            lockDevice, unlockDevice
 * Mock data removed — backend is single source of truth.
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { EndUserRecord, GetEndUsersParams } from '../types'

export interface EndUsersResponse {
  success: boolean
  data: EndUserRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export interface CustomerDirectoryItem {
  _id: string
  customerName: string
  customerMobileNumber: string
  address: string
  isVerified: boolean
  activeLoans: number
  createdAt: string
  kyc?: {
    aadhaar?: { number?: string; frontPhoto?: string; backPhoto?: string }
    pan?: { number?: string; photo?: string }
    bankPassbook?: { photo?: string }
  }
}

export interface CustomerDirectoryResponse {
  success: boolean
  data: CustomerDirectoryItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export interface DeviceControlRequest {
  imeiNumber?: string
  loanId?: string
  deviceId?: string
}

export interface DeviceControlResponse {
  success: boolean
  message: string
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── End Users / App Users (enterprise scoped) ──────────────────────────
    getEndUsers: builder.query<EndUsersResponse, GetEndUsersParams | void>({
      query: (params) => ({
        url: '/enterprise/users',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.fromDate ? { fromDate: params.fromDate } : {}),
          ...(params?.toDate ? { toDate: params.toDate } : {}),
          ...(params?.dealerId ? { dealerId: params.dealerId } : {}),
        },
      }),
      transformResponse: (raw: any): EndUsersResponse => {
        const list = Array.isArray(raw?.data) ? raw.data : []
        return {
          success: raw?.success ?? true,
          data: list.map((item: any) => ({
            ...item,
            userName: item.name || item.userName || '—',
            userPhone: item.phone || item.userPhone || '—',
            activationDate: item.activatedAt || item.activationDate || '—',
            userFeature: item.device || item.userFeature || 'Android Device',
            keyCode: item.keyId || item.keyCode || '—',
            imei1: item.imei || item.imei1 || '—',
            lockStatus:
              item.lockStatus ||
              (String(item.status || '').toLowerCase().includes('lock') ? 'locked' : 'unlocked'),
          })),
          pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: list.length },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load users',
      }),
      providesTags: [API_TAGS.CUSTOMERS],
    }),

    // ── Customer Directory (KYC customers) ────────────────────────────────
    getCustomersDirectory: builder.query<
      CustomerDirectoryResponse,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: '/customers',
        params: params || {},
      }),
      transformResponse: (raw: any): CustomerDirectoryResponse => {
        const list = Array.isArray(raw?.data) ? raw.data : []
        return {
          success: raw?.success ?? true,
          data: list,
          pagination: raw?.pagination || { currentPage: 1, totalPages: 1, totalItems: list.length },
        }
      },
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load customers',
      }),
      providesTags: [API_TAGS.CUSTOMERS],
    }),

    // ── Get Customer by ID ─────────────────────────────────────────────────
    getCustomerById: builder.query<{ success: boolean; data: CustomerDirectoryItem }, { id: string }>({
      query: ({ id }) => `/customers/${id}`,
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Customer not found',
      }),
      providesTags: [API_TAGS.CUSTOMERS],
    }),

    // ── Send OTP ───────────────────────────────────────────────────────────
    sendCustomerOtp: builder.mutation<
      { success: boolean; otp?: string; message: string },
      { customerName: string; customerMobileNumber: string; address: string; email?: string; alternatePhone?: string }
    >({
      query: (body) => ({
        url: '/customers/send-otp',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'OTP send failed',
      }),
    }),

    // ── Verify OTP & Create Customer ────────────────────────────────────────
    verifyAndCreateCustomer: builder.mutation<
      { success: boolean; data: CustomerDirectoryItem },
      { customerMobileNumber: string; otp: string }
    >({
      query: (body) => ({
        url: '/customers/verify-and-create',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Verification failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS],
    }),

    // ── Upload Aadhaar KYC ─────────────────────────────────────────────────
    uploadAadhaarKyc: builder.mutation<
      { success: boolean },
      { customerId: string; formData: FormData }
    >({
      query: ({ customerId, formData }) => ({
        url: `/customers/${customerId}/kyc/aadhaar`,
        method: 'PUT',
        body: formData,
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type') // let browser set multipart boundary
          return headers
        },
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Aadhaar KYC upload failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS],
    }),

    // ── Upload PAN KYC ─────────────────────────────────────────────────────
    uploadPanKyc: builder.mutation<
      { success: boolean },
      { customerId: string; formData: FormData }
    >({
      query: ({ customerId, formData }) => ({
        url: `/customers/${customerId}/kyc/pan`,
        method: 'PUT',
        body: formData,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'PAN KYC upload failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS],
    }),

    // ── Lock Device (via MDM) ──────────────────────────────────────────────
    lockDevice: builder.mutation<DeviceControlResponse, DeviceControlRequest>({
      query: (body) => ({
        url: '/device/lock',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Lock command failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS, API_TAGS.DEVICES],
    }),

    // ── Unlock Device (via MDM) ────────────────────────────────────────────
    unlockDevice: builder.mutation<DeviceControlResponse, DeviceControlRequest>({
      query: (body) => ({
        url: '/device/unlock',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Unlock command failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS, API_TAGS.DEVICES],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetEndUsersQuery,
  useGetCustomersDirectoryQuery,
  useGetCustomerByIdQuery,
  useSendCustomerOtpMutation,
  useVerifyAndCreateCustomerMutation,
  useUploadAadhaarKycMutation,
  useUploadPanKycMutation,
  useLockDeviceMutation,
  useUnlockDeviceMutation,
} = customersApi
