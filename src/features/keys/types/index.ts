export type KeyStatus = 'available' | 'allocated' | 'used' | 'reclaimed' | 'expired'

export interface LicenseKey {
  id: string
  keyCode: string
  batchNumber: string
  status: KeyStatus
  holderTier: 'super_admin' | 'stockist' | 'distributor' | 'dealer'
  holderName: string
  assignedCustomer?: string
  assignedImei?: string
  generatedAt: string
  activatedAt?: string
}

export interface GenerateKeysRequest {
  quantity: number
  targetTier: 'stockist' | 'distributor' | 'dealer'
  targetPartnerId: string
  notes?: string
}

export interface TransferKeysRequest {
  quantity: number
  sourcePartnerId?: string
  targetPartnerId: string
  targetTier: 'stockist' | 'distributor' | 'dealer'
}
