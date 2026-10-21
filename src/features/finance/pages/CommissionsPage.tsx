import { useMemo, useState } from 'react'
import { Coins, TrendingUp, DollarSign, Wallet, RefreshCw, AlertCircle } from 'lucide-react'
import { useGetCommissionsQuery } from '@/features/enterprise/api/enterpriseApi'
import type { CommissionItem } from '@/features/enterprise/types'
import { useDebounce } from '@/hooks/useDebounce'

export default function CommissionsPage() {
  const [tableSearch, setTableSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const debouncedSearch = useDebounce(tableSearch, 350)

  const { data: response, isLoading, isFetching, isError, error, refetch } = useGetCommissionsQuery()

  const commissionsList: CommissionItem[] = response?.data?.commissions || []

  const filtered = useMemo(() => {
    return commissionsList.filter((c) => {
      const q = debouncedSearch.toLowerCase().trim()
      const matchesSearch = !q || c.entity.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
      const matchesTier = tierFilter === 'all' || c.tier.toLowerCase() === tierFilter.toLowerCase()
      return matchesSearch && matchesTier
    })
  }, [commissionsList, debouncedSearch, tierFilter])

  const totals = useMemo(() => {
    let earned = 0
    let paid = 0
    let keys = 0
    commissionsList.forEach((c) => {
      earned += c.earned || 0
      paid += c.paid || 0
      keys += c.keysSold || 0
    })
    return { earned, paid, pending: Math.max(0, earned - paid), keys }
  }, [commissionsList])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Home</span>
            <span>&rsaquo;</span>
            <span>Financials</span>
            <span>&rsaquo;</span>
            <span className="text-foreground font-bold">Commissions</span>
          </div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mt-1">
            PARTNER INCENTIVES
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
            Hierarchy Commission Ledgers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated activation commissions computed for Stockists (₹12), Distributors (₹8), and Dealers (₹5).
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
        <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-300">
              TOTAL COMMISSIONS EARNED
            </p>
            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
              ₹{totals.earned.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300">
              ACTIVATIONS GENERATING PAYOUT
            </p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100 font-mono mt-1">
              {totals.keys.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-purple-700 dark:text-purple-300">
              COMMISSION DISBURSED
            </p>
            <p className="text-3xl font-black text-purple-900 dark:text-purple-100 font-mono mt-1">
              ₹{totals.paid.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-300">
              PENDING SETTLEMENT
            </p>
            <p className="text-3xl font-black text-amber-900 dark:text-amber-100 font-mono mt-1">
              ₹{totals.pending.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Error Resilience Alert */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to load commissions ledger'}</span>
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

      {/* Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Commission Statements</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live partner earnings by tier and activation performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="h-9 rounded-xl border border-border px-3 text-xs bg-background text-foreground"
            >
              <option value="all">All Tiers</option>
              <option value="stockist">Stockist (₹12)</option>
              <option value="distributor">Distributor (₹8)</option>
              <option value="dealer">Dealer (₹5)</option>
            </select>

            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search partner..."
              className="h-9 w-48 rounded-xl border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left enterprise-table">
            <thead>
              <tr>
                <th>Statement Ref</th>
                <th>Partner Entity</th>
                <th>Tier</th>
                <th>Activations Sold</th>
                <th>Rate (₹)</th>
                <th>Commission Earned</th>
                <th>Billing Month</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-5 w-24 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-32 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-20 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-20 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-20 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded-full"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Coins className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold">No commission records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="font-mono text-xs font-bold text-primary">{c.id}</td>
                    <td className="font-bold text-foreground text-xs">{c.entity}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {c.tier}
                      </span>
                    </td>
                    <td className="font-mono font-semibold text-xs text-foreground">
                      {c.keysSold.toLocaleString()}
                    </td>
                    <td className="font-mono text-xs text-muted-foreground">₹{c.rate}</td>
                    <td className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      ₹{c.earned.toLocaleString()}
                    </td>
                    <td className="text-xs text-muted-foreground font-mono">{c.month}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {c.status}
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
