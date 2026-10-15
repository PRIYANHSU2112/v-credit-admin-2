/**
 * Legacy Re-export for Backward Compatibility
 * Points to industry-standard mockSeedData.ts
 */

export * from './mockSeedData'
import {
  DEFAULT_DASHBOARD_STATS,
  type DashboardStats,
} from './mockSeedData'

export type FigmaDashboardStats = DashboardStats
export const FIGMA_DASHBOARD_STATS = DEFAULT_DASHBOARD_STATS
