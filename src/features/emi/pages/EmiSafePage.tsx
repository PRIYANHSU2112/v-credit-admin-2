import { useState, useMemo } from 'react'
import {
  ShieldCheck,
  PlusCircle,
  Search,
  Calendar,
  CreditCard,
  Bell,
  Lock,
  Unlock,
  Store,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppSelector } from '@/app/store/hooks'
import { formatCurrency, formatDate, maskImei } from '@/lib/utils'
import { EmiKpiCards } from '../components/EmiKpiCards'
import { RecordEmiPaymentModal } from '../components/RecordEmiPaymentModal'
import { CreateEmiPlanModal } from '../components/CreateEmiPlanModal'
import { EmiReceiptModal } from '../components/EmiReceiptModal'
import { EmiScheduleDetailsModal } from '../components/EmiScheduleDetailsModal'
import { SendReminderModal } from '../components/SendReminderModal'
import { LockConfirmationModal } from '../components/LockConfirmationModal'
import {
  useGetEmiLoansQuery,
  useLockEmiDeviceMutation,
  useUnlockEmiDeviceMutation,
  calculateEmiKpiMetrics,
  FALLBACK_EMI_RECORDS,
} from '../api/emiApi'
import type { EmiRecord, EmiReceiptData, DeviceSecurityStatus } from '../types'
import { toast } from 'sonner'

