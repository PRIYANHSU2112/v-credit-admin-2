import { useState } from 'react'
import { Eye, AlertCircle, Loader2 } from 'lucide-react'
import { useGetEndUsersQuery } from '@/features/customers/api/customersApi'
import type { EndUserRecord } from '@/features/customers/types'
import { useDebounce } from '@/hooks/useDebounce'
import { UserDetailsModal } from '@/components/modals/UserDetailsModal'
import { toast } from 'sonner'

export default function PendingUsersPage() {
  const [fromDate, setFromDate] = useState('2026-08-01')
  const [toDate, setToDate] = useState('2026-10-14')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // 350ms Debounced search
  const debouncedSearch = useDebounce(tableSearch, 350)

  // Live RTK Query connection to port 3005
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetEndUsersQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
  })

  // Details Modal state
  const [selectedUser, setSelectedUser] = useState<EndUserRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const allUsers: EndUserRecord[] = apiResponse?.data || []
  // Filter for records with Pending lifecycle status
  const pendingUsers = allUsers.filter(
    (u) =>
      u.status?.toLowerCase() === 'pending' ||
      u.loanStatus?.toLowerCase() === 'pending' ||
      !u.keyId ||
      u.keyId === '—'
  )

  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: pendingUsers.length,
  }

  const handleOpenDetails = (u: EndUserRecord) => {
    setSelectedUser(u)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Pending Users</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customer applications awaiting retail verification and device key authorization
        </p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4 max-w-2xl">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-primary">From :</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-primary">To :</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrentPage(1)
            refetch()
            toast.success('Filtered pending customer records by date')
          }}
          className="btn-action-primary text-sm font-bold h-10 px-6"
        >
          search
        </button>
      </div>

      {/* Live Server Error Banner */}
      {isError && (
        <div className="flex items-center justify-between p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Error loading pending users:{' '}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="h-9 rounded-lg border border-border px-2.5 bg-background text-foreground text-sm focus:ring-1 focus:ring-primary"
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
              placeholder="Search pending users..."
              className="h-10 w-64 rounded-lg border border-border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {isFetching && (
              <Loader2 className="h-4 w-4 text-primary absolute right-2.5 top-3 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Table with Shimmer Skeleton Loaders */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>User Name</th>
              <th>User Phone</th>
              <th>Activation Date</th>
              <th>Dealer</th>
              <th>City / Location</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  <td className="py-4"><div className="h-4 w-4 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-32 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-24 bg-muted/80 rounded font-mono" /></td>
                  <td><div className="h-4 w-20 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-28 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-20 bg-muted/80 rounded" /></td>
                  <td><div className="h-5 w-16 bg-muted/80 rounded" /></td>
                  <td className="text-center"><div className="h-7 w-7 bg-muted/80 rounded-full mx-auto" /></td>
                </tr>
              ))
            ) : pendingUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">No pending customer records found</p>
                    <p className="text-xs text-muted-foreground">
                      All registered borrower smartphones have completed device authorization.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pendingUsers.map((u, index) => (
                <tr key={u.id || u._id} className="hover:bg-muted/40 transition-colors">
                  <td className="text-muted-foreground font-mono text-sm">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="font-bold text-foreground text-sm">{u.name || u.userName}</td>
                  <td className="text-muted-foreground font-mono text-sm">{u.phone || u.userPhone}</td>
                  <td className="text-sm text-muted-foreground font-mono">{u.activatedAt || u.activationDate || '—'}</td>
                  <td className="text-sm font-semibold text-foreground">{u.dealer || 'Direct Store'}</td>
                  <td className="text-sm text-muted-foreground">{u.city || '—'}</td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      {u.status || 'Pending'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(u)}
                      className="p-1.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors inline-flex items-center justify-center"
                      title="Inspect User Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Server-Side Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground pt-2">
        <span>
          Showing {pendingUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, pagination.totalItems || pendingUsers.length)} of{' '}
          {pagination.totalItems || pendingUsers.length} entries
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            Previous
          </button>
          <span className="px-3.5 py-1.5 rounded-lg font-bold bg-primary text-primary-foreground shadow-xs text-sm">
            {currentPage} / {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= (pagination.totalPages || 1) || isFetching}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}
