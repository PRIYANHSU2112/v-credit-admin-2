import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Lock, Unlock, Settings } from 'lucide-react'
import { MOCK_USERS, type EmiSafeUserRecord } from '@/mocks/mockSeedData'
import { UserDetailsModal } from '@/components/modals/UserDetailsModal'
import { toast } from 'sonner'

export default function UserSearchPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<EmiSafeUserRecord[]>(MOCK_USERS)
  const [searchBy, setSearchBy] = useState<'Phone' | 'Name' | 'LoanId' | 'Dealer'>('Phone')
  const [searchValue, setSearchValue] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // Details Modal
  const [selectedUser, setSelectedUser] = useState<EmiSafeUserRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    if (!searchValue.trim()) return users

    return users.filter((u) => {
      const q = searchValue.toLowerCase()
      if (searchBy === 'Phone') return u.userPhone.includes(q)
      if (searchBy === 'Name') return u.userName.toLowerCase().includes(q)
      if (searchBy === 'LoanId') return u.loanId?.toLowerCase().includes(q)
      if (searchBy === 'Dealer') return u.dealer.toLowerCase().includes(q)
      return true
    })
  }, [users, searchBy, searchValue])

  const handleToggleLock = (user: EmiSafeUserRecord, newLock: 'locked' | 'unlocked') => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, lockStatus: newLock } : u)))

    if (newLock === 'locked') {
      toast.error(`Remote Lock broadcast to ${user.userName}'s device`)
    } else {
      toast.success(`Device unlocked for ${user.userName}`)
    }
  }

  const handleOpenDetails = (u: EmiSafeUserRecord) => {
    setSelectedUser(u)
    setIsDetailsOpen(true)
  }

  const handleOpenDeviceControl = (u: EmiSafeUserRecord) => {
    navigate(`/app/users/${u.id}/device-control`)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">User Search</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Quick lookup across customer database by phone, name, loan ID or retailer</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-1 max-w-3xl bg-muted/30 border border-border/60 rounded-xl p-4">
        <div className="space-y-1 w-44">
          <label className="text-xs font-semibold text-primary">Search By :</label>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value as any)}
            className="w-full h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="Phone">Phone</option>
            <option value="Name">Name</option>
            <option value="LoanId">Loan Id</option>
            <option value="Dealer">Dealer</option>
          </select>
        </div>

        <div className="space-y-1 flex-1">
          <label className="text-xs font-semibold text-primary">Search User :</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Enter phone, borrower name or loan id..."
              className="flex-1 h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => toast.success(`Found ${filteredUsers.length} records matching "${searchValue}"`)}
              className="btn-action-primary text-xs font-bold h-9 px-6"
            >
              search
            </button>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
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
              <th>Dealer Phone</th>
              <th className="text-center">Lock/Unlock</th>
              <th className="text-center">User Feature</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => (
                <tr key={u.id}>
                  <td className="text-muted-foreground">{index + 1}</td>
                  <td className="font-bold text-foreground">{u.userName}</td>
                  <td className="text-muted-foreground font-mono">{u.userPhone}</td>
                  <td className="font-mono text-xs text-primary font-semibold">{u.loanId || '—'}</td>
                  <td className="text-xs text-muted-foreground">{u.activationDate}</td>
                  <td className="text-xs font-semibold text-foreground">{u.dealer}</td>
                  <td className="text-muted-foreground font-mono">{u.dealerPhone}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
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
                        <Lock className="h-3 w-3" />
                      </button>
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
                        <Unlock className="h-3 w-3" />
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
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(u)}
                      className="p-1.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors inline-flex items-center justify-center"
                      title="Inspect User Details"
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
        <span>Showing 1 to {filteredUsers.length} of {filteredUsers.length} entries</span>
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

      {/* Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}
