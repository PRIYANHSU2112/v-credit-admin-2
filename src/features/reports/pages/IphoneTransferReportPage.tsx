import { useState } from 'react'
import { Printer } from 'lucide-react'
import { toast } from 'sonner'

const MOCK_IPHONE_TRANSFER = [
  { id: 'it_1', srNo: 1, sendBy: 'VEDA ENTERPRISE', transferTo: 'MOBILE SHOPI', noOfKeys: 10, keyPrice: 600, transactionDate: '22-09-2026 21:30:59' },
  { id: 'it_2', srNo: 2, sendBy: 'VEDA ENTERPRISE', transferTo: 'MOBILE SHOPI', noOfKeys: 10, keyPrice: 600, transactionDate: '22-09-2026 21:32:12' },
  { id: 'it_3', srNo: 3, sendBy: 'VEDA ENTERPRISE', transferTo: 'IRFAN MOBILE CARE CENTER', noOfKeys: 97, keyPrice: 600, transactionDate: '03-09-2026 18:12:03' },
  { id: 'it_4', srNo: 4, sendBy: 'VEDA ENTERPRISE', transferTo: 'IRFAN MOBILE CARE CENTER', noOfKeys: 3, keyPrice: 600, transactionDate: '03-09-2026 18:13:33' },
]

export default function IphoneTransferReportPage() {
  const [activeTab, setActiveTab] = useState<'stockist_dist' | 'dist_dealer'>('dist_dealer')
  const [fromDate, setFromDate] = useState('2026-01-14')
  const [toDate, setToDate] = useState('2026-10-01')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  const filtered = MOCK_IPHONE_TRANSFER.filter((r) =>
    tableSearch.trim() === '' ||
    r.transferTo.toLowerCase().includes(tableSearch.toLowerCase()) ||
    r.sendBy.toLowerCase().includes(tableSearch.toLowerCase())
  )

  const todaySell = 0
  const weeklySell = 10
  const monthlySell = 10

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">iPhone Key Transaction Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">iOS device activation license transfer and quota audit history</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('stockist_dist')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'stockist_dist'
                ? 'bg-teal-600 text-white ring-2 ring-teal-400/40 shadow-sm'
                : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Stockiest To Distributor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dist_dealer')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'dist_dealer'
                ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Distributor To Dealer</span>
          </button>
        </div>
      </div>

      {/* Subheader */}
      <h3 className="text-sm font-bold text-primary">
        {activeTab === 'stockist_dist' ? 'Stockiest To Distributor' : 'Distributor To Dealer'}
      </h3>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Today Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">{todaySell}</p>
        </div>
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Weekly Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">{weeklySell}</p>
        </div>
        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Monthly Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">{monthlySell}</p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-end gap-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4 max-w-3xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">From :</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-primary">To :</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => toast.success('Filtered iPhone transfer transactions')}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          search
        </button>
        <button
          type="button"
          onClick={() => toast.info('Loading today iPhone transfer records...')}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          Today Data
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
            placeholder="Search transfer records..."
            className="h-8 w-56 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-16">Sr No.</th>
              <th>Transaction Date</th>
              <th>Send By</th>
              <th>Transfer to / Return from</th>
              <th>No of keys</th>
              <th>Key Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td className="text-muted-foreground">{r.srNo}</td>
                  <td className="text-xs text-muted-foreground font-mono">{r.transactionDate}</td>
                  <td className="font-bold text-foreground">{r.sendBy}</td>
                  <td className="text-foreground">{r.transferTo}</td>
                  <td className="font-bold text-foreground font-mono">{r.noOfKeys}</td>
                  <td className="font-mono text-xs text-primary font-semibold">₹{r.keyPrice}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 cursor-not-allowed">Previous</button>
          <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">1</button>
          <button className="px-3 py-1 rounded-lg border border-border text-muted-foreground/60 cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  )
}
