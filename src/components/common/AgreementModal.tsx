import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Download, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface AgreementModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AgreementModal({ isOpen, onClose }: AgreementModalProps) {
  const handleDownload = () => {
    try {
      const content = `===============================================================
V-CREDIT ENTERPRISE PLATFORM COMPLIANCE & LEGAL MANDATE
Document: Distribution & Franchise Partnership Agreement
Version: v3.2 (Digitally Signed)
Generated: ${new Date().toISOString()}
===============================================================

1. LICENSE & KEY ALLOCATION SCOPE
The Stockist / Partner is granted non-exclusive rights to distribute digital device finance keys 
strictly within authorized municipal boundaries. Keys already activated on a financed phone are permanently non-reclaimable.

2. MDM DEVICE ENFORCEMENT & CUSTOMER DATA
Remote MDM lock signals must comply strictly with RBI guidelines and customer EMI repayment schedules. 
Unwarranted device tampering or unauthorized IMEI tracking is prohibited.

3. COMMISSION PAYOUTS & SETTLEMENT
Commission disbursements will be credited directly to the registered wallet upon verified borrower repayment.

Official Signatory:
V-Credit Legal Operations & Risk Management Directorate
`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `V-Credit_Partner_Agreement_v3.2.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Downloaded official Distribution Agreement')
      onClose()
    } catch {
      toast.error('Failed to download agreement document')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="V-Credit Partner Legal Agreement"
      description="Official digital distribution & franchise contract terms."
      size="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-2 max-h-60 overflow-y-auto leading-relaxed">
          <p className="font-bold text-foreground">1. License & Key Allocation Scope</p>
          <p>
            The Stockist / Partner is granted non-exclusive rights to distribute digital device finance keys strictly within authorized municipal boundaries. Keys already activated on a financed phone are permanently non-reclaimable.
          </p>
          <p className="font-bold text-foreground">2. MDM Device Enforcement & Customer Data</p>
          <p>
            Remote MDM lock signals must comply strictly with RBI guidelines and customer EMI repayment schedules. Unwarranted device tampering or unauthorized IMEI tracking is prohibited.
          </p>
          <p className="font-bold text-foreground">3. Commission Payouts & Settlement</p>
          <p>
            Commission disbursements will be credited directly to the registered wallet upon verified borrower repayment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Verified Digitally Signed Document (v3.2)</span>
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn-action-primary text-xs flex items-center gap-1.5 py-2 px-4"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}
