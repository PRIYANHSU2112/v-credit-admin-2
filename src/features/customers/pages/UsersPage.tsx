import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Unlock, Eye, Settings } from 'lucide-react'
import { MOCK_USERS, type EmiSafeUserRecord } from '@/mocks/mockSeedData'
import { UserDetailsModal } from '@/components/modals/UserDetailsModal'
import { toast } from 'sonner'

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<EmiSafeUserRecord[]>(
    MOCK_USERS.filter((u) => u.status === 'active')
  )
  const [fromDate, setFromDate] = useState('2026-01-15')
  const [toDate, setToDate] = useState('2026-10-14')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // User Details Modal state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<EmiSafeUserRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesTable =
        tableSearch.trim() === '' ||
        u.userName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        u.userPhone.includes(tableSearch) ||
        u.dealer.toLowerCase().includes(tableSearch.toLowerCase()) ||
        u.userFeature.toLowerCase().includes(tableSearch.toLowerCase())

      return matchesTable
    })
  }, [users, tableSearch])

  const handleToggleLock = (user: EmiSafeUserRecord, newLock: 'locked' | 'unlocked') => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, lockStatus: newLock } : u)))

    if (newLock === 'locked') {
      toast.error(`Remote Lock broadcast to ${user.userName}'s phone`)
    } else {
      toast.success(`Remote Unlock signal sent to ${user.userName}'s device!`)
    }
  }

  const handleOpenDetails = (u: EmiSafeUserRecord) => {
    setSelectedUserForDetails(u)
    setIsDetailsOpen(true)
  }

  const handleOpenDeviceControl = (u: EmiSafeUserRecord) => {
    navigate(`/app/users/${u.id}/device-control`)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">EmiSafe Users</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Enrolled customer smartphones under active MDM policy enforcement</p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4 max-w-2xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">From :</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">To :</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => toast.success('Filtered active user records by date')}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          search
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
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
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search users..."
            className="h-8 w-56 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>User Name</th>
              <th>User Phone</th>
              <th>Activation Date</th>
              <th>Dealer</th>
              <th>Dealer Phone</th>
              <th className="text-center">Lock/Unlock</th>
              <th className="text-center">User Feature</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => (
                <tr key={u.id}>
                  <td className="text-muted-foreground">{index + 1}</td>
                  <td className="font-bold text-foreground">{u.userName}</td>
                  <td className="text-muted-foreground font-mono">{u.userPhone}</td>
                  <td className="text-xs text-muted-foreground">{u.activationDate}</td>
                  <td className="text-xs font-semibold text-foreground">{u.dealer}</td>
                  <td className="text-muted-foreground font-mono">{u.dealerPhone}</td>
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        {/* Red Lock Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLock(u, 'locked')}
                          className={`p-1.5 rounded-lg transition-all shadow-xs ${
                            u.lockStatus === 'locked'
                              ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white'
                          }`}
                          title="Lock Phone"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>

                        {/* Green Unlock Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLock(u, 'unlocked')}
                          className={`p-1.5 rounded-lg transition-all shadow-xs ${
                            u.lockStatus === 'unlocked'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title="Unlock Phone"
                        >
                          <Unlock className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold capitalize">
                        {u.lockStatus === 'unlocked' ? 'Unlock' : 'Lock'}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenDeviceControl(u)}
                      className="p-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors inline-flex items-center justify-center"
                      title="Open EMI SAFE Device Control & Features"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(u)}
                      className="p-1.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors inline-flex items-center justify-center"
                      title="View User Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>
          Showing {filteredUsers.length === 0 ? 0 : 1} to {filteredUsers.length} of{' '}
          {filteredUsers.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">1</button>
          <button className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 cursor-not-allowed">
            Next
          </button>
        </div>
      </div>

      {/* User Details Modal matching Screenshot 000233 */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUserForDetails}
      />
    </div>
  )
}
