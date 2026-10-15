import { useState, useMemo } from 'react'
import {
  PlusCircle,
  Send,
  Copy,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/common/ConfirmModal/ConfirmModal'
import { useAppSelector } from '@/app/store/hooks'
import { hasPermission } from '@/config/permissions'
import { formatDate, maskImei, copyToClipboard } from '@/lib/utils'
import { MOCK_KEYS } from '../api/keysApi'
import type { LicenseKey } from '../types'
import { toast } from 'sonner'

export default function KeysPage() {
  const { user } = useAppSelector((state) => state.auth)
  const canGenerate = hasPermission(user?.role, 'keys:generate')
  const canTransfer = hasPermission(user?.role, 'keys:transfer')
  const canReclaim = hasPermission(user?.role, 'keys:reclaim')

  const [keysList, setKeysList] = useState<LicenseKey[]>(MOCK_KEYS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')

  // Modals state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [reclaimKeyTarget, setReclaimKeyTarget] = useState<LicenseKey | null>(null)

  // Form states
  const [generateQuantity, setGenerateQuantity] = useState('100')
  const [transferQuantity, setTransferQuantity] = useState('50')
  const [transferTarget, setTransferTarget] = useState('North Regional Stockist')
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  // Filtered keys
  const filteredKeys = useMemo(() => {
    return keysList.filter((k) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        k.keyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.assignedCustomer && k.assignedCustomer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (k.assignedImei && k.assignedImei.includes(searchQuery))

      const matchesStatus = statusFilter === 'all' || k.status === statusFilter
      const matchesTier = tierFilter === 'all' || k.holderTier === tierFilter

      return matchesSearch && matchesStatus && matchesTier
    })
  }, [keysList, searchQuery, statusFilter, tierFilter])

  const handleCopyKey = async (key: LicenseKey) => {
    const success = await copyToClipboard(key.keyCode)
    if (success) {
      setCopiedKeyId(key.id)
      toast.success('Key copied to clipboard')
      setTimeout(() => setCopiedKeyId(null), 2000)
    }
  }

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseInt(generateQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid key quantity.')
      return
    }

    const newKey: LicenseKey = {
      id: `key_${Date.now()}`,
      keyCode: `VC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      batchNumber: `BATCH-2026-00${Math.floor(Math.random() * 9) + 4}`,
      status: 'available',
      holderTier: user?.role === 'dealer' ? 'dealer' : 'super_admin',
      holderName: user?.name || 'Central Vault',
      generatedAt: new Date().toISOString(),
    }

    setKeysList([newKey, ...keysList])
    setIsGenerateOpen(false)
    toast.success(`Successfully generated batch of ${qty} keys!`, {
      description: `First key: ${newKey.keyCode}`,
    })
  }

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsTransferOpen(false)
    toast.success(`Allocated ${transferQuantity} keys to ${transferTarget}!`)
  }

  const handleConfirmReclaim = () => {
    if (!reclaimKeyTarget) return
    setKeysList(
      keysList.map((k) =>
        k.id === reclaimKeyTarget.id ? { ...k, status: 'reclaimed' as const } : k
      )
    )
    toast.success(`Key ${reclaimKeyTarget.keyCode} reclaimed back to your vault.`)
    setReclaimKeyTarget(null)
  }

  const columns: ColumnDef<LicenseKey>[] = [
    {
      id: 'keyCode',
      header: 'License Key Code',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-xs text-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
            {item.keyCode}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleCopyKey(item)
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Copy key"
          >
            {copiedKeyId === item.id ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      id: 'batch',
      header: 'Batch',
      accessorKey: 'batchNumber',
      sortable: true,
      className: 'text-xs text-muted-foreground font-mono',
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: 'holder',
      header: 'Holder / Tier',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-foreground">{item.holderName}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
            {item.holderTier.replace('_', ' ')}
          </p>
        </div>
      ),
    },
    {
      id: 'assignment',
      header: 'Assigned Device / Customer',
      render: (item) =>
        item.assignedCustomer ? (
          <div className="space-y-0.5 text-xs">
            <p className="font-medium text-foreground">{item.assignedCustomer}</p>
            <p className="font-mono text-[11px] text-muted-foreground">
              IMEI: {item.assignedImei ? maskImei(item.assignedImei) : '—'}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unassigned</span>
        ),
    },
    {
      id: 'date',
      header: 'Created Date',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.generatedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {canReclaim && item.status === 'allocated' && (
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setReclaimKeyTarget(item)
              }}
              className="text-xs text-amber-500 hover:text-amber-600"
            >
              Reclaim
            </Button>
          )}
          {item.status === 'used' && (
            <span className="text-[11px] text-muted-foreground italic">Activated</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="License Key Management"
        subtitle="Generate digital key batches, track multi-tier distribution, and monitor activation lifecycle."
        actions={
          <div className="flex items-center gap-2">
            {canTransfer && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Send className="h-3.5 w-3.5" />}
                onClick={() => setIsTransferOpen(true)}
              >
                Transfer Keys
              </Button>
            )}
            {canGenerate && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="h-4 w-4" />}
                onClick={() => setIsGenerateOpen(true)}
              >
                Generate Keys
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by key code, partner, customer or IMEI..."
        selectFilters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Available (Unused)', value: 'available' },
              { label: 'Allocated', value: 'allocated' },
              { label: 'Used / Activated', value: 'used' },
              { label: 'Reclaimed', value: 'reclaimed' },
            ],
          },
          {
            id: 'tier',
            label: 'Tier',
            value: tierFilter,
            onChange: setTierFilter,
            options: [
              { label: 'Super Admin', value: 'super_admin' },
              { label: 'Stockist', value: 'stockist' },
              { label: 'Distributor', value: 'distributor' },
              { label: 'Dealer', value: 'dealer' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('')
          setStatusFilter('all')
          setTierFilter('all')
        }}
      />

      {/* Reusable Data Table */}
      <DataTable
        data={filteredKeys}
        columns={columns}
        exportable
        exportFilename="v-credit-license-keys.csv"
        pageSize={10}
      />

      {/* Generate Batch Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate License Key Batch"
        description="Mint new cryptographically secure keys into your central vault."
        size="md"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Number of Keys to Generate
            </label>
            <Input
              type="number"
              min="1"
              max="10000"
              value={generateQuantity}
              onChange={(e) => setGenerateQuantity(e.target.value)}
              placeholder="e.g. 500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Batch Tag / Description
            </label>
            <Input
              type="text"
              placeholder="e.g. Q2 North Zone Expansion"
              defaultValue="Samsung A-Series Batch"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Generation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Keys Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Keys Downstream"
        description="Allocate available keys to an authorized subordinate partner."
        size="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Target Partner
            </label>
            <select
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="North Regional Stockist">North Regional Stockist (Punjab/Haryana)</option>
              <option value="Delhi Hub Distribution">Delhi Hub Distribution (NCR)</option>
              <option value="Metro Telecom">Metro Telecom (Retail Dealer)</option>
              <option value="Shiv Mobiles">Shiv Mobiles (Retail Dealer)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Quantity to Transfer
            </label>
            <Input
              type="number"
              min="1"
              max="5000"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTransferOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm">
              Execute Transfer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reclaim Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(reclaimKeyTarget)}
        onClose={() => setReclaimKeyTarget(null)}
        onConfirm={handleConfirmReclaim}
        title="Reclaim License Key?"
        variant="warning"
        confirmText="Confirm Reclaim"
        message={
          reclaimKeyTarget ? (
            <p>
              Are you sure you want to reclaim key{' '}
              <strong className="font-mono text-foreground">{reclaimKeyTarget.keyCode}</strong> from{' '}
              <strong>{reclaimKeyTarget.holderName}</strong>? Unused keys will return to your vault.
            </p>
          ) : (
            ''
          )
        }
      />
    </div>
  )
}
