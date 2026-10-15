import { useState } from 'react'

const MOCK_IPHONE_RECEIVED = [
  { id: 'ir_1', transactionDate: '06-07-2026 16:17:16', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 500, keyPrice: 70 },
  { id: 'ir_2', transactionDate: '19-12-2025 11:13:47', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 400, keyPrice: 0 },
  { id: 'ir_3', transactionDate: '27-11-2025 18:24:38', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 50, keyPrice: 0 },
  { id: 'ir_4', transactionDate: '15-09-2025 17:34:51', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 2000, keyPrice: 70 },
  { id: 'ir_5', transactionDate: '03-06-2025 15:40:04', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 1000, keyPrice: 75 },
  { id: 'ir_6', transactionDate: '27-11-2024 18:26:16', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 555, keyPrice: 0 },
  { id: 'ir_7', transactionDate: '16-11-2024 11:23:45', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 270, keyPrice: 0 },
  { id: 'ir_8', transactionDate: '28-10-2024 21:49:41', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 2000, keyPrice: 110 },
  { id: 'ir_9', transactionDate: '09-08-2024 11:20:19', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 660, keyPrice: 110 },
  { id: 'ir_10', transactionDate: '08-08-2024 20:45:57', receivedFrom: 'HBT EMPLOYEE FAIYAZ', noOfKeys: 500, keyPrice: 110 },
]

export default function IphoneReceivedReportPage() {
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = MOCK_IPHONE_RECEIVED.filter((r) =>
    tableSearch.trim() === '' ||
    r.receivedFrom.toLowerCase().includes(tableSearch.toLowerCase()) ||
    r.transactionDate.includes(tableSearch)
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">iPhone Key Received Reports</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Inbound shipments of Apple iOS MDM keys credited to master balance</p>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
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
            onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1) }}
            placeholder="Search received keys..."
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </td>
              </tr>
            ) : (
              paginated.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-muted-foreground">{(currentPage - 1) * pageSize + i + 1}</td>
                  <td className="font-medium text-primary text-xs font-mono">{r.transactionDate}</td>
                  <td className="font-bold text-foreground">{r.receivedFrom}</td>
                  <td className="font-bold text-foreground font-mono">{r.noOfKeys}</td>
                  <td className="font-mono text-xs text-primary font-semibold">
                    ₹{r.keyPrice}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 rounded-lg font-bold ${
                p === currentPage ? 'bg-primary text-primary-foreground shadow-xs' : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
