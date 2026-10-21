export type KeyStatus =
  | 'available'
  | 'allocated'
  | 'used'
  | 'reclaimed'
  | 'expired'
  | 'Generated'
  | 'Allocated'
  | 'Transferred'
  | 'Assigned'
  | 'Activated'
  | 'Expired'
  | 'Locked'

export type KeyType = 'standard' | 'iphone'

export interface LicenseKey {
  id: string
  _id?: string
  keyCode: string
  keyNumber?: string
  batchNumber: string
  batchId?: string
  keyType?: KeyType
  status: KeyStatus
  holderTier: 'super_admin' | 'stockist' | 'distributor' | 'dealer'
  holderName: string
  holderId?: string
  assignedCustomer?: string
  assignedImei?: string
  generatedAt: string
  createdAt?: string
  activatedAt?: string
  updatedAt?: string
}

export interface GenerateKeysRequest {
  quantity: number
  keyType?: KeyType
  targetTier?: 'stockist' | 'distributor' | 'dealer'
  targetPartnerId?: string
  notes?: string
}

export interface TransferKeysRequest {
  quantity: number
  toUserId?: string
  targetPartnerId?: string
  sourcePartnerId?: string
  targetTier?: 'stockist' | 'distributor' | 'dealer'
  note?: string
}

export interface ReclaimKeysRequest {
  quantity: number
  fromUserId?: string
  keyId?: string
  note?: string
  reason?: string
}
