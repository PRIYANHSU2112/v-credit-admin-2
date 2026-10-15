import { Modal } from '@/components/ui/Modal'
import { Printer, Download, CheckCircle2 } from 'lucide-react'
import type { TransferReportItem } from '@/mocks/mockSeedData'
import { toast } from 'sonner'

interface InvoiceReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  item: TransferReportItem | null
}

export function InvoiceReceiptModal({ isOpen, onClose, item }: InvoiceReceiptModalProps) {
  if (!item) return null

  const totalAmount = item.noOfKeys * item.keyPrice

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast.success(`Downloaded Receipt PDF: INV-${item.id.toUpperCase()}.pdf`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full">
          <span>License Key Transfer Invoice</span>
        </div>
      }
      size="lg"
      className="max-w-2xl"
    >
      <div className="space-y-4 pt-2 text-xs">
        {/* Receipt Printable Header */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-black text-foreground tracking-tight">V-CREDIT TECHNOLOGIES</h3>
              <p className="text-[11px] text-muted-foreground">Device Finance & MDM Key Distribution Network</p>
              <p className="text-[11px] text-muted-foreground">GSTIN: 23AABCU9603R1ZM</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] border border-emerald-500/20">
                PAID & TRANSFERRED
              </span>
              <p className="font-mono text-foreground font-bold mt-1">INV-{item.id.toUpperCase()}</p>
              <p className="text-[11px] text-muted-foreground">{item.transactionDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <p className="font-bold text-muted-foreground">TRANSFER TO (RECIPIENT):</p>
              <p className="font-bold text-foreground text-sm mt-0.5">{item.transferTo}</p>
              <p className="text-muted-foreground">{item.sendBy ? `Issued by: ${item.sendBy}` : 'Issued by: Regional Stockist'}</p>
            </div>
            <div>
              <p className="font-bold text-muted-foreground">TRANSACTION TYPE:</p>
              <p className="text-foreground font-medium mt-0.5">Device Locking Key Bulk Transfer</p>
              <p className="text-muted-foreground">Status: Verified On Ledger</p>
            </div>
          </div>

          {/* Line items */}
          <div className="pt-2 overflow-x-auto">
            <table className="w-full text-left border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted/60 font-bold text-foreground">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-center">Quantity</th>
                  <th className="py-2 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-2 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border bg-card/50">
                  <td className="py-2.5 px-3 font-semibold text-foreground">
                    EmiSafe Device Finance License Keys
                    {item.remark && <span className="block text-[11px] text-muted-foreground font-normal">{item.remark}</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-foreground">{item.noOfKeys}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground">₹{item.keyPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-primary">₹{totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-52 space-y-1 text-right">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono text-foreground">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (0% B2B):</span>
                <span className="font-mono text-foreground">₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground border-t border-border pt-1.5">
                <span>Total Paid:</span>
                <span className="font-mono text-primary font-black">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Cryptographically Verified Transfer Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent font-medium transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn-action-primary text-xs flex items-center gap-1.5 py-1.5 px-4 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
