import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_CONFIG } from '@/config/app.config'
import { ALL_API_TAGS } from './apiTags'
import type { RootState } from '../store/store'

/**
 * Base RTK Query API Slice
 * All features inject their endpoints into this base API using injectEndpoints.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: APP_CONFIG.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      // 1. Check Redux state
      const token = (getState() as RootState)?.auth?.token || localStorage.getItem(APP_CONFIG.storageKeys.token)

      if (token) {
        // Strip any quotes if stored as JSON
        const cleanToken = token.replace(/^"(.*)"$/, '$1')
        headers.set('Authorization', `Bearer ${cleanToken}`)
      }

      headers.set('Accept', 'application/json')
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ALL_API_TAGS,
  endpoints: () => ({}),
})
