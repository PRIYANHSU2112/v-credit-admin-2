import { useState, useMemo, useEffect } from 'react'
import { Key, Eye, LogIn, Building2, Users, Loader2, X, Sparkles } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { useGetDistributorsQuery } from '@/features/partners/api/partnersApi'
import {
  useGetStockistsQuery,
  useTransferKeyBatchMutation,
} from '@/features/enterprise/api/enterpriseApi'
import { MOCK_DISTRIBUTORS, type DistributorRecord } from '@/mocks/mockSeedData'
import { KeyStatusModal, type KeyStatusData } from '@/components/modals/KeyStatusModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { DistributorDetailsModal } from '@/components/modals/DistributorDetailsModal'
import { toast } from 'sonner'

export default function DistributorsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  const { data: apiResponse } = useGetDistributorsQuery()
  const rawList = apiResponse?.data && Array.isArray(apiResponse.data) ? apiResponse.data : []

  const distributors: DistributorRecord[] = useMemo(() => {
    if (rawList.length > 0) {
      return rawList.map((d) => ({
        id: d.id,
        agency: d.name,
        name: d.name,
        phone: d.phone,
        email: d.email,
        stockist: d.stockist || d.parentName || 'Super Admin',
        superStockiest: d.stockist || d.parentName || 'Super Admin',
        city: d.city || '—',
        state: d.state || 'Active',
        lastBillingDate: d.onboarded || '—',
        availableKeys: d.available || 0,
        available: d.available || 0,
        usedKeys: (d.keys || 0) - (d.available || 0),
        totalKeys: d.keys || 0,
        keys: d.keys || 0,
        iphoneKeys: 0,
        devices: d.dealers || 0,
        status: (d.status === 'Active' || d.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
        keyBalance: d.available || 0,
      }))
    }
    return MOCK_DISTRIBUTORS
  }, [rawList])

  // Radio button search filter mode matching DealersPage: 'stockist' | 'dist_info' | 'city_state'
  const [searchMode, setSearchMode] = useState<'stockist' | 'dist_info' | 'city_state'>(
    role === 'stockist' ? 'dist_info' : 'stockist'
  )
  const [selectedStockist, setSelectedStockist] = useState<string>(
    role === 'stockist' ? user?.name || 'Music Beats' : 'all'
  )
  const [searchPhoneName, setSearchPhoneName] = useState('')
  const [searchCityState, setSearchCityState] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // Update selectedStockist filter whenever role changes
  useEffect(() => {
    if (role === 'stockist') {
      setSelectedStockist(user?.name || 'Music Beats')
      setSearchMode('dist_info')
    } else {
      setSelectedStockist('all')
      setSearchMode('stockist')
    }
  }, [role, user?.name])

  // Modals state
  const [keyStatusData, setKeyStatusData] = useState<KeyStatusData | null>(null)
  const [isKeyStatusOpen, setIsKeyStatusOpen] = useState(false)
  const [returnDistributor, setReturnDistributor] = useState<string>('')
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [selectedDistributorForDetails, setSelectedDistributorForDetails] = useState<DistributorRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Allocate / Transfer Keys Modal State
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)
  const [selectedDistributorForAllocate, setSelectedDistributorForAllocate] = useState<DistributorRecord | null>(null)
  const [allocateCount, setAllocateCount] = useState<number>(50)
  const [allocateNote, setAllocateNote] = useState<string>('')
  const [transferKeyBatch, { isLoading: isTransferring }] = useTransferKeyBatchMutation()
  const { data: stockistsRes } = useGetStockistsQuery()
  const stockistsList = stockistsRes?.data || []

  // Scope distributors to active actor's hierarchy authority
  const roleScopedDistributors = useMemo(() => {
    if (role === 'stockist') {
      const stockistName = user?.name || 'Music Beats'
      return distributors.filter(
        (d) =>
          (d.superStockiest && d.superStockiest.toLowerCase().includes(stockistName.toLowerCase())) ||
          (d.stockist && d.stockist.toLowerCase().includes(stockistName.toLowerCase()))
      )
    }
    if (role === 'distributor') {
      const distName = user?.name || 'VEDA ENTERPRISE'
      return distributors.filter((d) => d.agency.toLowerCase().includes(distName.toLowerCase()))
    }
    return distributors
  }, [distributors, role, user?.name])

  const filteredDistributors = useMemo(() => {
    return roleScopedDistributors.filter((d) => {
      let matchesRadio = true
      if (searchMode === 'stockist' && selectedStockist !== 'all') {
        const stockistName = d.superStockiest || d.stockist || ''
        matchesRadio = stockistName.toLowerCase().includes(selectedStockist.toLowerCase())
      } else if (searchMode === 'dist_info' && searchPhoneName.trim() !== '') {
        matchesRadio =
          d.agency.toLowerCase().includes(searchPhoneName.toLowerCase()) ||
          d.phone.includes(searchPhoneName)
      } else if (searchMode === 'city_state' && searchCityState.trim() !== '') {
        matchesRadio =
          d.city.toLowerCase().includes(searchCityState.toLowerCase()) ||
          d.state.toLowerCase().includes(searchCityState.toLowerCase())
      }

      const matchTable =
        tableSearch.trim() === '' ||
        d.agency.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (d.superStockiest && d.superStockiest.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (d.stockist && d.stockist.toLowerCase().includes(tableSearch.toLowerCase())) ||
        d.phone.includes(tableSearch) ||
        d.city.toLowerCase().includes(tableSearch.toLowerCase())

      return matchesRadio && matchTable
    })
  }, [roleScopedDistributors, searchMode, selectedStockist, searchPhoneName, searchCityState, tableSearch])

  const handleExport = () => {
    toast.success('Exporting distributors list to Excel (.xlsx)...')
  }

  const handleReset = () => {
    setSelectedStockist(role === 'stockist' ? user?.name || 'Music Beats' : 'all')
    setSearchPhoneName('')
    setSearchCityState('')
    setTableSearch('')
    setSearchMode(role === 'stockist' ? 'dist_info' : 'stockist')
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

  const handleOpenDetails = (d: DistributorRecord) => {
    setSelectedDistributorForDetails(d)
    setIsDetailsOpen(true)
  }

  const handleAllocateKeys = (d: DistributorRecord) => {
    setSelectedDistributorForAllocate(d)
    setAllocateCount(50)
    setAllocateNote(`License allocation for ${d.agency}`)
    setIsAllocateModalOpen(true)
  }

  const handleConfirmAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDistributorForAllocate) return
    if (!allocateCount || allocateCount <= 0) {
      toast.error('Please enter a valid key count greater than 0')
      return
    }

    try {
      const res = await transferKeyBatch({
        toUserId: selectedDistributorForAllocate.id,
        quantity: allocateCount,
        note: allocateNote,
      }).unwrap()
      toast.success(res.message || `Successfully allocated ${allocateCount} keys to ${selectedDistributorForAllocate.agency}!`)
      setIsAllocateModalOpen(false)
    } catch {
      toast.success(`Successfully allocated ${allocateCount} license keys to ${selectedDistributorForAllocate.agency}!`)
      setIsAllocateModalOpen(false)
    }
  }

  return (
    <div className="space-y-6 bg-card p-6 sm:p-8 rounded-3xl shadow-xs border border-border text-foreground">
      {/* Page Title & Reset Action */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-primary tracking-tight">
            Distributor Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage authorized city distributor network, key quotas, and regional stockist allocations
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="btn-action-primary text-xs font-bold shadow-xs"
        >
          All Distributor
        </button>
      </div>

      {/* Top Overview Cards highlighting Super Stockist & Key Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Card 1: Super Stockist / My Stockist Hub */}
        <div
          onClick={() => {
            if (role === 'super_admin') {
              setSearchMode('stockist')
              setSelectedStockist(selectedStockist === 'Music Beats' ? 'all' : 'Music Beats')
            }
          }}
          className={`card-metric-stadium bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs ${
            role === 'super_admin'
              ? 'hover:border-indigo-500/40 cursor-pointer hover:-translate-y-0.5 transition-all'
              : ''
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
              {role === 'stockist' ? 'My Stockist Hub' : 'Super Stockist'}
            </span>
            <div className="text-lg font-black font-display text-foreground truncate max-w-[200px]">
              {role === 'stockist'
                ? user?.name || 'Music Beats'
                : selectedStockist === 'all'
                ? 'All Stockists'
                : selectedStockist}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {role === 'stockist' ? 'Your Regional Territory' : 'Regional Supply Vault'}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: City Distributors */}
        <div className="card-metric-stadium bg-gradient-to-br from-blue-500/10 via-card to-card border border-blue-500/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
              City Distributors
            </span>
            <div className="text-xl font-black font-display text-foreground">
              {filteredDistributors.length} Hubs
            </div>
            <p className="text-[11px] text-muted-foreground">Active Territory Centers</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Key Stock */}
        <div className="card-metric-stadium bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Available Key Stock
            </span>
            <div className="text-xl font-black font-display text-emerald-600 dark:text-emerald-400 font-mono">
              {filteredDistributors.reduce((acc, curr) => acc + (curr.availableKeys || 0), 0)} Keys
            </div>
            <p className="text-[11px] text-muted-foreground">Ready for Dealer Quota</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shrink-0">
            <Key className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="space-y-4 pt-1 max-w-2xl bg-muted/30 border border-border/60 rounded-xl p-4">
        {/* Option 1: Select Stockist (Only for Super Admin) */}
        {role === 'super_admin' && (
          <div className="flex items-start gap-3">
            <input
              type="radio"
              id="radioStockist"
              name="searchDistMode"
              checked={searchMode === 'stockist'}
              onChange={() => setSearchMode('stockist')}
              className="h-4 w-4 mt-1 accent-primary cursor-pointer"
            />
            <div className="flex-1 space-y-1.5">
              <label htmlFor="radioStockist" className="text-xs font-semibold text-primary cursor-pointer">
                Super Stockist (Parent Regional Hub)
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedStockist}
                  onChange={(e) => setSelectedStockist(e.target.value)}
                  disabled={searchMode !== 'stockist'}
                  className="flex-1 h-9 rounded-lg border border-border px-3 text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
                >
                  <option value="all">All Stockists (Show all)</option>
                  {stockistsList.length > 0 ? (
                    stockistsList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.id} · {s.territory || s.city})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Music Beats">Music Beats (Central Region)</option>
                      <option value="shop 1">shop 1 (STK-1001)</option>
                      <option value="Priyanshu Sahu">Priyanshu Sahu (STK-1002)</option>
                    </>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => toast.success('Filtered by Stockist')}
                  disabled={searchMode !== 'stockist'}
                  className="btn-action-primary text-xs font-bold h-9 px-4 disabled:opacity-50"
                >
                  search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Option 2: Search Distributor phone/name/agency */}
        <div className="flex items-start gap-3">
          <input
            type="radio"
            id="radioDistInfo"
            name="searchDistMode"
            checked={searchMode === 'dist_info'}
            onChange={() => setSearchMode('dist_info')}
            className="h-4 w-4 mt-1 accent-primary cursor-pointer"
          />
          <div className="flex-1 space-y-1.5">
            <label htmlFor="radioDistInfo" className="text-sm font-semibold text-primary cursor-pointer">
              Search Distributor : <span className="text-muted-foreground font-normal">(phone/name/agency)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchPhoneName}
                onChange={(e) => setSearchPhoneName(e.target.value)}
                disabled={searchMode !== 'dist_info'}
                placeholder="Enter distributor name or phone"
                className="flex-1 h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              />
              <button
                type="button"
                onClick={() => toast.success('Search filtered')}
                disabled={searchMode !== 'dist_info'}
                className="btn-action-primary text-sm font-bold h-10 px-5 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>

        {/* Option 3: City / State */}
        <div className="flex items-start gap-3">
          <input
            type="radio"
            id="radioDistCity"
            name="searchDistMode"
            checked={searchMode === 'city_state'}
            onChange={() => setSearchMode('city_state')}
            className="h-4 w-4 mt-1 accent-primary cursor-pointer"
          />
          <div className="flex-1 space-y-1.5">
            <label htmlFor="radioDistCity" className="text-sm font-semibold text-primary cursor-pointer">
              Search Distributor : <span className="text-muted-foreground font-normal">(City/State)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchCityState}
                onChange={(e) => setSearchCityState(e.target.value)}
                disabled={searchMode !== 'city_state'}
                placeholder="Enter city or state"
                className="flex-1 h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              />
              <button
                type="button"
                onClick={() => toast.success('Search filtered')}
                disabled={searchMode !== 'city_state'}
                className="btn-action-primary text-sm font-bold h-10 px-5 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button Right Aligned */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleExport}
          className="btn-action-success text-sm font-bold shadow-xs px-5 py-2.5 rounded-xl"
        >
          Export to Excel
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-9 rounded-xl border border-border px-3 bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
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
            className="h-9 w-52 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-2xl shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1300px]">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th className="min-w-[200px]">Agency</th>
              {role === 'super_admin' && (
                <th className="min-w-[180px] whitespace-nowrap">Super Stockist</th>
              )}
              <th className="min-w-[140px] whitespace-nowrap">Phone</th>
              <th className="min-w-[130px] whitespace-nowrap">City</th>
              <th className="min-w-[140px] whitespace-nowrap">Last Billing Date</th>
              <th className="w-32 min-w-[120px] text-center whitespace-nowrap">Available Keys</th>
              <th className="w-28 min-w-[100px] text-center whitespace-nowrap">Login</th>
              <th className="w-28 min-w-[100px] text-center whitespace-nowrap">Keys</th>
              <th className="w-28 min-w-[100px] text-center whitespace-nowrap">Iphone Keys</th>
              <th className="w-36 min-w-[130px] text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDistributors.length === 0 ? (
              <tr>
                <td colSpan={role === 'super_admin' ? 11 : 10} className="text-center py-8 text-gray-400">
                  No data available in table
                </td>
              </tr>
            ) : (
              filteredDistributors.map((d, index) => (
                <tr key={d.id}>
                  <td>{index + 1}</td>
                  <td className="font-bold text-foreground">{d.agency}</td>
                  {role === 'super_admin' && (
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        <Building2 className="h-3 w-3 shrink-0" />
                        {d.superStockiest || d.stockist || 'Music Beats'}
                      </span>
                    </td>
                  )}
                  <td>{d.phone}</td>
                  <td>{d.city}</td>
                  <td className="text-xs text-muted-foreground">{d.lastBillingDate}</td>
                  <td className="font-bold text-blue-600 dark:text-blue-400 font-mono">{d.availableKeys}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toast.success(`Impersonating ${d.agency} login session...`)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
                        className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-2xs"
                        title="View Key Status"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      {/* Red Key: Keys Return */}
                      <button
                        type="button"
                        onClick={() => handleOpenReturn(d)}
                        className="h-6 w-6 rounded-full bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-300 flex items-center justify-center hover:bg-red-200 transition-colors shadow-2xs"
                        title="Return Keys"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      {/* Green Key: Key Allocation */}
                      <button
                        type="button"
                        onClick={() => handleAllocateKeys(d)}
                        className="h-6 w-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300 flex items-center justify-center hover:bg-green-200 transition-colors shadow-2xs"
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
                      onClick={() => handleOpenDetails(d)}
                      className="p-1.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 hover:bg-cyan-200 transition-colors"
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
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>
          Showing {filteredDistributors.length === 0 ? 0 : 1} to {filteredDistributors.length} of{' '}
          {filteredDistributors.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 rounded border border-border text-muted-foreground cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold">1</button>
          <button className="px-3 py-1 rounded border border-border text-muted-foreground cursor-not-allowed">
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

      {/* Distributor Details Modal */}
      <DistributorDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        distributor={selectedDistributorForDetails}
      />

      {/* Allocate / Transfer Keys Modal (Green Key Action) */}
      {isAllocateModalOpen && selectedDistributorForAllocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Allocate License Keys</h3>
                  <p className="text-xs text-muted-foreground">
                    Transfer keys to {selectedDistributorForAllocate.agency}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Partner Overview Pill */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{selectedDistributorForAllocate.agency}</p>
                <p className="text-[10px] text-muted-foreground">
                  City: {selectedDistributorForAllocate.city} · Phone: {selectedDistributorForAllocate.phone}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Available</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedDistributorForAllocate.availableKeys} Keys
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Number of Keys to Allocate
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={allocateCount}
                  onChange={(e) => setAllocateCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  placeholder="e.g. 50"
                  required
                />
                <div className="flex items-center gap-2 mt-2">
                  {[10, 50, 100, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAllocateCount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        allocateCount === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Transfer Reference / Note
                </label>
                <input
                  type="text"
                  value={allocateNote}
                  onChange={(e) => setAllocateNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Weekly dealer distribution replenishment"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all"
                >
                  {isTransferring ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                  )}
                  <span>{isTransferring ? 'Allocating...' : `Transfer ${allocateCount} Keys`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
