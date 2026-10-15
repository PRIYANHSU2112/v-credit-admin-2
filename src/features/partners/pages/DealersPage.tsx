import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, LogIn, FileText, Edit, Key } from 'lucide-react'
import { MOCK_DEALERS, type DealerRecord } from '@/mocks/mockSeedData'
import { DealerDetailsModal } from '@/components/modals/DealerDetailsModal'
import { DealerFollowupModal } from '@/components/modals/DealerFollowupModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { toast } from 'sonner'

export default function DealersPage() {
  const navigate = useNavigate()
  const [dealers] = useState<DealerRecord[]>(MOCK_DEALERS)

  // Radio button search filter mode: 'distributor' | 'dealer_info' | 'city_state'
  const [searchMode, setSearchMode] = useState<'distributor' | 'dealer_info' | 'city_state'>('distributor')
  const [selectedDistributor, setSelectedDistributor] = useState('VEDA ENTERPRISE')
  const [dealerQuery, setDealerQuery] = useState('')
  const [cityStateQuery, setCityStateQuery] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // Modals state
  const [selectedDealerForDetails, setSelectedDealerForDetails] = useState<DealerRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDealerForFollowup, setSelectedDealerForFollowup] = useState<DealerRecord | null>(null)
  const [isFollowupOpen, setIsFollowupOpen] = useState(false)
  const [returnDealerName, setReturnDealerName] = useState('')
  const [isReturnOpen, setIsReturnOpen] = useState(false)

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      let matchesRadio = true
      if (searchMode === 'distributor' && selectedDistributor !== 'all') {
        matchesRadio = d.distributor.toLowerCase().includes(selectedDistributor.toLowerCase())
      } else if (searchMode === 'dealer_info' && dealerQuery.trim() !== '') {
        matchesRadio =
          d.dealerShop.toLowerCase().includes(dealerQuery.toLowerCase()) ||
          (d.dealerName && d.dealerName.toLowerCase().includes(dealerQuery.toLowerCase())) ||
          (d.dealerCode && d.dealerCode.includes(dealerQuery)) ||
          d.phone.includes(dealerQuery)
      } else if (searchMode === 'city_state' && cityStateQuery.trim() !== '') {
        matchesRadio =
          d.city.toLowerCase().includes(cityStateQuery.toLowerCase()) ||
          d.state.toLowerCase().includes(cityStateQuery.toLowerCase())
      }

      const matchesTable =
        tableSearch.trim() === '' ||
        d.dealerShop.toLowerCase().includes(tableSearch.toLowerCase()) ||
        d.phone.includes(tableSearch) ||
        d.city.toLowerCase().includes(tableSearch.toLowerCase()) ||
        d.distributor.toLowerCase().includes(tableSearch.toLowerCase())

      return matchesRadio && matchesTable
    })
  }, [dealers, searchMode, selectedDistributor, dealerQuery, cityStateQuery, tableSearch])

  const handleExport = () => {
    toast.success('Exporting dealers list to Excel (.xlsx)...')
  }

  const handleReset = () => {
    setSelectedDistributor('all')
    setDealerQuery('')
    setCityStateQuery('')
    setTableSearch('')
    toast.info('Showing All Dealers')
  }

  const handleOpenDetails = (d: DealerRecord) => {
    setSelectedDealerForDetails(d)
    setIsDetailsOpen(true)
  }

  const handleOpenFollowup = (d: DealerRecord) => {
    setSelectedDealerForFollowup(d)
    setIsFollowupOpen(true)
  }

  const handleOpenReturn = (d: DealerRecord) => {
    setReturnDealerName(d.dealerShop)
    setIsReturnOpen(true)
  }

  const handleEditDealer = (d: DealerRecord) => {
    navigate(`/app/dealers/edit/${d.id}`)
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Show Dealers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and monitor authorized retail dealer network & key quotas</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="btn-action-primary text-xs font-bold"
        >
          All Dealer
        </button>
      </div>

      {/* 3 Radio Filter Options */}
      <div className="space-y-4 pt-1 max-w-2xl bg-muted/30 border border-border/60 rounded-xl p-4">
        {/* Option 1: Select Distributor */}
        <div className="flex items-start gap-3">
          <input
            type="radio"
            id="radioDist"
            name="searchDealerMode"
            checked={searchMode === 'distributor'}
            onChange={() => setSearchMode('distributor')}
            className="h-4 w-4 mt-1 accent-primary cursor-pointer"
          />
          <div className="flex-1 space-y-1.5">
            <label htmlFor="radioDist" className="text-xs font-semibold text-primary cursor-pointer">
              Distributor
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedDistributor}
                onChange={(e) => setSelectedDistributor(e.target.value)}
                disabled={searchMode !== 'distributor'}
                className="flex-1 h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              >
                <option value="all">Select Distributor</option>
                <option value="VEDA ENTERPRISE">VEDA ENTERPRISE</option>
                <option value="Music Beats">Music Beats</option>
                <option value="Apex Telecom Logistics">Apex Telecom Logistics</option>
                <option value="Delhi Hub Key Distribution">Delhi Hub Key Distribution</option>
              </select>
              <button
                type="button"
                onClick={() => toast.success('Filtered by Distributor')}
                disabled={searchMode !== 'distributor'}
                className="btn-action-primary text-xs font-bold h-9 px-4 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>

        {/* Option 2: Search Dealer phone/name/shop/Dealercode */}
        <div className="flex items-start gap-3">
          <input
            type="radio"
            id="radioInfo"
            name="searchDealerMode"
            checked={searchMode === 'dealer_info'}
            onChange={() => setSearchMode('dealer_info')}
            className="h-4 w-4 mt-1 accent-primary cursor-pointer"
          />
          <div className="flex-1 space-y-1.5">
            <label htmlFor="radioInfo" className="text-xs font-semibold text-primary cursor-pointer">
              Search Dealer : <span className="text-muted-foreground font-normal">(phone/name/shop/Dealercode)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={dealerQuery}
                onChange={(e) => setDealerQuery(e.target.value)}
                disabled={searchMode !== 'dealer_info'}
                placeholder="Enter shop name, phone or code..."
                className="flex-1 h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              />
              <button
                type="button"
                onClick={() => toast.success('Filtered by Dealer Information')}
                disabled={searchMode !== 'dealer_info'}
                className="btn-action-primary text-xs font-bold h-9 px-4 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>

        {/* Option 3: Search Dealer City/State */}
        <div className="flex items-start gap-3">
          <input
            type="radio"
            id="radioCity"
            name="searchDealerMode"
            checked={searchMode === 'city_state'}
            onChange={() => setSearchMode('city_state')}
            className="h-4 w-4 mt-1 accent-primary cursor-pointer"
          />
          <div className="flex-1 space-y-1.5">
            <label htmlFor="radioCity" className="text-xs font-semibold text-primary cursor-pointer">
              Search Dealer : <span className="text-muted-foreground font-normal">(City/State)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={cityStateQuery}
                onChange={(e) => setCityStateQuery(e.target.value)}
                disabled={searchMode !== 'city_state'}
                placeholder="Enter city or state..."
                className="flex-1 h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              />
              <button
                type="button"
                onClick={() => toast.success('Filtered by City/State')}
                disabled={searchMode !== 'city_state'}
                className="btn-action-primary text-xs font-bold h-9 px-4 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export to Excel */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleExport}
          className="btn-action-success text-xs font-bold"
        >
          Export to Excel
        </button>
      </div>

      {/* Table Controls (Show entries + Search) */}
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
            placeholder="Search table..."
            className="h-8 w-56 rounded-lg border border-border px-3 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-12">Sr No</th>
              <th>Dealer Shop</th>
              <th>Phone</th>
              <th>Last Activation</th>
              <th>Distributor</th>
              <th>City</th>
              <th>Last Billing Date</th>
              <th>Available Keys</th>
              <th>Total Keys</th>
              <th>Login</th>
              <th>Followup</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </td>
              </tr>
            ) : (
              filteredDealers.map((d, index) => (
                <tr key={d.id}>
                  <td className="text-muted-foreground">{index + 1}</td>
                  <td className="font-bold text-foreground">{d.dealerShop}</td>
                  <td className="text-muted-foreground font-mono">{d.phone}</td>
                  <td className="text-xs text-muted-foreground">{d.lastActivation}</td>
                  <td className="text-xs font-semibold text-primary">{d.distributor}</td>
                  <td className="text-foreground">{d.city}</td>
                  <td className="text-xs text-muted-foreground">{d.lastBillingDate}</td>
                  <td className="font-bold text-primary">{d.availableKeys}</td>
                  <td className="font-bold text-foreground">{d.totalKeys}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toast.success(`Impersonating ${d.dealerShop} dealer portal...`)}
                      className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      title="Login as Dealer"
                    >
                      <LogIn className="h-4 w-4" />
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleOpenFollowup(d)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="View & Add Followup Remarks"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(d)}
                        className="p-1.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                        title="View Dealer Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditDealer(d)}
                        className="p-1.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25 transition-colors"
                        title="Edit Dealer Profile"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReturn(d)}
                        className="p-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors"
                        title="Return / Reclaim Keys"
                      >
                        <Key className="h-3.5 w-3.5" />
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

      {/* Dealer Details Modal matching Screenshot 235719 */}
      <DealerDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        dealer={selectedDealerForDetails}
      />

      {/* Followup Remarks Modal matching Screenshot fooloup.png */}
      <DealerFollowupModal
        isOpen={isFollowupOpen}
        onClose={() => setIsFollowupOpen(false)}
        dealer={selectedDealerForFollowup}
      />

      {/* Keys Return Modal */}
      <KeysReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        distributorName={returnDealerName}
      />
    </div>
  )
}
