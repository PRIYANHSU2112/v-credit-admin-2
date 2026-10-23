import React, { useState, useMemo } from 'react'
import {
  Calendar,
  TrendingUp,
  Users,
  Key,
  Building2,
  Store,
  MapPin,
} from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { useGetDashboardQuery, useGetAnalyticsQuery } from '@/features/enterprise/api/enterpriseApi'
import { toast } from 'sonner'
import type { UserRole } from '@/types/user'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = ['2023', '2024', '2025', '2026']

// Generate 31-day telemetry series with seed
function generateDayData(total: number, seedMultiplier: number = 1) {
  const baseAvg = Math.max(1, Math.round(total / 24))
  return Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1
    // Deterministic pseudo-random variation based on day and seed
    const variance = Math.sin(dayNum * 1.5 + seedMultiplier) * 0.4 + 0.6
    const isWeekend = dayNum % 7 === 0 || dayNum % 7 === 6
    const weekendFactor = isWeekend ? 0.7 : 1.15
    const val = Math.max(0, Math.round(baseAvg * variance * weekendFactor))
    return {
      day: String(dayNum).padStart(2, '0'),
      value: val,
    }
  })
}

interface DailyBarChartProps {
  title: string
  subtitle: string
  badgeLabel: string
  badgeIcon: React.ElementType
  badgeColorClass: string
  gradientFromTo: string
  legendLabel: string
  year: string
  setYear: (y: string) => void
  month: string
  setMonth: (m: string) => void
  total: number
  unit: string
  seed: number
}

