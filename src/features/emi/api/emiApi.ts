import { baseApi } from '@/app/api/baseApi'
import { API_TAGS } from '@/app/api/apiTags'
import type {
  EmiRecord,
  RecordFullPaymentPayload,
  CreateEmiPlanPayload,
  EmiReceiptData,
  EmiKpiMetrics,
} from '../types'
import type { ApiResponse } from '@/types/common'

export const FALLBACK_EMI_RECORDS: EmiRecord[] = [
  {
    id: 'emi_1',
    _id: '6ad8a863c900e605b334e85b',
    loanNumber: 'LN-904101',
    agreementId: 'AGR-2026-9041',
    customerName: 'Aarav Sharma',
    customerPhone: '9811001001',
    dealerId: '6ad85f4c43c9d5bad6f4d458',
    dealerName: 'Apex Phone Gallery',
    dealerPhone: '9822019283',
    mobileBrand: 'Samsung',
    mobileModel: 'Galaxy A15 5G',
    productName: 'Samsung Galaxy A15 5G',
    imeiNumber1: '864501041234567',
    installationType: 'New Phone',
    mobilePrice: 18500,
    downPayment: 3500,
    loanAmount: 15000,
    emiAmount: 2500,
    numberOfEMIs: 6,
    totalEmis: 6,
    installmentsPaid: 2,
    paidEmis: 2,
    amountPaid: 8500,
    amountLeft: 10000,
    firstEmiDate: '2026-02-10T00:00:00.000Z',
    nextDueDate: '2026-04-10T00:00:00.000Z',
    frequency: 'monthly',
    loanStatus: 'APPROVED',
    deviceUnlockStatus: 'UNLOCKED',
    statusCategory: 'upcoming',
    createdAt: '2026-01-10T10:00:00.000Z',
    installments: [
      { installmentNumber: 1, dueDate: '2026-02-10T00:00:00.000Z', amount: 2500, status: 'PAID', paidAmount: 2500, paidDate: '2026-02-09T10:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 2, dueDate: '2026-03-10T00:00:00.000Z', amount: 2500, status: 'PAID', paidAmount: 2500, paidDate: '2026-03-08T11:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 3, dueDate: '2026-04-10T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 4, dueDate: '2026-05-10T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 5, dueDate: '2026-06-10T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 6, dueDate: '2026-07-10T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
    ],
  },
  {
    id: 'emi_2',
    _id: '6ad8a863c900e605b334e85c',
    loanNumber: 'LN-881202',
    agreementId: 'AGR-2026-8812',
    customerName: 'Priya Verma',
    customerPhone: '9811001002',
    dealerId: '6ad85f4c43c9d5bad6f4d45a',
    dealerName: 'Karol Bagh Mobile Hub',
    dealerPhone: '9811234567',
    mobileBrand: 'Xiaomi',
    mobileModel: 'Redmi Note 13 5G',
    productName: 'Xiaomi Redmi Note 13 5G',
    imeiNumber1: '358921098234120',
    installationType: 'New Phone',
    mobilePrice: 17999,
    downPayment: 2999,
    loanAmount: 15000,
    emiAmount: 2500,
    numberOfEMIs: 6,
    totalEmis: 6,
    installmentsPaid: 1,
    paidEmis: 1,
    amountPaid: 5499,
    amountLeft: 12500,
    firstEmiDate: '2026-01-15T00:00:00.000Z',
    nextDueDate: '2026-03-15T00:00:00.000Z',
    frequency: 'monthly',
    loanStatus: 'APPROVED',
    deviceUnlockStatus: 'LOCKED',
    statusCategory: 'overdue',
    overdueDays: 12,
    createdAt: '2026-01-15T12:00:00.000Z',
    installments: [
      { installmentNumber: 1, dueDate: '2026-02-15T00:00:00.000Z', amount: 2500, status: 'PAID', paidAmount: 2500, paidDate: '2026-02-14T15:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 2, dueDate: '2026-03-15T00:00:00.000Z', amount: 2500, status: 'OVERDUE', paidAmount: 0, lateFee: 600, remarks: '12 days overdue' },
      { installmentNumber: 3, dueDate: '2026-04-15T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 4, dueDate: '2026-05-15T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 5, dueDate: '2026-06-15T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 6, dueDate: '2026-07-15T00:00:00.000Z', amount: 2500, status: 'PENDING', paidAmount: 0 },
    ],
  },
  {
    id: 'emi_3',
    _id: '6ad8a863c900e605b334e85d',
    loanNumber: 'LN-773403',
    agreementId: 'AGR-2026-7734',
    customerName: 'Rohan Gupta',
    customerPhone: '9811001003',
    dealerId: '6ad85f4c43c9d5bad6f4d458',
    dealerName: 'Apex Phone Gallery',
    dealerPhone: '9822019283',
    mobileBrand: 'Vivo',
    mobileModel: 'Vivo Y28 5G',
    productName: 'Vivo Y28 5G',
    imeiNumber1: '869012049182371',
    installationType: 'Old/Running Phone',
    mobilePrice: 15499,
    downPayment: 2499,
    loanAmount: 13000,
    emiAmount: 2166,
    numberOfEMIs: 6,
    totalEmis: 6,
    installmentsPaid: 6,
    paidEmis: 6,
    amountPaid: 15499,
    amountLeft: 0,
    firstEmiDate: '2025-09-15T00:00:00.000Z',
    nextDueDate: '2026-03-15T00:00:00.000Z',
    frequency: 'monthly',
    loanStatus: 'CLOSED',
    deviceUnlockStatus: 'UNLOCKED',
    statusCategory: 'paid',
    createdAt: '2025-09-15T14:00:00.000Z',
    installments: [
      { installmentNumber: 1, dueDate: '2025-10-15T00:00:00.000Z', amount: 2166, status: 'PAID', paidAmount: 2166, paidDate: '2025-10-14T11:00:00.000Z', paymentMethod: 'cash' },
      { installmentNumber: 2, dueDate: '2025-11-15T00:00:00.000Z', amount: 2166, status: 'PAID', paidAmount: 2166, paidDate: '2025-11-13T12:00:00.000Z', paymentMethod: 'cash' },
      { installmentNumber: 3, dueDate: '2025-12-15T00:00:00.000Z', amount: 2166, status: 'PAID', paidAmount: 2166, paidDate: '2025-12-15T09:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 4, dueDate: '2026-01-15T00:00:00.000Z', amount: 2166, status: 'PAID', paidAmount: 2166, paidDate: '2026-01-14T14:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 5, dueDate: '2026-02-15T00:00:00.000Z', amount: 2166, status: 'PAID', paidAmount: 2166, paidDate: '2026-02-15T10:00:00.000Z', paymentMethod: 'cash' },
      { installmentNumber: 6, dueDate: '2026-03-15T00:00:00.000Z', amount: 2170, status: 'PAID', paidAmount: 2170, paidDate: '2026-03-14T16:00:00.000Z', paymentMethod: 'upi' },
    ],
  },
  {
    id: 'emi_4',
    _id: '6ad8a863c900e605b334e85e',
    loanNumber: 'LN-664104',
    agreementId: 'AGR-2026-6641',
    customerName: 'Neha Patel',
    customerPhone: '9811001004',
    dealerId: '6ad85f4c43c9d5bad6f4d45d',
    dealerName: 'Noida Sector 18 Cellular',
    dealerPhone: '9899120934',
    mobileBrand: 'Realme',
    mobileModel: 'Realme 12 Pro 5G',
    productName: 'Realme 12 Pro 5G',
    imeiNumber1: '863291048192038',
    installationType: 'New Phone',
    mobilePrice: 25999,
    downPayment: 5999,
    loanAmount: 20000,
    emiAmount: 3333,
    numberOfEMIs: 6,
    totalEmis: 6,
    installmentsPaid: 1,
    paidEmis: 1,
    amountPaid: 9332,
    amountLeft: 16667,
    firstEmiDate: '2026-02-25T00:00:00.000Z',
    nextDueDate: '2026-03-27T00:00:00.000Z',
    frequency: 'monthly',
    loanStatus: 'APPROVED',
    deviceUnlockStatus: 'UNLOCKED',
    statusCategory: 'due',
    createdAt: '2026-01-25T11:30:00.000Z',
    installments: [
      { installmentNumber: 1, dueDate: '2026-02-25T00:00:00.000Z', amount: 3333, status: 'PAID', paidAmount: 3333, paidDate: '2026-02-24T18:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 2, dueDate: '2026-03-27T00:00:00.000Z', amount: 3333, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 3, dueDate: '2026-04-27T00:00:00.000Z', amount: 3333, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 4, dueDate: '2026-05-27T00:00:00.000Z', amount: 3333, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 5, dueDate: '2026-06-27T00:00:00.000Z', amount: 3333, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 6, dueDate: '2026-07-27T00:00:00.000Z', amount: 3335, status: 'PENDING', paidAmount: 0 },
    ],
  },
  {
    id: 'emi_5',
    _id: '6ad8a863c900e605b334e85f',
    loanNumber: 'LN-552105',
    agreementId: 'AGR-2026-5521',
    customerName: 'Vikram Singh',
    customerPhone: '9811001005',
    dealerId: '6ad85f4c43c9d5bad6f4d462',
    dealerName: 'Betul City Mobiles',
    dealerPhone: '9826012345',
    mobileBrand: 'OnePlus',
    mobileModel: 'Nord CE 4 Lite',
    productName: 'OnePlus Nord CE 4 Lite',
    imeiNumber1: '869910293847561',
    installationType: 'New Phone',
    mobilePrice: 19999,
    downPayment: 3999,
    loanAmount: 16000,
    emiAmount: 2666,
    numberOfEMIs: 6,
    totalEmis: 6,
    installmentsPaid: 2,
    paidEmis: 2,
    amountPaid: 9331,
    amountLeft: 10668,
    firstEmiDate: '2026-01-20T00:00:00.000Z',
    nextDueDate: '2026-04-20T00:00:00.000Z',
    frequency: 'monthly',
    loanStatus: 'APPROVED',
    deviceUnlockStatus: 'UNLOCKED',
    statusCategory: 'upcoming',
    createdAt: '2026-01-20T10:00:00.000Z',
    installments: [
      { installmentNumber: 1, dueDate: '2026-02-20T00:00:00.000Z', amount: 2666, status: 'PAID', paidAmount: 2666, paidDate: '2026-02-19T14:00:00.000Z', paymentMethod: 'cash' },
      { installmentNumber: 2, dueDate: '2026-03-20T00:00:00.000Z', amount: 2666, status: 'PAID', paidAmount: 2666, paidDate: '2026-03-19T16:00:00.000Z', paymentMethod: 'upi' },
      { installmentNumber: 3, dueDate: '2026-04-20T00:00:00.000Z', amount: 2666, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 4, dueDate: '2026-05-20T00:00:00.000Z', amount: 2666, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 5, dueDate: '2026-06-20T00:00:00.000Z', amount: 2666, status: 'PENDING', paidAmount: 0 },
      { installmentNumber: 6, dueDate: '2026-07-20T00:00:00.000Z', amount: 2670, status: 'PENDING', paidAmount: 0 },
    ],
  },
]

export function calculateEmiKpiMetrics(records: EmiRecord[]): EmiKpiMetrics {
  const now = new Date()
  let totalEmiDue = 0
  let upcomingEmi = 0
  let overdueEmi = 0
  let collectedAmount = 0
  let outstandingBalance = 0
  let activeEmiPlans = 0
  let overdueCount = 0
  let dueSoonCount = 0

  records.forEach((rec) => {
    if (rec.loanStatus === 'APPROVED') {
      activeEmiPlans += 1
    }
    collectedAmount += rec.amountPaid || 0
    outstandingBalance += rec.amountLeft || 0

    const installments = rec.installments || []
    installments.forEach((inst) => {
      if (inst.status === 'PAID') return

      const dDate = new Date(inst.dueDate)
      const diffDays = Math.ceil((dDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      const totalInstDue = (inst.amount || 0) + (inst.lateFee || 0) + (inst.bounceFee || 0) - (inst.paidAmount || 0)

      if (inst.status === 'OVERDUE' || diffDays < 0) {
        overdueEmi += totalInstDue
        overdueCount += 1
      } else if (diffDays <= 5) {
        totalEmiDue += totalInstDue
        dueSoonCount += 1
      } else {
        upcomingEmi += totalInstDue
      }
    })
  })

  return {
    totalEmiDue,
    upcomingEmi,
    overdueEmi,
    collectedAmount,
    outstandingBalance,
    activeEmiPlans,
    overdueCount,
    dueSoonCount,
  }
}

export const emiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmiLoans: builder.query<
      { data: EmiRecord[]; pagination?: { totalLoans: number; totalPages: number; currentPage: number } },
      { page?: number; limit?: number; search?: string; dealerId?: string; status?: string } | void
    >({
      query: (params) => ({
        url: '/customerLoan',
        params: params || {},
      }),
      providesTags: [API_TAGS.LOANS, API_TAGS.CUSTOMERS],
      transformResponse: (response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          const transformed = response.data.map((l: any): EmiRecord => {
            const cust = l.customerId || {}
            const dealer = l.dealer || l.createdBy || {}
            const installments = l.installments || []
            const paidCount = installments.filter((i: any) => i.status === 'PAID').length
            const isClosed = l.loanStatus === 'CLOSED' || paidCount >= (l.numberOfEMIs || installments.length)
            
            // Check overdue
            const now = new Date()
            const hasOverdue = installments.some(
              (i: any) => i.status === 'OVERDUE' || (i.status === 'PENDING' && new Date(i.dueDate) < now)
            )

            let statusCategory: EmiRecord['statusCategory'] = 'upcoming'
            if (isClosed) {
              statusCategory = 'paid'
            } else if (hasOverdue || l.deviceUnlockStatus === 'LOCKED') {
              statusCategory = 'overdue'
            } else {
              const nextPending = installments.find((i: any) => i.status === 'PENDING')
              if (nextPending) {
                const diff = (new Date(nextPending.dueDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
                if (diff <= 5) statusCategory = 'due'
              }
            }

            return {
              id: l._id || l.id,
              _id: l._id,
              loanNumber: l.imeiNumber1 ? `LN-${l.imeiNumber1.slice(-6)}` : `LN-${(l._id || '').slice(-6).toUpperCase()}`,
              agreementId: `AGR-2026-${(l._id || '').slice(-4).toUpperCase()}`,
              customerId: cust._id,
              customerName: cust.customerName || l.customerName || 'Customer',
              customerPhone: cust.customerMobileNumber || l.customerPhone || '',
              dealerId: dealer._id || l.createdBy,
              dealerName: dealer.name || l.shopName || 'Retail Dealer',
              dealerPhone: dealer.phone || '',
              mobileBrand: l.mobileBrand || 'Smartphone',
              mobileModel: l.mobileModel || '',
              productName: `${l.mobileBrand || ''} ${l.mobileModel || ''}`.trim() || 'Android Device',
              imeiNumber1: l.imeiNumber1 || '',
              imeiNumber2: l.imeiNumber2 || '',
              installationType: l.installationType || 'New Phone',
              mobilePrice: l.mobilePrice || 0,
              downPayment: l.downPayment || 0,
              loanAmount: l.loanAmount || 0,
              emiAmount: l.emiAmount || 0,
              numberOfEMIs: l.numberOfEMIs || installments.length || 6,
              totalEmis: l.numberOfEMIs || installments.length || 6,
              installmentsPaid: paidCount,
              paidEmis: paidCount,
              amountPaid: l.amountPaid || 0,
              amountLeft: l.amountLeft || 0,
              firstEmiDate: l.firstEmiDate || l.createdAt || new Date().toISOString(),
              nextDueDate: l.nextEmiDetails?.dueDate || l.nextDueDate || new Date().toISOString(),
              frequency: l.frequency || 'monthly',
              loanStatus: isClosed ? 'CLOSED' : (l.loanStatus || 'APPROVED'),
              deviceUnlockStatus: l.deviceUnlockStatus || 'UNLOCKED',
              installments: installments,
              createdAt: l.createdAt || new Date().toISOString(),
              statusCategory,
            }
          })
          return { data: transformed, pagination: response.pagination }
        }
        return { data: FALLBACK_EMI_RECORDS }
      },
    }),

    recordFullPayment: builder.mutation<
      ApiResponse<{ loan: EmiRecord; receipt: EmiReceiptData }>,
      RecordFullPaymentPayload
    >({
      query: (body) => ({
        url: `/customerLoan/pay/${body.loanId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.LOANS, API_TAGS.DASHBOARD],
    }),

    createEmiPlan: builder.mutation<ApiResponse<any>, CreateEmiPlanPayload>({
      query: (body) => ({
        url: `/customerLoan/${body.customerId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.LOANS, API_TAGS.DASHBOARD],
    }),

    lockEmiDevice: builder.mutation<ApiResponse<any>, string>({
      query: (loanId) => ({
        url: `/customerLoan/lock/${loanId}`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.LOANS],
    }),

    unlockEmiDevice: builder.mutation<ApiResponse<any>, string>({
      query: (loanId) => ({
        url: `/customerLoan/unlock/${loanId}`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.LOANS],
    }),
  }),
})

export const {
  useGetEmiLoansQuery,
  useRecordFullPaymentMutation,
  useCreateEmiPlanMutation,
  useLockEmiDeviceMutation,
  useUnlockEmiDeviceMutation,
} = emiApi