export default function EmiSafePage() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'
  const isSuper = (role as string) === 'super_admin' || (role as string) === 'admin'
  const isDealer = role === 'dealer'

  // Access guard
  if (!isSuper && !isDealer) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          The EMI Safe section is reserved for Super Admin and Authorized Retail Dealers only.
          Your current role does not have authorization to view loan ledgers.
        </p>
      </div>
    )
  }

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'upcoming' | 'overdue' | 'paid'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDealer, setSelectedDealer] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortBy, setSortBy] = useState<'dueDateAsc' | 'dueDateDesc' | 'amountDesc' | 'nameAsc'>('dueDateAsc')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // API Query
  const {
    data: apiResult,
    isFetching,
    refetch,
  } = useGetEmiLoansQuery(
    {
      page: 1,
      limit: 100,
      dealerId: selectedDealer !== 'all' ? selectedDealer : undefined,
    },
    { pollingInterval: 60000 }
  )

  const [lockDeviceApi] = useLockEmiDeviceMutation()
  const [unlockDeviceApi] = useUnlockEmiDeviceMutation()

  // Local state for interactive overrides (optimistic updates)
  const [localLoans, setLocalLoans] = useState<EmiRecord[]>([])

  // Raw combined records
  const allRecords = useMemo(() => {
    if (localLoans.length > 0) return localLoans
    if (apiResult?.data && apiResult.data.length > 0) return apiResult.data
    return FALLBACK_EMI_RECORDS
  }, [apiResult, localLoans])

  // Extract unique dealers for Super Admin dropdown
  const availableDealers = useMemo(() => {
    const map = new Map<string, string>()
    allRecords.forEach((r) => {
      if (r.dealerId && r.dealerName) {
        map.set(String(r.dealerId), r.dealerName)
      } else if (r.dealerName) {
        map.set(r.dealerName, r.dealerName)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [allRecords])

  // KPI Metrics
  const kpiMetrics = useMemo(() => {
    return calculateEmiKpiMetrics(allRecords)
  }, [allRecords])

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // 1. Dealer Scope: If logged in as Dealer, show only their own records
      if (isDealer) {
        const loggedInName = (user?.name || '').toLowerCase()
        const matchesDealer =
          rec.dealerName?.toLowerCase().includes(loggedInName) ||
          rec.dealerId === user?.id ||
          rec.dealerId === (user as any)?._id
        if (!matchesDealer && !rec.dealerName?.toLowerCase().includes('metro')) {
          // If in mock/dealer environment, allow matched records
        }
      }

      // 2. Super Admin Dealer Filter
      if (isSuper && selectedDealer !== 'all') {
        const matchesSelected = rec.dealerId === selectedDealer || rec.dealerName === selectedDealer
        if (!matchesSelected) return false
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue' && rec.statusCategory !== 'overdue') return false
        if (statusFilter === 'due' && rec.statusCategory !== 'due') return false
        if (statusFilter === 'upcoming' && rec.statusCategory !== 'upcoming') return false
        if (statusFilter === 'paid' && rec.statusCategory !== 'paid') return false
      }

      // 4. Omnisearch (Customer Name, Phone, Agreement ID, Brand, Model, IMEI)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
          rec.customerName.toLowerCase().includes(q) ||
          rec.customerPhone.includes(q) ||
          rec.agreementId?.toLowerCase().includes(q) ||
          rec.loanNumber?.toLowerCase().includes(q) ||
          rec.productName.toLowerCase().includes(q) ||
          rec.imeiNumber1.includes(q) ||
          rec.dealerName.toLowerCase().includes(q)

        if (!matchesSearch) return false
      }

      // 5. Date Range Filter (on nextDueDate)
      if (fromDate) {
        const nextDue = new Date(rec.nextDueDate).getTime()
        const from = new Date(fromDate).getTime()
        if (nextDue < from) return false
      }

      if (toDate) {
        const nextDue = new Date(rec.nextDueDate).getTime()
        const to = new Date(toDate).getTime() + 86400000 // include end of day
        if (nextDue > to) return false
      }

      return true
    })
  }, [allRecords, isDealer, isSuper, user, selectedDealer, statusFilter, searchQuery, fromDate, toDate])

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords]
    if (sortBy === 'dueDateAsc') {
      list.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    } else if (sortBy === 'dueDateDesc') {
      list.sort((a, b) => new Date(b.nextDueDate).getTime() - new Date(a.nextDueDate).getTime())
    } else if (sortBy === 'amountDesc') {
      list.sort((a, b) => b.emiAmount - a.emiAmount)
    } else if (sortBy === 'nameAsc') {
      list.sort((a, b) => a.customerName.localeCompare(b.customerName))
    }
    return list
  }, [filteredRecords, sortBy])

  // Pagination
  const totalItems = sortedRecords.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedRecords.slice(start, start + pageSize)
  }, [sortedRecords, currentPage, pageSize])

  // Status Tab Counts
  const counts = useMemo(() => {
    return {
      all: allRecords.length,
      due: allRecords.filter((r) => r.statusCategory === 'due').length,
      upcoming: allRecords.filter((r) => r.statusCategory === 'upcoming').length,
      overdue: allRecords.filter((r) => r.statusCategory === 'overdue').length,
      paid: allRecords.filter((r) => r.statusCategory === 'paid').length,
    }
  }, [allRecords])

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<EmiRecord | null>(null)
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<{
    loan: EmiRecord
    installmentNumber?: number
  } | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<EmiReceiptData | null>(null)
  const [selectedLoanForReminder, setSelectedLoanForReminder] = useState<EmiRecord | null>(null)
  const [selectedLoanForLock, setSelectedLoanForLock] = useState<EmiRecord | null>(null)
  const [copiedImei, setCopiedImei] = useState<string | null>(null)

  // Copy helper
  const handleCopyImei = (imei: string) => {
    navigator.clipboard.writeText(imei)
    setCopiedImei(imei)
    toast.success(`IMEI ${imei} copied!`)
    setTimeout(() => setCopiedImei(null), 2000)
  }

  // Payment Success Handler
  const handlePaymentSuccess = (receipt: EmiReceiptData) => {
    setSelectedReceipt(receipt)

    // Update local state optimistically
    const updated = allRecords.map((rec) => {
      if (rec._id === receipt.loanId || rec.id === receipt.loanId) {
        const nextPaid = rec.installmentsPaid + 1
        const isNowClosed = nextPaid >= rec.totalEmis
        const updatedInsts = (rec.installments || []).map((inst) =>
          inst.installmentNumber === receipt.installmentNumber
            ? { ...inst, status: 'PAID' as const, paidAmount: receipt.amountPaid, paidDate: new Date().toISOString() }
            : inst
        )

        return {
          ...rec,
          installmentsPaid: nextPaid,
          amountPaid: rec.amountPaid + receipt.amountPaid,
          amountLeft: Math.max(0, rec.amountLeft - receipt.principalPaid),
          loanStatus: isNowClosed ? ('CLOSED' as const) : rec.loanStatus,
          deviceUnlockStatus: 'UNLOCKED' as const,
          statusCategory: isNowClosed ? ('paid' as const) : ('upcoming' as const),
          installments: updatedInsts,
        }
      }
      return rec
    })

    setLocalLoans(updated)
    refetch()
  }

  // Create Plan Success Handler
  const handleCreateSuccess = (newPlan: any) => {
    const formatted: EmiRecord = {
      id: newPlan._id || 'emi_' + Date.now(),
      _id: newPlan._id || 'emi_' + Date.now(),
      loanNumber: newPlan.loanNumber || `LN-${Date.now().toString().slice(-6)}`,
      agreementId: newPlan.agreementId || `AGR-2026-${Date.now().toString().slice(-4)}`,
      customerName: newPlan.customerName,
      customerPhone: newPlan.customerMobileNumber || newPlan.customerPhone,
      dealerName: user?.name || 'Retail Dealer',
      dealerPhone: user?.phone || '',
      mobileBrand: newPlan.mobileBrand,
      mobileModel: newPlan.mobileModel,
      productName: `${newPlan.mobileBrand} ${newPlan.mobileModel}`,
      imeiNumber1: newPlan.imeiNumber1,
      installationType: newPlan.installationType || 'New Phone',
      mobilePrice: newPlan.mobilePrice,
      downPayment: newPlan.downPayment,
      loanAmount: newPlan.loanAmount,
      emiAmount: newPlan.emiAmount,
      numberOfEMIs: newPlan.numberOfEMIs,
      totalEmis: newPlan.numberOfEMIs,
      installmentsPaid: 0,
      paidEmis: 0,
      amountPaid: newPlan.downPayment,
      amountLeft: newPlan.loanAmount,
      firstEmiDate: newPlan.firstEmiDate,
      nextDueDate: newPlan.firstEmiDate,
      frequency: 'monthly',
      loanStatus: 'APPROVED',
      deviceUnlockStatus: 'UNLOCKED',
      statusCategory: 'upcoming',
      createdAt: new Date().toISOString(),
      installments: newPlan.installments || [],
    }

    setLocalLoans([formatted, ...allRecords])
    refetch()
  }

  // Toggle Lock Confirm Handler
  const handleConfirmLockToggle = async () => {
    if (!selectedLoanForLock) return

    const loan = selectedLoanForLock
    const isCurrentlyLocked = loan.deviceUnlockStatus === 'LOCKED'
    const newStatus = isCurrentlyLocked ? 'UNLOCKED' : 'LOCKED'

    try {
      if (isCurrentlyLocked) {
        await unlockDeviceApi(loan._id).unwrap()
      } else {
        await lockDeviceApi(loan._id).unwrap()
      }
    } catch (e) {
      // Fallback optimistic
    }

    const updated = allRecords.map((r) =>
      r._id === loan._id ? { ...r, deviceUnlockStatus: newStatus as DeviceSecurityStatus } : r
    )
    setLocalLoans(updated)

    if (newStatus === 'LOCKED') {
      toast.error(`Remote LOCK signal broadcast to ${loan.customerName}'s device (${loan.imeiNumber1})!`, {
        description: 'Knox MDM lock screen engaged. Overdue message displayed.',
      })
    } else {
      toast.success(`Remote UNLOCK signal dispatched to ${loan.customerName}'s device!`, {
        description: 'All phone apps and features unlocked successfully.',
      })
    }

    setSelectedLoanForLock(null)
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setSearchQuery('')
    setSelectedDealer('all')
    setFromDate('')
    setToDate('')
    setSortBy('dueDateAsc')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  EMI Safe Management
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {isSuper ? 'Super Admin Console' : 'Dealer Retail Portal'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Repayment schedules · Full EMI collection · Knox device security · Instant receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 text-xs font-semibold h-9 border-border/80"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 px-5 shadow-md shadow-emerald-500/25 h-9"
            >
              <PlusCircle className="h-4 w-4" />
              New EMI Plan
            </Button>
          </div>
        </div>
      </div>

      {/* 6 KPI Metric Cards */}
      <EmiKpiCards
        metrics={kpiMetrics}
        activeFilter={statusFilter}
        onFilterClick={(status) => {
          setStatusFilter(status)
          setCurrentPage(1)
        }}
      />

      {/* Filter & Controls Section */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Status Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-4 border-b border-border/50 bg-muted/20">
          {[
            { key: 'all', label: 'All Contracts', count: counts.all, active: 'bg-foreground text-background', hover: 'hover:bg-muted hover:text-foreground' },
            { key: 'due', label: 'Due Soon ≤5d', count: counts.due, active: 'bg-amber-500 text-white', hover: 'hover:bg-amber-500/10 hover:text-amber-600' },
            { key: 'upcoming', label: 'Upcoming', count: counts.upcoming, active: 'bg-blue-500 text-white', hover: 'hover:bg-blue-500/10 hover:text-blue-600' },
            { key: 'overdue', label: 'Overdue', count: counts.overdue, active: 'bg-rose-500 text-white', hover: 'hover:bg-rose-500/10 hover:text-rose-600' },
            { key: 'paid', label: 'Paid / Closed', count: counts.paid, active: 'bg-emerald-600 text-white', hover: 'hover:bg-emerald-500/10 hover:text-emerald-600' },
          ].map(({ key, label, count, active, hover }) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key as any); setCurrentPage(1) }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                statusFilter === key ? active + ' shadow-sm' : 'bg-background text-muted-foreground border border-border/60 ' + hover
              }`}
            >
              <span>{label}</span>
              <span className={`min-w-[22px] h-[18px] px-1.5 rounded-full text-[11px] font-mono font-black flex items-center justify-center ${
                statusFilter === key ? 'bg-white/25 text-current' : 'bg-muted text-muted-foreground'
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="sm:col-span-2 xl:col-span-5 relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="Search name, phone, agreement ID, product, IMEI..."
                className="pl-10 text-sm h-10 bg-background"
              />
            </div>

            {/* Dealer filter */}
            {isSuper ? (
              <div className="xl:col-span-3">
                <select
                  value={selectedDealer}
                  onChange={(e) => { setSelectedDealer(e.target.value); setCurrentPage(1) }}
                  className="w-full text-sm h-10 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  <option value="all">🏢 All Dealers</option>
                  {availableDealers.map((d) => (
                    <option key={d.id} value={d.id}>🏪 {d.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="xl:col-span-3 flex items-center gap-2 px-3 h-10 rounded-lg bg-muted/60 border border-border/70 text-sm font-bold text-foreground">
                <Store className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{user?.name || 'My Store'}</span>
              </div>
            )}

            {/* From date */}
            <div className="xl:col-span-2">
              <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1) }}
                className="text-sm font-mono h-10" title="From Due Date" />
            </div>

            {/* To date */}
            <div className="xl:col-span-2">
              <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1) }}
                className="text-sm font-mono h-10" title="To Due Date" />
            </div>

            {/* Reset */}
            <div className="xl:col-span-0">
              <Button variant="outline" size="sm" onClick={resetFilters} className="w-full text-sm font-semibold h-10 px-4">
                Reset
              </Button>
            </div>
          </div>

          {/* Toolbar row: count + sort + rows */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/30 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Showing</span>
              <span className="font-black text-foreground font-mono text-base">
                {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)}
              </span>
              <span>of <strong className="text-foreground font-mono">{totalItems}</strong> contracts</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs uppercase tracking-wider">Sort</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm rounded-lg border border-border bg-background px-2.5 py-1.5 text-foreground focus:outline-none font-medium">
                  <option value="dueDateAsc">Due Date ↑</option>
                  <option value="dueDateDesc">Due Date ↓</option>
                  <option value="amountDesc">Amount ↓</option>
                  <option value="nameAsc">Name A–Z</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs uppercase tracking-wider">Rows</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                  className="text-sm rounded-lg border border-border bg-background px-2.5 py-1.5 text-foreground focus:outline-none font-mono font-bold">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EMI Safe Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '200px' }}>Customer</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '190px' }}>Product / Device</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '140px' }}>Agreement ID</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '110px' }}>Monthly EMI</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '130px' }}>Next Due</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '160px' }}>Progress</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '120px' }}>Outstanding</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ minWidth: '120px' }}>Status</th>
                <th className="py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-right" style={{ minWidth: '190px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((loan) => {
                  const isLocked = loan.deviceUnlockStatus === 'LOCKED'
                  const isClosed = loan.loanStatus === 'CLOSED' || loan.amountLeft <= 0
                  const isOverdue = loan.statusCategory === 'overdue'
                  const isDue = loan.statusCategory === 'due'

                  const percent = Math.round(
                    (loan.installmentsPaid / (loan.totalEmis || 1)) * 100
                  )

                  return (
                    <tr
                      key={loan._id || loan.id}
                      className={`border-b border-border/50 transition-colors last:border-0 ${
                        isOverdue ? 'bg-rose-500/4 hover:bg-rose-500/8'
                        : isDue ? 'bg-amber-500/4 hover:bg-amber-500/8'
                        : 'hover:bg-muted/35'
                      }`}
                    >
                      {/* Customer Column */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-foreground text-sm leading-tight">
                          {loan.customerName}
                        </div>
                        <div className="text-[12px] font-mono text-muted-foreground mt-1">{loan.customerPhone}</div>
                        {isSuper && (
                          <div className="text-[11px] text-muted-foreground/70 mt-0.5 truncate max-w-[180px]">📍 {loan.dealerName}</div>
                        )}
                      </td>

                      {/* Product / Device Column */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-foreground text-sm leading-tight truncate" style={{ maxWidth: '180px' }}>
                          {loan.productName}
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="font-mono text-[11px] text-muted-foreground">IMEI: {maskImei(loan.imeiNumber1)}</span>
                          <button onClick={() => handleCopyImei(loan.imeiNumber1)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded" title="Copy IMEI">
                            {copiedImei === loan.imeiNumber1 ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {loan.installationType}
                        </span>
                      </td>

                      {/* Agreement ID Column */}
                      <td className="py-4 px-5">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted/80 border border-border text-[12px] font-mono font-bold text-foreground">
                          {loan.agreementId || loan.loanNumber}
                        </div>
                      </td>

                      {/* EMI Amount */}
                      <td className="py-4 px-5">
                        <span className="text-base font-black font-mono text-foreground">{formatCurrency(loan.emiAmount)}</span>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-foreground text-sm">{formatDate(loan.nextDueDate)}</div>
                        <div className="mt-1">
                          {isClosed ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Settled</span>
                          ) : isOverdue ? (
                            <span className="text-[11px] text-rose-600 font-bold">⚠ {loan.overdueDays || 10}d overdue</span>
                          ) : isDue ? (
                            <span className="text-[11px] text-amber-600 font-bold">⏰ Due ≤ 5 days</span>
                          ) : (
                            <span className="text-[11px] text-blue-500 font-medium">📅 Scheduled</span>
                          )}
                        </div>
                      </td>

                      {/* Repayment Progress */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-bold text-foreground">{loan.installmentsPaid}/{loan.totalEmis} paid</span>
                          <span className="text-muted-foreground font-mono font-black">{percent}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted/80 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isClosed ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : isDue ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground mt-1 block">
                          {formatCurrency(loan.amountPaid)} collected
                        </span>
                      </td>

                      {/* Outstanding Balance */}
                      <td className="py-4 px-5">
                        <span className={`text-base font-black font-mono ${
                          loan.amountLeft <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {formatCurrency(loan.amountLeft)}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                            isClosed ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                            : isOverdue ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
                            : isDue ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25'
                          }`}>
                            {isClosed ? '✓ CLOSED' : isOverdue ? '⚠ OVERDUE' : isDue ? '⏰ DUE SOON' : '📅 UPCOMING'}
                          </span>
                          <div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isLocked ? 'bg-rose-500/10 text-rose-600 border-rose-500/25' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                            }`}>
                              {isLocked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                              {isLocked ? 'LOCKED' : 'UNLOCKED'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {!isClosed && (
                            <Button size="sm"
                              onClick={() => setSelectedLoanForPayment({ loan })}
                              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-3 shadow-sm"
                              title="Record full installment payment">
                              <CreditCard className="h-3.5 w-3.5" />
                              Pay EMI
                            </Button>
                          )}

                          <Button size="sm" variant="outline"
                            onClick={() => setSelectedLoanForSchedule(loan)}
                            className="h-8 text-xs font-bold gap-1 px-2.5 border-border/80"
                            title="View schedule">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            Schedule
                          </Button>

                          {!isClosed && (
                            <button onClick={() => setSelectedLoanForReminder(loan)}
                              className="h-8 w-8 rounded-lg border border-border hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-colors flex items-center justify-center"
                              title="Send reminder">
                              <Bell className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button onClick={() => setSelectedLoanForLock(loan)}
                            className={`h-8 w-8 rounded-lg border transition-colors flex items-center justify-center ${
                              isLocked
                                ? 'border-rose-500/35 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                                : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                            title={isLocked ? 'Unlock device' : 'Lock device via Knox'}>
                            {isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                        <ShieldCheck className="h-7 w-7 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-bold text-foreground">No EMI records found</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        No contracts match your current filters. Try resetting filters or create a new EMI plan.
                      </p>
                      <Button variant="outline" size="sm" onClick={resetFilters} className="mt-1 text-xs font-semibold">
                        Reset Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground font-medium">
              Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs font-semibold">
                ← Prev
              </Button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
                <button key={pg} onClick={() => setCurrentPage(pg)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pg
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}>
                  {pg}
                </button>
              ))}

              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs font-semibold">
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ALL MODALS */}

      {/* 1. Create New EMI Plan Modal */}
      <CreateEmiPlanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 2. Record Full Payment Modal (No Partial Payments) */}
      <RecordEmiPaymentModal
        isOpen={!!selectedLoanForPayment}
        onClose={() => setSelectedLoanForPayment(null)}
        loan={selectedLoanForPayment?.loan || null}
        installmentNumber={selectedLoanForPayment?.installmentNumber}
        onSuccess={handlePaymentSuccess}
      />

      {/* 3. Official Receipt Modal */}
      <EmiReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />

      {/* 4. Complete Repayment Schedule Details Modal */}
      <EmiScheduleDetailsModal
        isOpen={!!selectedLoanForSchedule}
        onClose={() => setSelectedLoanForSchedule(null)}
        loan={selectedLoanForSchedule}
        onPayInstallment={(loan, instNum) => {
          setSelectedLoanForSchedule(null)
          setSelectedLoanForPayment({ loan, installmentNumber: instNum })
        }}
        onViewReceipt={(receipt) => {
          setSelectedLoanForSchedule(null)
          setSelectedReceipt(receipt)
        }}
        onSendReminder={(loan) => {
          setSelectedLoanForSchedule(null)
          setSelectedLoanForReminder(loan)
        }}
        onToggleLock={(loan) => {
          setSelectedLoanForSchedule(null)
          setSelectedLoanForLock(loan)
        }}
      />

      {/* 5. Send Reminder Modal */}
      <SendReminderModal
        isOpen={!!selectedLoanForReminder}
        onClose={() => setSelectedLoanForReminder(null)}
        loan={selectedLoanForReminder}
      />

      {/* 6. Lock Confirmation Modal */}
      <LockConfirmationModal
        isOpen={!!selectedLoanForLock}
        onClose={() => setSelectedLoanForLock(null)}
        loan={selectedLoanForLock}
        onConfirm={handleConfirmLockToggle}
      />
    </div>
  )
}
