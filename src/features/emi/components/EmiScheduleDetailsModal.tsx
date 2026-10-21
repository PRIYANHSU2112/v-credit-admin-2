import {
  Calendar,
  CheckCircle2,
  ClockAlert,
  AlertTriangle,
  Receipt,
  Bell,
  Lock,
  Unlock,
  X,
  CreditCard,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { EmiRecord, EmiReceiptData } from '../types'

interface EmiScheduleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  loan: EmiRecord | null
  onPayInstallment: (loan: EmiRecord, installmentNumber: number) => void
  onViewReceipt: (receipt: EmiReceiptData) => void
  onSendReminder: (loan: EmiRecord) => void
  onToggleLock: (loan: EmiRecord) => void
}

export const EmiScheduleDetailsModal: React.FC<EmiScheduleDetailsModalProps> = ({
  isOpen,
  onClose,
  loan,
  onPayInstallment,
  onViewReceipt,
  onSendReminder,
  onToggleLock,
}) => {
  if (!isOpen || !loan) return null

  const isLocked = loan.deviceUnlockStatus === 'LOCKED'
  const isClosed = loan.loanStatus === 'CLOSED' || loan.amountLeft <= 0

  const paidCount = loan.installments?.filter((i) => i.status === 'PAID').length || 0
  const progressPercent = Math.round((paidCount / (loan.totalEmis || 1)) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{loan.customerName}</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                  {loan.agreementId || loan.loanNumber}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isClosed
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : isLocked
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  }`}
                >
                  {isClosed ? 'LOAN CLOSED' : isLocked ? 'DEVICE LOCKED' : 'ACTIVE EMI PLAN'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mobile: <strong className="text-foreground">{loan.customerPhone}</strong> · Retailer: <strong className="text-foreground">{loan.dealerName}</strong> · Product: {loan.productName} (IMEI: {loan.imeiNumber1})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendReminder(loan)}
              className="gap-1.5 text-xs font-bold h-9 px-3"
            >
              <Bell className="h-4 w-4 text-amber-500" />
              Send Reminder
            </Button>

            <Button
              variant={isLocked ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onToggleLock(loan)}
              className={`gap-1.5 text-xs font-bold h-9 px-3.5 ${
                isLocked ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'text-foreground'
              }`}
            >
              {isLocked ? (
                <>
                  <Unlock className="h-4 w-4" /> Unlock Device
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-rose-500" /> Lock Device
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 flex-1 pr-1">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">Mobile Device Price</span>
              <p className="text-xl font-black text-foreground font-mono">
                {formatCurrency(loan.mobilePrice)}
              </p>
              <p className="text-xs text-muted-foreground">
                Down Payment: {formatCurrency(loan.downPayment)}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">Monthly EMI Amount</span>
              <p className="text-xl font-black text-primary font-mono">
                {formatCurrency(loan.emiAmount)} <span className="text-xs font-normal text-muted-foreground">/ month</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Tenure: {loan.totalEmis} Monthly Installments
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">Collected so far</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(loan.amountPaid)}
              </p>
              <p className="text-xs text-muted-foreground">
                {paidCount} of {loan.totalEmis} EMIs cleared
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">Outstanding Balance</span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(loan.amountLeft)}
              </p>
              <p className="text-xs text-muted-foreground">
                Next Due: {formatDate(loan.nextDueDate)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-foreground">Repayment Progress</span>
              <span className="text-primary font-mono">{progressPercent}% Completed</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {paidCount} installments paid ({formatCurrency(loan.amountPaid)}) · {loan.totalEmis - paidCount} installments remaining ({formatCurrency(loan.amountLeft)})
            </p>
          </div>

          {/* Complete Repayment Schedule Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Complete Repayment Schedule & Payment History
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                * All installments must be paid in full (No partial payments)
              </span>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/70 text-muted-foreground uppercase text-xs tracking-wider font-bold border-b border-border">
                  <tr>
                    <th className="py-3 px-3.5 font-bold">Inst. #</th>
                    <th className="py-3 px-3.5 font-bold">Due Date</th>
                    <th className="py-3 px-3.5 font-bold">EMI Amount</th>
                    <th className="py-3 px-3.5 font-bold">Penalty / Late Fee</th>
                    <th className="py-3 px-3.5 font-bold">Total Payable</th>
                    <th className="py-3 px-3.5 font-bold">Status</th>
                    <th className="py-3 px-3.5 font-bold">Payment Info</th>
                    <th className="py-3 px-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loan.installments && loan.installments.length > 0 ? (
                    loan.installments.map((inst) => {
                      const isPaid = inst.status === 'PAID'
                      const isOverdue = inst.status === 'OVERDUE'
                      const totalDue = (inst.amount || 0) + (inst.lateFee || 0) + (inst.bounceFee || 0)

                      return (
                        <tr
                          key={inst.installmentNumber}
                          className={`hover:bg-muted/30 transition-colors ${
                            isOverdue ? 'bg-rose-500/5' : isPaid ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <td className="py-3.5 px-3.5 font-mono font-bold text-foreground">
                            #{inst.installmentNumber}
                          </td>
                          <td className="py-3.5 px-3.5 font-bold text-foreground">
                            {formatDate(inst.dueDate)}
                          </td>
                          <td className="py-3.5 px-3.5 font-mono font-bold text-foreground">
                            {formatCurrency(inst.amount)}
                          </td>
                          <td className="py-3.5 px-3.5 font-mono">
                            {inst.lateFee && inst.lateFee > 0 ? (
                              <span className="text-rose-600 font-bold">+{formatCurrency(inst.lateFee)}</span>
                            ) : (
                              <span className="text-muted-foreground">₹0</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 font-mono font-black text-foreground">
                            {formatCurrency(totalDue)}
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : isOverdue
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {isPaid && <CheckCircle2 className="h-3 w-3" />}
                              {isOverdue && <AlertTriangle className="h-3 w-3" />}
                              {!isPaid && !isOverdue && <ClockAlert className="h-3 w-3" />}
                              {inst.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-xs text-muted-foreground">
                            {isPaid ? (
                              <div>
                                <span className="font-semibold text-foreground">
                                  {formatDate(inst.paidDate || inst.dueDate)}
                                </span>
                                <span className="block font-mono text-[11px] text-emerald-600 uppercase font-bold">
                                  via {inst.paymentMethod || 'UPI'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground font-medium">Unpaid</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            {isPaid ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const receipt: EmiReceiptData = {
                                    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
                                    loanId: loan._id,
                                    loanNumber: loan.loanNumber,
                                    agreementId: loan.agreementId,
                                    customerName: loan.customerName,
                                    customerPhone: loan.customerPhone,
                                    dealerName: loan.dealerName,
                                    dealerPhone: loan.dealerPhone,
                                    productName: loan.productName,
                                    imei: loan.imeiNumber1,
                                    installmentNumber: inst.installmentNumber,
                                    totalInstallments: loan.totalEmis,
                                    amountPaid: inst.paidAmount || inst.amount,
                                    principalPaid: inst.amount,
                                    lateFeePaid: inst.lateFee || 0,
                                    paymentMethod: (inst.paymentMethod || 'UPI').toUpperCase(),
                                    transactionRef: `TXN-${inst.installmentNumber}0948`,
                                    paidDate: inst.paidDate || new Date().toISOString(),
                                    remainingBalance: Math.max(0, loan.amountLeft),
                                    nextDueDate: loan.nextDueDate,
                                    deviceUnlockStatus: loan.deviceUnlockStatus,
                                  }
                                  onViewReceipt(receipt)
                                }}
                                className="h-8 text-xs font-bold gap-1 px-3"
                              >
                                <Receipt className="h-3.5 w-3.5 text-primary" />
                                Receipt
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => onPayInstallment(loan, inst.installmentNumber)}
                                className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-3 shadow-xs"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                Pay Full
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-muted-foreground text-sm">
                        No repayment installments found for this agreement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-border shrink-0">
          <div className="text-xs text-muted-foreground font-mono">
            Agreement ID: {loan.agreementId} · Registered IMEI: {loan.imeiNumber1}
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="px-5 text-xs font-bold">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
