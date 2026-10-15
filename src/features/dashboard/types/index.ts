export interface DashboardKPIs {
  totalKeysInOrbit: number
  activeDevices: number
  lockedDevices: number
  totalFinancedAmount: number
  totalCollectedAmount: number
  pendingOverdueAmount: number
  activePartners: number
  keysChange: number
  devicesChange: number
  collectionRate: number
}

export interface RevenueDataPoint {
  month: string
  disbursed: number
  collected: number
}

export interface KeyDistributionDataPoint {
  tier: string
  allocated: number
  active: number
  available: number
}

export interface DeviceStatusBreakdown {
  status: string
  count: number
  color: string
}
