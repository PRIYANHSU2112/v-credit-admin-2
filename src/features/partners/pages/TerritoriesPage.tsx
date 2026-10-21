import { useMemo, useState } from 'react'
import { MapPin, Building2, Users, Key, RefreshCw, AlertCircle } from 'lucide-react'
import { useGetTerritoriesQuery } from '@/features/enterprise/api/enterpriseApi'
import type { TerritoryItem } from '@/features/enterprise/types'
import { useDebounce } from '@/hooks/useDebounce'

export default function TerritoriesPage() {
  const [tableSearch, setTableSearch] = useState('')
  const debouncedSearch = useDebounce(tableSearch, 350)

  const { data: response, isLoading, isFetching, isError, error, refetch } = useGetTerritoriesQuery()

  const territoriesList: TerritoryItem[] = response?.data || []

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return territoriesList
    const q = debouncedSearch.toLowerCase().trim()
    return territoriesList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.state.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    )
  }, [territoriesList, debouncedSearch])

  const totals = useMemo(() => {
    let stk = 0
    let dst = 0
    let dlr = 0
    let kys = 0
    let act = 0
    let rev = 0
    territoriesList.forEach((t) => {
      stk += t.stockists || 0
      dst += t.distributors || 0
      dlr += t.dealers || 0
      kys += t.keys || 0
      act += t.activations || 0
      rev += t.revenue || 0
    })
    return { count: territoriesList.length, stk, dst, dlr, kys, act, rev }
  }, [territoriesList])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Home</span>
            <span>&rsaquo;</span>
            <span>Network</span>
            <span>&rsaquo;</span>
            <span className="text-foreground font-bold">Territories</span>
          </div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase mt-1">
            GEOGRAPHIC EXPANSION
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
            Territories & Regional Coverage
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            State and regional hubs distribution network, licensing capacity, and retail footprints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted text-foreground transition-colors self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300">
              ACTIVE TERRITORIES
            </p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100 font-mono mt-1">
              {totals.count}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-300">
              STOCKIST HUBS
            </p>
            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
              {totals.stk}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-purple-700 dark:text-purple-300">
              RETAIL DEALERS
            </p>
            <p className="text-3xl font-black text-purple-900 dark:text-purple-100 font-mono mt-1">
              {totals.dlr}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-sky-200/50 dark:border-sky-800/30 bg-sky-50/50 dark:bg-sky-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-sky-700 dark:text-sky-300">
              TOTAL ACTIVATIONS
            </p>
            <p className="text-3xl font-black text-sky-900 dark:text-sky-100 font-mono mt-1">
              {totals.act}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">₹{totals.rev.toLocaleString()} revenue</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Key className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Error Resilience Alert */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to load territory distribution from server'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">All Territories</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live geographic presence across state boundaries
            </p>
          </div>

          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search territory or state..."
            className="h-10 w-64 rounded-xl border border-border px-3.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left enterprise-table">
            <thead>
              <tr>
                <th>Territory Code</th>
                <th>State / Region</th>
                <th>Stockists</th>
                <th>Distributors</th>
                <th>Dealers</th>
                <th>Keys Capacity</th>
                <th>Activations</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-5 w-20 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-32 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-12 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-12 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-12 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded-full"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold">No territories matching criteria</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="font-mono text-sm font-bold text-primary">{t.id}</td>
                    <td>
                      <div className="font-bold text-foreground text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">Code: {t.state}</div>
                    </td>
                    <td className="font-mono font-semibold text-sm text-foreground">{t.stockists}</td>
                    <td className="font-mono font-semibold text-sm text-foreground">{t.distributors}</td>
                    <td className="font-mono font-semibold text-sm text-foreground">{t.dealers}</td>
                    <td className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {t.keys.toLocaleString()}
                    </td>
                    <td className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {t.activations.toLocaleString()}
                    </td>
                    <td className="font-mono font-bold text-sm text-foreground">
                      ₹{t.revenue.toLocaleString()}
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {t.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
