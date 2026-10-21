import { Modal } from '@/components/ui/Modal'
import type { EndUserRecord } from '@/features/customers/types'

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: EndUserRecord | null
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null

  const detailsList = [
    { label: 'Customer ID', value: user._id || user.customerId || user.id },
    { label: 'Customer Name', value: user.customerName || user.userName || (user as any).name },
    { label: 'Mobile Number', value: user.customerMobileNumber || user.userPhone || (user as any).phone },
    { label: 'Email Address', value: user.email || '—' },
    { label: 'Loan Reference', value: user.loanId || (user as any).loanStatus || '—' },
    {
      label: 'Brand & Model',
      value:
        (user as any).device ||
        `${user.mobileBrand || ''} ${user.mobileModel || user.deviceName || user.userFeature || ''}`.trim() ||
        '—',
    },
    { label: 'Primary IMEI (1)', value: (user as any).imei || user.imeiNumber1 || user.imei1 || '—' },
    { label: 'Secondary IMEI (2)', value: user.imeiNumber2 || user.imei2 || '—' },
    {
      label: 'Lock Status',
      value:
        user.deviceUnlockStatus ||
        (user.lockStatus === 'locked' ? 'LOCKED' : user.lockStatus === 'unlocked' ? 'UNLOCKED' : '—'),
    },
    { label: 'Loan Lifecycle Status', value: user.loanStatus || '—' },
    { label: 'Bound License Key', value: (user as any).keyId || user.keyCode || '—' },
    {
      label: 'Dealer Retailer',
      value: user.dealer ? `${user.dealer}${user.dealerPhone ? ` (${user.dealerPhone})` : ''}` : '—',
    },
    {
      label: 'Device Agent',
      value: user.deviceAgent || (user as any).device || '—',
    },
    { label: 'Activation Date', value: (user as any).activatedAt || user.activationDate || '—' },
    { label: 'Enrollment Date', value: user.enrollmentDate || (user as any).activatedAt || '—' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-primary font-bold text-lg">User Details</span>}
      size="lg"
      className="max-w-2xl"
    >
      <div className="divide-y divide-border text-xs">
        {detailsList.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 py-2.5 px-3 hover:bg-muted/40 transition-colors"
          >
            <span className="font-semibold text-muted-foreground">{item.label}</span>
            <span className="col-span-2 text-foreground font-medium break-words">
              {item.value || '—'}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  )
}
