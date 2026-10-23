import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Phone, MapPin, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { maskPhone, formatDate } from '@/lib/utils'
import { useGetCustomersDirectoryQuery, type CustomerDirectoryItem } from '../api/customersApi'

interface CustomerRow {
  id: string
  name: string
  phone: string
  aadhaarLast4: string
  city: string
  address: string
  activeLoans: number
  isVerified: boolean
  status: 'active' | 'suspended'
  registeredAt: string
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const { data: apiResponse, isLoading, isFetching } = useGetCustomersDirectoryQuery()

  const rawList = apiResponse?.data || []

  const customers: CustomerRow[] = useMemo(() => {
    return rawList.map((c: CustomerDirectoryItem) => {
      const aadhaarNum = c.kyc?.aadhaar?.number || ''
      const last4 = aadhaarNum.length >= 4 ? aadhaarNum.slice(-4) : '••••'
      return {
        id: c._id,
        name: c.customerName || '—',
        phone: c.customerMobileNumber || '—',
        aadhaarLast4: last4,
        city: c.address?.split(',')?.[1]?.trim() || c.address?.split(' ')?.[0] || '—',
        address: c.address || '—',
        activeLoans: c.activeLoans ?? 1,
        isVerified: Boolean(c.isVerified),
        status: 'active',
        registeredAt: c.createdAt || new Date().toISOString(),
      }
    })
  }, [rawList])

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase())
    )
  }, [customers, search])

  const columns: ColumnDef<CustomerRow>[] = [
    {
      id: 'name',
      header: 'Borrower',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">{item.name}</span>
            {item.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" /> Verified KYC
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <ShieldAlert className="h-3 w-3" /> Pending KYC
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {maskPhone(item.phone)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.city}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'aadhaar',
      header: 'Aadhaar (Last 4)',
      render: (item) => (
        <span className="font-mono text-xs bg-muted px-2.5 py-1 rounded-md text-foreground border border-border">
          •••• •••• {item.aadhaarLast4}
        </span>
      ),
    },
    {
      id: 'address',
      header: 'Address',
      render: (item) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]" title={item.address}>
          {item.address}
        </span>
      ),
    },
    {
      id: 'loans',
      header: 'Active Loans',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm font-bold text-primary">
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
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(item.registeredAt)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrowers & Customer Profiles"
        subtitle="Live KYC customer records, active loans, and verification status from MongoDB."
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by borrower name, phone, city, address..."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 p-16 bg-card border border-border rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <span className="text-sm font-medium text-muted-foreground">Loading borrower profiles...</span>
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          exportable
          exportFilename="v-credit-customers.csv"
        />
      )}
    </div>
  )
}
