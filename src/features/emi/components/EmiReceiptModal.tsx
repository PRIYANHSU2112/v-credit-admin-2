import {
  Printer,
  Download,
  CheckCircle2,
  X,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { EmiReceiptData } from '../types'
import { toast } from 'sonner'

interface EmiReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receipt: EmiReceiptData | null
}

export const EmiReceiptModal: React.FC<EmiReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  if (!isOpen || !receipt) return null

  const handlePrint = () => {
    window.print()
  }

  const handleCopySlip = () => {
    const text = `
=============================================
           V-CREDIT EMI SAFE RECEIPT
=============================================
Receipt No    : ${receipt.receiptNumber}
Agreement ID  : ${receipt.agreementId || receipt.loanNumber}
Date & Time   : ${formatDate(receipt.paidDate)}
Customer Name : ${receipt.customerName}
Mobile Number : ${receipt.customerPhone}
Retail Dealer : ${receipt.dealerName}
Product       : ${receipt.productName}
IMEI          : ${receipt.imei}
---------------------------------------------
Installment   : #${receipt.installmentNumber} of ${receipt.totalInstallments}
Amount Paid   : ${formatCurrency(receipt.amountPaid)}
Payment Mode  : ${receipt.paymentMethod}
Transaction ID: ${receipt.transactionRef}
Balance Left  : ${formatCurrency(receipt.remainingBalance)}
Device Status : ${receipt.deviceUnlockStatus}
=============================================
      Thank you for your prompt repayment!
=============================================
`.trim()

    navigator.clipboard.writeText(text)
    toast.success('Receipt details copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            <span>Official EMI Repayment Slip</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div
          id="emi-receipt-print-area"
          className="p-6 rounded-xl border border-border bg-white text-neutral-900 shadow-inner space-y-5 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  VC
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-neutral-900 leading-none">
                    V-CREDIT ENTERPRISE
                  </h1>
                  <p className="text-[10px] text-neutral-500 font-medium">
                    EMI Safe Device Finance & Repayments
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-neutral-600 mt-2 font-mono">
                Receipt #: <span className="font-bold text-neutral-900">{receipt.receiptNumber}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>PAID IN FULL</span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono mt-1.5">
                {formatDate(receipt.paidDate)}
              </p>
            </div>
          </div>

          {/* Two-Column Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Customer Details */}
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Customer Details
              </span>
              <p className="font-bold text-neutral-900 text-base">{receipt.customerName}</p>
              <p className="text-neutral-700 font-mono text-xs">{receipt.customerPhone}</p>
              <p className="text-neutral-500 text-xs">Agreement: {receipt.agreementId || receipt.loanNumber}</p>
            </div>

            {/* Merchant / Dealer */}
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Authorized Dealer Outlet
              </span>
              <p className="font-bold text-neutral-900 text-base truncate">{receipt.dealerName}</p>
              <p className="text-neutral-700 text-xs">V-Credit Retail Network</p>
              <p className="text-emerald-700 font-bold text-xs">
                Device Status: {receipt.deviceUnlockStatus}
              </p>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">{receipt.productName}</p>
                <p className="text-xs font-mono text-neutral-600">IMEI: {receipt.imei}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded bg-neutral-200 text-neutral-800 font-mono text-xs font-bold">
                Installment #{receipt.installmentNumber} of {receipt.totalInstallments}
              </span>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-neutral-100 p-2.5 font-bold text-neutral-700 text-xs">
              <span>Description</span>
              <span className="text-center">Channel / UTR</span>
              <span className="text-right">Amount (₹)</span>
            </div>

            <div className="grid grid-cols-3 p-3 border-t border-neutral-200 text-neutral-800 text-xs">
              <span className="font-semibold">Installment #{receipt.installmentNumber} Principal</span>
              <span className="text-center font-mono text-neutral-600 font-medium">{receipt.paymentMethod}</span>
              <span className="text-right font-mono font-bold text-sm">{formatCurrency(receipt.principalPaid || receipt.amountPaid)}</span>
            </div>

            {receipt.lateFeePaid > 0 && (
              <div className="grid grid-cols-3 p-3 border-t border-neutral-200 text-neutral-800 text-xs">
                <span className="text-rose-600 font-semibold">Late Fee Clearance</span>
                <span className="text-center text-neutral-500 text-xs">Overdue Charge</span>
                <span className="text-right font-mono font-bold text-rose-600 text-sm">
                  {formatCurrency(receipt.lateFeePaid)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 p-3.5 bg-neutral-50 border-t border-neutral-200 font-black text-sm text-neutral-900 items-center">
              <span className="text-base font-bold">Total Settled</span>
              <span className="text-center font-mono text-xs text-neutral-600 font-normal">
                Ref: {receipt.transactionRef}
              </span>
              <span className="text-right font-mono text-emerald-700 text-lg">
                {formatCurrency(receipt.amountPaid)}
              </span>
            </div>
          </div>

          {/* Remaining Balance & Next Due */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs">
            <div>
              <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
                Outstanding Balance Left
              </p>
              <p className="text-lg font-black text-emerald-900 font-mono">
                {formatCurrency(receipt.remainingBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
                Authorized Verification
              </p>
              <p className="text-xs font-mono font-bold text-neutral-800 flex items-center gap-1 justify-end">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> V-Credit Digital Seal
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-xs text-neutral-500 border-t border-neutral-200">
            This is a computer-generated tax invoice and repayment receipt. Keep this for your records.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border shrink-0">
          <Button variant="outline" size="sm" onClick={handleCopySlip} className="gap-1.5 text-xs font-bold h-9">
            <Download className="h-4 w-4" />
            Copy Text Slip
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold h-9">
              Close
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs px-4 h-9 shadow-xs"
            >
              <Printer className="h-4 w-4" />
              Print Official Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
