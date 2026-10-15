import { useState, useMemo } from 'react'
import { Key, Eye, LogIn } from 'lucide-react'
import { MOCK_DISTRIBUTORS, type DistributorRecord } from '@/mocks/mockSeedData'
import { KeyStatusModal, type KeyStatusData } from '@/components/modals/KeyStatusModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { toast } from 'sonner'

export default function DistributorsPage() {
  const [distributors] = useState<DistributorRecord[]>(MOCK_DISTRIBUTORS)
  const [searchPhoneName, setSearchPhoneName] = useState('')
  const [searchCityState, setSearchCityState] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // Modals state
  const [keyStatusData, setKeyStatusData] = useState<KeyStatusData | null>(null)
  const [isKeyStatusOpen, setIsKeyStatusOpen] = useState(false)
  const [returnDistributor, setReturnDistributor] = useState<string>('')
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)

  const filteredDistributors = useMemo(() => {
    return distributors.filter((d) => {
      const match1 =
        searchPhoneName.trim() === '' ||
        d.agency.toLowerCase().includes(searchPhoneName.toLowerCase()) ||
        d.phone.includes(searchPhoneName)

      const match2 =
        searchCityState.trim() === '' ||
        d.city.toLowerCase().includes(searchCityState.toLowerCase()) ||
        d.state.toLowerCase().includes(searchCityState.toLowerCase())

      const matchTable =
        tableSearch.trim() === '' ||
        d.agency.toLowerCase().includes(tableSearch.toLowerCase()) ||
        d.phone.includes(tableSearch) ||
        d.city.toLowerCase().includes(tableSearch.toLowerCase())

      return match1 && match2 && matchTable
    })
  }, [distributors, searchPhoneName, searchCityState, tableSearch])

  const handleExport = () => {
    toast.success('Exporting distributors list to Excel (.xlsx)...')
  }

  const handleReset = () => {
    setSearchPhoneName('')
    setSearchCityState('')
    setTableSearch('')
    toast.info('Showing All Distributors')
  }

  // Open Key Status modal matching Screenshot 235321
  const handleOpenKeyStatus = (d: DistributorRecord) => {
    setKeyStatusData({
      agencyName: d.agency,
      totalKeys: d.totalKeys || 5810,
      usedKeys: d.usedKeys || 5810,
      availableKeys: d.availableKeys || 0,
    })
    setIsKeyStatusOpen(true)
  }

  // Open Return Keys modal matching Screenshot 235354
  const handleOpenReturn = (d: DistributorRecord) => {
    setReturnDistributor(d.agency)
    setIsReturnModalOpen(true)
  }

  const handleAllocateKeys = (d: DistributorRecord) => {
    toast.info(`Prompting new key issuance for ${d.agency}`)
  }

  return (
    <div className="space-y-6 bg-card p-6 sm:p-8 rounded-3xl shadow-xs border border-border text-foreground select-none">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h2 className="text-xl sm:text-2xl font-display font-black text-primary tracking-tight">
          EmiSafe Distributor
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="btn-action-primary text-xs font-bold shadow-xs"
        >
          All Distributor
        </button>
      </div>

      {/* Dual Search Filters */}
      <div className="space-y-4 pt-1 max-w-xl">
        {/* Filter 1: Phone / Name / Shop */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-primary">
            Search Distributor : <span className="text-muted-foreground font-normal">(phone/name/shop)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchPhoneName}
              onChange={(e) => setSearchPhoneName(e.target.value)}
              className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => toast.success('Search filtered')}
              className="btn-action-primary text-xs font-bold h-9 px-4"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter 2: City / State */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-primary">
            Search Distributor : <span className="text-muted-foreground font-normal">(City/State)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchCityState}
              onChange={(e) => setSearchCityState(e.target.value)}
              className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => toast.success('Search filtered')}
              className="btn-action-primary text-xs font-bold h-9 px-4"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Export Button Right Aligned */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleExport}
          className="btn-action-success text-xs font-bold shadow-xs"
        >
          Export to Excel
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-border px-2 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
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
            className="h-8 w-48 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-2xl shadow-2xs">
        <table className="w-full text-left enterprise-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Agency</th>
              <th>Phone</th>
              <th>City</th>
              <th>Last Billing Date</th>
              <th>Available Keys</th>
              <th>Login</th>
              <th>Keys</th>
              <th>Iphone Keys</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDistributors.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">
                  No data available in table
                </td>
              </tr>
            ) : (
              filteredDistributors.map((d, index) => (
                <tr key={d.id}>
                  <td>{index + 1}</td>
                  <td className="font-bold text-gray-900">{d.agency}</td>
                  <td>{d.phone}</td>
                  <td>{d.city}</td>
                  <td className="text-xs text-gray-600">{d.lastBillingDate}</td>
                  <td className="font-bold text-blue-600">{d.availableKeys}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toast.success(`Impersonating ${d.agency} login session...`)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50"
                      title="Login as Distributor"
                    >
                      <LogIn className="h-4 w-4" />
                    </button>
                  </td>
                  <td>
                    {/* 3 Clickable Key Icons matching Screenshot 235321 */}
                    <div className="flex items-center gap-1.5">
                      {/* Blue Key: Key Status Modal */}
                      <button
                        type="button"
                        onClick={() => handleOpenKeyStatus(d)}
                        className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-2xs"
                        title="View Key Status"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      {/* Red Key: Keys Return */}
                      <button
                        type="button"
                        onClick={() => handleOpenReturn(d)}
                        className="h-6 w-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shadow-2xs"
                        title="Return Keys"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      {/* Green Key: Key Allocation */}
                      <button
                        type="button"
                        onClick={() => handleAllocateKeys(d)}
                        className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors shadow-2xs"
                        title="Allocate Keys"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td>{d.iphoneKeys}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleOpenKeyStatus(d)}
                      className="p-1.5 rounded-full bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
                      title="View Distributor Details"
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

      {/* Footer entries info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
        <span>
          Showing {filteredDistributors.length === 0 ? 0 : 1} to {filteredDistributors.length} of{' '}
          {filteredDistributors.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 rounded border border-gray-200 text-gray-400 cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 rounded bg-[#007bff] text-white font-bold">1</button>
          <button className="px-3 py-1 rounded border border-gray-200 text-gray-400 cursor-not-allowed">
            Next
          </button>
        </div>
      </div>

      {/* Key Status Modal */}
      <KeyStatusModal
        isOpen={isKeyStatusOpen}
        onClose={() => setIsKeyStatusOpen(false)}
        data={keyStatusData}
      />

      {/* Keys Return Modal */}
      <KeysReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        distributorName={returnDistributor}
      />
    </div>
  )
}