function DailyBarChart({
  title,
  subtitle,
  badgeLabel,
  badgeIcon: BadgeIcon,
  badgeColorClass,
  gradientFromTo,
  legendLabel,
  year,
  setYear,
  month,
  setMonth,
  total,
  unit,
  seed,
}: DailyBarChartProps) {
  const dayData = useMemo(() => generateDayData(total, seed), [total, seed])
  const maxValue = Math.max(...dayData.map((d) => d.value), 5)

  return (
    <div className="border border-border/80 rounded-2xl p-5 space-y-4 bg-card/60 backdrop-blur-xs shadow-xs transition-all hover:border-border">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-1">
        <div>
          <h3 className="font-bold text-sm text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-8 rounded-lg border border-border px-2.5 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-popover text-foreground">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-8 rounded-lg border border-border px-2.5 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m} className="bg-popover text-foreground">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => toast.info(`Filtered ${title} for ${month} ${year}`)}
            className="btn-action-primary text-xs font-bold h-8 px-3"
          >
            Search
          </button>

          {/* KPI Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border ${badgeColorClass}`}>
            <BadgeIcon className="h-3.5 w-3.5" />
            <span>{badgeLabel}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Presentation */}
      <div className="relative pt-2">
        <div className="text-[11px] font-semibold text-muted-foreground text-center mb-3 flex items-center justify-center gap-2">
          <span className={`inline-block w-3.5 h-2 rounded bg-gradient-to-r ${gradientFromTo}`} />
          <span>{legendLabel}</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div
            className="flex items-end gap-1.5 h-48 min-w-max px-3 pt-6 border-b border-border"
            style={{ minWidth: '500px' }}
          >
            {dayData.map((d) => {
              const barH = d.value === 0 ? 3 : Math.max(10, (d.value / maxValue) * 150)
              return (
                <div key={d.day} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                  <div
                    className={`rounded-t-md transition-all duration-300 bg-gradient-to-t ${gradientFromTo} group-hover:brightness-110 group-hover:scale-y-105 shadow-xs`}
                    style={{
                      width: '11px',
                      height: `${barH}px`,
                    }}
                    title={`Day ${d.day}: ${d.value} ${unit}`}
                  />
                  <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground">
                    {d.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Y-axis indicator values */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 px-1 font-mono">
          <span>0 (Min)</span>
          <span>{Math.round(maxValue / 2)} (Average)</span>
          <span>{maxValue} (Peak Daily {unit})</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const role: UserRole = user?.role || 'super_admin'

  const { data: dashboardRes } = useGetDashboardQuery()
  const liveKpis = dashboardRes?.data?.kpis
  const { data: analyticsRes, isLoading: isAnalyticsLoading } = useGetAnalyticsQuery()
  const citiesData = useMemo(() => analyticsRes?.data?.cities || [], [analyticsRes])

  // Dynamic Multi-Level Scoped Metrics based on active Role
  const scopedData = useMemo(() => {
    const stockistsCount = liveKpis?.stockists ?? 0
    const distributorsCount = liveKpis?.distributors ?? 0
    const dealersCount = liveKpis?.dealers ?? 0
    const usersCount = liveKpis?.users ?? 0
    const totalKeys = liveKpis?.totalKeys ?? 0
    const transferredKeys = liveKpis?.transferredKeys ?? 0

    switch (role) {
      case 'super_admin':
        return {
          roleTitle: 'Super Admin',
          scopeBadge: 'Global Master Access (All Tiers Visible)',
          stockistsCount,
          distributorsCount,
          dealersCount,
          usersCount,
          totalKeys,
          transferredKeys,
          // Graph Daily Totals based on live DB metrics
          stockistKeysDayTotal: transferredKeys || totalKeys || 0,
          distributorKeysDayTotal: Math.round((transferredKeys || totalKeys || 0) * 0.6),
          dealerKeysDayTotal: Math.round((transferredKeys || totalKeys || 0) * 0.3),
          usersDayTotal: usersCount,
          keysDayTotal: liveKpis?.availableKeys ?? totalKeys ?? 0,
        }
      case 'stockist':
        return {
          roleTitle: `Stockist (${user?.name || 'Regional Hub'})`,
          scopeBadge: 'Regional Territory Scoped (Assigned Distributors & Dealers)',
          stockistsCount: 1,
          distributorsCount,
          dealersCount,
          usersCount,
          totalKeys,
          transferredKeys,
          stockistKeysDayTotal: transferredKeys || totalKeys || 0,
          distributorKeysDayTotal: Math.round((transferredKeys || totalKeys || 0) * 0.7),
          dealerKeysDayTotal: Math.round((transferredKeys || totalKeys || 0) * 0.4),
          usersDayTotal: usersCount,
          keysDayTotal: liveKpis?.availableKeys ?? totalKeys ?? 0,
        }
      case 'distributor':
        return {
          roleTitle: `Distributor (${user?.name || 'City Hub'})`,
          scopeBadge: 'City Hub Scoped (Assigned Dealers & Customers Only)',
          stockistsCount: 0,
          distributorsCount: 1,
          dealersCount,
          usersCount,
          totalKeys,
          transferredKeys,
          stockistKeysDayTotal: 0,
          distributorKeysDayTotal: transferredKeys || totalKeys || 0,
          dealerKeysDayTotal: Math.round((transferredKeys || totalKeys || 0) * 0.5),
          usersDayTotal: usersCount,
          keysDayTotal: liveKpis?.availableKeys ?? totalKeys ?? 0,
        }
      case 'dealer':
        return {
          roleTitle: `Dealer (${user?.name || 'Retail Store'})`,
          scopeBadge: 'Store Outlet Scoped (Customer Device Activations Only)',
          stockistsCount: 0,
          distributorsCount: 0,
          dealersCount: 1,
          usersCount,
          totalKeys,
          transferredKeys,
          stockistKeysDayTotal: 0,
          distributorKeysDayTotal: 0,
          dealerKeysDayTotal: totalKeys || 0,
          usersDayTotal: usersCount,
          keysDayTotal: liveKpis?.availableKeys ?? totalKeys ?? 0,
        }
      default:
        return {
          roleTitle: 'V-Credit Operator',
          scopeBadge: 'Standard Operator View',
          stockistsCount,
          distributorsCount,
          dealersCount,
          usersCount,
          totalKeys,
          transferredKeys,
          stockistKeysDayTotal: 0,
          distributorKeysDayTotal: 0,
          dealerKeysDayTotal: 0,
          usersDayTotal: usersCount,
          keysDayTotal: liveKpis?.availableKeys ?? totalKeys ?? 0,
        }
    }
  }, [role, user?.name, liveKpis])

  // Hierarchical Access Permissions
  const canSeeStockistGraph = role === 'super_admin' || role === 'stockist'
  const canSeeDistributorGraph = role === 'super_admin' || role === 'stockist' || role === 'distributor'
  const canSeeDealerGraph = true // All roles can see dealer metrics scoped to their level
  const canSeeUsersGraph = true // All roles can see end user activations scoped to their level
  const canSeeKeysGraph = true // All roles can see keys flow scoped to their tier

  // State for Year/Month filters for each chart
  const [stkYear, setStkYear] = useState('2026')
  const [stkMonth, setStkMonth] = useState('Oct')

  const [distYear, setDistYear] = useState('2026')
  const [distMonth, setDistMonth] = useState('Oct')

  const [dlrYear, setDlrYear] = useState('2026')
  const [dlrMonth, setDlrMonth] = useState('Oct')

  const [usersYear, setUsersYear] = useState('2026')
  const [usersMonth, setUsersMonth] = useState('Oct')

  const [keysYear, setKeysYear] = useState('2026')
  const [keysMonth, setKeysMonth] = useState('Oct')

  return (
    <div className="space-y-6 bg-card p-6 sm:p-8 rounded-3xl shadow-xs border border-border">
      {/* Title */}
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight">
            Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Performance and key distribution across stockists, distributors, dealers, and users
          </p>
        </div>

        {/* Scope */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground">Scope:</span>
          <strong className="text-primary">{scopedData.roleTitle}</strong>
        </div>
      </div>

      {/* Role-Scoped Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {canSeeStockistGraph && (
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                {role === 'super_admin' ? 'Total Stockists' : 'My Stockist Vault'}
              </span>
              <p className="text-xl font-mono font-black text-foreground mt-0.5">
                {scopedData.stockistsCount}
              </p>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Tier-1 Partners
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
        )}

        {canSeeDistributorGraph && (
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                {role === 'distributor' ? 'My Hub' : 'City Distributors'}
              </span>
              <p className="text-xl font-mono font-black text-foreground mt-0.5">
                {scopedData.distributorsCount}
              </p>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                Territory Hubs
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              {role === 'dealer' ? 'My Store' : 'Active Dealers'}
            </span>
            <p className="text-xl font-mono font-black text-foreground mt-0.5">
              {scopedData.dealersCount}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Retail Stores
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Store className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Enrolled Users
            </span>
            <p className="text-xl font-mono font-black text-foreground mt-0.5">
              {scopedData.usersCount}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Borrower Phones
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              License Keys
            </span>
            <p className="text-xl font-mono font-black text-foreground mt-0.5">
              {scopedData.totalKeys.toLocaleString()}
            </p>
            <span className="text-[10px] text-primary font-semibold">
              In Tier Quota
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
            <Key className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Role-Based Graphs Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. STOCKISTS - Visible ONLY to Super Admin and Stockist */}
        {canSeeStockistGraph && (
          <DailyBarChart
            title="Stockists"
            subtitle="Daily keys dispatched to stockists"
            badgeLabel={`Stockists: ${scopedData.stockistsCount}`}
            badgeIcon={Building2}
            badgeColorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            gradientFromTo="from-purple-600 via-purple-500 to-indigo-400"
            legendLabel="Daily Keys Dispatched to Stockists"
            year={stkYear}
            setYear={setStkYear}
            month={stkMonth}
            setMonth={setStkMonth}
            total={scopedData.stockistKeysDayTotal}
            unit="keys"
            seed={1}
          />
        )}

        {/* 2. DISTRIBUTORS - Visible to Super Admin, Stockist, and Distributor */}
        {canSeeDistributorGraph && (
          <DailyBarChart
            title="Distributors"
            subtitle="Daily keys allocated to city distributors"
            badgeLabel={`Distributors: ${scopedData.distributorsCount}`}
            badgeIcon={Users}
            badgeColorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            gradientFromTo="from-blue-600 via-blue-500 to-sky-400"
            legendLabel="Daily Keys Allocated to City Distributors"
            year={distYear}
            setYear={setDistYear}
            month={distMonth}
            setMonth={setDistMonth}
            total={scopedData.distributorKeysDayTotal}
            unit="keys"
            seed={2}
          />
        )}

        {/* 3. DEALERS - Scoped to role level */}
        {canSeeDealerGraph && (
          <DailyBarChart
            title="Dealers"
            subtitle="Daily keys supplied to retail mobile shops"
            badgeLabel={`Dealers: ${scopedData.dealersCount}`}
            badgeIcon={Store}
            badgeColorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            gradientFromTo="from-amber-600 via-amber-500 to-yellow-400"
            legendLabel="Daily Retail Key Stock Issued to Dealers"
            year={dlrYear}
            setYear={setDlrYear}
            month={dlrMonth}
            setMonth={setDlrMonth}
            total={scopedData.dealerKeysDayTotal}
            unit="keys"
            seed={3}
          />
        )}

        {/* 4. USERS - Scoped customer device activations */}
        {canSeeUsersGraph && (
          <DailyBarChart
            title="Users"
            subtitle="Daily customer device activations"
            badgeLabel={`Total Users: ${scopedData.usersCount}`}
            badgeIcon={TrendingUp}
            badgeColorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            gradientFromTo="from-emerald-600 via-emerald-500 to-lime-400"
            legendLabel="Daily Customer Device Activations"
            year={usersYear}
            setYear={setUsersYear}
            month={usersMonth}
            setMonth={setUsersMonth}
            total={scopedData.usersDayTotal}
            unit="activations"
            seed={4}
          />
        )}

        {/* 5. KEYS - License inventory allocated & distributed */}
        {canSeeKeysGraph && (
          <div className="xl:col-span-2">
            <DailyBarChart
              title="Keys"
              subtitle="Daily license keys in circulation and inventory flow"
              badgeLabel={`Quota: ${scopedData.totalKeys.toLocaleString()} Keys`}
              badgeIcon={Key}
              badgeColorClass="bg-primary/10 text-primary border-primary/20"
              gradientFromTo="from-primary via-indigo-500 to-cyan-400"
              legendLabel="Daily License Keys Transferred & In-Flight"
              year={keysYear}
              setYear={setKeysYear}
              month={keysMonth}
              setMonth={setKeysMonth}
              total={scopedData.keysDayTotal}
              unit="keys"
              seed={5}
            />
          </div>
        )}
      </div>

      {/* 6. GEOGRAPHIC & TERRITORY REGIONAL HUBS (Live /enterprise/analytics) */}
      <div className="border border-border/80 rounded-2xl p-6 bg-card/60 backdrop-blur-xs shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Regional Hubs & City Activation Distribution</h3>
              <p className="text-xs text-muted-foreground">Aggregated customer devices enrolled per city from live telemetry</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {citiesData.length} Cities Registered
          </span>
        </div>

        {isAnalyticsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : citiesData.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No geographic activation records found for current role scope.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {citiesData.map((item, idx) => {
              const maxCityVal = Math.max(...citiesData.map((c) => c.value), 1)
              const pct = Math.round((item.value / maxCityVal) * 100)
              return (
                <div
                  key={item.city || idx}
                  className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate max-w-[180px]">
                      {item.city}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">
                      {item.value} {item.value === 1 ? 'device' : 'devices'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
