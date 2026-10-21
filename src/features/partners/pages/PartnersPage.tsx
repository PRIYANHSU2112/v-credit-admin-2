import { useState, useMemo } from 'react'
import {
  UserPlus,
  Phone,
  MapPin,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAppSelector } from '@/app/store/hooks'
import { hasPermission } from '@/config/permissions'
import { formatCurrency, formatNumber, formatDate } from '@/lib/formatters'
import { MOCK_PARTNERS } from '../api/partnersApi'
import type { Partner } from '../types'
import { toast } from 'sonner'

export default function PartnersPage() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role || 'super_admin'

  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false)
  const [newPartnerName, setNewPartnerName] = useState('')
  const [newContactPerson, setNewContactPerson] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'stockist' | 'distributor' | 'dealer'>('distributor')
  const [newState, setNewState] = useState('Delhi')
  const [newCity, setNewCity] = useState('New Delhi')

  // Downstream permission checks
  const canAddPartner =
    hasPermission(user?.role, 'partners:create:stockist') ||
    hasPermission(user?.role, 'partners:create:distributor') ||
    hasPermission(user?.role, 'partners:create:dealer')

  // Scope partners based on active role hierarchy
  const roleScopedPartners = useMemo(() => {
    if (role === 'distributor') {
      const distName = (user?.name || 'VEDA ENTERPRISE').toLowerCase()
      return partners.filter((p) => p.role === 'dealer' || p.parentName?.toLowerCase().includes(distName))
    }
    if (role === 'stockist') {
      const stockistName = (user?.name || 'Music Beats').toLowerCase()
      return partners.filter(
        (p) =>
          p.role !== 'stockist' ||
          p.name.toLowerCase().includes(stockistName) ||
          p.parentName?.toLowerCase().includes(stockistName)
      )
    }
    if (role === 'dealer') {
      const dealerName = (user?.name || 'Malviya mobile hub').toLowerCase()
      return partners.filter((p) => p.name.toLowerCase().includes(dealerName) || p.contactPerson.toLowerCase().includes(dealerName))
    }
    return partners
  }, [partners, role, user?.name])

  const filteredPartners = useMemo(() => {
    return roleScopedPartners.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery)

      const matchesTier = tierFilter === 'all' || p.role === tierFilter
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter

      return matchesSearch && matchesTier && matchesStatus
    })
  }, [roleScopedPartners, searchQuery, tierFilter, statusFilter])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartnerName || !newPhone) {
      toast.error('Partner name and phone are required.')
      return
    }

    const created: Partner = {
      id: `pt_${Date.now()}`,
      name: newPartnerName,
      contactPerson: newContactPerson || newPartnerName,
      phone: newPhone,
      email: newEmail || `${newPhone}@vcredit-partner.in`,
      role: newRole,
      parentName: user?.name || 'Platform Admin',
      state: newState,
      city: newCity,
      allocatedKeys: 0,
      availableKeys: 0,
      activeDevices: 0,
      walletBalance: 0,
      status: 'active',
      joinedAt: new Date().toISOString(),
    }

    setPartners([created, ...partners])
    setIsAddPartnerOpen(false)
    toast.success(`Partner ${newPartnerName} registered successfully!`)

    // Reset form
    setNewPartnerName('')
    setNewContactPerson('')
    setNewPhone('')
    setNewEmail('')
  }

  const columns: ColumnDef<Partner>[] = [
    {
      id: 'name',
      header: 'Partner & Contact',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-xs">{item.name}</span>
            <Badge
              variant={
                item.role === 'stockist'
                  ? 'default'
                  : item.role === 'distributor'
                  ? 'purple'
                  : 'cyan'
              }
              className="text-[10px] capitalize"
            >
              {item.role}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {item.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.city}, {item.state}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'parent',
      header: 'Parent Sponsor',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {item.parentName || 'Super Admin'}
        </span>
      ),
    },
    {
      id: 'keys',
      header: 'Key Inventory',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-foreground font-mono">
            {formatNumber(item.availableKeys)}{' '}
            <span className="font-normal text-muted-foreground">/ {formatNumber(item.allocatedKeys)}</span>
          </span>
          <p className="text-[10px] text-muted-foreground">Available / Allocated</p>
        </div>
      ),
    },
    {
      id: 'devices',
      header: 'Active Devices',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-xs text-foreground font-mono">
          {formatNumber(item.activeDevices)}
        </span>
      ),
    },
    {
      id: 'wallet',
      header: 'Wallet Balance',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-xs text-emerald-500 font-mono">
          {formatCurrency(item.walletBalance)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: 'joined',
      header: 'Onboarded',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.joinedAt)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Network Hierarchy"
        subtitle="Manage Stockists, City Distributors, and Retail Dealers with credit balances and key quotas."
        actions={
          canAddPartner && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setIsAddPartnerOpen(true)}
            >
              Onboard Partner
            </Button>
          )
        }
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search partner name, city, phone..."
        selectFilters={[
          {
            id: 'tier',
            label: 'Partner Tier',
            value: tierFilter,
            onChange: setTierFilter,
            options: [
              { label: 'Stockists (Regional)', value: 'stockist' },
              { label: 'Distributors (City)', value: 'distributor' },
              { label: 'Dealers (Retail)', value: 'dealer' },
            ],
          },
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Suspended', value: 'suspended' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('')
          setTierFilter('all')
          setStatusFilter('all')
        }}
      />

      <DataTable
        data={filteredPartners}
        columns={columns}
        exportable
        exportFilename="v-credit-partners.csv"
      />

      {/* Onboard Partner Modal */}
      <Modal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
        title="Onboard New Partner"
        description="Register an authorized entity into your distribution hierarchy."
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Partner Tier
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="distributor">Distributor (City / District)</option>
              <option value="dealer">Dealer (Retail Store)</option>
              {user?.role === 'super_admin' && (
                <option value="stockist">Stockist (Regional)</option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Business / Store Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Apex Telecom Hub"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Contact Person
              </label>
              <Input
                type="text"
                placeholder="Manager name"
                value={newContactPerson}
                onChange={(e) => setNewContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="10-digit mobile"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                State
              </label>
              <Input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                City
              </label>
              <Input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddPartnerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Partner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
