export type LoanStatus = 'current' | 'overdue' | 'settled' | 'defaulted' | 'pending'
export type BackendLoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'
export type DeviceUnlockStatus = 'LOCKED' | 'UNLOCKED'
export type InstallationType = 'New Phone' | 'Old/Running Phone'
export type PaymentFrequency = 'monthly' | 'weekly' | 'daily'

export interface Installment {
  installmentNumber: number
  dueDate: string
  amount: number
  status: 'PENDING' | 'PAID' | 'BOUNCED'
  paidAmount?: number
  paidDate?: string
  bounceCharge?: number
}

export interface LoanAccount {
  id: string
  _id?: string
  loanNumber: string
  customerName: string
  customerPhone: string
  installationType?: InstallationType
  mobileBrand?: string
  mobileModel?: string
  deviceModel: string
  imei: string
  imeiNumber1?: string
  imeiNumber2?: string
  dealerName: string
  dealerPhone?: string
  mobilePrice?: number
  totalLoanAmount: number
  loanAmount?: number
  downPayment: number
  processingFees?: number
  interestRate?: number
  monthlyEmi: number
  emiAmount?: number
  totalEmis: number
  numberOfEMIs?: number
  paidEmis: number
  installmentsPaid?: number
  amountLeft?: number
  frequency?: PaymentFrequency
  firstEmiDate?: string
  nextDueDate: string
  financer?: string
  paymentOptions?: string
  description?: string
  loanStatus?: BackendLoanStatus
  deviceUnlockStatus?: DeviceUnlockStatus
  installments?: Installment[]
  status: LoanStatus
  overdueDays: number
  createdAt: string
}

export interface RecordPaymentRequest {
  loanId: string
  amount: number
  paymentMethod: 'UPI' | 'CASH' | 'NET_BANKING'
  transactionRef?: string
  installmentNumber?: number
  payFull?: boolean
}

export interface CreateCustomerLoanRequest {
  customerId: string
  installationType: InstallationType
  mobileBrand: string
  mobileModel: string
  imeiNumber1: string
  imeiNumber2?: string
  mobilePrice: number
  downPayment?: number
  processingFees?: number
  loanAmount: number
  interestRate?: number
  numberOfEMIs: number
  emiAmount?: number
  frequency?: PaymentFrequency
  firstEmiDate?: string
  financer?: string
  paymentOptions?: string
  description?: string
}
