import React, { useState, useMemo } from 'react'
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  KeyRound,
  LogIn,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import {
  useGetStockistsQuery,
  useCreateStockistMutation,
  useTransferKeyBatchMutation,
  useReclaimKeyBatchMutation,
  useResetPasswordMutation,
  useImpersonateUserMutation,
} from '@/features/enterprise/api/enterpriseApi'
import type { StockistItem } from '@/features/enterprise/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/app/routes/routePaths'

export default function StockistsPage() {
  const navigate = useNavigate()
  const [tableSearch, setTableSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live RTK Query
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetStockistsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
  })

  // Mutations
  const [createStockist, { isLoading: isCreating }] = useCreateStockistMutation()
  const [transferKeys, { isLoading: isTransferring }] = useTransferKeyBatchMutation()
  const [reclaimKeys, { isLoading: isReclaiming }] = useReclaimKeyBatchMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()
  const [impersonateUser] = useImpersonateUserMutation()

  // Modals state
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    territory: 'Madhya Pradesh',
    gstNumber: '',
    password: 'password123',
  })

  const [activeTransferStockist, setActiveTransferStockist] = useState<StockistItem | null>(null)
  const [transferQty, setTransferQty] = useState('100')
  const [transferNote, setTransferNote] = useState('')

  const [activeReclaimStockist, setActiveReclaimStockist] = useState<StockistItem | null>(null)
  const [reclaimQty, setReclaimQty] = useState('50')
  const [reclaimNote, setReclaimNote] = useState('Reclaim unallocated stock')

  const [activePasswordStockist, setActivePasswordStockist] = useState<StockistItem | null>(null)
  const [newPassword, setNewPassword] = useState('admin123')

  const stockistsList: StockistItem[] = apiResponse?.data || []
  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: stockistsList.length,
  }

  // Live KPI metrics
  const { totalStockists, activeCount, suspendedCount, totalAllocatedKeys, totalRevenue } = useMemo(() => {
    let active = 0
    let suspended = 0
    let keys = 0
    let rev = 0
    stockistsList.forEach((s) => {
      if (s.status === 'Active') active++
      else suspended++
      keys += s.keys || 0
      rev += s.revenue || 0
    })
    return {
      totalStockists: pagination.totalItems || stockistsList.length,
      activeCount: active,
      suspendedCount: suspended,
      totalAllocatedKeys: keys,
      totalRevenue: rev,
    }
  }, [stockistsList, pagination])

  // Handle Create Stockist Submit
  const handleCreateStockist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.email || !newForm.phone) {
      toast.error('Name, email, and phone are required')
      return
    }
    try {
      await createStockist({
        name: newForm.name,
        email: newForm.email,
        phone: newForm.phone,
        city: newForm.city,
        territory: newForm.territory,
        gst: newForm.gstNumber,
        password: newForm.password,
      }).unwrap()

      toast.success(`Successfully created Stockist ${newForm.name}!`)
      setIsNewOpen(false)
      setNewForm({
        name: '',
        email: '',
        phone: '',
        city: '',
        territory: 'Madhya Pradesh',
        gstNumber: '',
        password: 'password123',
      })
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create stockist')
    }
  }

  // Handle Transfer Keys Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTransferStockist) return
    const qty = parseInt(transferQty, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Enter a valid key quantity')
      return
    }
    try {
      await transferKeys({
        toUserId: activeTransferStockist._id || activeTransferStockist.id,
        quantity: qty,
        note: transferNote || 'Super Admin Key Allocation',
      }).unwrap()

      toast.success(`Allocated ${qty} keys to ${activeTransferStockist.name}!`)
      setActiveTransferStockist(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to transfer keys')
    }
  }

  // Handle Reclaim Keys Submit
  const handleReclaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReclaimStockist) return
    const qty = parseInt(reclaimQty, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Enter a valid key quantity')
      return
    }
    try {
      await reclaimKeys({
        fromUserId: activeReclaimStockist._id || activeReclaimStockist.id,
        quantity: qty,
        note: reclaimNote || 'Super Admin Key Reclaim',
      }).unwrap()

      toast.success(`Reclaimed ${qty} keys from ${activeReclaimStockist.name}!`)
      setActiveReclaimStockist(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reclaim keys')
    }
  }

  // Handle Password Reset
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePasswordStockist) return
    try {
      await resetPassword({
        userId: activePasswordStockist._id || activePasswordStockist.id,
        password: newPassword,
      }).unwrap()

      toast.success(`Password reset successfully for ${activePasswordStockist.name}!`)
      setActivePasswordStockist(null)
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reset password')
    }
  }

  // Handle Impersonation
  const handleImpersonate = async (s: StockistItem) => {
    try {
      const res = await impersonateUser({ targetUserId: s._id || s.id }).unwrap()
      if (res.token) {
        localStorage.setItem('vlocker_impersonate_token', res.token)
        localStorage.setItem('vlocker_impersonating_user', JSON.stringify(res.user || s))
        toast.success(`Logged in as ${s.name} (Stockist)`)
        navigate(ROUTE_PATHS.DASHBOARD)
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Impersonation failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Home</span>
            <span>&rsaquo;</span>
            <span>Network</span>
            <span>&rsaquo;</span>
            <span className="text-foreground font-bold">Stockists</span>
          </div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mt-1">
            DISTRIBUTION NETWORK
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-0.5">Stockists</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tier-1 partners who receive keys directly from Super Admin and distribute downstream.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted text-foreground transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewOpen(true)}
            className="btn-action-primary text-sm font-bold flex items-center gap-2 py-2 px-4 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Stockist</span>
          </button>
        </div>
      </div>

      {/* 4 Colored KPI Cards matching image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stockists */}
        <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300">
              TOTAL STOCKISTS
            </p>
            <p className="text-3xl font-black text-blue-900 dark:text-blue-100 font-mono mt-1">
              {totalStockists}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Active */}
        <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-300">
              ACTIVE
            </p>
            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
              {activeCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Suspended */}
        <div className="p-5 rounded-2xl border border-rose-200/50 dark:border-rose-800/30 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-rose-700 dark:text-rose-300">
              SUSPENDED
            </p>
            <p className="text-3xl font-black text-rose-900 dark:text-rose-100 font-mono mt-1">
              {suspendedCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Allocated Keys */}
        <div className="p-5 rounded-2xl border border-sky-200/50 dark:border-sky-800/30 bg-sky-50/50 dark:bg-sky-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-sky-700 dark:text-sky-300">
              ALLOCATED KEYS
            </p>
            <p className="text-3xl font-black text-sky-900 dark:text-sky-100 font-mono mt-1">
              {totalAllocatedKeys.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">₹{totalRevenue} revenue</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Error alert */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to load stockists from server'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {/* Table Header controls */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">All stockists</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {stockistsList.length} partners across territories
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search..."
                className="h-10 w-48 sm:w-64 rounded-xl border border-border pl-9 pr-3 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => toast.info('Filter options')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={() => toast.success('Exporting stockists to CSV...')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left enterprise-table min-w-[1100px]">
            <thead>
              <tr>
                <th className="min-w-[220px]">Stockist</th>
                <th className="min-w-[180px] whitespace-nowrap">Territory</th>
                <th className="w-36 min-w-[140px] whitespace-nowrap">GST</th>
                <th className="w-28 min-w-[110px] whitespace-nowrap text-center">Keys</th>
                <th className="w-28 min-w-[110px] whitespace-nowrap text-center">Distributors</th>
                <th className="w-32 min-w-[120px] whitespace-nowrap">Revenue</th>
                <th className="w-28 min-w-[110px] whitespace-nowrap text-center">Status</th>
                <th className="w-36 min-w-[140px] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-8 w-40 bg-muted rounded-xl"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-24 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-24 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-12 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-5 w-16 bg-muted rounded-full"></div></td>
                    <td className="py-3 px-4"><div className="h-8 w-32 bg-muted rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : stockistsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-base font-semibold">No Stockists Found</p>
                      <p className="text-sm text-muted-foreground/70 max-w-sm">
                        Use the "+ New Stockist" button above to create a Tier-1 regional distribution partner.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stockistsList.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-muted/40 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary font-black text-sm flex items-center justify-center uppercase shrink-0">
                          {s.name ? s.name.slice(0, 2) : 'ST'}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{s.id}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-semibold text-foreground">{s.territory || '—'}</p>
                      <p className="text-xs text-muted-foreground">{s.city}</p>
                    </td>
                    <td className="font-mono text-sm text-muted-foreground">
                      {s.gst && s.gst !== '—' ? s.gst : '—'}
                    </td>
                    <td>
                      <p className="font-bold font-mono text-sm text-foreground">
                        {s.keys?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {s.available?.toLocaleString() || 0} avail.
                      </p>
                    </td>
                    <td className="font-mono font-semibold text-sm text-foreground text-center">
                      {s.distributors || 0}
                    </td>
                    <td className="font-mono text-sm font-semibold text-foreground">
                      ₹{s.revenue || 0}
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {s.status || 'Active'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Reset Password */}
                        <button
                          type="button"
                          onClick={() => setActivePasswordStockist(s)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-medium p-1.5 hover:bg-muted rounded"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Reset Password</span>
                        </button>

                        {/* Impersonate */}
                        <button
                          type="button"
                          onClick={() => handleImpersonate(s)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-medium p-1 hover:bg-muted rounded"
                          title="Impersonate Stockist"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Impersonate</span>
                        </button>

                        {/* Transfer Keys button */}
                        <button
                          type="button"
                          onClick={() => setActiveTransferStockist(s)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-2xs"
                        >
                          Transfer Keys
                        </button>

                        {/* Reclaim button */}
                        <button
                          type="button"
                          onClick={() => setActiveReclaimStockist(s)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-2xs"
                        >
                          Reclaim
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal 1: New Stockist ─── */}
      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Create Tier-1 Stockist Partner"
        description="Onboard an authorized regional stockist directly beneath Super Admin."
        size="md"
      >
        <form onSubmit={handleCreateStockist} className="space-y-4 pt-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Stockist / Business Name *</label>
            <input
              type="text"
              required
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="e.g. Royal Telecom Hub"
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Email ID *</label>
              <input
                type="email"
                required
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                placeholder="stockist@vcredit.in"
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Phone Number *</label>
              <input
                type="tel"
                required
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Territory / State</label>
              <input
                type="text"
                value={newForm.territory}
                onChange={(e) => setNewForm({ ...newForm, territory: e.target.value })}
                placeholder="Madhya Pradesh"
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">City</label>
              <input
                type="text"
                value={newForm.city}
                onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                placeholder="Bhopal"
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">GST Number (Optional)</label>
            <input
              type="text"
              value={newForm.gstNumber}
              onChange={(e) => setNewForm({ ...newForm, gstNumber: e.target.value })}
              placeholder="e.g. 23AABCU9603R1ZM"
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Initial Portal Password</label>
            <input
              type="password"
              value={newForm.password}
              onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="btn-action-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5"
            >
              {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Create Stockist</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 2: Transfer Keys ─── */}
      <Modal
        isOpen={Boolean(activeTransferStockist)}
        onClose={() => setActiveTransferStockist(null)}
        title={`Transfer Keys to ${activeTransferStockist?.name}`}
        description="Allocate unlocked license keys from Super Admin master vault."
        size="sm"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 pt-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Number of Keys to Transfer</label>
            <input
              type="number"
              min={1}
              required
              value={transferQty}
              onChange={(e) => setTransferQty(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Transfer Note / Memo</label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="e.g. Q4 Regional consignment"
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setActiveTransferStockist(null)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring}
              className="btn-action-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5"
            >
              {isTransferring && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm Transfer</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 3: Reclaim Keys ─── */}
      <Modal
        isOpen={Boolean(activeReclaimStockist)}
        onClose={() => setActiveReclaimStockist(null)}
        title={`Reclaim Keys from ${activeReclaimStockist?.name}`}
        description="Pull available keys back into the Super Admin vault."
        size="sm"
      >
        <form onSubmit={handleReclaimSubmit} className="space-y-4 pt-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Quantity to Reclaim</label>
            <input
              type="number"
              min={1}
              required
              value={reclaimQty}
              onChange={(e) => setReclaimQty(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Reason / Note</label>
            <input
              type="text"
              value={reclaimNote}
              onChange={(e) => setReclaimNote(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setActiveReclaimStockist(null)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReclaiming}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              {isReclaiming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm Reclaim</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 4: Reset Password ─── */}
      <Modal
        isOpen={Boolean(activePasswordStockist)}
        onClose={() => setActivePasswordStockist(null)}
        title={`Reset Password for ${activePasswordStockist?.name}`}
        description="Set a new password for this partner portal access."
        size="sm"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">New Password</label>
            <input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setActivePasswordStockist(null)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResetting}
              className="btn-action-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5"
            >
              {isResetting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Password</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
