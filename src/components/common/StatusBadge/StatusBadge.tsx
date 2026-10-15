import { Badge, type BadgeProps } from '@/components/ui/Badge'

export type CommonStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'locked'
  | 'unlocked'
  | 'online'
  | 'offline'
  | 'allocated'
  | 'used'
  | 'reclaimed'
  | 'expired'
  | 'overdue'
  | 'settled'
  | 'approved'
  | 'rejected'

const STATUS_MAP: Record<
  string,
  { label: string; variant: BadgeProps['variant']; dot?: boolean }
> = {
  // Common
  active: { label: 'Active', variant: 'success', dot: true },
  inactive: { label: 'Inactive', variant: 'outline' },
  pending: { label: 'Pending', variant: 'warning', dot: true },
  suspended: { label: 'Suspended', variant: 'destructive', dot: true },

  // Devices & MDM
  online: { label: 'Online', variant: 'success', dot: true },
  offline: { label: 'Offline', variant: 'secondary' },
  locked: { label: 'Device Locked', variant: 'destructive', dot: true },
  unlocked: { label: 'Unlocked', variant: 'success' },

  // License Keys
  allocated: { label: 'Allocated', variant: 'purple', dot: true },
  used: { label: 'Activated', variant: 'cyan' },
  reclaimed: { label: 'Reclaimed', variant: 'secondary' },
  expired: { label: 'Expired', variant: 'destructive' },

  // Loans & EMIs
  current: { label: 'On Track', variant: 'success' },
  overdue: { label: 'Overdue EMI', variant: 'destructive', dot: true },
  settled: { label: 'Settled', variant: 'cyan' },
  defaulted: { label: 'Defaulted', variant: 'destructive' },

  // Requests
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

interface StatusBadgeProps {
  status: string | null | undefined
  customLabel?: string
  className?: string
}

export function StatusBadge({ status, customLabel, className }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase()
  const config = STATUS_MAP[normalized] || {
    label: customLabel || status || 'Unknown',
    variant: 'outline' as const,
    dot: false,
  }

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      className={className}
    >
      {customLabel || config.label}
    </Badge>
  )
}
