import { Modal } from '@/components/ui/Modal'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export interface DealerDetailsData {
  id?: string
  entityCode?: string
  dealerCode?: string
  createDate?: string
  dealerShop?: string
  name?: string
  dealerName?: string
  phone?: string
  email?: string
  distributor?: string
  superStockiest?: string
  national?: string
  gst?: string
  gstNumber?: string
  available?: number
  availableKeys?: number
  keys?: number
  totalKeys?: number
  address?: string
  city?: string
  territory?: string
  state?: string
  pincode?: string
  document1?: string
  document2?: string
}

interface DealerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  dealer: DealerDetailsData | null
}

export function DealerDetailsModal({ isOpen, onClose, dealer }: DealerDetailsModalProps) {
  if (!dealer) return null

  const handleDownloadDoc = (docName: string) => {
    toast.success(`Downloading verified KYC document: ${docName}`)
  }

  const detailsList = [
    { label: 'Entity Code', value: dealer.entityCode || dealer.dealerCode || 'DLR-1001' },
    { label: 'Create Date', value: dealer.createDate || '08/10/2026 16:44:10' },
    { label: 'Shop / Business', value: dealer.dealerShop || dealer.name },
    { label: 'Contact Person', value: dealer.dealerName || 'Abhishek malviya' },
    { label: 'Phone No', value: dealer.phone },
    { label: 'Email Id', value: dealer.email || 'abhimalviya319@gmail.com' },
    { label: 'Distributor', value: dealer.distributor },
    { label: 'Super Stockiest', value: dealer.superStockiest || 'Music Beats' },
    { label: 'National', value: dealer.national || 'HBT EMPLOYEE FAIYAZ' },
    { label: 'GST Number', value: dealer.gst || dealer.gstNumber || '23AABCU9603R1ZM' },
    { label: 'Keys Allocation', value: `${dealer.available ?? dealer.availableKeys} Available / ${dealer.keys ?? dealer.totalKeys} Total` },
    { label: 'Address', value: dealer.address || 'Bus stand Sukhtawa kalaakhar road sukhtawa' },
    { label: 'City', value: dealer.city },
    { label: 'Territory / State', value: dealer.territory || dealer.state },
    { label: 'Pincode', value: dealer.pincode || '460001' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-primary font-bold text-lg">Dealer Details</span>}
      size="lg"
      className="max-w-2xl"
    >
      <div className="divide-y divide-border text-xs">
        {detailsList.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 py-2.5 px-3 hover:bg-muted/40 transition-colors">
            <span className="font-semibold text-muted-foreground">{item.label}</span>
            <span className="col-span-2 text-foreground font-medium">{item.value || '—'}</span>
          </div>
        ))}

        {/* Document 1 */}
        <div className="grid grid-cols-3 py-2.5 px-3 items-center hover:bg-muted/40 transition-colors">
          <span className="font-semibold text-muted-foreground">Document 1</span>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-foreground">{dealer.document1 || 'Aadhar_Card.pdf'}</span>
            <button
              type="button"
              onClick={() => handleDownloadDoc(dealer.document1 || 'Aadhar_Card.pdf')}
              className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
              title="Download Document 1"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Document 2 */}
        <div className="grid grid-cols-3 py-2.5 px-3 items-center hover:bg-muted/40 transition-colors">
          <span className="font-semibold text-muted-foreground">Document 2</span>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-foreground">{dealer.document2 || 'Shop_License.pdf'}</span>
            <button
              type="button"
              onClick={() => handleDownloadDoc(dealer.document2 || 'Shop_License.pdf')}
              className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
              title="Download Document 2"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
