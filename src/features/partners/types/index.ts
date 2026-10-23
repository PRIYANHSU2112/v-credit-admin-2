export type EnterpriseRole = 'super_admin' | 'stockist' | 'distributor' | 'dealer'

export interface Partner {
  id: string
  _id?: string
  name: string
  entityCode?: string
  contactPerson: string
  phone: string
  email: string
  role: 'stockist' | 'distributor' | 'dealer'
  enterpriseRole?: EnterpriseRole
  parentName?: string
  parentId?: string
  stockist?: string
  distributor?: string
  state?: string
  territory?: string
  city: string
  gst?: string
  allocatedKeys?: number
  availableKeys?: number
  keys?: number
  available?: number
  activeDevices?: number
  dealersCount?: number
  usersCount?: number
  walletBalance?: number
  status: 'active' | 'suspended' | 'pending' | 'Active' | 'Inactive'
  joinedAt: string
  createdAt?: string
  lastActive?: string
}

export interface CreatePartnerRequest {
  name: string
  agencyName?: string
  email: string
  phone: string
  contactPerson?: string
  password?: string
  role?: 'stockist' | 'distributor' | 'dealer'
  enterpriseRole?: EnterpriseRole
  parentId?: string
  parentStockistId?: string
  parentName?: string
  territory?: string
  state?: string
  city: string
  district?: string
  pincode?: string
  address?: string
  gst?: string
  gstNumber?: string
  initialKeys?: number | string
  status?: 'Active' | 'Inactive' | string
}

export interface HierarchyPartnerRow {
  id: string
  _id: string
  name: string
  entityCode?: string
  parentName?: string
  agencyName?: string
  email: string
  phone?: string
  city: string
  state?: string
  territory?: string
  status: string
  keys: number
  available: number
  availableKeys?: number
  allocatedKeys?: number
  activeDevices?: number
  walletBalance?: number
  role?: string
  joinedAt?: string
  stockist?: string
  distributor?: string
  distributors?: number
  dealers?: number
  users?: number
  activations?: number
  revenue?: number
  gst?: string
  lastActive?: string
  onboarded?: string
  createdAt?: string
}

export interface DistributorRecord {
  id: string
  _id?: string
  entityCode?: string
  agency: string
  name?: string
  phone: string
  email?: string
  stockist?: string
  superStockiest?: string
  city: string
  state: string
  territory?: string
  lastBillingDate: string
  remark?: string
  availableKeys: number
  available?: number
  usedKeys: number
  totalKeys: number
  keys?: number
  iphoneKeys: number
  devices?: number
  enterpriseRole?: 'distributor'
  status?: 'active' | 'inactive' | string
  keyBalance?: number
}

export interface FollowupRemark {
  id?: string
  remarkNo?: number
  remark: string
  createdDate?: string
  date?: string
  by?: string
}

export interface DealerRecord {
  id: string
  _id?: string
  entityCode?: string
  dealerShop: string
  name?: string
  dealerName?: string
  phone: string
  email?: string
  lockScreenNumber?: string
  password?: string
  dealerCode?: string
  createDate?: string
  lastActivation: string
  distributor: string
  superStockiest?: string
  national?: string
  gstNumber?: string
  gst?: string
  address?: string
  city: string
  district?: string
  state: string
  territory?: string
  pincode?: string
  lastBillingDate: string
  availableKeys: number
  available?: number
  totalKeys: number
  keys?: number
  remark?: string
  lockAccess: boolean
  enterpriseRole?: 'dealer'
  status?: string
  document1?: string
  document2?: string
  followups?: FollowupRemark[]
  deviceCount?: number
  keyBalance?: number
}

