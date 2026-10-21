import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Phone, MapPin } from 'lucide-react'
import { maskPhone, formatDate } from '@/lib/utils'

interface Customer {
  id: string
  _id?: string
  name: string
  customerName?: string
  phone: string
  customerMobileNumber?: string
  aadhaarLast4: string
  aadhaarNumber?: string
  panNumber?: string
  city: string
  address?: string
  dealerName: string
  activeLoans: number
  isVerified: boolean
  status: 'active' | 'suspended'
  registeredAt: string
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c_1',
    _id: '6708ab9e1234567890cus001',
    name: 'Rohan Sharma',
    customerName: 'Rohan Sharma',
    phone: '9876543210',
    customerMobileNumber: '9876543210',
    aadhaarLast4: '4821',
    aadhaarNumber: '123456784821',
    panNumber: 'ABCDE1234F',
    city: 'New Delhi',
    address: 'Flat 402, Green Avenue, Rohini Sector 15',
    dealerName: 'Metro Telecom',
    activeLoans: 1,
    isVerified: true,
    status: 'active',
    registeredAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'c_2',
    _id: '6708ab9e1234567890cus002',
    name: 'Sunita Devi',
    customerName: 'Sunita Devi',
    phone: '9811234567',
    customerMobileNumber: '9811234567',
    aadhaarLast4: '9912',
    aadhaarNumber: '234567899912',
    panNumber: 'FGHIJ5678K',
    city: 'Rohini',
    address: 'Pocket C, House 142, Rohini',
    dealerName: 'City Cell Care',
    activeLoans: 1,
    isVerified: true,
    status: 'active',
    registeredAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'c_3',
    _id: '6708ab9e1234567890cus003',
    name: 'Mukesh Kumar',
    customerName: 'Mukesh Kumar',
    phone: '9822334455',
    customerMobileNumber: '9822334455',
    aadhaarLast4: '3410',
    aadhaarNumber: '345678903410',
    panNumber: 'KLMNO9012P',
    city: 'Ludhiana',
    address: 'Cinema Square, Multai',
    dealerName: 'Metro Telecom',
    activeLoans: 0,
    isVerified: true,
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
          <p className="font-bold text-foreground text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
            <Phone className="h-3.5 w-3.5" /> {maskPhone(item.phone)}
          </p>
        </div>
      ),
    },
    {
      id: 'kyc',
      header: 'KYC / Aadhaar',
      render: (item) => (
        <span className="font-mono text-sm text-muted-foreground font-medium">
          XXXX-XXXX-{item.aadhaarLast4}
        </span>
      ),
    },
    {
      id: 'city',
      header: 'Location',
      render: (item) => (
        <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
          <MapPin className="h-3.5 w-3.5" /> {item.city}
        </span>
      ),
    },
    {
      id: 'dealer',
      header: 'Sponsoring Dealer',
      render: (item) => (
        <span className="text-sm font-semibold text-primary">
          {item.dealerName}
        </span>
      ),
    },
    {
      id: 'loans',
      header: 'Active Loans',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm font-bold text-foreground">
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
        <span className="text-sm text-muted-foreground font-mono">
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
