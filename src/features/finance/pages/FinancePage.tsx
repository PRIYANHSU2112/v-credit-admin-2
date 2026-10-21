import { PageHeader } from '@/components/layout/PageHeader'
import { KPICard } from '@/components/common/KPICard/KPICard'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { DollarSign, Wallet, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/formatters'

interface FinancialTransaction {
  id: string
  ref: string
  partyName: string
  tier: string
  type: 'COMMISSION' | 'LOAN_DISBURSEMENT' | 'EMI_COLLECTION' | 'WALLET_TOPUP'
  amount: number
  date: string
  status: 'settled' | 'pending'
}

const MOCK_FINANCIALS: FinancialTransaction[] = [
  {
    id: 'tx_1',
    ref: 'TXN-90218',
    partyName: 'Metro Telecom',
    tier: 'Dealer',
    type: 'EMI_COLLECTION',
    amount: 2500,
    date: new Date().toISOString(),
    status: 'settled',
  },
  {
    id: 'tx_2',
    ref: 'TXN-90217',
    partyName: 'North Region Key Logistics',
    tier: 'Stockist',
    type: 'COMMISSION',
    amount: 14200,
    date: new Date(Date.now() - 3600000).toISOString(),
    status: 'settled',
  },
  {
    id: 'tx_3',
    ref: 'TXN-90216',
    partyName: 'Delhi Hub Distribution',
    tier: 'Distributor',
    type: 'WALLET_TOPUP',
    amount: 100000,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'settled',
  },
]

export default function FinancePage() {
  const columns: ColumnDef<FinancialTransaction>[] = [
    {
      id: 'ref',
      header: 'Reference ID',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm font-bold text-foreground">{item.ref}</span>
      ),
    },
    {
      id: 'party',
      header: 'Partner / Account',
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-foreground text-sm">{item.partyName}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{item.tier}</p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Transaction Type',
      render: (item) => (
        <span className="text-sm font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
          {item.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-sm text-foreground font-mono">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date & Time',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground font-mono">
          {formatDate(item.date, true)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financials & Commission Settlement"
        subtitle="Live ledger of partner commissions, wallet balances, and loan cashflows."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Platform Revenue"
          value={formatCurrency(48500000)}
          change={18.4}
          icon={TrendingUp}
          variant="indigo"
        />
        <KPICard
          title="Commissions Paid"
          value={formatCurrency(3420000)}
          change={8.2}
          icon={Wallet}
          variant="emerald"
        />
        <KPICard
          title="Escrow Balance"
          value={formatCurrency(12800000)}
          change={4.1}
          icon={DollarSign}
          variant="amber"
        />
      </div>

      <DataTable data={MOCK_FINANCIALS} columns={columns} exportable exportFilename="v-credit-ledger.csv" />
    </div>
  )
}
