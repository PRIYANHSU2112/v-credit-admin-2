export type DeviceLockState = 'locked' | 'unlocked'
export type DeviceNetworkState = 'online' | 'offline'

export interface DevicePolicy {
  isResetAllowed: boolean
  isUninstallAllowed: boolean
  isDeveloperOptionsBlocked: boolean
  isWallpaperEnabled: boolean
  wallpaperUrl?: string
  isWhatsAppBlocked: boolean
  isInstagramBlocked: boolean
  isSnapchatBlocked: boolean
  isYouTubeBlocked: boolean
  isFacebookBlocked: boolean
  isDialerBlocked: boolean
  isMessagesBlocked: boolean
  isPlayStoreBlocked: boolean
  isChromeBlocked: boolean
  isVoiceReminderEnabled: boolean
  isLocationEnabled: boolean
}

export interface FinancedDevice {
  id: string
  _id?: string
  imei: string
  imei1?: string
  imei2?: string
  modelName: string
  brand: string
  customerName: string
  customerPhone: string
  dealerName: string
  lockState: DeviceLockState
  networkState: DeviceNetworkState
  batteryLevel: number
  lastHeartbeat: string
  loanId: string
  overdueDays?: number
  appVersion: string
  devicePolicy?: Partial<DevicePolicy>
  simCardNumber?: string
  simOperator?: string
  gpsLatitude?: number
  gpsLongitude?: number
  isBlacklisted?: boolean
}

export type DeviceCommandType =
  | 'LOCK'
  | 'UNLOCK'
  | 'PLAY_ALARM'
  | 'SET_MESSAGE'
  | 'WIPE'
  | 'REBOOT'
  | 'FACTORY_RESET'
  | 'ENABLE_CAMERA'
  | 'DISABLE_CAMERA'
  | 'SYNC_POLICY'

export interface DeviceCommandPayload {
  deviceId: string
  command: DeviceCommandType
  customMessage?: string
  policy?: Partial<DevicePolicy>
}
