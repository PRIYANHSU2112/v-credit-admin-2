/**
 * Master Data & File Upload API — RTK Query
 * Handles States, Cities, Mobile Brands, Mobile Models, and Multipart File Uploads.
 * Adheres strictly to Docs/optmize.md.
 */
import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { ApiResponse } from '@/types/common'

export interface StateItem {
  _id: string
  name?: string
  stateName?: string
  code?: string
}

export interface CityItem {
  _id: string
  cityName?: string
  name?: string
  stateId?: string
}

export interface MobileBrandItem {
  _id: string
  brandName?: string
  name?: string
}

export interface MobileModelItem {
  _id: string
  modelName?: string
  name?: string
  brandId?: string
}

export interface UploadFileResponse {
  success: boolean
  message: string
  filePath: string
  filename: string
}

export const masterDataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Get All States ──
    getStates: builder.query<StateItem[], void>({
      query: () => '/states',
      transformResponse: (raw: any): StateItem[] => {
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      },
    }),

    // ── Get Cities by State ID ──
    getCitiesByState: builder.query<CityItem[], string>({
      query: (stateId) => `/cities/state/${stateId}`,
      transformResponse: (raw: any): CityItem[] => {
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      },
    }),

    // ── Get All Cities ──
    getAllCities: builder.query<CityItem[], void>({
      query: () => '/cities',
      transformResponse: (raw: any): CityItem[] => {
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      },
    }),

    // ── Get All Mobile Brands ──
    getMobileBrands: builder.query<MobileBrandItem[], void>({
      query: () => '/mobile-brands',
      transformResponse: (raw: any): MobileBrandItem[] => {
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      },
    }),

    // ── Get All Mobile Models ──
    getMobileModels: builder.query<MobileModelItem[], void>({
      query: () => '/mobile-models',
      transformResponse: (raw: any): MobileModelItem[] => {
        if (Array.isArray(raw)) return raw
        if (Array.isArray(raw?.data)) return raw.data
        return []
      },
    }),

    // ── Upload Single File (Linode / DigitalOcean Spaces / Disk) ──
    uploadFile: builder.mutation<UploadFileResponse, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type') // Let browser set multipart boundary
          return headers
        },
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetStatesQuery,
  useGetCitiesByStateQuery,
  useGetAllCitiesQuery,
  useGetMobileBrandsQuery,
  useGetMobileModelsQuery,
  useUploadFileMutation,
} = masterDataApi
