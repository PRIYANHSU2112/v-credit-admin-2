import { Modal } from '@/components/ui/Modal'
import { Download } from 'lucide-react'
import type { DistributorRecord } from '@/mocks/mockSeedData'
import { toast } from 'sonner'

interface DistributorDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  distributor: DistributorRecord | null
}

export function DistributorDetailsModal({
  isOpen,
  onClose,
  distributor,
}: DistributorDetailsModalProps) {
  if (!distributor) return null

  const handleDownloadDoc = (docName: string) => {
    toast.success(`Downloading verified KYC document: ${docName}`)
  }

  const detailsList = [
    { label: 'Entity Code', value: distributor.entityCode || 'DST-1001' },
    { label: 'Agency / Business', value: distributor.agency || distributor.name },
    { label: 'Phone No', value: distributor.phone },
    { label: 'Email Id', value: distributor.email || 'partner@vcredit.in' },
    { label: 'Super Stockiest', value: distributor.superStockiest || distributor.stockist || 'Music Beats' },
    { label: 'City', value: distributor.city },
    { label: 'Territory / State', value: distributor.territory || distributor.state },
    { label: 'Last Billing Date', value: distributor.lastBillingDate || '25-07-2026 16:45:48' },
    { label: 'Available Android Keys', value: `${distributor.available ?? distributor.availableKeys} Keys` },
    { label: 'Total Android Keys', value: `${distributor.keys ?? distributor.totalKeys} Keys` },
    { label: 'Used Android Keys', value: `${distributor.usedKeys} Keys` },
    { label: 'Available iPhone Keys', value: `${distributor.iphoneKeys} Keys` },
    { label: 'Network Status', value: distributor.status || 'Active' },
    { label: 'Remark / Notes', value: distributor.remark || 'Active distribution hub' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-primary font-bold text-lg">Distributor Details</span>}
      size="lg"
      className="max-w-2xl"
    >
      <div className="divide-y divide-border text-xs">
        {detailsList.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 py-2.5 px-3 hover:bg-muted/40 transition-colors">
            <span className="font-semibold text-muted-foreground">{item.label}</span>
            <span className="col-span-2 text-foreground font-medium">
              {item.label === 'Super Stockiest' ? (
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {item.value}
                </span>
              ) : (
                item.value || '—'
              )}
            </span>
          </div>
        ))}

        {/* Verified Documents */}
        <div className="grid grid-cols-3 py-2.5 px-3 items-center hover:bg-muted/40 transition-colors">
          <span className="font-semibold text-muted-foreground">GST Document</span>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-foreground">Distributor_GST_Cert.pdf</span>
            <button
              type="button"
              onClick={() => handleDownloadDoc('Distributor_GST_Cert.pdf')}
              className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
              title="Download GST Certificate"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 py-2.5 px-3 items-center hover:bg-muted/40 transition-colors">
          <span className="font-semibold text-muted-foreground">Agency Agreement</span>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-foreground">EmiSafe_Partner_Agreement.pdf</span>
            <button
              type="button"
              onClick={() => handleDownloadDoc('EmiSafe_Partner_Agreement.pdf')}
              className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
              title="Download Agreement"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
