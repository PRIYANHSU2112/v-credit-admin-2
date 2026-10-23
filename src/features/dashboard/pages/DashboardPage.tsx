/**
 * DashboardPage — Role-Aware Dashboard
 * Uses real /enterprise/dashboard API. Zero mock data.
 * Follows optimize.md: skeleton loaders, React.memo on cards, selectFromResult,
 *   role-scoped display, single API call for all sections.
 */
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, User, Key, Building2, RefreshCw, AlertCircle } from 'lucide-react'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { useAppSelector } from '@/app/store/hooks'
import { useGetDashboardQuery } from '../api/dashboardApi'
import type { DashboardKpis } from '../api/dashboardApi'

// ── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = React.memo(() => (
  <div className="card-metric-stadium p-6 min-h-[160px] flex flex-col justify-between animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-13 w-13 rounded-2xl bg-muted/60 shrink-0" />
      <div className="h-6 w-28 rounded-lg bg-muted/60" />
    </div>
    <div className="h-12 w-24 rounded-lg bg-muted/40 mx-auto mt-3" />
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

// ── Metric Card ────────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: number | string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ReactNode
  onClick?: () => void
}

const MetricCard = React.memo(({ label, value, color, bgColor, borderColor, icon, onClick }: MetricCardProps) => (
  <div
    onClick={onClick}
    className={`card-metric-stadium ${bgColor} ${borderColor} p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200 ${onClick ? 'cursor-pointer group hover:border-opacity-60' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`flex h-13 w-13 items-center justify-center rounded-2xl ${color} shrink-0 ${onClick ? 'group-hover:scale-105 transition-transform' : ''}`}>
        {icon}
      </div>
      <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">{label}</span>
    </div>
    <div className={`text-center text-5xl font-black tracking-tight font-mono mt-3 ${typeof value === 'string' ? 'text-primary' : 'text-slate-900 dark:text-foreground'}`}>
      {value}
    </div>
  </div>
))
MetricCard.displayName = 'MetricCard'

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  const isSuper = role === 'super_admin'
  const isStockist = role === 'stockist' || isSuper
  const isDistributor = role === 'distributor' || isStockist

  const {
    data: dashResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetDashboardQuery(undefined, {
    // Refetch every 5 minutes for live counts
    pollingInterval: 300000,
  })

  const kpis: DashboardKpis = useMemo(() => {
    return dashResponse?.data?.kpis || ({} as DashboardKpis)
  }, [dashResponse?.data?.kpis])

  // Inline skeleton grid
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <p className="text-lg font-bold text-foreground">Dashboard unavailable</p>
        <p className="text-sm text-muted-foreground">
          {(error as any)?.message || 'Could not connect to server. Check your backend is running.'}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Role-Aware Persona Banner */}
      {role !== 'super_admin' && (
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase shrink-0">
              {role === 'stockist' ? 'STK' : role === 'distributor' ? 'DST' : 'DLR'}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                Active Perspective: {user?.name}{' '}
                <span className="text-sm font-bold text-primary capitalize">({role.replace('_', ' ')})</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                {role === 'stockist'
                  ? 'Showing regional stockist metrics, managed city distributors, retail stores & allocated licenses.'
                  : role === 'distributor'
                    ? `Showing metrics scoped to your city distribution tree under ${user?.parentName || '—'}.`
                    : `Showing metrics for your retail store counter under ${user?.parentName || '—'}.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-sm font-bold px-4 py-2 rounded-xl bg-card border border-border text-foreground font-mono shadow-xs">
              Available Keys:{' '}
              <strong className="text-emerald-500 text-base">
                {kpis.balanceKeys ?? kpis.availableKeys ?? 0}
              </strong>
            </span>
            {isFetching && (
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {/* Stockist Card — Super Admin only */}
        {isSuper && (
          <MetricCard
            label="Stockist"
            value={kpis.stockists ?? kpis.stockistCount ?? kpis.networkStockists ?? 0}
            color="bg-indigo-600 text-white shadow-md"
            bgColor="bg-gradient-to-br from-indigo-500/10 via-card to-card"
            borderColor="border border-indigo-500/20 hover:border-indigo-500/40"
            icon={<Building2 className="h-6 w-6" />}
            onClick={() => navigate(ROUTE_PATHS.PARTNERS)}
          />
        )}

        {/* Stockist Hub badge — when logged in as stockist */}
        {role === 'stockist' && (
          <div
            onClick={() => navigate(ROUTE_PATHS.PARTNERS)}
            className="card-metric-stadium bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 hover:border-indigo-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Stockist Hub</span>
                <span className="text-xl font-bold font-display text-slate-900 dark:text-foreground">{user?.name || '—'}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <span>Territory: {user?.territory || 'Regional'}</span>
              <span className="font-bold text-primary">Master Regional</span>
            </div>
          </div>
        )}

        {/* Assigned Stockist — when logged in as distributor */}
        {role === 'distributor' && (
          <div className="card-metric-stadium bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assigned Stockist</span>
                <span className="text-xl font-bold font-display text-slate-900 dark:text-foreground">{user?.parentName || '—'}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <span>Parent Supply Hub</span>
              <span className="font-bold text-primary">Regional Head</span>
            </div>
          </div>
        )}

        {/* Assigned Distributor — when logged in as dealer */}
        {role === 'dealer' && (
          <div className="card-metric-stadium bg-gradient-to-br from-blue-500/10 via-card to-card border border-blue-500/20 p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assigned Distributor</span>
                <span className="text-xl font-bold font-display text-slate-900 dark:text-foreground">{user?.parentName || '—'}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <span>Retail Outlet</span>
              <span className="font-bold text-primary">{user?.name || '—'}</span>
            </div>
          </div>
        )}

        {/* Distributor — Super Admin / Stockist */}
        {isStockist && (
          <MetricCard
            label="Distributor"
            value={kpis.distributors ?? kpis.distributorCount ?? kpis.networkDistributors ?? 0}
            color="bg-blue-600 text-white shadow-md"
            bgColor="bg-gradient-to-br from-blue-500/10 via-card to-card"
            borderColor="border border-blue-500/20 hover:border-blue-500/40"
            icon={<Users className="h-6 w-6" />}
            onClick={() => navigate(ROUTE_PATHS.DISTRIBUTORS)}
          />
        )}

        {/* Dealer — Super Admin / Stockist / Distributor */}
        {isDistributor && (
          <MetricCard
            label="Dealer"
            value={kpis.dealers ?? kpis.dealerCount ?? kpis.networkDealers ?? 0}
            color="bg-purple-600 text-white shadow-md"
            bgColor="bg-gradient-to-br from-purple-500/10 via-card to-card"
            borderColor="border border-purple-500/20 hover:border-purple-500/40"
            icon={<Users className="h-6 w-6" />}
            onClick={() => navigate(ROUTE_PATHS.DEALERS)}
          />
        )}

        {/* User */}
        <MetricCard
          label="User"
          value={kpis.users ?? kpis.userCount ?? 0}
          color="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
          bgColor="bg-gradient-to-br from-emerald-500/10 via-card to-card"
          borderColor="border border-emerald-500/20 hover:border-emerald-500/40"
          icon={<User className="h-6 w-6" />}
          onClick={() => navigate(ROUTE_PATHS.USERS)}
        />

        {/* Remove User (disabled users count) */}
        <MetricCard
          label="Remove User"
          value={kpis.removeUserCount ?? 0}
          color="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
          bgColor="bg-gradient-to-br from-rose-500/10 via-card to-card"
          borderColor="border border-rose-500/20 hover:border-rose-500/40"
          icon={<User className="h-6 w-6" />}
        />

        {/* Today's 3.0 User */}
        <MetricCard
          label="Today's 3.0 User"
          value={kpis.today30UserCount ?? 0}
          color="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
          bgColor="bg-gradient-to-br from-amber-500/10 via-card to-card"
          borderColor="border border-amber-500/20 hover:border-amber-500/40"
          icon={<User className="h-6 w-6" />}
        />

        {/* Today's Running User */}
        <MetricCard
          label="Today's Running User"
          value={kpis.todayRunningUserCount ?? 0}
          color="bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/25"
          bgColor="bg-gradient-to-br from-teal-500/10 via-card to-card"
          borderColor="border border-teal-500/20 hover:border-teal-500/40"
          icon={<User className="h-6 w-6" />}
        />

        {/* Today's iPhone User */}
        <MetricCard
          label="Today's iPhone User"
          value={kpis.todayIphoneUserCount ?? 0}
          color="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25"
          bgColor="bg-gradient-to-br from-indigo-500/10 via-card to-card"
          borderColor="border border-indigo-500/20 hover:border-indigo-500/40"
          icon={<User className="h-6 w-6" />}
        />

        {/* Total Keys */}
        <MetricCard
          label="Total Keys"
          value={kpis.totalKeys ?? 0}
          color="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25"
          bgColor="bg-gradient-to-br from-cyan-500/10 via-card to-card"
          borderColor="border border-cyan-500/20 hover:border-cyan-500/40"
          icon={<Key className="h-6 w-6" />}
        />

        {/* Transferred Keys */}
        <MetricCard
          label="Transfered"
          value={kpis.transferredKeys ?? kpis.transferedKeys ?? kpis.allocatedKeys ?? 0}
          color="bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25"
          bgColor="bg-gradient-to-br from-orange-500/10 via-card to-card"
          borderColor="border border-orange-500/20 hover:border-orange-500/40"
          icon={<Key className="h-6 w-6" />}
          onClick={() => navigate(ROUTE_PATHS.REPORT_TRANSFER)}
        />

        {/* Balance Keys */}
        <div className="card-metric-stadium bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 hover:border-emerald-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Balance</span>
          </div>
          <div className="text-center text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono mt-3">
            {kpis.balanceKeys ?? kpis.availableKeys ?? 0}
          </div>
        </div>

        {/* Total iPhone Keys */}
        <MetricCard
          label="Total iPhone Keys"
          value={kpis.totalIphoneKeys ?? 0}
          color="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25"
          bgColor="bg-gradient-to-br from-sky-500/10 via-card to-card"
          borderColor="border border-sky-500/20 hover:border-sky-500/40"
          icon={<Key className="h-6 w-6" />}
        />

        {/* Transfer iPhone Keys */}
        <MetricCard
          label="Transfer iPhone Keys"
          value={kpis.transferIphoneKeys ?? 0}
          color="bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/25"
          bgColor="bg-gradient-to-br from-pink-500/10 via-card to-card"
          borderColor="border border-pink-500/20 hover:border-pink-500/40"
          icon={<Key className="h-6 w-6" />}
          onClick={() => navigate(ROUTE_PATHS.REPORT_IPHONE_TRANSFER)}
        />

        {/* Balance iPhone Keys */}
        <div className="card-metric-stadium bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Balance iPhone Keys</span>
          </div>
          <div className="text-center text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono mt-3">
            {kpis.balanceIphoneKeys ?? 0}
          </div>
        </div>
      </div>
    </div>
  )
}
