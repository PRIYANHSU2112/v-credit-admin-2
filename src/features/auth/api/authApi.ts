import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { LoginRequest, LoginResponse } from '../types'
import type { ApiResponse } from '@/types/common'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [API_TAGS.AUTH, API_TAGS.USER],
    }),
    getMe: builder.query<ApiResponse<LoginResponse['user']>, void>({
      query: () => '/auth/me',
      providesTags: [API_TAGS.USER],
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.AUTH, API_TAGS.USER],
    }),
  }),
})

export const { useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi
