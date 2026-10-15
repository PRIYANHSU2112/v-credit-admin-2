export type LoanStatus = 'current' | 'overdue' | 'settled' | 'defaulted'

export interface LoanAccount {
  id: string
  loanNumber: string
  customerName: string
  customerPhone: string
  deviceModel: string
  imei: string
  dealerName: string
  totalLoanAmount: number
  downPayment: number
  monthlyEmi: number
  totalEmis: number
  paidEmis: number
  nextDueDate: string
  status: LoanStatus
  overdueDays: number
  createdAt: string
}

export interface RecordPaymentRequest {
  loanId: string
  amount: number
  paymentMethod: 'UPI' | 'CASH' | 'NET_BANKING'
  transactionRef?: string
}
