/**
 * Auth API — RTK Query
 * Endpoints: login, getMe, checkBan, toggleBan, toggleUserDisable
 * Follows optimize.md: transformResponse, transformErrorResponse, providesTags, onQueryStarted
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import { setCredentials, logout } from '../slices/authSlice'
import type { LoginRequest, LoginResponse } from '../types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Login ──────────────────────────────────────────────────────────────
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any): LoginResponse => ({
        user: {
          id: response.data?.id || response.data?._id || '',
          name: response.data?.name || '',
          email: response.data?.email || '',
          phone: response.data?.phone || '',
          role: response.data?.enterpriseRole || response.data?.role || 'dealer',
          parentName: response.data?.parentName || null,
          parentId: response.data?.parentId || null,
          status: response.data?.enterpriseStatus?.toLowerCase() || 'active',
          createdAt: response.data?.createdAt || new Date().toISOString(),
          availableKeys: response.data?.keys || 0,
          entityCode: response.data?.entityCode,
          city: response.data?.city,
          territory: response.data?.territory,
        },
        token: response.data?.token || '',
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Login failed. Check your credentials.',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch {
          // error handled by isError in component
        }
      },
    }),

    // ── Get Session Profile /enterprise/me ──────────────────────────────────
    getMe: builder.query<LoginResponse['user'], void>({
      query: () => '/enterprise/me',
      transformResponse: (response: any): LoginResponse['user'] => ({
        id: response.data?.id || response.data?._id || '',
        name: response.data?.name || '',
        email: response.data?.email || '',
        phone: response.data?.phone || '',
        role: response.data?.enterpriseRole || 'dealer',
        parentName: response.data?.parentName || null,
        parentId: response.data?.parentId || null,
        status: response.data?.enterpriseStatus?.toLowerCase() || 'active',
        createdAt: response.data?.createdAt || '',
        availableKeys: response.data?.keys || 0,
        entityCode: response.data?.entityCode,
        city: response.data?.city,
        territory: response.data?.territory,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Failed to load profile',
      }),
      providesTags: [API_TAGS.AUTH],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err: any) {
          // Auto-logout on 401 (expired token)
          if (err?.error?.status === 401) {
            dispatch(logout())
          }
        }
      },
    }),

    // ── Check Ban Status ────────────────────────────────────────────────────
    checkBan: builder.mutation<
      { found: boolean; isBanned: boolean; isDisabled: boolean; message: string; name?: string },
      { phone: string }
    >({
      query: (body) => ({
        url: '/auth/check-ban',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => ({
        found: response.found ?? false,
        isBanned: response.isBanned ?? false,
        isDisabled: response.isDisabled ?? false,
        message: response.message || '',
        name: response.name,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Check ban failed',
      }),
    }),

    // ── Toggle Ban by Phone ─────────────────────────────────────────────────
    toggleBan: builder.mutation<
      { success: boolean; message: string },
      { phone: string; isBanned: boolean }
    >({
      query: (body) => ({
        url: '/auth/toggle-ban',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Toggle ban failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS, API_TAGS.USER],
    }),

    // ── Toggle User Disable ─────────────────────────────────────────────────
    toggleUserDisable: builder.mutation<
      { success: boolean; message: string },
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/user/disable/${userId}`,
        method: 'PATCH',
      }),
      transformErrorResponse: (response: any) => ({
        status: response.status,
        message: response.data?.message || 'Toggle disable failed',
      }),
      invalidatesTags: [API_TAGS.CUSTOMERS, API_TAGS.USER],
    }),
  }),
  overrideExisting: true,
})

export const {
  useLoginMutation,
  useGetMeQuery,
  useCheckBanMutation,
  useToggleBanMutation,
  useToggleUserDisableMutation,
} = authApi
