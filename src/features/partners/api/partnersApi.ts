import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type { Partner, CreatePartnerRequest } from '../types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common'

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'pt_1',
    name: 'North Region Key Logistics',
    contactPerson: 'Aman Verma',
    phone: '9811029384',
    email: 'aman@northlogistics.in',
    role: 'stockist',
    parentName: 'Platform Central Admin',
    state: 'Punjab',
    city: 'Ludhiana',
    allocatedKeys: 8200,
    availableKeys: 1800,
    activeDevices: 6400,
    walletBalance: 1250000,
    status: 'active',
    joinedAt: '2025-11-10T10:00:00Z',
  },
  {
    id: 'pt_2',
    name: 'Delhi NCR Hub Distribution',
    contactPerson: 'Vikram Mehta',
    phone: '9899120934',
    email: 'vikram@delhidist.in',
    role: 'distributor',
    parentName: 'North Region Key Logistics',
    state: 'Delhi',
    city: 'New Delhi',
    allocatedKeys: 4200,
    availableKeys: 900,
    activeDevices: 3300,
    walletBalance: 650000,
    status: 'active',
    joinedAt: '2025-12-05T12:00:00Z',
  },
  {
    id: 'pt_3',
    name: 'Metro Mobiles & Electronics',
    contactPerson: 'Karan Patel',
    phone: '9822019283',
    email: 'karan@metromobiles.com',
    role: 'dealer',
    parentName: 'Delhi NCR Hub Distribution',
    state: 'Delhi',
    city: 'Rohini',
    allocatedKeys: 350,
    availableKeys: 45,
    activeDevices: 305,
    walletBalance: 85000,
    status: 'active',
    joinedAt: '2026-01-12T09:30:00Z',
  },
  {
    id: 'pt_4',
    name: 'Shiv Telecom & Gadgets',
    contactPerson: 'Sanjay Gupta',
    phone: '9845019284',
    email: 'sanjay@shivtelecom.in',
    role: 'dealer',
    parentName: 'Delhi NCR Hub Distribution',
    state: 'Delhi',
    city: 'Janakpuri',
    allocatedKeys: 280,
    availableKeys: 22,
    activeDevices: 258,
    walletBalance: 42000,
    status: 'active',
    joinedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'pt_5',
    name: 'West Coast Distribution Hub',
    contactPerson: 'Deepak Shah',
    phone: '9820019284',
    email: 'deepak@westcoast.in',
    role: 'stockist',
    parentName: 'Platform Central Admin',
    state: 'Maharashtra',
    city: 'Mumbai',
    allocatedKeys: 5400,
    availableKeys: 1200,
    activeDevices: 4200,
    walletBalance: 890000,
    status: 'active',
    joinedAt: '2026-02-01T14:00:00Z',
  },
]

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<ApiResponse<PaginatedResponse<Partner>>, PaginationParams | void>({
      query: (params) => ({
        url: '/partners',
        params: params || {},
      }),
      providesTags: [API_TAGS.PARTNERS],
    }),
    createPartner: builder.mutation<ApiResponse<Partner>, CreatePartnerRequest>({
      query: (body) => ({
        url: '/partners',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.PARTNERS, API_TAGS.DASHBOARD],
    }),
  }),
})

export const { useGetPartnersQuery, useCreatePartnerMutation } = partnersApi
