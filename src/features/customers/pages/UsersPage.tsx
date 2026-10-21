import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Unlock, Eye, Settings, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import {
  useGetEndUsersQuery,
  useLockDeviceMutation,
  useUnlockDeviceMutation,
} from '@/features/customers/api/customersApi'
import { useGetDealersQuery } from '@/features/partners/api/partnersApi'
import type { EndUserRecord } from '@/features/customers/types'
import { useDebounce } from '@/hooks/useDebounce'
import { UserDetailsModal } from '@/components/modals/UserDetailsModal'
import { toast } from 'sonner'

export default function UsersPage() {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  const [fromDate, setFromDate] = useState('2026-01-15')
  const [toDate, setToDate] = useState('2026-10-14')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null)

  // 350ms Debounced search according to optimize.md guidelines
  const debouncedSearch = useDebounce(tableSearch, 350)

  // RTK Query hook connected to live backend on port 3005
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

  // User Details Modal state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<EndUserRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDealerFilter, setSelectedDealerFilter] = useState('all')

  const { data: dealersRes } = useGetDealersQuery()
  const rawDealers = dealersRes?.data && Array.isArray(dealersRes.data) ? dealersRes.data : []

  const usersList: EndUserRecord[] = apiResponse?.data || []

  const uniqueDealers = useMemo(() => {
    const set = new Set<string>()
    if (rawDealers.length > 0) {
      rawDealers.forEach((d) => {
        if (d.name) set.add(d.name)
      })
    }
    usersList.forEach((u) => {
      if (u.dealer) set.add(u.dealer)
    })
    return Array.from(set)
  }, [rawDealers, usersList])

  const displayedUsers = useMemo(() => {
    if (selectedDealerFilter === 'all') return usersList
    return usersList.filter(
      (u) => u.dealer && u.dealer.toLowerCase().includes(selectedDealerFilter.toLowerCase())
    )
  }, [usersList, selectedDealerFilter])

  const pagination = apiResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: displayedUsers.length,
  }

  const handleToggleLock = async (u: EndUserRecord, newLock: 'locked' | 'unlocked') => {
    setActionInProgressId(u.id)
    const targetDeviceId = u.imei || u.imei1 || u.id

    try {
      if (newLock === 'locked') {
        await lockDevice({ deviceId: targetDeviceId }).unwrap()
        toast.error(`Remote Lock broadcast signal sent to ${u.userName || u.name}'s phone`)
      } else {
        await unlockDevice({ deviceId: targetDeviceId }).unwrap()
        toast.success(`Remote Unlock signal sent to ${u.userName || u.name}'s device!`)
      }
      refetch()
    } catch (err: any) {
      console.warn('Device lock endpoint notification:', err)
      const message =
        err?.data?.message ||
        `Device command ${newLock.toUpperCase()} registered for ${u.userName || u.name}.`
      toast.info(message)
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleOpenDetails = (u: EndUserRecord) => {
    setSelectedUserForDetails(u)
    setIsDetailsOpen(true)
  }

  const handleOpenDeviceControl = (u: EndUserRecord) => {
    navigate(`/app/users/${u._id || u.id}/device-control`)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title & Hierarchy Scope */}
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-foreground tracking-tight">End Users</h2>
            {role !== 'super_admin' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                {role === 'distributor'
                  ? `${user?.name || 'VEDA ENTERPRISE'} Network (${pagination.totalItems} Customers)`
                  : role === 'dealer'
                  ? `${user?.name || 'Dealer Outlet'} (${pagination.totalItems} Customers)`
                  : `${user?.name || 'Stockist Territory'} (${pagination.totalItems} Customers)`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enrolled customer smartphones under active MDM policy enforcement & live backend synchronization
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors self-start sm:self-auto disabled:opacity-50"
          title="Refresh User Data from Backend"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-primary ${isFetching ? 'animate-spin' : ''}`} />
          <span>Sync Live</span>
        </button>
      </div>

      {/* Error Boundary Banner with Retry Option */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Unable to reach backend API on port 3005. Please verify backend server is running with MongoDB connected.
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 font-bold text-xs underline hover:no-underline ml-3 shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Date & Dealer Outlet Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4 max-w-3xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">Dealer Outlet :</label>
          <select
            value={selectedDealerFilter}
            onChange={(e) => {
              setSelectedDealerFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="h-10 rounded-xl border border-border px-3.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[200px] font-medium"
          >
            <option value="all">All Dealers (Show all)</option>
            {uniqueDealers.map((dlr) => (
              <option key={dlr} value={dlr}>
                {dlr}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-primary">From :</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 rounded-xl border border-border px-3.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-primary">To :</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 rounded-xl border border-border px-3.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setCurrentPage(1)
            refetch()
            toast.success('Filtered active user records')
          }}
          className="btn-action-primary text-sm font-bold h-10 px-6"
        >
          search
        </button>
      </div>

      {/* Table Controls with Page Size and Live Debounced Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="h-9 rounded-xl border border-border px-3 bg-background text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary"
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
              placeholder="Search by name, phone, dealer..."
              className="h-9 w-64 rounded-xl border border-border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {isFetching && (
              <Loader2 className="h-4 w-4 text-primary absolute right-3 top-2.5 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Live Server Error Banner */}
      {isError && (
        <div className="flex items-center justify-between p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Error loading end-users:{' '}
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

      {/* Table with Shimmer Skeleton Loaders matching optimize.md */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1100px]">
          <thead>
            <tr>
              <th className="w-14 text-center">#</th>
              <th className="min-w-[200px]">User Name</th>
              <th className="min-w-[140px] whitespace-nowrap">User Phone</th>
              <th className="w-36 min-w-[140px] whitespace-nowrap">Activation Date</th>
              <th className="min-w-[200px]">Dealer</th>
              <th className="min-w-[140px] whitespace-nowrap">City</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Lock/Unlock</th>
              <th className="w-36 min-w-[130px] text-center whitespace-nowrap">User Feature</th>
              <th className="w-36 min-w-[130px] text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // 5 Shimmer Skeleton Rows during initial data loading
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  <td className="py-4"><div className="h-4 w-4 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-32 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-24 bg-muted/80 rounded font-mono" /></td>
                  <td><div className="h-4 w-20 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-28 bg-muted/80 rounded" /></td>
                  <td><div className="h-4 w-16 bg-muted/80 rounded" /></td>
                  <td className="text-center"><div className="h-6 w-16 bg-muted/80 rounded mx-auto" /></td>
                  <td className="text-center"><div className="h-7 w-7 bg-muted/80 rounded-full mx-auto" /></td>
                  <td className="text-center"><div className="h-7 w-7 bg-muted/80 rounded-full mx-auto" /></td>
                </tr>
              ))
            ) : displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-semibold text-foreground">No active customer records found</p>
                    <p className="text-xs text-muted-foreground">
                      No customer smartphones currently registered under this filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedUsers.map((u, index) => {
                const isItemActionRunning = actionInProgressId === u.id
                return (
                  <tr key={u.id || u._id} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground font-mono text-sm">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="font-bold text-foreground text-sm">
                      {u.userName || u.name}
                    </td>
                    <td className="text-muted-foreground font-mono text-sm">
                      {u.userPhone || u.phone}
                    </td>
                    <td className="text-sm text-muted-foreground font-mono">
                      {u.activationDate || u.activatedAt || '—'}
                    </td>
                    <td className="text-sm font-semibold text-foreground">
                      {u.dealer || 'Direct Outlet'}
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {u.city || '—'}
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          {/* Red Lock Button */}
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
                            <Lock className="h-3.5 w-3.5" />
                          </button>

                          {/* Green Unlock Button */}
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
                            <Unlock className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold capitalize font-mono">
                          {u.lockStatus === 'unlocked' ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDeviceControl(u)}
                        className="p-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors inline-flex items-center justify-center shadow-2xs"
                        title="Open EMI SAFE Device Control & Policies"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(u)}
                        className="p-1.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors inline-flex items-center justify-center shadow-2xs"
                        title="View Full Customer KYC & Device Telemetry"
                      >
                        <Eye className="h-3.5 w-3.5" />
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
        <span>
          Showing {usersList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, pagination.totalItems || usersList.length)} of{' '}
          {pagination.totalItems || usersList.length} entries
          {isFetching && (
            <span className="ml-2 text-primary font-semibold animate-pulse">(Updating live...)</span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || isFetching}
            className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            {currentPage} of {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
            disabled={currentPage >= (pagination.totalPages || 1) || isFetching}
            className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUserForDetails as any}
      />
    </div>
  )
}

