export interface Partner {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  role: 'stockist' | 'distributor' | 'dealer'
  parentName?: string
  parentId?: string
  state: string
  city: string
  allocatedKeys: number
  availableKeys: number
  activeDevices: number
  walletBalance: number
  status: 'active' | 'suspended' | 'pending'
  joinedAt: string
}

export interface CreatePartnerRequest {
  name: string
  contactPerson: string
  phone: string
  email: string
  role: 'stockist' | 'distributor' | 'dealer'
  parentId?: string
  state: string
  city: string
}
