import { useMemo, useState } from 'react'
import {
  Coins,
  TrendingUp,
  DollarSign,
  Wallet,
  RefreshCw,
  AlertCircle,
  Sliders,
  Building2,
  Users,
  Store,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import {
  useGetCommissionsQuery,
  useUpdateCommissionRatesMutation,
} from '@/features/enterprise/api/enterpriseApi'
import type { CommissionItem, CommissionRates } from '@/features/enterprise/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export default function CommissionsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'
  const isSuper = role === 'super_admin'
  const isStockist = role === 'stockist'
  const isDistributor = role === 'distributor'
  const isDealer = role === 'dealer'

  const [tableSearch, setTableSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const debouncedSearch = useDebounce(tableSearch, 350)

  const { data: response, isLoading, isFetching, isError, error, refetch } = useGetCommissionsQuery()
  const [updateCommissionRates, { isLoading: isUpdatingRates }] = useUpdateCommissionRatesMutation()

  // Dynamic rates from backend with fallback
  const rates: CommissionRates = response?.data?.rates || {
    stockist: 12,
    distributor: 8,
    dealer: 5,
  }

  // Rate configuration modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [stockistRateInput, setStockistRateInput] = useState('')
  const [distributorRateInput, setDistributorRateInput] = useState('')
  const [dealerRateInput, setDealerRateInput] = useState('')

  const handleOpenConfig = () => {
    setStockistRateInput(String(rates.stockist))
    setDistributorRateInput(String(rates.distributor))
    setDealerRateInput(String(rates.dealer))
    setIsConfigModalOpen(true)
  }

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault()
    const s = Number(stockistRateInput)
    const d = Number(distributorRateInput)
    const r = Number(dealerRateInput)

    if (isNaN(s) || s < 0 || isNaN(d) || d < 0 || isNaN(r) || r < 0) {
      toast.error('Please enter valid positive numbers for commission rates.')
      return
    }

    try {
      await updateCommissionRates({
        stockist: s,
        distributor: d,
        dealer: r,
      }).unwrap()

      toast.success('Commission rates updated successfully!', {
        description: `Stockist: ₹${s} · Distributor: ₹${d} · Dealer: ₹${r} per device activation.`,
      })
      setIsConfigModalOpen(false)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update commission rates')
    }
  }

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

  // Context-aware subtitle based on user role
  const roleSubtitle = useMemo(() => {
    if (isSuper) {
      return `Automated activation commissions computed for Stockists (₹${rates.stockist}), Distributors (₹${rates.distributor}), and Dealers (₹${rates.dealer}).`
    }
    if (isStockist) {
      return `Your Stockist tier earns ₹${rates.stockist} per activated key, plus visibility into downline distributor and dealer ledger statements.`
    }
    if (isDistributor) {
      return `Your Distributor tier earns ₹${rates.distributor} per activated key, plus visibility into assigned retail dealer store activations.`
    }
    if (isDealer) {
      return `Your Dealer tier earns ₹${rates.dealer} per customer device activated on EMI Safe.`
    }
    return `Tier commission ledger calculated based on active platform activation rates.`
  }, [isSuper, isStockist, isDistributor, isDealer, rates])

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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[11px] font-bold tracking-widest text-primary uppercase">
              PARTNER INCENTIVES
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              Role: {role.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
            Hierarchy Commission Ledgers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {roleSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Super Admin Rate Configuration Button */}
          {isSuper && (
            <button
              type="button"
              onClick={handleOpenConfig}
              className="btn-action-primary text-xs font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Configure Rates</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Dynamic Commission Rates Ribbon */}
      <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Active Tier Payout Rates
            </span>
          </div>
          {isSuper ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span>Managed by Super Admin</span>
              <button
                type="button"
                onClick={handleOpenConfig}
                className="text-primary font-bold hover:underline ml-1 cursor-pointer"
              >
                Edit
              </button>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              Live automated rates configured by Platform Directorate
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Stockist Rate */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isStockist
                ? 'bg-purple-500/10 border-purple-500/40 shadow-xs ring-1 ring-purple-500/30'
                : 'bg-muted/30 border-border/70 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Stockist Tier</p>
                  <p className="text-[10px] text-muted-foreground">Regional Hub</p>
                </div>
              </div>
              {isStockist && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Your Rate
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-300">
                ₹{rates.stockist}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">/ activated key</span>
            </div>
          </div>

          {/* Distributor Rate */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isDistributor
                ? 'bg-blue-500/10 border-blue-500/40 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-muted/30 border-border/70 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Distributor Tier</p>
                  <p className="text-[10px] text-muted-foreground">City Hub</p>
                </div>
              </div>
              {isDistributor && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Your Rate
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300">
                ₹{rates.distributor}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">/ activated key</span>
            </div>
          </div>

          {/* Dealer Rate */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isDealer
                ? 'bg-amber-500/10 border-amber-500/40 shadow-xs ring-1 ring-amber-500/30'
                : 'bg-muted/30 border-border/70 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Dealer Tier</p>
                  <p className="text-[10px] text-muted-foreground">Retail Shop</p>
                </div>
              </div>
              {isDealer && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Your Rate
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
                ₹{rates.dealer}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">/ activated key</span>
            </div>
          </div>
        </div>
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
            className="px-3 py-1 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90 cursor-pointer"
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
              className="h-9 rounded-xl border border-border px-3 text-xs bg-background text-foreground font-medium cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="stockist">Stockist (₹{rates.stockist})</option>
              <option value="distributor">Distributor (₹{rates.distributor})</option>
              <option value="dealer">Dealer (₹{rates.dealer})</option>
            </select>

            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search partner or ref..."
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Statements appear once keys are activated on financed phones.
                    </p>
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

      {/* Super Admin Rate Configuration Modal */}
      {isSuper && (
        <Modal
          isOpen={isConfigModalOpen}
          onClose={() => !isUpdatingRates && setIsConfigModalOpen(false)}
          title="Configure Hierarchy Commission Rates"
          description="Adjust the automated payout amount (in ₹) credited per activated license key for each partner tier."
          size="md"
        >
          <form onSubmit={handleSaveRates} className="space-y-4 pt-2">
            {/* Stockist Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-purple-500" />
                  Stockist Commission Rate (₹)
                </span>
                <span className="text-[10px] text-muted-foreground">Tier-1 Regional Hub</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={stockistRateInput}
                  onChange={(e) => setStockistRateInput(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. 12"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Accrued by regional stockists on each handset enrolled in their network.
              </p>
            </div>

            {/* Distributor Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  Distributor Commission Rate (₹)
                </span>
                <span className="text-[10px] text-muted-foreground">City Hub</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={distributorRateInput}
                  onChange={(e) => setDistributorRateInput(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. 8"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Accrued by city distributors on retail dealer activations in their territory.
              </p>
            </div>

            {/* Dealer Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-amber-500" />
                  Dealer Commission Rate (₹)
                </span>
                <span className="text-[10px] text-muted-foreground">Retail Mobile Store</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={dealerRateInput}
                  onChange={(e) => setDealerRateInput(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. 5"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Direct retail store incentive credited upon loan enrollment and device lock registration.
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfigModalOpen(false)}
                disabled={isUpdatingRates}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isUpdatingRates}
                className="btn-action-primary text-xs font-bold px-4 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingRates ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Rates...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Commission Rates</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
