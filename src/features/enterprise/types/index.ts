export interface StockistItem {
  id: string
  _id: string
  name: string
  email: string
  phone?: string
  city: string
  status: string
  keys: number
  available: number
  lastActive: string
  territory: string
  gst: string
  distributors: number
  revenue: number
  entityCode?: string
}

export interface TerritoryItem {
  id: string
  name: string
  state: string
  stockists: number
  distributors: number
  dealers: number
  keys: number
  activations: number
  revenue: number
  status: string
}

export interface InventoryKpis {
  totalKeys: number
  networkKeys?: number
  availableKeys: number
  networkAvailable?: number
  allocatedKeys: number
  usedKeys?: number
  monthlyActivations?: number
  todaySell?: number
  weeklySell?: number
  monthlySell?: number
}

export interface StockistInventoryItem {
  id: string
  name: string
  email: string
  city: string
  role?: string
  status: string
  keys: number
  available: number
  territory?: string
}

export interface CommissionItem {
  id: string
  entity: string
  stockistName?: string
  tier: string
  keysSold: number
  rate: number
  earned: number
  paid: number
  amount?: number
  month: string
  period?: string
  status: string
}

export interface CommissionTrendItem {
  month: string
  stockist: number
  distributor: number
  dealer: number
}

export interface AuditLogItem {
  time: string
  actor: string
  role: string
  action: string
  target: string
  severity?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type?: 'alert' | 'info' | 'warning' | 'success'
  time?: string
  createdAt?: string
  read?: boolean
}

export interface SearchResultData {
  keys: Array<{ type: string; label: string; id: string }>
  users: Array<{ type: string; label: string; id: string }>
  customers: Array<{ type: string; label: string; id: string }>
}
