import { useState } from 'react'
import { AlertCircle, Loader2, ArrowDownLeft, RefreshCw, FileText } from 'lucide-react'
import { useGetTransferReportsQuery } from '@/features/reports/api/reportsApi'
import type { TransferReportItem } from '@/features/reports/types'
import { useDebounce } from '@/hooks/useDebounce'
import { InvoiceReceiptModal } from '@/components/modals/InvoiceReceiptModal'

export default function ReceivedKeyReportPage() {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [tableSearch, setTableSearch] = useState('')

  // 350ms search debounce
  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live RTK Query connection for received keys
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
    type: 'received',
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

  const handleOpenReceipt = (item: TransferReportItem) => {
    setSelectedInvoiceItem(item)
    setIsInvoiceOpen(true)
  }

  // Calculate live volume
  const totalReceivedKeys = reportsList.reduce((acc, curr) => acc + (curr.quantity || curr.keys || 0), 0)

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Key Received Reports</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Inbound Allocations
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inbound license key allocations received from parent super-stockist & regional hubs
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
        <div className="card-stat-blue p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
            <span className="text-xs font-bold uppercase tracking-wider">Total Received Volume</span>
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <p className="text-2xl font-black mt-2 font-mono text-blue-900 dark:text-blue-100">
            {totalReceivedKeys.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Keys recorded in current view</p>
        </div>

        <div className="card-stat-yellow p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Batches</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-black mt-2 font-mono text-foreground">
            {pagination.totalItems.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Verified consignment consignments</p>
        </div>
      </div>

      {/* Error Resilience Alert */}
      {isError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {error && 'data' in error
                ? String((error.data as { message?: string })?.message || 'Failed to fetch received key records')
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
            placeholder="Search sender, batch or notes..."
            className="h-8 w-full sm:w-64 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1050px]">
          <thead>
            <tr>
              <th className="w-14 text-center">#</th>
              <th className="w-48 min-w-[170px] whitespace-nowrap">Transaction Date</th>
              <th className="min-w-[240px]">Received From</th>
              <th className="w-32 min-w-[130px] whitespace-nowrap">No of Keys</th>
              <th className="w-32 min-w-[120px] whitespace-nowrap">Key Price</th>
              <th className="w-32 min-w-[120px] whitespace-nowrap">Status</th>
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
                    <div className="h-4 w-36 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-muted rounded-full"></div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="h-7 w-16 bg-muted rounded-lg ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : reportsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ArrowDownLeft className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold">No received key records found</p>
                    <p className="text-xs text-muted-foreground/70 max-w-sm">
                      When parent super-stockists transfer device unlock license consignments to this entity,
                      they will appear here automatically.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reportsList.map((r, index) => {
                const quantity = r.quantity || r.noOfKeys || r.keys || 0
                const unitPrice = r.keyPrice || 50
                const rowNum = (currentPage - 1) * pageSize + index + 1
                return (
                  <tr key={r.id || r.transferId || index} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-xs">{rowNum}</td>
                    <td className="text-xs text-muted-foreground font-mono">{r.transactionDate}</td>
                    <td>
                      <div className="font-bold text-foreground">
                        {r.receivedFrom || r.sendBy || 'V-Credit Super Stockist'}
                      </div>
                      {r.receivedPhone && (
                        <div className="text-[11px] text-muted-foreground font-mono">{r.receivedPhone}</div>
                      )}
                    </td>
                    <td className="font-bold text-foreground font-mono">{quantity.toLocaleString()}</td>
                    <td className="font-mono text-xs text-primary font-semibold">₹{unitPrice.toFixed(2)}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {r.status || 'Received'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span>Receipt</span>
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
