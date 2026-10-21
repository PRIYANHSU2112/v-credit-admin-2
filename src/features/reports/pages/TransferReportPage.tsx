import { useState, useMemo } from 'react'
import { Printer, AlertCircle, Loader2 } from 'lucide-react'
import { useGetTransferReportsQuery } from '@/features/reports/api/reportsApi'
import type { TransferReportItem } from '@/features/reports/types'
import { useDebounce } from '@/hooks/useDebounce'
import { InvoiceReceiptModal } from '@/components/modals/InvoiceReceiptModal'
import { toast } from 'sonner'

export default function TransferReportPage() {
  const [activeTab, setActiveTab] = useState<'stockist_dist' | 'dist_dealer'>('stockist_dist')
  const [fromDate, setFromDate] = useState('2026-01-15')
  const [toDate, setToDate] = useState('2026-10-15')
  const [appliedFromDate, setAppliedFromDate] = useState<string | undefined>(undefined)
  const [appliedToDate, setAppliedToDate] = useState<string | undefined>(undefined)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [tableSearch, setTableSearch] = useState('')

  // 350ms search debounce
  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live RTK Query connection
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTransferReportsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    fromDate: appliedFromDate,
    toDate: appliedToDate,
    type: activeTab,
    keyType: 'regular',
  })

  // Invoice Receipt Modal state
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<TransferReportItem | null>(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  const reportsList: TransferReportItem[] = apiResponse?.data || []
  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: reportsList.length,
  }

  // Calculate live sales numbers
  const totalKeysVolume = useMemo(() => {
    return reportsList.reduce((acc, curr) => acc + (curr.quantity || curr.keys || 0), 0)
  }, [reportsList])

  const handleOpenInvoice = (item: TransferReportItem) => {
    setSelectedInvoiceItem(item)
    setIsInvoiceOpen(true)
  }

  const handleApplyDateSearch = () => {
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
    setCurrentPage(1)
    refetch()
    toast.success('Filtered transactions by selected date range')
  }

  const handleTodayData = () => {
    const today = new Date().toISOString().split('T')[0]
    setFromDate(today)
    setToDate(today)
    setAppliedFromDate(today)
    setAppliedToDate(today)
    setCurrentPage(1)
    refetch()
    toast.info('Displaying transfers recorded for today')
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Key Transaction Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit trail of license key consignments and retail billing dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Stockiest To Distributor */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('stockist_dist')
              setCurrentPage(1)
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'stockist_dist'
                ? 'bg-teal-600 text-white ring-2 ring-teal-400/40 shadow-sm'
                : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Stockiest To Distributor</span>
          </button>

          {/* Distributor To Dealer */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('dist_dealer')
              setCurrentPage(1)
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'dist_dealer'
                ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Distributor To Dealer</span>
          </button>
        </div>
      </div>

      {/* Subheader */}
      <h3 className="text-sm font-bold text-primary">
        {activeTab === 'stockist_dist' ? 'Stockiest To Distributor' : 'Distributor To Dealer'}
      </h3>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Total Transferred Volume</p>
          <p className="text-3xl font-black mt-2 font-mono">{totalKeysVolume.toLocaleString()}</p>
        </div>

        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Total Dispatches Logged</p>
          <p className="text-3xl font-black mt-2 font-mono">{pagination.totalItems.toLocaleString()}</p>
        </div>

        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Active Transfer Batches</p>
          <p className="text-3xl font-black mt-2 font-mono">{reportsList.length}</p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-end gap-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4 max-w-3xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">From :</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">To :</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={handleApplyDateSearch}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          search
        </button>

        <button
          type="button"
          onClick={handleTodayData}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          Today Data
        </button>
      </div>

      {/* Live Server Error Banner */}
      {isError && (
        <div className="flex items-center justify-between p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Error loading transfer reports:{' '}
              {(error && 'data' in error && (error.data as { message?: string })?.message) ||
                (error && 'error' in error ? String(error.error) : 'Failed to connect to backend server on port 3005')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-destructive text-white rounded-md font-semibold hover:bg-destructive/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="h-8 rounded-lg border border-border px-2 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Search:</span>
          <div className="relative">
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search transfer records..."
              className="h-8 w-60 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {isFetching && (
              <Loader2 className="h-3.5 w-3.5 text-primary absolute right-2.5 top-2.5 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Table with Shimmer Skeleton Loaders */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1100px]">
          <thead>
            <tr>
              <th className="w-14 text-center">#</th>
              <th className="w-48 min-w-[170px] whitespace-nowrap">Transaction Date</th>
              <th className="min-w-[240px]">Transfer To / Sender</th>
              <th className="w-32 min-w-[130px] whitespace-nowrap">No of Keys</th>
              <th className="min-w-[240px]">Remark / Batch</th>
              <th className="w-32 min-w-[130px] whitespace-nowrap">Status</th>
              <th className="w-24 text-center whitespace-nowrap">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  <td className="py-4"><div className="h-4 w-4 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-32 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-36 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-16 bg-muted/80 rounded font-mono" /></td>
                  <td><div className="h-4 w-28 bg-muted/80 rounded" /></td>
                  <td><div className="h-5 w-20 bg-muted/80 rounded" /></td>
                  <td className="text-center"><div className="h-6 w-8 bg-muted/80 rounded mx-auto" /></td>
                </tr>
              ))
            ) : reportsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">No transaction records found</p>
                    <p className="text-xs text-muted-foreground">
                      No key allocations or transfers logged for this criteria yet.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reportsList.map((r, index) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="text-muted-foreground font-mono text-xs">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="text-xs text-muted-foreground font-mono">{r.transactionDate}</td>
                  <td className="font-bold text-foreground">
                    {r.transferTo}
                    {r.toRole && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                        {r.toRole}
                      </span>
                    )}
                  </td>
                  <td className="font-bold text-foreground font-mono text-xs">{r.quantity || r.keys}</td>
                  <td className="text-xs text-muted-foreground italic">{r.note || '—'}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                          : r.status === 'Reversed'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(r)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/15 transition-colors inline-flex items-center justify-center"
                      title="View & Download Transfer Invoice Receipt PDF"
                    >
                      <div className="h-6 w-5 border border-rose-500 rounded bg-background flex flex-col items-center justify-center p-0.5 shadow-2xs">
                        <span className="text-[7px] font-black text-rose-500 leading-none">PDF</span>
                        <div className="w-3 h-0.5 bg-rose-400 mt-0.5" />
                      </div>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Server-Side Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
        <span>
          Showing {reportsList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, pagination.totalItems || reportsList.length)} of{' '}
          {pagination.totalItems || reportsList.length} entries
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-3 py-1 rounded-lg font-bold bg-primary text-primary-foreground shadow-xs">
            {currentPage} / {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= (pagination.totalPages || 1) || isFetching}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        item={selectedInvoiceItem as any}
      />
    </div>
  )
}
