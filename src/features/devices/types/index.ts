export type DeviceLockState = 'locked' | 'unlocked'
export type DeviceNetworkState = 'online' | 'offline'

export interface FinancedDevice {
  id: string
  imei: string
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
  overdueDays: number
  appVersion: string
}

export type DeviceCommandType = 'LOCK' | 'UNLOCK' | 'PLAY_ALARM' | 'SET_MESSAGE' | 'WIPE'

export interface DeviceCommandPayload {
  deviceId: string
  command: DeviceCommandType
  customMessage?: string
}
