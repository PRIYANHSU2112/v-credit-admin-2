import { Lock, Unlock, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { EmiRecord } from '../types'

interface LockConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  loan: EmiRecord | null
  onConfirm: () => void
  isProcessing?: boolean
}

export const LockConfirmationModal: React.FC<LockConfirmationModalProps> = ({
  isOpen,
  onClose,
  loan,
  onConfirm,
  isProcessing = false,
}) => {
  if (!isOpen || !loan) return null

  const isCurrentlyLocked = loan.deviceUnlockStatus === 'LOCKED'
  const targetAction = isCurrentlyLocked ? 'Unlock' : 'Lock'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isCurrentlyLocked
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              {isCurrentlyLocked ? (
                <Unlock className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Confirm Remote Device {targetAction}
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">
                {loan.customerName} · {loan.productName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-sm leading-relaxed text-foreground">
          {isCurrentlyLocked ? (
            <p className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
              Are you sure you want to <strong>UNLOCK</strong> {loan.customerName}&apos;s device (
              {loan.imeiNumber1})? An instant unlock signal will be dispatched, restoring all phone
              features immediately.
            </p>
          ) : (
            <p className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200">
              Are you sure you want to <strong>LOCK</strong> {loan.customerName}&apos;s device (
              {loan.imeiNumber1})? This will engage the Knox MDM security overlay, preventing phone
              access until overdue EMI amounts are cleared.
            </p>
          )}

          <div className="p-3.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground space-y-1.5">
            <p>Customer: <strong className="text-foreground">{loan.customerName}</strong> ({loan.customerPhone})</p>
            <p>Agreement: {loan.agreementId || loan.loanNumber}</p>
            <p>Device IMEI: {loan.imeiNumber1}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing} className="text-sm font-bold h-10 px-4">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`font-bold gap-2 px-6 h-10 text-sm shadow-xs ${
              isCurrentlyLocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isProcessing ? 'Processing Signal...' : `Confirm ${targetAction} Device`}
          </Button>
        </div>
      </div>
    </div>
  )
}
