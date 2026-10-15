import { useState, useMemo } from 'react'
import { Eye } from 'lucide-react'
import { MOCK_USERS, type EmiSafeUserRecord } from '@/mocks/mockSeedData'
import { UserDetailsModal } from '@/components/modals/UserDetailsModal'
import { toast } from 'sonner'

export default function PendingUsersPage() {
  const [users] = useState<EmiSafeUserRecord[]>(
    MOCK_USERS.filter((u) => u.status === 'pending')
  )
  const [fromDate, setFromDate] = useState('2026-08-01')
  const [toDate, setToDate] = useState('2026-10-14')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Details Modal state
  const [selectedUser, setSelectedUser] = useState<EmiSafeUserRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesTable =
        tableSearch.trim() === '' ||
        u.userName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        u.userPhone.includes(tableSearch) ||
        u.dealer.toLowerCase().includes(tableSearch.toLowerCase())

      return matchesTable
    })
  }, [users, tableSearch])

  const handleOpenDetails = (u: EmiSafeUserRecord) => {
    setSelectedUser(u)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Pending Users</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customer applications awaiting retail verification and device key authorization</p>
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
          onClick={() => toast.success('Filtered pending users by activation date range')}
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
            placeholder="Search pending users..."
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
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
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
          <button
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1 rounded-lg font-bold ${currentPage === 1 ? 'bg-primary text-primary-foreground shadow-xs' : 'border border-border text-foreground hover:bg-muted'}`}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`px-3 py-1 rounded-lg font-bold ${currentPage === 2 ? 'bg-primary text-primary-foreground shadow-xs' : 'border border-border text-foreground hover:bg-muted'}`}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className={`px-3 py-1 rounded-lg font-bold ${currentPage === 3 ? 'bg-primary text-primary-foreground shadow-xs' : 'border border-border text-foreground hover:bg-muted'}`}
          >
            3
          </button>
          <button className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted">
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
