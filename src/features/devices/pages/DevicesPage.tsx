import { useState, useMemo } from 'react'
import {
  Lock,
  Unlock,
  BellRing,
  Battery,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/common/ConfirmModal/ConfirmModal'
import { useAppSelector } from '@/app/store/hooks'
import { hasPermission } from '@/config/permissions'
import { formatDate, maskImei, maskPhone } from '@/lib/utils'
import { MOCK_DEVICES } from '../api/devicesApi'
import type { FinancedDevice, DeviceCommandType } from '../types'
import { toast } from 'sonner'

export default function DevicesPage() {
  const { user } = useAppSelector((state) => state.auth)

  const canLock = hasPermission(user?.role, 'devices:command:lock')
  const canUnlock = hasPermission(user?.role, 'devices:command:unlock')
  const canAlarm = hasPermission(user?.role, 'devices:command:alarm')

  const [devices, setDevices] = useState<FinancedDevice[]>(MOCK_DEVICES)
  const [searchQuery, setSearchQuery] = useState('')
  const [lockFilter, setLockFilter] = useState('all')
  const [networkFilter, setNetworkFilter] = useState('all')

  // Command modal
  const [activeCommand, setActiveCommand] = useState<{
    device: FinancedDevice
    command: DeviceCommandType
  } | null>(null)

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        d.imei.includes(searchQuery) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerPhone.includes(searchQuery)

      const matchesLock = lockFilter === 'all' || d.lockState === lockFilter
      const matchesNetwork = networkFilter === 'all' || d.networkState === networkFilter

      return matchesSearch && matchesLock && matchesNetwork
    })
  }, [devices, searchQuery, lockFilter, networkFilter])

  const handleExecuteCommand = () => {
    if (!activeCommand) return
    const { device, command } = activeCommand

    setDevices(
      devices.map((d) => {
        if (d.id === device.id) {
          if (command === 'LOCK') return { ...d, lockState: 'locked' as const }
          if (command === 'UNLOCK') return { ...d, lockState: 'unlocked' as const }
        }
        return d
      })
    )

    if (command === 'LOCK') {
      toast.error(`Remote LOCK signal broadcast to ${device.modelName} (IMEI ${maskImei(device.imei)})`, {
        description: 'Device lock screen activated. User cannot bypass MDM.',
      })
    } else if (command === 'UNLOCK') {
      toast.success(`Remote UNLOCK signal dispatched to ${device.modelName}!`)
    } else if (command === 'PLAY_ALARM') {
      toast.info(`Loud anti-tamper buzzer triggered on ${device.modelName}.`)
    }

    setActiveCommand(null)
  }

  const columns: ColumnDef<FinancedDevice>[] = [
    {
      id: 'device',
      header: 'Device & Hardware',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-xs">{item.brand} {item.modelName}</span>
            <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
              {item.appVersion}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>IMEI: {maskImei(item.imei)}</span>
            <span>·</span>
            <span>Loan #{item.loanId}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer / Dealer',
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-foreground">{item.customerName}</p>
          <p className="text-muted-foreground">{maskPhone(item.customerPhone)}</p>
          <p className="text-[10px] text-primary font-medium">{item.dealerName}</p>
        </div>
      ),
    },
    {
      id: 'network',
      header: 'Connectivity',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.networkState === 'online' ? (
            <Badge variant="success" dot className="text-xs">
              Online
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Offline
            </Badge>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
            <Battery className="h-3 w-3 text-muted-foreground" />
            {item.batteryLevel}%
          </span>
        </div>
      ),
    },
    {
      id: 'lock',
      header: 'Lock State',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.lockState} />
          {item.overdueDays > 0 && (
            <p className="text-[10px] text-rose-500 font-bold">
              {item.overdueDays} Days Overdue
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'heartbeat',
      header: 'Last Seen',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(item.lastHeartbeat, true)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'MDM Commands',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {canAlarm && (
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setActiveCommand({ device: item, command: 'PLAY_ALARM' })
              }}
              title="Play anti-tamper buzzer"
            >
              <BellRing className="h-3 w-3" />
            </Button>
          )}

          {canLock && item.lockState === 'unlocked' && (
            <Button
              variant="destructive"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setActiveCommand({ device: item, command: 'LOCK' })
              }}
              leftIcon={<Lock className="h-3 w-3" />}
            >
              Lock
            </Button>
          )}

          {canUnlock && item.lockState === 'locked' && (
            <Button
              variant="primary"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setActiveCommand({ device: item, command: 'UNLOCK' })
              }}
              leftIcon={<Unlock className="h-3 w-3" />}
            >
              Unlock
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financed Devices & Remote MDM"
        subtitle="Real-time telemetry, heartbeat monitoring, and remote lock controls for EMI enforcement."
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by IMEI, model, customer or phone..."
        selectFilters={[
          {
            id: 'lock',
            label: 'Lock Status',
            value: lockFilter,
            onChange: setLockFilter,
            options: [
              { label: 'Device Locked', value: 'locked' },
              { label: 'Device Unlocked', value: 'unlocked' },
            ],
          },
          {
            id: 'network',
            label: 'Network',
            value: networkFilter,
            onChange: setNetworkFilter,
            options: [
              { label: 'Online (Connected)', value: 'online' },
              { label: 'Offline', value: 'offline' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('')
          setLockFilter('all')
          setNetworkFilter('all')
        }}
      />

      <DataTable
        data={filteredDevices}
        columns={columns}
        exportable
        exportFilename="v-credit-devices.csv"
      />

      {/* Command Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(activeCommand)}
        onClose={() => setActiveCommand(null)}
        onConfirm={handleExecuteCommand}
        title={
          activeCommand?.command === 'LOCK'
            ? 'Lock Financed Device?'
            : activeCommand?.command === 'UNLOCK'
            ? 'Unlock Financed Device?'
            : 'Trigger Device Alarm?'
        }
        variant={activeCommand?.command === 'LOCK' ? 'danger' : 'info'}
        confirmText={
          activeCommand?.command === 'LOCK'
            ? 'Broadcast Lock'
            : activeCommand?.command === 'UNLOCK'
            ? 'Dispatch Unlock'
            : 'Play Alarm'
        }
        message={
          activeCommand ? (
            <div className="space-y-2">
              <p>
                Target Device: <strong>{activeCommand.device.brand} {activeCommand.device.modelName}</strong>
              </p>
              <p className="font-mono text-xs">IMEI: {activeCommand.device.imei}</p>
              <p className="text-muted-foreground text-xs">
                {activeCommand.command === 'LOCK'
                  ? 'This action will instantly lock the phone with an EMI overdue warning overlay. Phone calls and apps will be blocked until payment.'
                  : 'This action will restore normal Android phone operations.'}
              </p>
            </div>
          ) : (
            ''
          )
        }
      />
    </div>
  )
}
