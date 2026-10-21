import { useNavigate } from 'react-router-dom'
import {
  Users,
  User,
  Key,
  Building2,
} from 'lucide-react'
import { DEFAULT_DASHBOARD_STATS, type DashboardStats } from '@/mocks/mockSeedData'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { useAppSelector } from '@/app/store/hooks'
import type { UserRole } from '@/types/user'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const role = user?.role || 'super_admin'
  const isSuper = role === 'super_admin'
  const isStockist = role === 'stockist' || isSuper
  const isDistributor = role === 'distributor' || isStockist

  // Role-tailored mock stats reflecting the hierarchy chain
  const roleStatsMap: Record<UserRole, DashboardStats> = {
    super_admin: DEFAULT_DASHBOARD_STATS,
    sub_admin: DEFAULT_DASHBOARD_STATS,
    stockist: {
      ...DEFAULT_DASHBOARD_STATS,
      stockistCount: 1,
      distributorCount: 2,
      dealerCount: 42,
      userCount: 4890,
      removeUserCount: 1204,
      totalKeys: 6500,
      transferedKeys: 6420,
      balanceKeys: 80,
      totalIphoneKeys: 250,
      transferIphoneKeys: 120,
      balanceIphoneKeys: 130,
    },
    distributor: {
      ...DEFAULT_DASHBOARD_STATS,
      stockistCount: 1,
      dealerCount: 18,
      userCount: 1840,
      removeUserCount: 412,
      totalKeys: 2400,
      transferedKeys: 2360,
      balanceKeys: 40,
      totalIphoneKeys: 80,
      transferIphoneKeys: 35,
      balanceIphoneKeys: 45,
    },
    dealer: {
      ...DEFAULT_DASHBOARD_STATS,
      stockistCount: 1,
      userCount: 245,
      removeUserCount: 38,
      today30UserCount: 2,
      todayRunningUserCount: 0,
      todayIphoneUserCount: 1,
      totalKeys: 320,
      transferedKeys: 305,
      balanceKeys: 15,
      totalIphoneKeys: 15,
      transferIphoneKeys: 10,
      balanceIphoneKeys: 5,
    },
  }
  const stats = roleStatsMap[role as UserRole] || DEFAULT_DASHBOARD_STATS

  return (
    <div className="space-y-6 pb-12">
      {/* Role-Aware Persona Overview Banner */}
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
                    ? `Showing metrics scoped to your city distribution tree under ${user?.parentName || 'Music Beats'}.`
                    : `Showing metrics for your retail store counter under ${user?.parentName || 'VEDA ENTERPRISE'}.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-sm font-bold px-4 py-2 rounded-xl bg-card border border-border text-foreground font-mono shadow-xs">
              Available Keys: <strong className="text-emerald-500 text-base">{stats.balanceKeys}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Responsive Grid of Metric Stadium Cards with larger readable typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Card: Stockist - Super Admin */}
        {isSuper && (
          <div
            onClick={() => navigate(ROUTE_PATHS.PARTNERS)}
            className="card-metric-stadium bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 hover:border-indigo-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Stockist</span>
            </div>
            <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
              {stats.stockistCount || 3}
            </div>
          </div>
        )}

        {/* Card: Stockist Hub - When Actor is Stockist */}
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
                <span className="text-xl font-bold font-display text-slate-900 dark:text-foreground">{user?.name || 'Music Beats'}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <span>Territory: Central Hub</span>
              <span className="font-bold text-primary">Master Regional</span>
            </div>
          </div>
        )}

        {/* Card: Assigned Stockist - When Actor is Distributor */}
        {role === 'distributor' && (
          <div
            onClick={() => navigate(ROUTE_PATHS.PARTNERS)}
            className="card-metric-stadium bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 hover:border-indigo-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assigned Stockist</span>
                <span className="text-xl font-bold font-display text-slate-900 dark:text-foreground">{user?.parentName || 'Music Beats'}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <span>Parent Supply Hub</span>
              <span className="font-bold text-primary">Regional Head</span>
            </div>
          </div>
        )}

        {/* Card: Assigned Distributor - When Actor is Dealer */}
        {role === 'dealer' && (
          <div
            className="card-metric-stadium bg-gradient-to-br from-blue-500/10 via-card to-card border border-blue-500/20 hover:border-blue-500/40 p-6 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assigned Distributor</span>
                <span className="text-xl font-bold font-display text-slate-900 dark:text-foreground">{user?.parentName || 'VEDA ENTERPRISE'}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <span>Retail Outlet</span>
              <span className="font-bold text-primary">{user?.name || 'Malviya mobile hub'}</span>
            </div>
          </div>
        )}

        {/* Card: Distributor - Super Admin / Stockist only */}
        {isStockist && (
          <div
            onClick={() => navigate(ROUTE_PATHS.DISTRIBUTORS)}
            className="card-metric-stadium bg-gradient-to-br from-blue-500/10 via-card to-card border border-blue-500/20 hover:border-blue-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Distributor</span>
            </div>
            <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
              {stats.distributorCount}
            </div>
          </div>
        )}

        {/* Card: Dealer - Super Admin / Stockist / Distributor */}
        {isDistributor && (
          <div
            onClick={() => navigate(ROUTE_PATHS.DEALERS)}
            className="card-metric-stadium bg-gradient-to-br from-purple-500/10 via-card to-card border border-purple-500/20 hover:border-purple-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Dealer</span>
            </div>
            <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
              {stats.dealerCount}
            </div>
          </div>
        )}

        {/* Card: User */}
        <div
          onClick={() => navigate(ROUTE_PATHS.USERS)}
          className="card-metric-stadium bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 hover:border-emerald-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">User</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.userCount}
          </div>
        </div>

        {/* Card: Remove User */}
        <div className="card-metric-stadium bg-gradient-to-br from-rose-500/10 via-card to-card border border-rose-500/20 hover:border-rose-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Remove User</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.removeUserCount}
          </div>
        </div>

        {/* Card: Today's 3.0 User */}
        <div className="card-metric-stadium bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/20 hover:border-amber-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Today&apos;s 3.0 User</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.today30UserCount}
          </div>
        </div>

        {/* Card: Today's Running User */}
        <div className="card-metric-stadium bg-gradient-to-br from-teal-500/10 via-card to-card border border-teal-500/20 hover:border-teal-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/25 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Today&apos;s Running User</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.todayRunningUserCount}
          </div>
        </div>

        {/* Card: Today's iPhone User */}
        <div className="card-metric-stadium bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 hover:border-indigo-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shrink-0">
              <User className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Today&apos;s iPhone User</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.todayIphoneUserCount}
          </div>
        </div>

        {/* Card: Total Keys */}
        <div className="card-metric-stadium bg-gradient-to-br from-cyan-500/10 via-card to-card border border-cyan-500/20 hover:border-cyan-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Total Keys</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.totalKeys}
          </div>
        </div>

        {/* Card: Transfered Keys */}
        <div
          onClick={() => navigate(ROUTE_PATHS.REPORT_TRANSFER)}
          className="card-metric-stadium bg-gradient-to-br from-orange-500/10 via-card to-card border border-orange-500/20 hover:border-orange-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Transfered</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.transferedKeys}
          </div>
        </div>

        {/* Card: Balance Keys */}
        <div className="card-metric-stadium bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 hover:border-emerald-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Balance</span>
          </div>
          <div className="text-center text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono mt-3">
            {stats.balanceKeys}
          </div>
        </div>

        {/* Card: Total iPhone Keys */}
        <div className="card-metric-stadium bg-gradient-to-br from-sky-500/10 via-card to-card border border-sky-500/20 hover:border-sky-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Total iPhone Keys</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.totalIphoneKeys}
          </div>
        </div>

        {/* Card: Transfer iPhone Keys */}
        <div
          onClick={() => navigate(ROUTE_PATHS.REPORT_IPHONE_TRANSFER)}
          className="card-metric-stadium bg-gradient-to-br from-pink-500/10 via-card to-card border border-pink-500/20 hover:border-pink-500/40 p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Transfer iPhone Keys</span>
          </div>
          <div className="text-center text-5xl font-black text-slate-900 dark:text-foreground tracking-tight font-mono mt-3">
            {stats.transferIphoneKeys}
          </div>
        </div>

        {/* Card: Balance iPhone Keys */}
        <div className="card-metric-stadium bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 hover:border-emerald-500/40 p-6 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-foreground">Balance iPhone Keys</span>
          </div>
          <div className="text-center text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono mt-3">
            {stats.balanceIphoneKeys}
          </div>
        </div>
      </div>
    </div>
  )
}
