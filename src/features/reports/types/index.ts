export interface TransferReportItem {
  id: string
  transferId: string
  transactionDate: string
  transferTo: string
  toRole?: string
  toPhone?: string
  toCity?: string
  toEntityCode?: string
  sendBy: string
  fromRole?: string
  fromPhone?: string
  receivedFrom?: string
  receivedPhone?: string
  quantity: number
  keys: number
  noOfKeys?: number
  keyPrice?: number
  status: string
  note: string
  remark?: string
  keyType?: string
  invoiceNo?: string
  gstNumber?: string
}

export interface LowKeyPartnerItem {
  id: string
  entityCode: string
  name: string
  agency: string
  dealerShop?: string
  dealerName?: string
  phone: string
  email: string
  city: string
  state: string
  availableKeys: number
  totalKeys: number
  usedKeys: number
  threshold: number
  parentName?: string
  stockist?: string
  distributor?: string
  superStockiest?: string
  status: string
  lastActive: string
  lastActivation?: string
  lastBillingDate?: string
  lockAccess?: boolean
}

export interface GetTransferReportsParams {
  page?: number
  limit?: number
  search?: string
  fromDate?: string
  toDate?: string
  keyType?: string
  type?: string
  role?: string
}

export interface GetLowKeyReportsParams {
  page?: number
  limit?: number
  search?: string
  threshold?: number
  role?: 'stockist' | 'distributor' | 'dealer'
}

export interface ReportsApiResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    limit?: number
  }
  message?: string
}
