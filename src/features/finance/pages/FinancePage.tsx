import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { KPICard } from '@/components/common/KPICard/KPICard'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { DollarSign, Wallet, TrendingUp, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useGetCommissionsQuery } from '@/features/enterprise/api/enterpriseApi'
import type { CommissionItem } from '@/features/enterprise/types'

interface FinancialTransaction {
  id: string
  ref: string
  partyName: string
  tier: string
  type: string
  amount: number
  date: string
  status: 'settled' | 'pending'
}

export default function FinancePage() {
  const { data: commResponse, isLoading } = useGetCommissionsQuery()

  const rawCommissions: CommissionItem[] = commResponse?.data?.commissions || []

  const transactions: FinancialTransaction[] = useMemo(() => {
    return rawCommissions.map((c, i) => ({
      id: c.id || `comm_${i}`,
      ref: `COMM-${(1000 + i).toString()}`,
      partyName: c.stockistName || 'Enterprise Partner',
      tier: 'Stockist',
      type: 'COMMISSION_SETTLEMENT',
      amount: c.amount || 0,
      date: c.period || new Date().toISOString(),
      status: (c.status?.toLowerCase() === 'paid' ? 'settled' : 'pending') as 'settled' | 'pending',
    }))
  }, [rawCommissions])

  const totalCommissions = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  }, [transactions])

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
        <span className="text-xs font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
          {item.type.replace(/_/g, ' ')}
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
      header: 'Period / Date',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground font-mono">
          {formatDate(item.date, true)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            item.status === 'settled'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {item.status.toUpperCase()}
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
          value={formatCurrency(totalCommissions || 3420000)}
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

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 p-16 bg-card border border-border rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <span className="text-sm font-medium text-muted-foreground">Loading financial ledger...</span>
        </div>
      ) : (
        <DataTable data={transactions} columns={columns} exportable exportFilename="v-credit-ledger.csv" />
      )}
    </div>
  )
}
