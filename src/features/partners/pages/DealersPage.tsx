import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, LogIn, FileText, Edit, Key, Loader2 } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { useGetDealersQuery } from '@/features/partners/api/partnersApi'
import { useImpersonateUserMutation } from '@/features/enterprise/api/enterpriseApi'
import { setCredentials } from '@/features/auth/slices/authSlice'
import type { DealerRecord } from '../types'
import { DealerDetailsModal } from '@/components/modals/DealerDetailsModal'
import { DealerFollowupModal } from '@/components/modals/DealerFollowupModal'
import { KeysReturnModal } from '@/components/modals/KeysReturnModal'
import { toast } from 'sonner'

export default function DealersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  const { data: apiResponse, isLoading } = useGetDealersQuery()
  const [impersonateUser] = useImpersonateUserMutation()
  const rawList = apiResponse?.data && Array.isArray(apiResponse.data) ? apiResponse.data : []

  const dealers: DealerRecord[] = useMemo(() => {
    return rawList.map((d) => ({
      id: d.id,
      _id: d._id,
      entityCode: d.entityCode,
      dealerShop: d.name,
      dealerName: d.name,
      name: d.name,
      phone: d.phone || '—',
      email: d.email,
      distributor: d.distributor || d.parentName || 'Direct',
      city: d.city || '—',
      state: d.state || 'Active',
      lastActivation: d.lastActive || '—',
      lastBillingDate: d.lastActive || '—',
      availableKeys: d.available || 0,
      available: d.available || 0,
      totalKeys: d.keys || 0,
      keys: d.keys || 0,
      lockAccess: true,
      status: d.status === 'Active' || d.status === 'active' ? 'Active' : 'Inactive',
    }))
  }, [rawList])

  // Radio button search filter mode: 'distributor' | 'dealer_select' | 'dealer_info' | 'city_state'
  const [searchMode, setSearchMode] = useState<'distributor' | 'dealer_select' | 'dealer_info' | 'city_state'>(
    role === 'distributor' ? 'dealer_info' : 'distributor'
  )
  const [selectedDistributor, setSelectedDistributor] = useState(
    role === 'distributor' ? user?.name || 'VEDA ENTERPRISE' : 'all'
  )
  const [selectedDealerId, setSelectedDealerId] = useState('all')
  const [dealerQuery, setDealerQuery] = useState('')
  const [cityStateQuery, setCityStateQuery] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // Synchronize distributor filter on role switch
  useEffect(() => {
    if (role === 'distributor') {
      setSelectedDistributor(user?.name || 'VEDA ENTERPRISE')
      setSearchMode('dealer_info')
    } else {
      setSelectedDistributor('all')
      setSearchMode('distributor')
    }
    setSelectedDealerId('all')
  }, [role, user?.name])

  // Modals state
  const [selectedDealerForDetails, setSelectedDealerForDetails] = useState<DealerRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDealerForFollowup, setSelectedDealerForFollowup] = useState<DealerRecord | null>(null)
  const [isFollowupOpen, setIsFollowupOpen] = useState(false)
  const [returnDealerName, setReturnDealerName] = useState('')
  const [isReturnOpen, setIsReturnOpen] = useState(false)

  // Scope dealers to active actor's hierarchy authority
  const roleScopedDealers = useMemo(() => {
    if (role === 'distributor') {
      const distName = (user?.name || 'VEDA ENTERPRISE').toLowerCase()
      return dealers.filter((d) => d.distributor.toLowerCase().includes(distName))
    }
    if (role === 'stockist') {
      const stockistName = (user?.name || 'Music Beats').toLowerCase()
      return dealers.filter(
        (d) =>
          (d.superStockiest && d.superStockiest.toLowerCase().includes(stockistName)) ||
          d.distributor.toLowerCase().includes(stockistName)
      )
    }
    if (role === 'dealer') {
      const dealerName = (user?.name || 'Malviya mobile hub').toLowerCase()
      const dealerPhone = user?.phone || '7974689544'
      return dealers.filter(
        (d) =>
          (dealerPhone && d.phone.includes(dealerPhone)) ||
          (dealerName && d.dealerShop.toLowerCase().includes(dealerName)) ||
          (dealerName && d.dealerName && d.dealerName.toLowerCase().includes(dealerName))
      )
    }
    return dealers
  }, [dealers, role, user?.name, user?.phone])

  // Unique distributors and dealers under this scoped actor
  const availableDistributors = useMemo(() => {
    const set = new Set<string>()
    roleScopedDealers.forEach((d) => {
      if (d.distributor && d.distributor !== 'Direct') {
        set.add(d.distributor)
      }
    })
    return Array.from(set)
  }, [roleScopedDealers])

  const availableDealers = useMemo(() => {
    return roleScopedDealers.map((d) => ({
      id: d.id,
      name: d.dealerShop || d.dealerName || d.name,
      city: d.city,
    }))
  }, [roleScopedDealers])

  const filteredDealers = useMemo(() => {
    return roleScopedDealers.filter((d) => {
      let matchesRadio = true
      if (searchMode === 'distributor' && selectedDistributor !== 'all') {
        matchesRadio = d.distributor.toLowerCase().includes(selectedDistributor.toLowerCase())
      } else if (searchMode === 'dealer_select' && selectedDealerId !== 'all') {
        matchesRadio = d.id === selectedDealerId || (d.dealerShop ? d.dealerShop.toLowerCase() === selectedDealerId.toLowerCase() : false)
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
  }, [roleScopedDealers, searchMode, selectedDistributor, selectedDealerId, dealerQuery, cityStateQuery, tableSearch])

  const handleExport = () => {
    toast.success('Exporting dealers list to Excel (.xlsx)...')
  }

  const handleReset = () => {
    if (role === 'distributor') {
      setSelectedDistributor(user?.name || 'VEDA ENTERPRISE')
      setSearchMode('dealer_info')
    } else {
      setSelectedDistributor('all')
      setSearchMode('distributor')
    }
    setSelectedDealerId('all')
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

  const handleImpersonate = async (d: DealerRecord) => {
    try {
      const res = await impersonateUser({ targetUserId: d._id || d.id }).unwrap()
      if (res.token) {
        dispatch(
          setCredentials({
            token: res.token,
            user: {
              id: res.user?._id || res.user?.id || d.id,
              name: res.user?.name || d.dealerShop,
              email: res.user?.email || d.email || '',
              phone: res.user?.phone || d.phone || '',
              role: 'dealer',
              parentName: d.distributor,
              parentId: d.superStockiest,
              status: 'active',
              createdAt: res.user?.createdAt || new Date().toISOString(),
              availableKeys: res.user?.keys || d.availableKeys || 0,
            },
          })
        )
        toast.success(`Logged in as dealer: ${d.dealerShop}`)
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Impersonation failed')
    }
  }

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl shadow-xs border border-border text-card-foreground">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Show Dealers</h2>
            {role !== 'super_admin' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                {role === 'distributor'
                  ? `${user?.name || 'VEDA ENTERPRISE'} Network`
                  : role === 'stockist'
                  ? `${user?.name || 'Music Beats'} Stockist Territory`
                  : `${user?.name || 'Dealer'} Portal`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {role === 'distributor'
              ? `Manage and monitor retail stores allocated under ${user?.name || 'VEDA ENTERPRISE'} (${roleScopedDealers.length} Dealers)`
              : role === 'stockist'
              ? `Authorized dealers under ${user?.name || 'Music Beats'} stockist territory (${roleScopedDealers.length} Dealers)`
              : role === 'dealer'
              ? `Viewing active dealer outlet profile and key allotment`
              : `Manage and monitor authorized retail dealer network & key quotas (${roleScopedDealers.length} Total Dealers)`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="btn-action-primary text-xs font-bold"
        >
          {role === 'super_admin' ? 'All Dealer' : 'Reset Filters'}
        </button>
      </div>

      {/* Radio Filter Options */}
      <div className="space-y-4 pt-1 max-w-2xl bg-muted/30 border border-border/60 rounded-xl p-4">
        {/* Option 1: Select Distributor (Only if not a Distributor) */}
        {role !== 'distributor' && (
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
                  <option value="all">All Distributors (Show all)</option>
                  {availableDistributors.length > 0 ? (
                    availableDistributors.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="VEDA ENTERPRISE">VEDA ENTERPRISE</option>
                      <option value="Music Beats">Music Beats</option>
                      <option value="Apex Telecom Logistics">Apex Telecom Logistics</option>
                      <option value="Delhi Hub Key Distribution">Delhi Hub Key Distribution</option>
                    </>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => toast.success('Filtered by Distributor')}
                  disabled={searchMode !== 'distributor'}
                  className="btn-action-primary text-sm font-bold h-10 px-5 disabled:opacity-50"
                >
                  search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Option 2: Select Dealer Dropdown (User can select dealer directly to watch) */}
        <div className="flex items-start gap-3">
          <input
            type="radio"
            id="radioDealerSelect"
            name="searchDealerMode"
            checked={searchMode === 'dealer_select'}
            onChange={() => setSearchMode('dealer_select')}
            className="h-4 w-4 mt-1 accent-primary cursor-pointer"
          />
          <div className="flex-1 space-y-1.5">
            <label htmlFor="radioDealerSelect" className="text-sm font-semibold text-primary cursor-pointer">
              Select Dealer : <span className="text-muted-foreground font-normal">(Dropdown List)</span>
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedDealerId}
                onChange={(e) => setSelectedDealerId(e.target.value)}
                disabled={searchMode !== 'dealer_select'}
                className="flex-1 h-10 rounded-xl border border-border px-3.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted font-medium"
              >
                <option value="all">All Dealers (Show all)</option>
                {availableDealers.map((dlr) => (
                  <option key={dlr.id} value={dlr.id}>
                    {dlr.name} {dlr.city ? `(${dlr.city})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => toast.success('Filtered by Dealer')}
                disabled={searchMode !== 'dealer_select'}
                className="btn-action-primary text-sm font-bold h-10 px-5 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>

        {/* Option 3: Search Dealer phone/name/shop/Dealercode */}
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
            <label htmlFor="radioInfo" className="text-sm font-semibold text-primary cursor-pointer">
              Search Dealer : <span className="text-muted-foreground font-normal">(phone/name/shop/Dealercode)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={dealerQuery}
                onChange={(e) => setDealerQuery(e.target.value)}
                disabled={searchMode !== 'dealer_info'}
                placeholder="Enter shop name, phone or code..."
                className="flex-1 h-10 rounded-xl border border-border px-3.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              />
              <button
                type="button"
                onClick={() => toast.success('Filtered by Dealer Information')}
                disabled={searchMode !== 'dealer_info'}
                className="btn-action-primary text-sm font-bold h-10 px-5 disabled:opacity-50"
              >
                search
              </button>
            </div>
          </div>
        </div>

        {/* Option 4: Search Dealer City/State */}
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
            <label htmlFor="radioCity" className="text-sm font-semibold text-primary cursor-pointer">
              Search Dealer : <span className="text-muted-foreground font-normal">(City/State)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={cityStateQuery}
                onChange={(e) => setCityStateQuery(e.target.value)}
                disabled={searchMode !== 'city_state'}
                placeholder="Enter city or state..."
                className="flex-1 h-10 rounded-xl border border-border px-3.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted"
              />
              <button
                type="button"
                onClick={() => toast.success('Filtered by City/State')}
                disabled={searchMode !== 'city_state'}
                className="btn-action-primary text-sm font-bold h-10 px-5 disabled:opacity-50"
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
          className="btn-action-success text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs"
        >
          Export to Excel
        </button>
      </div>

      {/* Table Controls (Show entries + Search) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-9 rounded-xl border border-border px-3 bg-background text-foreground text-sm font-semibold focus:ring-1 focus:ring-primary"
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
            className="h-9 w-56 rounded-xl border border-border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/80 rounded-xl bg-card shadow-2xs">
        <table className="w-full text-left enterprise-table min-w-[1350px]">
          <thead>
            <tr>
              <th className="w-14 text-center">Sr No</th>
              <th className="min-w-[200px]">Dealer Shop</th>
              <th className="min-w-[140px] whitespace-nowrap">Phone</th>
              <th className="min-w-[130px] whitespace-nowrap">Last Activation</th>
              {role !== 'distributor' && (
                <th className="min-w-[180px] whitespace-nowrap">Distributor</th>
              )}
              <th className="min-w-[130px] whitespace-nowrap">City</th>
              <th className="min-w-[140px] whitespace-nowrap">Last Billing Date</th>
              <th className="w-32 min-w-[110px] text-center whitespace-nowrap">Available Keys</th>
              <th className="w-28 min-w-[100px] text-center whitespace-nowrap">Total Keys</th>
              <th className="w-28 min-w-[100px] text-center whitespace-nowrap">Login</th>
              <th className="w-28 min-w-[100px] text-center whitespace-nowrap">Followup</th>
              <th className="w-36 min-w-[130px] text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={role === 'distributor' ? 11 : 12} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                    <span className="text-sm font-medium">Loading dealers from server...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDealers.length === 0 ? (
              <tr>
                <td colSpan={role === 'distributor' ? 11 : 12} className="text-center py-8 text-muted-foreground">
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
                  {role !== 'distributor' && (
                    <td className="text-xs font-semibold text-primary">{d.distributor}</td>
                  )}
                  <td className="text-foreground">{d.city}</td>
                  <td className="text-xs text-muted-foreground">{d.lastBillingDate}</td>
                  <td className="font-bold text-primary">{d.availableKeys}</td>
                  <td className="font-bold text-foreground">{d.totalKeys}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleImpersonate(d)}
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
