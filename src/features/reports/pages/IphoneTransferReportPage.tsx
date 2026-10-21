import { useState, useMemo } from 'react'
import { Printer, AlertCircle, Loader2, RefreshCw, FileText } from 'lucide-react'
import { useGetTransferReportsQuery } from '@/features/reports/api/reportsApi'
import type { TransferReportItem } from '@/features/reports/types'
import { useDebounce } from '@/hooks/useDebounce'
import { InvoiceReceiptModal } from '@/components/modals/InvoiceReceiptModal'
import { toast } from 'sonner'

export default function IphoneTransferReportPage() {
  const [activeTab, setActiveTab] = useState<'stockist_dist' | 'dist_dealer'>('dist_dealer')
  const [fromDate, setFromDate] = useState('2026-01-14')
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
    keyType: 'iphone',
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

  // Live Sell metrics calculated from backend data
  const { todaySell, weeklySell, monthlySell } = useMemo(() => {
    let today = 0
    let weekly = 0
    let monthly = 0
    let total = 0
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    reportsList.forEach((r) => {
      const qty = r.quantity || r.noOfKeys || r.keys || 0
      total += qty
      const txDate = r.transactionDate ? new Date(r.transactionDate) : null
      if (txDate) {
        const itemDateStr = txDate.toISOString().split('T')[0]
        if (itemDateStr === todayStr) today += qty
        if (txDate >= sevenDaysAgo) weekly += qty
        if (txDate >= thirtyDaysAgo) monthly += qty
      }
    })

    return { totalVolume: total, todaySell: today, weeklySell: weekly, monthlySell: monthly }
  }, [reportsList])

  const handleOpenReceipt = (item: TransferReportItem) => {
    setSelectedInvoiceItem(item)
    setIsInvoiceOpen(true)
  }

  const handleApplyDateSearch = () => {
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
    setCurrentPage(1)
    refetch()
    toast.success('Filtered iPhone transfers by selected date range')
  }

  const handleTodayData = () => {
    const today = new Date().toISOString().split('T')[0]
    setFromDate(today)
    setToDate(today)
    setAppliedFromDate(today)
    setAppliedToDate(today)
    setCurrentPage(1)
    refetch()
    toast.info('Displaying iPhone transfers recorded for today')
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              iPhone Key Transaction Reports
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              iOS MDM Keys
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            iOS device activation license transfer and quota audit history
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary">
          {activeTab === 'stockist_dist' ? 'Stockiest To Distributor (iOS Keys)' : 'Distributor To Dealer (iOS Keys)'}
        </h3>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Today iPhone Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">{todaySell}</p>
        </div>
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Weekly iPhone Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">{weeklySell}</p>
        </div>
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Monthly iPhone Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">{monthlySell}</p>
        </div>
      </div>

      {/* Error Resilience Alert */}
      {isError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {error && 'data' in error
                ? String((error.data as { message?: string })?.message || 'Failed to fetch iPhone transfer records')
                : 'Server connection timeout. Please verify backend service.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Date Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-muted/30 border border-border/60 rounded-xl p-4 max-w-3xl">
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
          disabled={isLoading || isFetching}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleTodayData}
          disabled={isLoading || isFetching}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          Today Data
        </button>
      </div>

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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span>Search:</span>
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => {
              setTableSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search transfer records..."
            className="h-8 w-full sm:w-64 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1050px]">
          <thead>
            <tr>
              <th className="w-16 text-center">Sr No.</th>
              <th className="w-48 min-w-[170px] whitespace-nowrap">Transaction Date</th>
              <th className="min-w-[200px]">Send By</th>
              <th className="min-w-[220px]">Transfer To / Return From</th>
              <th className="w-32 min-w-[120px] whitespace-nowrap text-center">No of Keys</th>
              <th className="w-32 min-w-[120px] whitespace-nowrap text-center">Key Price</th>
              <th className="w-24 text-right whitespace-nowrap">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // 5-row Shimmer Skeleton Loader
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse border-b border-border/50">
                  <td className="py-3 px-4">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-28 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-36 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-7 w-16 bg-muted rounded-lg ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : reportsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Printer className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">No iPhone transfer records found</p>
                    <p className="text-xs text-muted-foreground/70 max-w-sm">
                      Specialized iOS device unlock keys transferred between stockists and retail partners
                      will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reportsList.map((r, index) => {
                const rowNum = (currentPage - 1) * pageSize + index + 1
                const quantity = r.quantity || r.noOfKeys || r.keys || 0
                const unitPrice = r.keyPrice || 600
                return (
                  <tr key={r.id || r.transferId || index} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-xs">{rowNum}</td>
                    <td className="text-xs text-muted-foreground font-mono">{r.transactionDate}</td>
                    <td className="font-bold text-foreground">{r.sendBy}</td>
                    <td>
                      <div className="text-foreground font-medium">{r.transferTo}</div>
                      {r.toPhone && <div className="text-[11px] text-muted-foreground font-mono">{r.toPhone}</div>}
                    </td>
                    <td className="font-bold text-foreground font-mono">{quantity.toLocaleString()}</td>
                    <td className="font-mono text-xs text-primary font-semibold">₹{unitPrice.toFixed(2)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Server Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
        <span>
          Showing{' '}
          {pagination.totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, pagination.totalItems)} of {pagination.totalItems} entries
          {isFetching && <Loader2 className="inline ml-2 h-3 w-3 animate-spin text-primary" />}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(pagination.totalPages || 1, 5) }).map((_, i) => {
            const pageNum = i + 1
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={currentPage >= pagination.totalPages || isLoading}
            className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        item={selectedInvoiceItem}
      />
    </div>
  )
}
