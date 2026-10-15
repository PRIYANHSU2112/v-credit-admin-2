import { useState } from 'react'
import { MOCK_RECEIVED_REPORTS } from '@/mocks/mockSeedData'

export default function ReceivedKeyReportPage() {
  const [reports] = useState(MOCK_RECEIVED_REPORTS)
  const [pageSize, setPageSize] = useState(10)
  const [tableSearch, setTableSearch] = useState('')

  const filtered = reports.filter(
    (r) =>
      tableSearch.trim() === '' ||
      r.receivedFrom.toLowerCase().includes(tableSearch.toLowerCase()) ||
      r.transactionDate.includes(tableSearch)
  )

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Key Received Reports</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Inbound license key allocations received from parent super-stockist</p>
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
          </select>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Search:</span>
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search received records..."
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
              <th>Transaction Date</th>
              <th>Received from</th>
              <th>No of keys</th>
              <th>Key Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, index) => (
              <tr key={r.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td className="text-xs text-muted-foreground font-mono">{r.transactionDate}</td>
                <td className="font-bold text-foreground">{r.receivedFrom}</td>
                <td className="font-bold text-foreground font-mono">{r.noOfKeys}</td>
                <td className="font-mono text-xs text-primary font-semibold">₹{r.keyPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">1</button>
          <button className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted">
            2
          </button>
          <button className="px-3 py-1 rounded-lg border border-border text-foreground hover:bg-muted">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
