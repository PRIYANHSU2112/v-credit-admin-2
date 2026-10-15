import { useState } from 'react'
import { Printer } from 'lucide-react'
import {
  MOCK_TRANSFER_REPORTS,
  MOCK_DISTRIBUTOR_TO_DEALER_TRANSFERS,
  type TransferReportItem,
} from '@/mocks/mockSeedData'
import { InvoiceReceiptModal } from '@/components/modals/InvoiceReceiptModal'
import { toast } from 'sonner'

export default function TransferReportPage() {
  const [activeTab, setActiveTab] = useState<'stockist_dist' | 'dist_dealer'>('stockist_dist')
  const [fromDate, setFromDate] = useState('2026-01-15')
  const [toDate, setToDate] = useState('2026-10-15')
  const [pageSize, setPageSize] = useState(10)
  const [tableSearch, setTableSearch] = useState('')

  // Invoice Receipt Modal state
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<TransferReportItem | null>(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  const rawReports = activeTab === 'stockist_dist'
    ? MOCK_TRANSFER_REPORTS
    : MOCK_DISTRIBUTOR_TO_DEALER_TRANSFERS

  const filteredReports = rawReports.filter(
    (r) =>
      tableSearch.trim() === '' ||
      r.transferTo.toLowerCase().includes(tableSearch.toLowerCase()) ||
      r.transactionDate.includes(tableSearch) ||
      (r.sendBy && r.sendBy.toLowerCase().includes(tableSearch.toLowerCase()))
  )

  const handleOpenInvoice = (item: TransferReportItem) => {
    setSelectedInvoiceItem(item)
    setIsInvoiceOpen(true)
  }

  const handleTodayData = () => {
    const today = new Date().toISOString().split('T')[0]
    setFromDate(today)
    setToDate(today)
    toast.info('Displaying transfers recorded for today')
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Key Transaction Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Audit trail of license key consignments and retail billing dispatches</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Stockiest To Distributor */}
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

          {/* Distributor To Dealer */}
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
          <p className="text-3xl font-black mt-2 font-mono">0</p>
        </div>

        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Weekly Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">0</p>
        </div>

        <div className="card-stat-yellow p-6 text-center shadow-xs">
          <p className="text-sm font-bold">Monthly Sell</p>
          <p className="text-3xl font-black mt-2 font-mono">0</p>
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
          onClick={() => toast.success('Filtered transactions by selected date range')}
          className="btn-action-primary text-xs font-bold h-9 px-6"
        >
          search
        </button>

        <button
          type="button"
          onClick={handleTodayData}
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
              <th className="w-12">#</th>
              <th>Transaction Date</th>
              <th>Transfer to / Return from</th>
              <th>No of keys</th>
              <th>Remark</th>
              <th>Key Price</th>
              <th className="text-center">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transaction records found
                </td>
              </tr>
            ) : (
              filteredReports.map((r, index) => (
                <tr key={r.id}>
                  <td className="text-muted-foreground">{index + 1}</td>
                  <td className="text-xs text-muted-foreground font-mono">{r.transactionDate}</td>
                  <td className="font-bold text-foreground">{r.transferTo}</td>
                  <td className="font-bold text-foreground font-mono">{r.noOfKeys}</td>
                  <td className="text-xs text-muted-foreground italic">{r.remark || '—'}</td>
                  <td className="font-mono text-xs text-primary font-semibold">₹{r.keyPrice}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(r)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/15 transition-colors inline-flex items-center justify-center"
                      title="View & Download Transfer Invoice Receipt PDF"
                    >
                      <div className="h-6 w-5 border border-rose-500 rounded bg-background flex flex-col items-center justify-center p-0.5 shadow-2xs">
                        <span className="text-[7px] font-black text-rose-500 leading-none">PDF</span>
                        <div className="w-3 h-0.5 bg-rose-400 mt-0.5" />
                      </div>
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
          Showing 1 to {filteredReports.length} of {filteredReports.length} entries
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

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        item={selectedInvoiceItem}
      />
    </div>
  )
}
