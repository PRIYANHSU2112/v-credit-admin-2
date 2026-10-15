import { useState } from 'react'
import { Key } from 'lucide-react'
import { MOCK_DISTRIBUTORS, type DistributorRecord } from '@/mocks/mockSeedData'
import { KeyStatusModal, type KeyStatusData } from '@/components/modals/KeyStatusModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { toast } from 'sonner'

export default function DistributorLowKeyReportPage() {
  const [distributors, setDistributors] = useState<DistributorRecord[]>(
    MOCK_DISTRIBUTORS.filter((d) => d.availableKeys < 40)
  )
  const [remarks, setRemarks] = useState<Record<string, string>>({
    dist_1: 'baad me lenge',
    dist_2: '',
  })
  const [onlyZeroKeys, setOnlyZeroKeys] = useState(false)
  const [pageSize, setPageSize] = useState(10)

  // Modals state
  const [keyStatusData, setKeyStatusData] = useState<KeyStatusData | null>(null)
  const [isKeyStatusOpen, setIsKeyStatusOpen] = useState(false)
  const [returnDistributor, setReturnDistributor] = useState<string>('')
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)

  const handleRemarkSubmit = (distId: string, agencyName: string) => {
    const text = remarks[distId] || ''
    setDistributors(
      distributors.map((d) => (d.id === distId ? { ...d, remark: text } : d))
    )
    toast.success(`Remark updated for ${agencyName}: "${text}"`)
  }

  const handleOpenKeyStatus = (d: DistributorRecord) => {
    setKeyStatusData({
      agencyName: d.agency,
      totalKeys: d.totalKeys || 5810,
      usedKeys: d.usedKeys || 5810,
      availableKeys: d.availableKeys || 0,
    })
    setIsKeyStatusOpen(true)
  }

  const handleOpenReturn = (d: DistributorRecord) => {
    setReturnDistributor(d.agency)
    setIsReturnModalOpen(true)
  }

  const displayedDistributors = onlyZeroKeys
    ? distributors.filter((d) => d.availableKeys === 0)
    : distributors

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Depleted Distributor Keys Report
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Showing distributors with critical inventory threshold (&lt; 40 license keys remaining)
        </p>
      </div>

      {/* Top filter: Search Distributor having 0 keys */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">
            Search Distributor having 0 keys
          </span>
          <button
            type="button"
            onClick={() => {
              setOnlyZeroKeys(!onlyZeroKeys)
              toast.info(onlyZeroKeys ? 'Showing all low-key distributors' : 'Filtering 0 key distributors')
            }}
            className={`text-xs font-bold h-8 px-4 rounded-lg transition-colors shadow-xs ${
              onlyZeroKeys ? 'bg-primary text-primary-foreground' : 'btn-action-primary'
            }`}
          >
            {onlyZeroKeys ? 'Show All Low Keys' : 'Filter 0 Keys'}
          </button>
        </div>

        {/* Green Export button */}
        <button
          type="button"
          onClick={() => toast.success('Exporting Low-Key Distributors to Excel (.xlsx)...')}
          className="btn-action-success text-xs font-bold"
        >
          Export to Excel
        </button>
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
          </select>
          <span>entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Agency</th>
              <th>Phone</th>
              <th>City</th>
              <th>State</th>
              <th>Last Billing</th>
              <th>Remark</th>
              <th className="text-center">Available Keys</th>
              <th className="text-center">Total Keys</th>
              <th className="text-center">Keys Action</th>
              <th className="min-w-[200px]">Update Remark</th>
            </tr>
          </thead>
          <tbody>
            {displayedDistributors.map((d, index) => (
              <tr key={d.id}>
                <td className="text-muted-foreground">{index + 1}</td>
                <td className="font-bold text-foreground">{d.agency}</td>
                <td className="text-muted-foreground font-mono">{d.phone}</td>
                <td className="text-foreground">{d.city}</td>
                <td className="text-muted-foreground">{d.state}</td>
                <td className="text-xs text-muted-foreground">{d.lastBillingDate}</td>
                <td className="text-xs text-muted-foreground italic">{d.remark || '—'}</td>
                <td className="font-bold text-rose-500 text-center">{d.availableKeys}</td>
                <td className="font-bold text-foreground text-center">{d.totalKeys}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenKeyStatus(d)}
                      className="h-7 w-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-500/25 transition-colors"
                      title="View Key Status"
                    >
                      <Key className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReturn(d)}
                      className="h-7 w-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-500/25 transition-colors"
                      title="Return Keys"
                    >
                      <Key className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(`Issuing quota for ${d.agency}`)}
                      className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors"
                      title="Allocate Keys"
                    >
                      <Key className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={remarks[d.id] ?? d.remark ?? ''}
                      onChange={(e) =>
                        setRemarks({ ...remarks, [d.id]: e.target.value })
                      }
                      placeholder="Enter Remark"
                      className="h-8 rounded-lg border border-border px-2 text-xs text-foreground bg-background w-32 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemarkSubmit(d.id, d.agency)}
                      className="btn-action-primary text-xs font-bold h-8 px-3"
                    >
                      Submit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Showing 1 to {displayedDistributors.length} of {displayedDistributors.length} entries</span>
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

      {/* Key Status Modal matching Screenshot 235321 */}
      <KeyStatusModal
        isOpen={isKeyStatusOpen}
        onClose={() => setIsKeyStatusOpen(false)}
        data={keyStatusData}
      />

      {/* Keys Return Modal matching Screenshot 235354 */}
      <KeysReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        distributorName={returnDistributor}
      />
    </div>
  )
}
