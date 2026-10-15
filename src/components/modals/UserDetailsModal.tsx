import { Modal } from '@/components/ui/Modal'
import type { EmiSafeUserRecord } from '@/mocks/mockSeedData'

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: EmiSafeUserRecord | null
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null

  const detailsList = [
    { label: 'Name', value: user.userName },
    { label: 'Phone No', value: user.userPhone },
    { label: 'Key Code', value: user.keyCode || 'VC-883920' },
    { label: 'IMEI or Device Id', value: user.imei1 || '352839711277967' },
    {
      label: 'Device Agent',
      value:
        user.deviceAgent ||
        'Device - INFINIX MOBILITY LIMITED Infinix X6512, Android Version - 11, SDK - 30',
    },
    { label: 'GSF ID', value: user.gsfId || '4029182390' },
    { label: 'Device ID', value: user.deviceId || '0' },
    { label: 'Device Name', value: user.deviceName || user.userFeature || 'N/A' },
    { label: 'Claimed', value: user.claimed || 'C' },
    { label: 'Activation Date', value: user.activationDate },
    { label: 'Enrollment Date', value: user.enrollmentDate || '14/10/2026 19:44:40' },
    { label: 'Removed On', value: user.removedOn || '--' },
    { label: 'Activated By', value: user.activatedBy || '3.0' },
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
