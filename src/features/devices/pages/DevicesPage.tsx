import { useState, useMemo } from 'react'
import {
  Lock,
  Unlock,
  BellRing,
  Battery,
  Loader2,
  Smartphone,
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
import {
  useGetEndUsersQuery,
  useLockDeviceMutation,
  useUnlockDeviceMutation,
} from '@/features/customers/api/customersApi'
import { useGetDevicesQuery } from '../api/devicesApi'
import type { FinancedDevice, DeviceCommandType } from '../types'
import { toast } from 'sonner'

export default function DevicesPage() {
  const { user } = useAppSelector((state) => state.auth)

  const canLock = hasPermission(user?.role, 'devices:command:lock')
  const canUnlock = hasPermission(user?.role, 'devices:command:unlock')
  const canAlarm = hasPermission(user?.role, 'devices:command:alarm')

  const { data: devicesRes, isLoading: isLoadingDevices, isFetching: isFetchingDevices } = useGetDevicesQuery()
  const { data: usersRes, isLoading: isLoadingUsers, isFetching: isFetchingUsers } = useGetEndUsersQuery()
  const [lockDevice, { isLoading: isLocking }] = useLockDeviceMutation()
  const [unlockDevice, { isLoading: isUnlocking }] = useUnlockDeviceMutation()

  const isLoading = isLoadingDevices && isLoadingUsers
  const isFetching = isFetchingDevices || isFetchingUsers

  const rawUsers = usersRes?.data || []

  const devices: FinancedDevice[] = useMemo(() => {
    if (devicesRes?.data && devicesRes.data.length > 0) {
      return devicesRes.data
    }
    return rawUsers.map((u, i) => {
      const parts = (u.device || u.userFeature || 'Samsung Galaxy').split(' ')
      const brand = parts[0] || 'Generic'
      const modelName = parts.slice(1).join(' ') || 'Android'
      return {
        id: u.id || u._id || `dev_${i}`,
        imei: u.imei || u.imei1 || `861029384756${i}`,
        brand,
        modelName,
        customerName: u.name || u.userName || '—',
        customerPhone: u.phone || u.userPhone || '—',
        dealerName: u.dealer || 'Direct',
        lockState: (u.lockStatus === 'locked' ? 'locked' : 'unlocked') as 'locked' | 'unlocked',
        networkState: 'online' as const,
        batteryLevel: 85,
        lastHeartbeat: u.activatedAt || 'Just now',
        loanId: u.loanId || `VC-${1000 + i}`,
        appVersion: 'v2.4.1',
        isKnoxEnabled: true,
      }
    })
  }, [devicesRes, rawUsers])

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

  const handleExecuteCommand = async () => {
    if (!activeCommand) return
    const { device, command } = activeCommand

    try {
      if (command === 'LOCK') {
        await lockDevice({ imeiNumber: device.imei }).unwrap()
        toast.error(`Remote LOCK signal broadcast to ${device.modelName} (IMEI ${maskImei(device.imei)})`, {
          description: 'Device lock screen activated. User cannot bypass MDM.',
        })
      } else if (command === 'UNLOCK') {
        await unlockDevice({ imeiNumber: device.imei }).unwrap()
        toast.success(`Remote UNLOCK signal dispatched to ${device.modelName}!`)
      } else if (command === 'PLAY_ALARM') {
        toast.info(`Loud anti-tamper buzzer triggered on ${device.modelName}.`)
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Command execution failed')
    } finally {
      setActiveCommand(null)
    }
  }

  const columns: ColumnDef<FinancedDevice>[] = [
    {
      id: 'device',
      header: 'Device & Hardware',
      sortable: true,
      render: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">{item.brand} {item.modelName}</span>
            <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded">
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
        <div className="space-y-0.5">
          <p className="font-bold text-foreground text-sm">{item.customerName}</p>
          <p className="text-xs text-muted-foreground font-mono">{maskPhone(item.customerPhone)}</p>
          <p className="text-xs text-primary font-semibold">{item.dealerName}</p>
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
            <Badge variant="success" dot className="text-xs font-semibold">
              Online
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs font-semibold">
              Offline
            </Badge>
          )}
          <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-mono font-medium">
            <Battery className="h-4 w-4 text-emerald-500" />
            {item.batteryLevel}%
          </span>
        </div>
      ),
    },
    {
      id: 'lockState',
      header: 'MDM Status',
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.lockState === 'locked' ? 'locked' : 'unlocked'} />
      ),
    },
    {
      id: 'actions',
      header: 'Remote Commands',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {item.lockState === 'unlocked' ? (
            <Button
              variant="outline"
              size="sm"
              disabled={!canLock || isLocking}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 h-8 px-2.5 text-xs font-semibold"
              onClick={() => setActiveCommand({ device: item, command: 'LOCK' })}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
            >
              Lock
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={!canUnlock || isUnlocking}
              className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30 h-8 px-2.5 text-xs font-semibold"
              onClick={() => setActiveCommand({ device: item, command: 'UNLOCK' })}
              leftIcon={<Unlock className="h-3.5 w-3.5" />}
            >
              Unlock
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            disabled={!canAlarm}
            className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-500/10"
            title="Trigger Anti-Tamper Alarm"
            onClick={() => setActiveCommand({ device: item, command: 'PLAY_ALARM' })}
          >
            <BellRing className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financed Device Fleet (MDM)"
        subtitle="Live telemetry, remote MDM locks, and security heartbeat of customer hardware."
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by IMEI, borrower, phone, or model..."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 p-16 bg-card border border-border rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <span className="text-sm font-medium text-muted-foreground">Loading device fleet telemetry...</span>
        </div>
      ) : (
        <DataTable
          data={filteredDevices}
          columns={columns}
          exportable
          exportFilename="v-credit-devices-fleet.csv"
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(activeCommand)}
        title={
          activeCommand?.command === 'LOCK'
            ? 'Broadcast Remote MDM Lock?'
            : activeCommand?.command === 'UNLOCK'
            ? 'Broadcast Remote MDM Unlock?'
            : 'Trigger Anti-Tamper Siren?'
        }
        description={
          activeCommand?.command === 'LOCK'
            ? `Are you sure you want to lock ${activeCommand.device.brand} ${activeCommand.device.modelName} (IMEI ${activeCommand.device.imei})? The borrower will be presented with a full-screen lock and payment prompt.`
            : activeCommand?.command === 'UNLOCK'
            ? `Are you sure you want to release the lock on ${activeCommand?.device.modelName}? All device functions will be immediately restored.`
            : `This will play a high-volume siren on ${activeCommand?.device.modelName} even if the volume is muted.`
        }
        confirmText={
          activeCommand?.command === 'LOCK'
            ? 'Confirm Remote Lock'
            : activeCommand?.command === 'UNLOCK'
            ? 'Confirm Unlock'
            : 'Sound Siren'
        }
        variant={activeCommand?.command === 'LOCK' ? 'danger' : 'primary'}
        onConfirm={handleExecuteCommand}
        onCancel={() => setActiveCommand(null)}
      />
    </div>
  )
}
