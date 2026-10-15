import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Phone, MapPin } from 'lucide-react'
import { maskPhone, formatDate } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  phone: string
  aadhaarLast4: string
  city: string
  dealerName: string
  activeLoans: number
  status: 'active' | 'suspended'
  registeredAt: string
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c_1',
    name: 'Rohan Sharma',
    phone: '9876543210',
    aadhaarLast4: '4821',
    city: 'New Delhi',
    dealerName: 'Metro Telecom',
    activeLoans: 1,
    status: 'active',
    registeredAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'c_2',
    name: 'Sunita Devi',
    phone: '9811234567',
    aadhaarLast4: '9912',
    city: 'Rohini',
    dealerName: 'City Cell Care',
    activeLoans: 1,
    status: 'active',
    registeredAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'c_3',
    name: 'Mukesh Kumar',
    phone: '9822334455',
    aadhaarLast4: '3410',
    city: 'Ludhiana',
    dealerName: 'Metro Telecom',
    activeLoans: 0,
    status: 'active',
    registeredAt: '2025-09-15T14:00:00Z',
  },
]

export default function CustomersPage() {
  const [search, setSearch] = useState('')

  const columns: ColumnDef<Customer>[] = [
    {
      id: 'name',
      header: 'Customer',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-foreground text-xs">{item.name}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> {maskPhone(item.phone)}
          </p>
        </div>
      ),
    },
    {
      id: 'kyc',
      header: 'KYC / Aadhaar',
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          XXXX-XXXX-{item.aadhaarLast4}
        </span>
      ),
    },
    {
      id: 'city',
      header: 'Location',
      render: (item) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {item.city}
        </span>
      ),
    },
    {
      id: 'dealer',
      header: 'Sponsoring Dealer',
      render: (item) => (
        <span className="text-xs font-medium text-primary">
          {item.dealerName}
        </span>
      ),
    },
    {
      id: 'loans',
      header: 'Active Loans',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {item.activeLoans}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: 'date',
      header: 'Enrolled On',
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.registeredAt)}
        </span>
      ),
    },
  ]

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrowers & Customer Profiles"
        subtitle="KYC records, financed device mappings, and customer verification statuses."
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by borrower name, phone, city..."
      />

      <DataTable data={filtered} columns={columns} exportable exportFilename="v-credit-customers.csv" />
    </div>
  )
}
