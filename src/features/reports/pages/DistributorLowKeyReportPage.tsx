import { useState } from 'react'
import { Key, AlertCircle, Loader2, RefreshCw, Download, ShieldAlert } from 'lucide-react'
import { useGetLowKeyReportsQuery } from '@/features/reports/api/reportsApi'
import { useGetStockistsQuery } from '@/features/partners/api/partnersApi'
import type { LowKeyPartnerItem } from '@/features/reports/types'
import { useDebounce } from '@/hooks/useDebounce'
import { KeyStatusModal, type KeyStatusData } from '@/components/modals/KeyStatusModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { toast } from 'sonner'

export default function DistributorLowKeyReportPage() {
  const [onlyZeroKeys, setOnlyZeroKeys] = useState(false)
  const [threshold, setThreshold] = useState<number>(40)
  const [selectedStockistId, setSelectedStockistId] = useState<string>('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [tableSearch, setTableSearch] = useState('')
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  // 350ms search debounce
  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live stockists query for dynamic filter dropdown
  const { data: stockistsRes } = useGetStockistsQuery()
  const stockistsList = stockistsRes?.data && Array.isArray(stockistsRes.data) ? stockistsRes.data : []

  // Live RTK Query connection
  const activeThreshold = onlyZeroKeys ? 0 : threshold
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetLowKeyReportsQuery({
    role: 'distributor',
    threshold: activeThreshold,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    parentId: selectedStockistId !== 'all' ? selectedStockistId : undefined,
  })

  // Modals state
  const [keyStatusData, setKeyStatusData] = useState<KeyStatusData | null>(null)
  const [isKeyStatusOpen, setIsKeyStatusOpen] = useState(false)
  const [returnDistributorId, setReturnDistributorId] = useState<string>('')
  const [returnDistributor, setReturnDistributor] = useState<string>('')
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)

  const distributorsList: LowKeyPartnerItem[] = apiResponse?.data || []
  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: distributorsList.length,
  }

  const handleRemarkSubmit = (distId: string, agencyName: string) => {
    const text = remarks[distId] || ''
    toast.success(`Remark saved for ${agencyName}: "${text || 'No remark'}"`)
  }

  const handleOpenKeyStatus = (d: LowKeyPartnerItem) => {
    setKeyStatusData({
      agencyName: d.agency || d.name,
      totalKeys: d.totalKeys || 0,
      usedKeys: d.usedKeys || 0,
      availableKeys: d.availableKeys || 0,
    })
    setIsKeyStatusOpen(true)
  }

  const handleOpenReturn = (d: LowKeyPartnerItem) => {
    setReturnDistributorId(d.id || (d as any)._id)
    setReturnDistributor(d.agency || d.name)
    setIsReturnModalOpen(true)
  }

  const handleExportCSV = () => {
    if (distributorsList.length === 0) {
      toast.error('No distributor records to export')
      return
    }

    const headers = ['Agency', 'Phone', 'City', 'State', 'Available Keys', 'Total Keys', 'Last Active']
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...distributorsList.map((d) =>
          [
            `"${d.agency || d.name}"`,
            `"${d.phone}"`,
            `"${d.city}"`,
            `"${d.state}"`,
            d.availableKeys,
            d.totalKeys,
            `"${d.lastActive}"`,
          ].join(',')
        ),
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `low_key_distributors_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported low-key distributors report to CSV')
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Depleted Distributor Keys Report
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Low Stock Alert
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing distributors operating below safety inventory threshold (&le; {activeThreshold} keys)
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

      {/* Top Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 border border-border/60 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Threshold:</span>
            <select
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value))
                setCurrentPage(1)
              }}
              disabled={onlyZeroKeys}
              className="h-8 rounded-lg border border-border px-2 text-xs bg-background text-foreground disabled:opacity-50"
            >
              <option value={10}>&le; 10 Keys</option>
              <option value={20}>&le; 20 Keys</option>
              <option value={40}>&le; 40 Keys</option>
              <option value={100}>&le; 100 Keys</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Stockist:</span>
            <select
              value={selectedStockistId}
              onChange={(e) => {
                setSelectedStockistId(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 rounded-lg border border-border px-2 text-xs bg-background text-foreground cursor-pointer font-medium"
            >
              <option value="all">All Regional Stockists</option>
              {stockistsList.map((s: any) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <button
            type="button"
            onClick={() => {
              setOnlyZeroKeys(!onlyZeroKeys)
              setCurrentPage(1)
            }}
            className={`text-xs font-bold h-8 px-4 rounded-lg transition-colors shadow-xs ${
              onlyZeroKeys
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'btn-action-primary'
            }`}
          >
            {onlyZeroKeys ? 'Showing 0 Keys Only (Click to reset)' : 'Filter 0 Keys Only'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isLoading || distributorsList.length === 0}
          className="btn-action-success text-xs font-bold flex items-center gap-1.5 py-1.5 px-4 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export to Excel / CSV</span>
        </button>
      </div>

      {/* Error Resilience Alert */}
      {isError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {error && 'data' in error
                ? String((error.data as { message?: string })?.message || 'Failed to fetch low key distributors')
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
            placeholder="Search distributor, city, phone..."
            className="h-8 w-full sm:w-64 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1250px]">
          <thead>
            <tr>
              <th className="w-14 text-center">#</th>
              <th className="min-w-[220px]">Agency / Distributor</th>
              <th className="min-w-[140px] whitespace-nowrap">Phone</th>
              <th className="min-w-[130px] whitespace-nowrap">City</th>
              <th className="min-w-[130px] whitespace-nowrap">State</th>
              <th className="min-w-[140px] whitespace-nowrap">Last Billing</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Available Keys</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Total Keys</th>
              <th className="w-36 min-w-[130px] text-center whitespace-nowrap">Keys Action</th>
              <th className="min-w-[220px]">Update Remark</th>
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
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-12 bg-muted rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-12 bg-muted rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-7 w-20 bg-muted rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-8 w-44 bg-muted rounded"></div>
                  </td>
                </tr>
              ))
            ) : distributorsList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-emerald-500/60" />
                    <p className="text-sm font-semibold text-foreground">
                      No Distributors with Depleted Stock
                    </p>
                    <p className="text-xs text-muted-foreground/80 max-w-sm">
                      All registered distributors currently maintain healthy key balances above the threshold of &le; {activeThreshold} keys.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              distributorsList.map((d, index) => {
                const rowNum = (currentPage - 1) * pageSize + index + 1
                return (
                  <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-xs">{rowNum}</td>
                    <td>
                      <div className="font-bold text-foreground">{d.agency || d.name}</div>
                      <div className="text-[11px] text-muted-foreground">{d.name}</div>
                    </td>
                    <td className="text-muted-foreground font-mono text-xs">{d.phone}</td>
                    <td className="text-foreground">{d.city}</td>
                    <td className="text-muted-foreground">{d.state}</td>
                    <td className="text-xs text-muted-foreground font-mono">{d.lastBillingDate || 'N/A'}</td>
                    <td className="font-black text-rose-500 text-center font-mono">
                      {d.availableKeys}
                    </td>
                    <td className="font-bold text-foreground text-center font-mono">{d.totalKeys}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenKeyStatus(d)}
                          className="h-7 w-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-colors shadow-2xs"
                          title="View Key Status"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReturn(d)}
                          className="h-7 w-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-500/25 transition-colors shadow-2xs"
                          title="Return Keys"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info(`Issuing quota for ${d.agency || d.name}`)}
                          className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors shadow-2xs"
                          title="Allocate Keys"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={remarks[d.id] ?? ''}
                          onChange={(e) =>
                            setRemarks({ ...remarks, [d.id]: e.target.value })
                          }
                          placeholder="Enter Remark"
                          className="h-8 rounded-lg border border-border px-2 text-xs text-foreground bg-background w-32 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemarkSubmit(d.id, d.agency || d.name)}
                          className="btn-action-primary text-xs font-bold h-8 px-3"
                        >
                          Submit
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

      {/* Key Status Modal */}
      <KeyStatusModal
        isOpen={isKeyStatusOpen}
        onClose={() => setIsKeyStatusOpen(false)}
        data={keyStatusData}
      />

      {/* Keys Return Modal */}
      <KeysReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        distributorName={returnDistributor}
        partnerId={returnDistributorId}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
