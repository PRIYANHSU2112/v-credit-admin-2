export interface EndUserRecord {
  id: string
  _id: string
  customerId?: string
  name: string
  userName?: string
  customerName?: string
  phone: string
  userPhone?: string
  customerMobileNumber?: string
  email?: string
  dealer: string
  dealerPhone?: string
  city: string
  keyId: string
  keyCode?: string
  keyStatus?: string
  device: string
  deviceName?: string
  userFeature?: string
  mobileBrand?: string
  mobileModel?: string
  imei: string
  imei1?: string
  imeiNumber1?: string
  imeiNumber2?: string
  imei2?: string
  activatedAt: string
  activationDate?: string
  enrollmentDate?: string
  status: string
  lockStatus?: 'locked' | 'unlocked'
  deviceUnlockStatus?: string
  loanStatus?: string
  loanId?: string
  deviceAgent?: string
}

export interface GetEndUsersResponse {
  data: EndUserRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export interface GetEndUsersParams {
  page?: number
  limit?: number
  search?: string
  fromDate?: string
  toDate?: string
  dealerId?: string
}

export interface DeviceControlRequest {
  deviceId: string
}

export interface DeviceControlResponse {
  success: boolean
  message: string
  device?: {
    deviceId: string
    isLocked: boolean
    lockStatus: string
  }
}

export interface EmiSafeUserRecord extends EndUserRecord {
  unlockCode?: string
  address?: string
  fatherName?: string
  dob?: string
  aadhaarNumber?: string
  panNumber?: string
  devicePolicy?: {
    isResetAllowed?: boolean
    isUninstallAllowed?: boolean
    isDeveloperOptionsBlocked?: boolean
    isWallpaperEnabled?: boolean
    wallpaperUrl?: string
    isWhatsAppBlocked?: boolean
    isInstagramBlocked?: boolean
    isSnapchatBlocked?: boolean
    isYouTubeBlocked?: boolean
    isFacebookBlocked?: boolean
    isDialerBlocked?: boolean
    isMessagesBlocked?: boolean
    isPlayStoreBlocked?: boolean
    isChromeBlocked?: boolean
    isVoiceReminderEnabled?: boolean
    isLocationEnabled?: boolean
  }
}

