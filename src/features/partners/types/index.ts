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
  agencyName?: string
  email: string
  phone?: string
  city: string
  state?: string
  territory?: string
  status: string
  keys: number
  available: number
  stockist?: string
  distributor?: string
  dealers?: number
  users?: number
  activations?: number
  revenue?: number
  lastActive?: string
  onboarded?: string
  createdAt?: string
}
