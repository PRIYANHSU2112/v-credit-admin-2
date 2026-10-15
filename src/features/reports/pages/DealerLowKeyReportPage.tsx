import { useState, useMemo } from 'react'
import { Key, XCircle, CheckCircle2 } from 'lucide-react'
import { MOCK_DEALERS, type DealerRecord } from '@/mocks/mockSeedData'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { DealerDetailsModal } from '@/components/modals/DealerDetailsModal'
import { toast } from 'sonner'

export default function DealerLowKeyReportPage() {
  const [dealers, setDealers] = useState<DealerRecord[]>(
    MOCK_DEALERS.filter((d) => d.availableKeys < 4)
  )

  const [mode, setMode] = useState<'dist_date' | 'dist_city' | 'zero_keys'>('dist_city')
  const [selectedDist, setSelectedDist] = useState('VEDA ENTERPRISE')
  const [fromDate, setFromDate] = useState('2026-08-01')
  const [toDate, setToDate] = useState('2026-10-14')
  const [cityQuery, setCityQuery] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [keyInputValues, setKeyInputValues] = useState<{ [dealerId: string]: string }>({})

  // Modals state
  const [returnDealerName, setReturnDealerName] = useState('')
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [selectedDealerForDetails, setSelectedDealerForDetails] = useState<DealerRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      if (mode === 'zero_keys') {
        return d.availableKeys === 0
      }
      if (mode === 'dist_city') {
        const matchesDist = selectedDist === 'Select Distributor' || d.distributor.includes(selectedDist)
        const matchesCity =
          !cityQuery.trim() ||
          d.city.toLowerCase().includes(cityQuery.toLowerCase()) ||
          d.state.toLowerCase().includes(cityQuery.toLowerCase()) ||
          d.dealerShop.toLowerCase().includes(cityQuery.toLowerCase())
        return matchesDist && matchesCity
      }
      if (mode === 'dist_date') {
        return selectedDist === 'Select Distributor' || d.distributor.includes(selectedDist)
      }
      return true
    })
  }, [dealers, mode, selectedDist, cityQuery])

  // Key Allocation Action (Input + Submit Button matching Screenshot 000738)
  const handleKeyInputChange = (dealerId: string, val: string) => {
    setKeyInputValues({
      ...keyInputValues,
      [dealerId]: val,
    })
  }

  const handleAllocateKeysSubmit = (dealer: DealerRecord) => {
    const val = parseInt(keyInputValues[dealer.id] || '', 10)
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter the number of keys to allocate')
      return
    }

    setDealers(
      dealers.map((d) =>
        d.id === dealer.id
          ? {
              ...d,
              availableKeys: d.availableKeys + val,
              totalKeys: d.totalKeys + val,
            }
          : d
      )
    )

    toast.success(`Allocated ${val} keys to ${dealer.dealerShop}! Available: ${dealer.availableKeys + val}`)
    setKeyInputValues({
      ...keyInputValues,
      [dealer.id]: '',
    })
  }

  const handleToggleLockAccess = (dealer: DealerRecord) => {
    setDealers(
      dealers.map((d) =>
        d.id === dealer.id ? { ...d, lockAccess: !d.lockAccess } : d
      )
    )
    toast.info(`Updated lock access permission for ${dealer.dealerShop}`)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Depleted Dealer Keys Report
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Showing retail dealers with low key stock threshold (&lt; 4 license keys remaining)
        </p>
      </div>

      {/* 3 Radio Filters */}
      <div className="space-y-4 pt-1 bg-muted/30 border border-border/60 rounded-xl p-4">
        {/* Radio 1: Dist + Date Range */}
        <div className="flex items-start sm:items-center gap-3">
          <input
            type="radio"
            id="r1"
            name="dealerReportMode"
            checked={mode === 'dist_date'}
            onChange={() => setMode('dist_date')}
            className="mt-1 sm:mt-0 h-4 w-4 accent-primary cursor-pointer"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="r1" className="text-primary font-semibold block cursor-pointer">
                Select Distributor
              </label>
              <select
                value={selectedDist}
                onChange={(e) => setSelectedDist(e.target.value)}
                disabled={mode !== 'dist_date'}
                className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground disabled:opacity-50 disabled:bg-muted"
              >
                <option value="Select Distributor">Select Distributor</option>
                <option value="VEDA ENTERPRISE">VEDA ENTERPRISE</option>
                <option value="Music Beats">Music Beats</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-primary font-semibold block">From :</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={mode !== 'dist_date'}
                className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground disabled:opacity-50 disabled:bg-muted"
              />
            </div>

            <div className="space-y-1">
              <label className="text-primary font-semibold block">To :</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={mode !== 'dist_date'}
                className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground disabled:opacity-50 disabled:bg-muted"
              />
            </div>

            <button
              type="button"
              disabled={mode !== 'dist_date'}
              onClick={() => toast.success('Filtered low-key dealers by distributor and date')}
              className="btn-action-primary text-xs font-bold h-9 px-4 mt-5 disabled:opacity-50"
            >
              search
            </button>
          </div>
        </div>

        {/* Radio 2: Dist + City/State */}
        <div className="flex items-start sm:items-center gap-3">
          <input
            type="radio"
            id="r2"
            name="dealerReportMode"
            checked={mode === 'dist_city'}
            onChange={() => setMode('dist_city')}
            className="mt-1 sm:mt-0 h-4 w-4 accent-primary cursor-pointer"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="r2" className="text-primary font-semibold block cursor-pointer">
                Select Distributor
              </label>
              <select
                value={selectedDist}
                onChange={(e) => setSelectedDist(e.target.value)}
                disabled={mode !== 'dist_city'}
                className="h-9 rounded-lg border border-border px-3 text-xs bg-background text-foreground disabled:opacity-50 disabled:bg-muted"
              >
                <option value="Select Distributor">Select Distributor</option>
                <option value="VEDA ENTERPRISE">VEDA ENTERPRISE</option>
                <option value="Music Beats">Music Beats</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-primary font-semibold block">
                Search Dealer : <span className="text-muted-foreground font-normal">(City/State)</span>
              </label>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                disabled={mode !== 'dist_city'}
                placeholder="Enter city or state..."
                className="h-9 w-60 rounded-lg border border-border px-3 text-xs bg-background text-foreground disabled:opacity-50 disabled:bg-muted"
              />
            </div>

            <button
              type="button"
              disabled={mode !== 'dist_city'}
              onClick={() => toast.success('Filtered low-key dealers by city/state')}
              className="btn-action-primary text-xs font-bold h-9 px-4 mt-5 disabled:opacity-50"
            >
              search
            </button>
          </div>
        </div>

        {/* Radio 3: Having 0 keys */}
        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="r3"
            name="dealerReportMode"
            checked={mode === 'zero_keys'}
            onChange={() => setMode('zero_keys')}
            className="h-4 w-4 accent-primary cursor-pointer"
          />
          <label htmlFor="r3" className="text-xs font-semibold text-primary cursor-pointer">
            Search Dealer having 0 keys
          </label>
          <button
            type="button"
            disabled={mode !== 'zero_keys'}
            onClick={() => toast.success('Filtering dealers with 0 available keys')}
            className="btn-action-primary text-xs font-bold h-8 px-4 disabled:opacity-50"
          >
            search
          </button>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={() => toast.success('Exporting low-key dealers report to Excel...')}
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
              <th>Create Date</th>
              <th>Shop</th>
              <th>Phone</th>
              <th>City</th>
              <th>State</th>
              <th className="text-center">Available Keys</th>
              <th className="text-center">Total Keys</th>
              <th>Last Activation</th>
              <th>Last Billing</th>
              <th>Remark</th>
              <th className="text-center">Lock Access</th>
              <th className="text-center">Keys</th>
              <th>Quick Allocate</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center py-8 text-muted-foreground">
                  No dealers matching low-key criteria
                </td>
              </tr>
            ) : (
              filteredDealers.map((d, index) => (
                <tr key={d.id}>
                  <td className="text-muted-foreground">{index + 1}</td>
                  <td className="text-xs text-muted-foreground">{d.createDate || '08/10/2026 16:44:10'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDealerForDetails(d)
                        setIsDetailsOpen(true)
                      }}
                      className="font-bold text-foreground hover:text-primary hover:underline text-left cursor-pointer"
                    >
                      {d.dealerShop}
                    </button>
                  </td>
                  <td className="text-muted-foreground font-mono">{d.phone}</td>
                  <td className="text-foreground">{d.city}</td>
                  <td className="text-muted-foreground">{d.state}</td>
                  <td className="font-bold text-rose-500 text-center">{d.availableKeys}</td>
                  <td className="font-bold text-foreground text-center">{d.totalKeys}</td>
                  <td className="text-xs text-muted-foreground">{d.lastActivation}</td>
                  <td className="text-xs text-muted-foreground">{d.lastBillingDate}</td>
                  <td className="text-xs text-muted-foreground italic">{d.remark || '—'}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleLockAccess(d)}
                      className="inline-flex items-center justify-center p-1 rounded-full hover:bg-muted transition-colors"
                      title={d.lockAccess ? 'Lock Access Enabled (Click to toggle)' : 'Lock Access Disabled (Click to toggle)'}
                    >
                      {d.lockAccess ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setReturnDealerName(d.dealerShop)
                        setIsReturnOpen(true)
                      }}
                      className="p-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors inline-flex items-center justify-center"
                      title="Return / Adjust Keys"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={keyInputValues[d.id] || ''}
                        onChange={(e) => handleKeyInputChange(d.id, e.target.value)}
                        className="w-16 h-8 rounded-lg border border-border px-2 text-xs text-center font-bold text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleAllocateKeysSubmit(d)}
                        className="btn-action-primary text-xs font-bold h-8 px-3"
                      >
                        Submit
                      </button>
                    </div>
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
          Showing {filteredDealers.length === 0 ? 0 : 1} to {filteredDealers.length} of{' '}
          {filteredDealers.length} entries
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

      {/* Keys Return Modal */}
      <KeysReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        distributorName={returnDealerName}
      />

      {/* Dealer Details Modal */}
      <DealerDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        dealer={selectedDealerForDetails}
      />
    </div>
  )
}
