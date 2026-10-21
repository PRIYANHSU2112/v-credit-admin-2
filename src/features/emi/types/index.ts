/**
 * EMI Safe Types & Enterprise Data Contracts
 */

export type EmiInstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'BOUNCED'
export type EmiPlanStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'CLOSED'
export type DeviceSecurityStatus = 'LOCKED' | 'UNLOCKED'
export type EmiPaymentMethod = 'upi' | 'cash' | 'autopay/autodebit' | 'net_banking'

export interface EmiInstallment {
  _id?: string
  installmentNumber: number
  dueDate: string
  amount: number
  status: EmiInstallmentStatus
  paidAmount?: number
  paidDate?: string | null
  paymentMethod?: EmiPaymentMethod | string | null
  lateFee?: number
  bounceFee?: number
  remarks?: string | null
}

export interface EmiCustomer {
  _id: string
  customerName: string
  customerMobileNumber: string
  email?: string
  address?: string
}

export interface EmiDealer {
  _id: string
  name: string
  email?: string
  phone?: string
  agencyName?: string
}

export interface EmiRecord {
  id: string
  _id: string
  loanNumber: string
  agreementId: string
  customerId?: EmiCustomer | string
  customerName: string
  customerPhone: string
  dealerId?: string
  dealerName: string
  dealerPhone?: string
  mobileBrand: string
  mobileModel: string
  productName: string
  imeiNumber1: string
  imeiNumber2?: string
  installationType: 'New Phone' | 'Old/Running Phone'
  mobilePrice: number
  downPayment: number
  loanAmount: number
  emiAmount: number
  numberOfEMIs: number
  totalEmis: number
  installmentsPaid: number
  paidEmis: number
  amountPaid: number
  amountLeft: number
  firstEmiDate: string
  nextDueDate: string
  frequency: 'monthly' | 'weekly' | 'daily'
  loanStatus: EmiPlanStatus
  deviceUnlockStatus: DeviceSecurityStatus
  installments: EmiInstallment[]
  createdAt: string
  overdueDays?: number
  statusCategory: 'upcoming' | 'due' | 'overdue' | 'paid'
}

export interface EmiKpiMetrics {
  totalEmiDue: number
  upcomingEmi: number
  overdueEmi: number
  collectedAmount: number
  outstandingBalance: number
  activeEmiPlans: number
  overdueCount: number
  dueSoonCount: number
}

export interface RecordFullPaymentPayload {
  loanId: string
  installmentNumber?: number
  amount: number // Must match full installment due
  paymentMethod: 'upi' | 'cash' | 'autopay/autodebit' | 'net_banking'
  transactionRef?: string
  remarks?: string
}

export interface CreateEmiPlanPayload {
  customerId: string
  customerName: string
  customerPhone: string
  mobileBrand: string
  mobileModel: string
  imeiNumber1: string
  imeiNumber2?: string
  mobilePrice: number
  downPayment: number
  loanAmount: number
  numberOfEMIs: number
  emiAmount: number
  firstEmiDate: string
  installationType: 'New Phone' | 'Old/Running Phone'
  paymentOptions?: string
  financer?: string
}

export interface EmiReceiptData {
  receiptNumber: string
  loanId: string
  loanNumber: string
  agreementId: string
  customerName: string
  customerPhone: string
  dealerName: string
  dealerPhone?: string
  productName: string
  imei: string
  installmentNumber: number
  totalInstallments: number
  amountPaid: number
  principalPaid: number
  lateFeePaid: number
  paymentMethod: string
  transactionRef: string
  paidDate: string
  remainingBalance: number
  nextDueDate?: string
  deviceUnlockStatus: DeviceSecurityStatus
}
