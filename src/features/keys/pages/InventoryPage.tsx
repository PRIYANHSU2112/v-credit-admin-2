import { KeyRound, ShieldCheck, ArrowRightLeft, Layers, RefreshCw, AlertCircle } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/store/hooks'
import { useGetInventoryQuery } from '@/features/enterprise/api/enterpriseApi'

export default function InventoryPage() {
  const { user } = useAppSelector((state) => state.auth)

  // Strict Super Admin Access Guard
  if (user?.role && user.role !== 'super_admin') {
    return <Navigate to="/app/dashboard" replace />
  }

  const { data: response, isLoading, isFetching, isError, error, refetch } = useGetInventoryQuery()

  const inventoryData = response?.data
  const kpis = inventoryData?.kpis || {
    totalKeys: 0,
    networkKeys: 0,
    availableKeys: 0,
    networkAvailable: 0,
    allocatedKeys: 0,
    usedKeys: 0,
    monthlyActivations: 0,
  }
  const stockistsList = inventoryData?.stockists || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Home</span>
            <span>&rsaquo;</span>
            <span>License Keys</span>
            <span>&rsaquo;</span>
            <span className="text-foreground font-bold">Master Inventory</span>
          </div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mt-1">
            KEY VAULT & QUOTA
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
            Key Inventory Snapshot
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Central repository status, distributed quotas, and available activation balances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300">
              TOTAL MASTER KEYS
            </p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100 font-mono mt-1">
              {(kpis.totalKeys || kpis.networkKeys || 0).toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-300">
              AVAILABLE IN VAULT
            </p>
            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
              {(kpis.availableKeys || kpis.networkAvailable || 0).toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-purple-700 dark:text-purple-300">
              ALLOCATED DOWNSTREAM
            </p>
            <p className="text-3xl font-black text-purple-900 dark:text-purple-100 font-mono mt-1">
              {(kpis.allocatedKeys || 0).toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-300">
              USED / ACTIVATED
            </p>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-100 font-mono mt-1">
              {(kpis.usedKeys || kpis.monthlyActivations || 0).toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Error Resilience Alert */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to fetch inventory snapshot'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Breakdown by Stockist Vault */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Stockist Quota Distribution</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key stock assigned to Tier-1 regional vaults for distribution to dealers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left enterprise-table">
            <thead>
              <tr>
                <th>Stockist Hub</th>
                <th>Territory / City</th>
                <th>Total Keys Assigned</th>
                <th>Available Quota</th>
                <th>Utilized Keys</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-5 w-32 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-24 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded-full"></div></td>
                  </tr>
                ))
              ) : stockistsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <KeyRound className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold">No Regional Stockist Inventories Recorded</p>
                  </td>
                </tr>
              ) : (
                stockistsList.map((s) => {
                  const used = Math.max(0, (s.keys || 0) - (s.available || 0))
                  return (
                    <tr key={s.id || s.email} className="hover:bg-muted/40 transition-colors">
                      <td>
                        <div className="font-bold text-foreground text-xs">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.email}</div>
                      </td>
                      <td>
                        <div className="text-xs text-foreground font-semibold">{s.territory || s.city || '—'}</div>
                      </td>
                      <td className="font-mono font-bold text-xs text-foreground">
                        {(s.keys || 0).toLocaleString()}
                      </td>
                      <td className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {(s.available || 0).toLocaleString()}
                      </td>
                      <td className="font-mono font-semibold text-xs text-muted-foreground">
                        {used.toLocaleString()}
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {s.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
