import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAppSelector } from '@/app/store/hooks'
import { hasPermission } from '@/config/permissions'
import { formatCurrency, formatDate, maskImei, maskPhone } from '@/lib/utils'
import { MOCK_LOANS } from '../api/loansApi'
import type { LoanAccount } from '../types'
import { toast } from 'sonner'

export default function LoansPage() {
  const { user } = useAppSelector((state) => state.auth)
  const canPay = hasPermission(user?.role, 'loans:pay')
  const canLock = hasPermission(user?.role, 'devices:command:lock')

  const [loans, setLoans] = useState<LoanAccount[]>(MOCK_LOANS)
  const [searchQuery, setSearchQuery] = useState('')
  const [deviceFilter, setDeviceFilter] = useState('all')

  // Payment modal state
  const [paymentLoan, setPaymentLoan] = useState<LoanAccount | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'NET_BANKING'>('UPI')
  const [txnRef, setTxnRef] = useState('')

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        l.loanNumber.toLowerCase().includes(q) ||
        l.customerName.toLowerCase().includes(q) ||
        l.customerPhone.includes(q) ||
        l.imei.includes(q) ||
        (l.mobileBrand && l.mobileBrand.toLowerCase().includes(q)) ||
        l.deviceModel.toLowerCase().includes(q)

      let matchesFilter = true
      if (deviceFilter === 'running') {
        matchesFilter = l.installationType === 'Old/Running Phone' || l.status === 'current'
      } else if (deviceFilter === 'new') {
        matchesFilter = l.installationType === 'New Phone'
      } else if (deviceFilter === 'locked') {
        matchesFilter = l.deviceUnlockStatus === 'LOCKED' || l.status === 'overdue'
      } else if (deviceFilter === 'unlocked') {
        matchesFilter = l.deviceUnlockStatus === 'UNLOCKED'
      } else if (deviceFilter === 'settled') {
        matchesFilter = l.loanStatus === 'CLOSED' || l.status === 'settled'
      }

      return matchesSearch && matchesFilter
    })
  }, [loans, searchQuery, deviceFilter])

  const handleOpenPayment = (loan: LoanAccount) => {
    setPaymentLoan(loan)
    setPaymentAmount(String(loan.monthlyEmi))
    setTxnRef(`UPI-${Date.now().toString().slice(-6)}`)
  }

  const handleToggleLock = (loan: LoanAccount) => {
    const isCurrentlyLocked = loan.deviceUnlockStatus === 'LOCKED'
    const newUnlockState = isCurrentlyLocked ? 'UNLOCKED' : 'LOCKED'

    setLoans(
      loans.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              deviceUnlockStatus: newUnlockState,
            }
          : l
      )
    )

    if (newUnlockState === 'LOCKED') {
      toast.error(`Remote LOCK signal broadcast to ${loan.customerName}'s phone (${loan.imei})`, {
        description: 'MDM overlay activated. Phone features restricted until repayment.',
      })
    } else {
      toast.success(`Remote UNLOCK signal dispatched to ${loan.customerName}'s device!`)
    }
  }

  const handleMarkBounce = (loan: LoanAccount) => {
    setLoans(
      loans.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              status: 'overdue',
              deviceUnlockStatus: 'LOCKED',
              overdueDays: Math.max(l.overdueDays, 1) + 7,
            }
          : l
      )
    )
    toast.error(`Auto-debit / NACH failure marked for ${loan.customerName}!`, {
      description: '₹400 bounce charge applied. Device lock command queued.',
    })
  }

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentLoan) return

    const updatedPaid = paymentLoan.paidEmis + 1
    const isNowSettled = updatedPaid >= paymentLoan.totalEmis

    setLoans(
      loans.map((l) =>
        l.id === paymentLoan.id
          ? {
              ...l,
              paidEmis: updatedPaid,
              status: isNowSettled ? 'settled' : 'current',
              deviceUnlockStatus: isNowSettled ? 'UNLOCKED' : l.deviceUnlockStatus,
              overdueDays: 0,
            }
          : l
      )
    )

    toast.success(`Payment of ${formatCurrency(Number(paymentAmount))} recorded!`, {
      description: `Loan #${paymentLoan.loanNumber} updated. Connected device unlocked.`,
    })

    setPaymentLoan(null)
  }

  const columns: ColumnDef<LoanAccount>[] = [
    {
      id: 'loanNumber',
      header: 'Loan & Device',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-foreground">
              {item.loanNumber}
            </span>
            <span className="text-xs text-muted-foreground font-medium">({item.dealerName})</span>
          </div>
          <p className="text-sm text-foreground font-semibold flex items-center gap-1.5">
            <span>{item.deviceModel}</span>
            {item.installationType && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                {item.installationType}
              </span>
            )}
          </p>
          <p className="font-mono text-xs text-muted-foreground">IMEI: {maskImei(item.imei)}</p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Borrower',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-bold text-foreground text-sm">{item.customerName}</p>
          <p className="text-xs text-muted-foreground font-mono">{maskPhone(item.customerPhone)}</p>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Loan / EMI',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <span className="font-bold text-foreground font-mono text-sm">
            {formatCurrency(item.totalLoanAmount)}
          </span>
          <p className="text-xs text-muted-foreground font-medium">
            EMI: {formatCurrency(item.monthlyEmi)}/mo
          </p>
        </div>
      ),
    },
    {
      id: 'progress',
      header: 'EMI Progress',
      render: (item) => {
        const pct = Math.round((item.paidEmis / item.totalEmis) * 100)
        return (
          <div className="space-y-1.5 w-36">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                {item.paidEmis}/{item.totalEmis} Paid
              </span>
              <span className="text-muted-foreground font-semibold">{pct}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  item.status === 'overdue' ? 'bg-rose-500' : 'bg-primary'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      id: 'due',
      header: 'Next Due Date',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <span className="text-foreground font-medium text-sm">
            {formatDate(item.nextDueDate)}
          </span>
          {item.overdueDays > 0 ? (
            <p className="text-xs text-rose-500 font-bold">
              {item.overdueDays}d Overdue
            </p>
          ) : (
            <p className="text-xs text-emerald-500 font-medium">On Schedule</p>
          )}
        </div>
      ),
    },
    {
      id: 'lockStatus',
      header: 'Device Lock',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            item.deviceUnlockStatus === 'LOCKED'
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {item.deviceUnlockStatus === 'LOCKED' ? (
            <>
              <Lock className="h-3.5 w-3.5" /> LOCKED
            </>
          ) : (
            <>
              <Unlock className="h-3.5 w-3.5" /> UNLOCKED
            </>
          )}
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
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {canPay && item.status !== 'settled' && (
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenPayment(item)
              }}
              className="text-xs text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
            >
              Collect EMI
            </Button>
          )}
          {item.status !== 'settled' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleMarkBounce(item)
              }}
              className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Mark Auto-Debit / NACH Bounce (Apply ₹400 penalty)"
            >
              <AlertCircle className="h-3.5 w-3.5" />
            </button>
          )}
          {canLock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleLock(item)
              }}
              className={`p-1 rounded transition-colors ${
                item.deviceUnlockStatus === 'LOCKED'
                  ? 'text-emerald-500 hover:bg-emerald-500/10'
                  : 'text-rose-500 hover:bg-rose-500/10'
              }`}
              title={item.deviceUnlockStatus === 'LOCKED' ? 'Remote Unlock' : 'Remote Lock'}
            >
              {item.deviceUnlockStatus === 'LOCKED' ? (
                <Unlock className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          {item.status === 'settled' && (
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Settled
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans & EMI Recovery"
        subtitle="Track customer repayment progress, overdue schedules, and record cash/UPI collections."
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search loan #, customer, phone, IMEI, brand..."
        selectFilters={[
          {
            id: 'deviceCategory',
            label: 'Filter Category',
            value: deviceFilter,
            onChange: setDeviceFilter,
            options: [
              { label: 'Running Devices (active loans)', value: 'running' },
              { label: 'New Devices (originated)', value: 'new' },
              { label: 'Locked Devices (overdue/locked)', value: 'locked' },
              { label: 'Unlocked Devices', value: 'unlocked' },
              { label: 'Fully Settled / Closed', value: 'settled' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('')
          setDeviceFilter('all')
        }}
      />

      <DataTable
        data={filteredLoans}
        columns={columns}
        exportable
        exportFilename="v-credit-loans.csv"
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={Boolean(paymentLoan)}
        onClose={() => setPaymentLoan(null)}
        title="Record EMI Collection"
        description="Acknowledge borrower payment and trigger automatic device unlock."
        size="md"
      >
        {paymentLoan && (
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borrower:</span>
                <span className="font-bold text-foreground">{paymentLoan.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Number:</span>
                <span className="font-mono text-foreground">{paymentLoan.loanNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Financed Unit:</span>
                <span className="text-foreground">{paymentLoan.deviceModel}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Amount Received (₹ INR)
              </label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="CASH">Cash Over Counter</option>
                <option value="NET_BANKING">IMPS / NEFT / Net Banking</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reference / Receipt ID
              </label>
              <Input
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentLoan(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm & Unlock Device
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
