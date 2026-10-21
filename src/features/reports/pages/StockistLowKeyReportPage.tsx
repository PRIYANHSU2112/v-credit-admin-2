import { useState } from 'react'
import { Key, AlertCircle, RefreshCw, Download, ShieldAlert, Building2, Send } from 'lucide-react'
import { useGetLowKeyReportsQuery } from '@/features/reports/api/reportsApi'
import type { LowKeyPartnerItem } from '@/features/reports/types'
import { useDebounce } from '@/hooks/useDebounce'
import { KeyStatusModal, type KeyStatusData } from '@/components/modals/KeyStatusModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { toast } from 'sonner'

export default function StockistLowKeyReportPage() {
  const [onlyZeroKeys, setOnlyZeroKeys] = useState(false)
  const [threshold, setThreshold] = useState<number>(40)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [tableSearch, setTableSearch] = useState('')
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  // 350ms search debounce
  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live RTK Query connection for Stockist role
  const activeThreshold = onlyZeroKeys ? 0 : threshold
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetLowKeyReportsQuery({
    role: 'stockist',
    threshold: activeThreshold,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
  })

  // Modals state
  const [keyStatusData, setKeyStatusData] = useState<KeyStatusData | null>(null)
  const [isKeyStatusOpen, setIsKeyStatusOpen] = useState(false)
  const [returnStockist, setReturnStockist] = useState<string>('')
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)

  const stockistsList: LowKeyPartnerItem[] = apiResponse?.data || []
  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: stockistsList.length,
  }

  const handleRemarkSubmit = (stkId: string, name: string) => {
    const text = remarks[stkId] || ''
    toast.success(`Remark saved for ${name}: "${text || 'No remark'}"`)
  }

  const handleOpenKeyStatus = (s: LowKeyPartnerItem) => {
    setKeyStatusData({
      agencyName: s.agency || s.name,
      totalKeys: s.totalKeys || 0,
      usedKeys: s.usedKeys || 0,
      availableKeys: s.availableKeys || 0,
    })
    setIsKeyStatusOpen(true)
  }

  const handleOpenReturn = (s: LowKeyPartnerItem) => {
    setReturnStockist(s.agency || s.name)
    setIsReturnModalOpen(true)
  }

  const handleExportCSV = () => {
    if (stockistsList.length === 0) {
      toast.error('No stockist records to export')
      return
    }

    const headers = ['Stockist / Agency', 'Territory', 'Phone', 'City', 'State', 'Available Keys', 'Total Keys', 'Status', 'Last Active']
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...stockistsList.map((s) =>
          [
            `"${s.agency || s.name}"`,
            `"${s.state || '—'}"`,
            `"${s.phone}"`,
            `"${s.city}"`,
            `"${s.state}"`,
            s.availableKeys,
            s.totalKeys,
            `"${s.status || (s.availableKeys === 0 ? 'Critical (0 Keys)' : 'Low Warning')}"`,
            `"${s.lastActive}"`,
          ].join(',')
        ),
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `low_key_stockists_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported low-key stockists report to CSV')
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Depleted Stockist Keys Report
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Regional Alert
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Super Admin Regional Oversight: Monitoring stockists operating below safety key threshold (&le; {activeThreshold} keys)
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all duration-150"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-xl border border-border/60">
        {/* Only 0 Keys Toggle */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card border border-border shadow-2xs">
          <input
            id="onlyZeroStockists"
            type="checkbox"
            checked={onlyZeroKeys}
            onChange={(e) => {
              setOnlyZeroKeys(e.target.checked)
              setCurrentPage(1)
            }}
            className="h-4 w-4 rounded border-border text-rose-500 focus:ring-rose-500/20 cursor-pointer accent-rose-500"
          />
          <label htmlFor="onlyZeroStockists" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            <span>Only Critical (0 Keys)</span>
          </label>
        </div>

        {/* Threshold Selector */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-2xs">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Threshold:</span>
          <select
            value={threshold}
            disabled={onlyZeroKeys}
            onChange={(e) => {
              setThreshold(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="w-full text-xs font-semibold bg-transparent border-none text-foreground focus:outline-none disabled:opacity-50"
          >
            <option value={10}>&le; 10 Keys (Critical Warning)</option>
            <option value={25}>&le; 25 Keys (Low Alert)</option>
            <option value={40}>&le; 40 Keys (Standard Quota)</option>
            <option value={100}>&le; 100 Keys (Regional High)</option>
          </select>
        </div>

        {/* Status Indicator Pill */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-card border border-border shadow-2xs">
          <span className="text-xs text-muted-foreground">Active Filter:</span>
          <span className="text-xs font-bold font-mono text-primary">
            {onlyZeroKeys ? 'Critical (0 Keys)' : `Low Warning (≤ ${threshold} Keys)`}
          </span>
        </div>

        {/* Total Depleted Count Badge */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-card border border-border shadow-2xs">
          <span className="text-xs text-muted-foreground">Depleted Stockists:</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono">
            {pagination.totalItems}
          </span>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load stockist report: {(error as any)?.data?.message || 'Server connection error'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Table Controls (Search & Page Size) */}
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
            placeholder="Search stockist, territory, city..."
            className="h-8 w-full sm:w-64 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table with Generous Widths for Readability */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1250px]">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th className="min-w-[220px]">Stockist / Agency</th>
              <th className="min-w-[180px] whitespace-nowrap">Territory / Region</th>
              <th className="min-w-[140px] whitespace-nowrap">Phone</th>
              <th className="min-w-[130px] whitespace-nowrap">City</th>
              <th className="min-w-[130px] whitespace-nowrap">Last Active</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Available Keys</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Total Keys</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Status</th>
              <th className="w-36 min-w-[130px] text-center whitespace-nowrap">Keys Action</th>
              <th className="min-w-[220px]">Update Remark</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse border-b border-border/50">
                  <td className="py-3 px-4 text-center"><div className="h-4 w-4 bg-muted rounded mx-auto"></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-40 bg-muted rounded"></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-28 bg-muted rounded"></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                  <td className="py-3 px-4 text-center"><div className="h-4 w-12 bg-muted rounded mx-auto"></div></td>
                  <td className="py-3 px-4 text-center"><div className="h-4 w-12 bg-muted rounded mx-auto"></div></td>
                  <td className="py-3 px-4 text-center"><div className="h-5 w-20 bg-muted rounded-full mx-auto"></div></td>
                  <td className="py-3 px-4 text-center"><div className="h-7 w-20 bg-muted rounded mx-auto"></div></td>
                  <td className="py-3 px-4"><div className="h-8 w-44 bg-muted rounded"></div></td>
                </tr>
              ))
            ) : stockistsList.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-emerald-500/60" />
                    <p className="text-sm font-semibold text-foreground">
                      No Stockists with Depleted Inventory
                    </p>
                    <p className="text-xs text-muted-foreground/80 max-w-sm">
                      All registered regional stockists maintain healthy key reserves exceeding the safety threshold of &le; {activeThreshold} keys.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              stockistsList.map((s, index) => {
                const rowNum = (currentPage - 1) * pageSize + index + 1
                const isCritical = s.availableKeys === 0

                return (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-xs text-center">{rowNum}</td>
                    <td>
                      <div className="font-bold text-foreground text-sm">{s.agency || s.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{s.entityCode || s.id}</div>
                    </td>
                    <td className="text-foreground text-xs font-medium whitespace-nowrap">{s.state || 'National / Regional'}</td>
                    <td className="text-muted-foreground font-mono text-xs whitespace-nowrap">{s.phone}</td>
                    <td className="text-foreground text-xs whitespace-nowrap">{s.city}</td>
                    <td className="text-xs text-muted-foreground font-mono whitespace-nowrap">{s.lastActive || 'Just now'}</td>
                    <td className="text-center">
                      <span className={`font-black font-mono text-sm ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {s.availableKeys}
                      </span>
                    </td>
                    <td className="font-bold text-foreground text-center font-mono text-sm">{s.totalKeys}</td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {isCritical ? 'Critical (0 Keys)' : 'Low Warning'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenKeyStatus(s)}
                          className="h-7 w-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-colors shadow-2xs"
                          title="View Key Status"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReturn(s)}
                          className="h-7 w-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-500/25 transition-colors shadow-2xs"
                          title="Return Keys"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info(`Issuing quota batch for ${s.agency || s.name}`)}
                          className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors shadow-2xs"
                          title="Allocate New Keys"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={remarks[s.id] ?? ''}
                          onChange={(e) =>
                            setRemarks({ ...remarks, [s.id]: e.target.value })
                          }
                          placeholder="Add inventory note..."
                          className="h-8 w-44 rounded-lg border border-border px-2 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemarkSubmit(s.id, s.agency || s.name)}
                          className="h-8 px-2.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Save Remark"
                        >
                          <Send className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
        <div>
          Showing {stockistsList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, pagination.totalItems)} of {pagination.totalItems} entries
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold font-mono">
            {currentPage} / {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= pagination.totalPages || isLoading}
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {keyStatusData && (
        <KeyStatusModal
          isOpen={isKeyStatusOpen}
          onClose={() => setIsKeyStatusOpen(false)}
          data={keyStatusData}
        />
      )}

      {returnStockist && (
        <KeysReturnModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          distributorName={returnStockist}
        />
      )}
    </div>
  )
}
