import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Lock, Unlock, Settings, AlertCircle, Loader2 } from 'lucide-react'
import {
  useGetEndUsersQuery,
  useLockDeviceMutation,
  useUnlockDeviceMutation,
} from '@/features/customers/api/customersApi'
import type { EndUserRecord } from '@/features/customers/types'
import { useDebounce } from '@/hooks/useDebounce'
import { UserDetailsModal } from '@/components/modals/UserDetailsModal'
import { toast } from 'sonner'

export default function UserSearchPage() {
  const navigate = useNavigate()
  const [searchBy, setSearchBy] = useState<'Phone' | 'Name' | 'LoanId' | 'Dealer'>('Phone')
  const [searchValue, setSearchValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null)

  // 350ms Debounced search for live query
  const debouncedSearch = useDebounce(searchValue, 350)

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

  const [lockDevice] = useLockDeviceMutation()
  const [unlockDevice] = useUnlockDeviceMutation()

  // Details Modal
  const [selectedUser, setSelectedUser] = useState<EndUserRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const usersList: EndUserRecord[] = apiResponse?.data || []
  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: usersList.length,
  }

  const handleToggleLock = async (u: EndUserRecord, newLock: 'locked' | 'unlocked') => {
    setActionInProgressId(u.id)
    const targetDeviceId = u.imei || u.imei1 || u.id

    try {
      if (newLock === 'locked') {
        await lockDevice({ deviceId: targetDeviceId }).unwrap()
        toast.error(`Remote Lock signal dispatched to ${u.name || u.userName}'s device`)
      } else {
        await unlockDevice({ deviceId: targetDeviceId }).unwrap()
        toast.success(`Device unlock signal broadcast for ${u.name || u.userName}`)
      }
      refetch()
    } catch (err: any) {
      console.error('Remote lock operation error:', err)
      const msg = err?.data?.message || err?.message || 'Remote lock request failed'
      toast.error(msg)
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleOpenDetails = (u: EndUserRecord) => {
    setSelectedUser(u)
    setIsDetailsOpen(true)
  }

  const handleOpenDeviceControl = (u: EndUserRecord) => {
    navigate(`/app/users/${u.id}/device-control`)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">User Search</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Quick lookup across customer database by phone, name, loan ID or retailer
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-1 max-w-3xl bg-muted/30 border border-border/60 rounded-xl p-4">
        <div className="space-y-1 w-48">
          <label className="text-sm font-semibold text-primary">Search By :</label>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value as any)}
            className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
          >
            <option value="Phone">Phone</option>
            <option value="Name">Name</option>
            <option value="LoanId">Loan Id</option>
            <option value="Dealer">Dealer</option>
          </select>
        </div>

        <div className="space-y-1 flex-1">
          <label className="text-sm font-semibold text-primary">Search User :</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Enter phone, borrower name or loan id..."
                className="w-full h-10 rounded-lg border border-border px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {isFetching && (
                <Loader2 className="h-4 w-4 text-primary absolute right-2.5 top-3 animate-spin" />
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                refetch()
                toast.success(`Querying records matching "${searchValue || 'all'}"`)
              }}
              className="btn-action-primary text-sm font-bold h-10 px-6 shrink-0"
            >
              search
            </button>
          </div>
        </div>
      </div>

      {/* Live Server Error Banner */}
      {isError && (
        <div className="flex items-center justify-between p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Error searching users:{' '}
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
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Loan Id</th>
              <th>Activation Date</th>
              <th>Dealer</th>
              <th>City</th>
              <th className="text-center">Lock/Unlock</th>
              <th className="text-center">User Feature</th>
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
                  <td><div className="h-4 w-20 bg-muted/80 rounded font-mono" /></td>
                  <td><div className="h-4 w-20 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-28 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-16 bg-muted/80 rounded" /></td>
                  <td className="text-center"><div className="h-6 w-16 bg-muted/80 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-7 w-7 bg-muted/80 rounded-full mx-auto" /></td>
                  <td className="text-center"><div className="h-7 w-7 bg-muted/80 rounded-full mx-auto" /></td>
                </tr>
              ))
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">No customer records matching search</p>
                    <p className="text-xs text-muted-foreground">
                      Try searching with different phone number or customer name keywords.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              usersList.map((u, index) => {
                const isItemActionRunning = actionInProgressId === u.id
                return (
                  <tr key={u.id || u._id} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-sm">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="font-bold text-foreground text-sm">{u.name || u.userName}</td>
                    <td className="text-muted-foreground font-mono text-sm">{u.phone || u.userPhone}</td>
                    <td className="font-mono text-sm text-primary font-semibold">{u.loanId || u.loanStatus || '—'}</td>
                    <td className="text-sm text-muted-foreground font-mono">{u.activatedAt || u.activationDate || '—'}</td>
                    <td className="text-sm font-semibold text-foreground">{u.dealer || 'Direct Store'}</td>
                    <td className="text-sm text-muted-foreground">{u.city || '—'}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={isItemActionRunning}
                          onClick={() => handleToggleLock(u, 'locked')}
                          className={`p-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50 ${
                            u.lockStatus === 'locked'
                              ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white'
                          }`}
                          title="Send Remote Lock Signal"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isItemActionRunning}
                          onClick={() => handleToggleLock(u, 'unlocked')}
                          className={`p-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50 ${
                            u.lockStatus === 'unlocked'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title="Send Remote Unlock Signal"
                        >
                          <Unlock className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDeviceControl(u)}
                        className="p-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors inline-flex items-center justify-center"
                        title="Open EMI SAFE Device Control"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
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
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Server-Side Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground pt-2">
        <span>
          Showing {usersList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, pagination.totalItems || usersList.length)} of{' '}
          {pagination.totalItems || usersList.length} entries
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
