import { useState } from 'react'
import { Key, AlertCircle, Loader2, RefreshCw, Download, ShieldAlert } from 'lucide-react'
import { useGetLowKeyReportsQuery } from '@/features/reports/api/reportsApi'
import { useGetDistributorsQuery } from '@/features/partners/api/partnersApi'
import { useTransferKeysMutation } from '@/features/keys/api/keysApi'
import type { LowKeyPartnerItem } from '@/features/reports/types'
import { useDebounce } from '@/hooks/useDebounce'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { DealerDetailsModal, type DealerDetailsData } from '@/components/modals/DealerDetailsModal'
import { toast } from 'sonner'

export default function DealerLowKeyReportPage() {
  const [mode, setMode] = useState<'all_low' | 'zero_keys'>('all_low')
  const [threshold, setThreshold] = useState<number>(10)
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [tableSearch, setTableSearch] = useState('')
  const [keyInputValues, setKeyInputValues] = useState<{ [dealerId: string]: string }>({})

  // 350ms search debounce
  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live partners query for dynamic filter dropdown
  const { data: distributorsRes } = useGetDistributorsQuery()
  const distributorsList = distributorsRes?.data && Array.isArray(distributorsRes.data) ? distributorsRes.data : []

  // Live Key Transfer Mutation for Quick Allocation
  const [transferKeys, { isLoading: isAllocating }] = useTransferKeysMutation()

  // Live RTK Query connection
  const activeThreshold = mode === 'zero_keys' ? 0 : threshold
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetLowKeyReportsQuery({
    role: 'dealer',
    threshold: activeThreshold,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    parentId: selectedDistributorId !== 'all' ? selectedDistributorId : undefined,
  })

  // Modals state
  const [returnDealerId, setReturnDealerId] = useState('')
  const [returnDealerName, setReturnDealerName] = useState('')
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [selectedDealerForDetails, setSelectedDealerForDetails] = useState<DealerDetailsData | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const dealersList: LowKeyPartnerItem[] = apiResponse?.data || []
  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: dealersList.length,
  }

  // Key Allocation Action
  const handleKeyInputChange = (dealerId: string, val: string) => {
    setKeyInputValues({
      ...keyInputValues,
      [dealerId]: val,
    })
  }

  const handleAllocateKeysSubmit = async (dealer: LowKeyPartnerItem) => {
    const val = parseInt(keyInputValues[dealer.id] || '', 10)
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter the number of keys to allocate')
      return
    }

    try {
      await transferKeys({
        toUserId: dealer.id || (dealer as any)._id,
        quantity: val,
        note: `Allocated directly from Dealer Low Key Report`,
      }).unwrap()

      toast.success(`Successfully allocated ${val} keys to ${dealer.dealerShop || dealer.name}!`)
      setKeyInputValues({
        ...keyInputValues,
        [dealer.id]: '',
      })
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to allocate keys to dealer.')
    }
  }

  const handleExportCSV = () => {
    if (dealersList.length === 0) {
      toast.error('No dealer records to export')
      return
    }

    const headers = ['Entity Code', 'Dealer / Shop', 'Phone', 'City', 'State', 'Available Keys', 'Total Keys', 'Status']
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...dealersList.map((d) =>
          [
            `"${d.entityCode || d.id}"`,
            `"${d.dealerShop || d.name}"`,
            `"${d.phone}"`,
            `"${d.city}"`,
            `"${d.state}"`,
            d.availableKeys,
            d.totalKeys,
            `"${d.status}"`,
          ].join(',')
        ),
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `low_key_dealers_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported low-key dealers report to CSV')
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Depleted Dealer Keys Report
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Retail Stock Alert
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing retail dealers with low key stock threshold (&le; {activeThreshold} license keys remaining)
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

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 border border-border/60 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Stock Threshold:</span>
            <select
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value))
                setCurrentPage(1)
              }}
              disabled={mode === 'zero_keys'}
              className="h-8 rounded-lg border border-border px-2 text-xs bg-background text-foreground disabled:opacity-50"
            >
              <option value={5}>&le; 5 Keys</option>
              <option value={10}>&le; 10 Keys</option>
              <option value={20}>&le; 20 Keys</option>
              <option value={50}>&le; 50 Keys</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Distributor:</span>
            <select
              value={selectedDistributorId}
              onChange={(e) => {
                setSelectedDistributorId(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 rounded-lg border border-border px-2 text-xs bg-background text-foreground cursor-pointer font-medium"
            >
              <option value="all">All City Distributors</option>
              {distributorsList.map((d: any) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('all_low')
                setCurrentPage(1)
              }}
              className={`text-xs font-bold h-8 px-3 rounded-lg transition-colors ${
                mode === 'all_low' ? 'bg-primary text-primary-foreground shadow-xs' : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              All Low Keys
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('zero_keys')
                setCurrentPage(1)
              }}
              className={`text-xs font-bold h-8 px-3 rounded-lg transition-colors ${
                mode === 'zero_keys' ? 'bg-rose-600 text-white shadow-xs' : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              Zero (0) Keys Only
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isLoading || dealersList.length === 0}
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
                ? String((error.data as { message?: string })?.message || 'Failed to fetch low key dealers')
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
            placeholder="Search dealer, shop, city, phone..."
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
              <th className="min-w-[220px]">Shop / Dealer</th>
              <th className="min-w-[140px] whitespace-nowrap">Phone</th>
              <th className="min-w-[130px] whitespace-nowrap">City</th>
              <th className="min-w-[130px] whitespace-nowrap">State</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Available Keys</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Total Keys</th>
              <th className="min-w-[130px] whitespace-nowrap">Last Active</th>
              <th className="w-24 text-center whitespace-nowrap">Return</th>
              <th className="w-36 text-center whitespace-nowrap">Quick Allocate</th>
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
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-12 bg-muted rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-4 w-12 bg-muted rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-7 w-7 bg-muted rounded-full mx-auto"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-8 w-28 bg-muted rounded"></div>
                  </td>
                </tr>
              ))
            ) : dealersList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-emerald-500/60" />
                    <p className="text-sm font-semibold text-foreground">
                      No Retail Outlets with Depleted Stock
                    </p>
                    <p className="text-xs text-muted-foreground/80 max-w-sm">
                      All registered dealers currently maintain key balances above the threshold of &le; {activeThreshold} keys.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              dealersList.map((d, index) => {
                const rowNum = (currentPage - 1) * pageSize + index + 1
                return (
                  <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-xs">{rowNum}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDealerForDetails({
                            id: d.id,
                            entityCode: d.entityCode,
                            dealerShop: d.dealerShop || d.name,
                            dealerName: d.dealerName || d.name,
                            phone: d.phone,
                            email: d.email,
                            city: d.city,
                            state: d.state,
                            availableKeys: d.availableKeys,
                            totalKeys: d.totalKeys,
                            distributor: d.distributor || 'V-Credit HQ',
                          })
                          setIsDetailsOpen(true)
                        }}
                        className="font-bold text-foreground hover:text-primary hover:underline text-left cursor-pointer"
                      >
                        {d.dealerShop || d.name}
                      </button>
                      <div className="text-[11px] text-muted-foreground">{d.name}</div>
                    </td>
                    <td className="text-muted-foreground font-mono text-xs">{d.phone}</td>
                    <td className="text-foreground">{d.city}</td>
                    <td className="text-muted-foreground">{d.state}</td>
                    <td className="font-black text-rose-500 text-center font-mono">
                      {d.availableKeys}
                    </td>
                    <td className="font-bold text-foreground text-center font-mono">{d.totalKeys}</td>
                    <td className="text-xs text-muted-foreground font-mono">{d.lastActive || 'Today'}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setReturnDealerId(d.id || (d as any)._id)
                          setReturnDealerName(d.dealerShop || d.name)
                          setIsReturnOpen(true)
                        }}
                        className="p-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors inline-flex items-center justify-center shadow-2xs"
                        title="Return / Adjust Keys"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={keyInputValues[d.id] || ''}
                          onChange={(e) => handleKeyInputChange(d.id, e.target.value)}
                          className="w-16 h-8 rounded-lg border border-border px-2 text-xs text-center font-bold text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleAllocateKeysSubmit(d)}
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

      {/* Keys Return Modal */}
      <KeysReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        distributorName={returnDealerName}
        partnerId={returnDealerId}
        onSuccess={() => refetch()}
      />

      {/* Dealer Details Modal */}
      <DealerDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        dealer={selectedDealerForDetails}
      />
    </div>
  )
}
