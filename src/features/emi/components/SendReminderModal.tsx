import React, { useState } from 'react'
import {
  MessageSquare,
  Smartphone,
  Volume2,
  BellRing,
  Send,
  X,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { EmiRecord } from '../types'
import { toast } from 'sonner'

interface SendReminderModalProps {
  isOpen: boolean
  onClose: () => void
  loan: EmiRecord | null
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  if (!isOpen || !loan) return null

  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'voice' | 'push'>('whatsapp')
  const [isSending, setIsSending] = useState(false)

  // Find next pending/overdue installment
  const nextPending =
    loan.installments?.find((i) => i.status === 'OVERDUE') ||
    loan.installments?.find((i) => i.status === 'PENDING')

  const amountDue = nextPending
    ? (nextPending.amount || 0) + (nextPending.lateFee || 0)
    : loan.emiAmount

  const dueDate = nextPending?.dueDate ? formatDate(nextPending.dueDate) : formatDate(loan.nextDueDate)

  const templateMessage = `Dear ${loan.customerName}, this is a friendly reminder from ${loan.dealerName} (V-Credit). Your mobile EMI payment of ${formatCurrency(amountDue)} is due on ${dueDate}. Please pay your installment in full to prevent device Knox lock. Pay via UPI or visit the store. Thank you!`

  const handleSend = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      const channelLabel =
        channel === 'whatsapp'
          ? 'WhatsApp message'
          : channel === 'sms'
          ? 'SMS alert'
          : channel === 'voice'
          ? 'Automated Voice Reminder'
          : 'High-priority Push Notification'

      toast.success(`${channelLabel} sent to ${loan.customerName} (${loan.customerPhone})!`, {
        description: `Installment reminder for ${formatCurrency(amountDue)} dispatched.`,
      })
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Send EMI Reminder</h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">
                {loan.customerName} · {loan.customerPhone}
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

        {/* Channel Selection */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-foreground block">
            Select Reminder Channel
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={`p-3.5 rounded-xl border text-sm font-bold flex items-center gap-2.5 transition-all ${
                channel === 'whatsapp'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'border-border/60 hover:bg-muted text-foreground'
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>WhatsApp Message</span>
            </button>

            <button
              type="button"
              onClick={() => setChannel('sms')}
              className={`p-3.5 rounded-xl border text-sm font-bold flex items-center gap-2.5 transition-all ${
                channel === 'sms'
                  ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                  : 'border-border/60 hover:bg-muted text-foreground'
              }`}
            >
              <Smartphone className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              <span>Direct SMS</span>
            </button>

            <button
              type="button"
              onClick={() => setChannel('voice')}
              className={`p-3.5 rounded-xl border text-sm font-bold flex items-center gap-2.5 transition-all ${
                channel === 'voice'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20'
                  : 'border-border/60 hover:bg-muted text-foreground'
              }`}
            >
              <Volume2 className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              <span>Voice Call Alert</span>
            </button>

            <button
              type="button"
              onClick={() => setChannel('push')}
              className={`p-3.5 rounded-xl border text-sm font-bold flex items-center gap-2.5 transition-all ${
                channel === 'push'
                  ? 'border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20'
                  : 'border-border/60 hover:bg-muted text-foreground'
              }`}
            >
              <BellRing className="h-4.5 w-4.5 text-violet-500 shrink-0" />
              <span>Knox Push Prompt</span>
            </button>
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            Message Preview
          </label>
          <div className="p-4 rounded-xl border border-border bg-muted/50 text-sm text-foreground font-mono leading-relaxed">
            {templateMessage}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Amount and due date are automatically populated from the repayment ledger.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSending} className="text-sm font-bold h-10 px-4">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={isSending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6 h-10 text-sm shadow-xs"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Dispatch Reminder'}
          </Button>
        </div>
      </div>
    </div>
  )
}
