import React, { useState } from 'react'
import {
  PlusCircle,
  Send,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { FilterBar } from '@/components/common/FilterBar/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAppSelector } from '@/app/store/hooks'
import { hasPermission } from '@/config/permissions'
import { copyToClipboard } from '@/lib/utils'
import {
  useGetKeysQuery,
  useBulkGenerateKeysMutation,
  useTransferKeyBatchMutation,
  useReclaimKeyBatchMutation,
  useGetStockistsQuery,
} from '@/features/enterprise/api/enterpriseApi'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from 'sonner'

export default function KeysPage() {
  const { user } = useAppSelector((state) => state.auth)
  const canGenerate = user?.role === 'super_admin'
  const canTransfer = hasPermission(user?.role, 'keys:transfer') || user?.role === 'super_admin'
  const canReclaim = hasPermission(user?.role, 'keys:reclaim') || user?.role === 'super_admin'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage] = useState(1)
  const pageSize = 50

  const debouncedSearch = useDebounce(searchQuery, 350)

  // Live queries
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetKeysQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const { data: stockistsRes } = useGetStockistsQuery()
  const stockistsList = stockistsRes?.data || []

  // Mutations
  const [bulkGenerateKeys, { isLoading: isGenerating }] = useBulkGenerateKeysMutation()
  const [transferKeyBatch, { isLoading: isTransferring }] = useTransferKeyBatchMutation()
  const [reclaimKeyBatch, { isLoading: isReclaiming }] = useReclaimKeyBatchMutation()

  // Modals state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [reclaimTarget, setReclaimTarget] = useState<any | null>(null)

  // Form states
  const [generateQuantity, setGenerateQuantity] = useState('100')
  const [keyType, setKeyType] = useState<'standard' | 'iphone'>('standard')
  const [generateDesc, setGenerateDesc] = useState('Central Vault Batch')

  const [transferQuantity, setTransferQuantity] = useState('50')
  const [transferTargetId, setTransferTargetId] = useState('')
  const [transferNote, setTransferNote] = useState('')

  const [reclaimQuantity, setReclaimQuantity] = useState('10')
  const [reclaimNote, setReclaimNote] = useState('Routine key audit recovery')

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  const keysList = apiResponse?.data || []

  const handleCopyKey = async (keyCode: string, id: string) => {
    const success = await copyToClipboard(keyCode)
    if (success) {
      setCopiedKeyId(id)
      toast.success('Key code copied to clipboard')
      setTimeout(() => setCopiedKeyId(null), 2000)
    }
  }

  // Handle Generation
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseInt(generateQuantity, 10)
    if (isNaN(qty) || qty < 1 || qty > 10000) {
      toast.error('Enter a quantity between 1 and 10,000')
      return
    }

    try {
      const res = await bulkGenerateKeys({
        count: qty,
        keyType,
        description: generateDesc,
      }).unwrap()

      toast.success(`Generated ${qty} ${keyType.toUpperCase()} keys in Vault!`, {
        description: `Batch Ref: ${res?.data?.batchId || 'BATCH-' + Date.now().toString().slice(-4)}`,
      })
      setIsGenerateOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to generate key batch')
    }
  }

  // Handle Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = transferTargetId || stockistsList[0]?._id
    if (!target) {
      toast.error('Please select a target partner')
      return
    }
    const qty = parseInt(transferQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Enter a valid transfer quantity')
      return
    }

    try {
      await transferKeyBatch({
        toUserId: target,
        quantity: qty,
        note: transferNote || 'Super Admin Key Dispatch',
      }).unwrap()

      toast.success(`Allocated ${qty} keys downstream!`)
      setIsTransferOpen(false)
      setTransferNote('')
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to transfer keys')
    }
  }

  // Handle Reclaim
  const handleReclaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reclaimTarget) return
    const qty = parseInt(reclaimQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Enter a valid quantity to reclaim')
      return
    }

    try {
      await reclaimKeyBatch({
        fromUserId: reclaimTarget._id || reclaimTarget.id,
        quantity: qty,
        note: reclaimNote,
      }).unwrap()

      toast.success(`Reclaimed ${qty} keys back to Super Admin vault!`)
      setReclaimTarget(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reclaim keys')
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      id: 'key',
      header: 'License Key Code',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border/50">
            {item.key || item.keyCode || item.keyNumber}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleCopyKey(item.key || item.keyCode, item._id || item.id)
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Copy key"
          >
            {copiedKeyId === (item._id || item.id) ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
    {
      id: 'batch',
      header: 'Batch Reference',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm text-muted-foreground">
          {item.batch || item.batchNumber || '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: 'owner',
      header: 'Current Vault / Holder',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{item.owner || item.holderName || 'Central Vault'}</p>
          <p className="text-xs uppercase font-bold text-muted-foreground">
            {item.role || 'Super Admin'}
          </p>
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground font-mono">
          {item.createdAt ? String(item.createdAt).slice(0, 10) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {canReclaim && item.status !== 'Generated' && item.status !== 'Activated' && (
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setReclaimTarget(item)
              }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              Reclaim
            </Button>
          )}
          {item.status === 'Generated' && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              Ready in Vault
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="License Key Management"
        subtitle="Generate digital master key batches, allocate quotas downstream to Stockists, and monitor activation life-cycle."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
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

      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to load keys from backend'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by key code, batch reference, or vault owner..."
        selectFilters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Available / Generated', value: 'Generated' },
              { label: 'Allocated Downstream', value: 'Allocated' },
              { label: 'Activated / Used', value: 'Activated' },
              { label: 'Reclaimed to Vault', value: 'Reclaimed' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('')
          setStatusFilter('all')
        }}
      />

      {/* Reusable Data Table */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs">Loading live key ledger from MongoDB...</p>
        </div>
      ) : (
        <DataTable
          data={keysList}
          columns={columns}
          exportable
          exportFilename="v-credit-license-keys.csv"
        />
      )}

      {/* ─── Modal 1: Generate Keys ─── */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate New License Key Batch"
        description="Creates unique cryptographic unlock tokens in the Super Admin Central Vault."
        size="md"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4 pt-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">License Key Type</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="standard">Android (EmiSafe Standard)</option>
                <option value="iphone">Apple iOS MDM License</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Quantity to Mint *</label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={generateQuantity}
                onChange={(e) => setGenerateQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Batch Memo / Tag</label>
            <Input
              type="text"
              value={generateDesc}
              onChange={(e) => setGenerateDesc(e.target.value)}
              placeholder="e.g. Q4 Regional Central Vault"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-action-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5"
            >
              {isGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Mint Key Batch</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 2: Transfer Keys ─── */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Keys Downstream"
        description="Dispatch verified unlock license keys to an authorized subordinate stockist or partner."
        size="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 pt-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Target Stockist / Hub *</label>
            <select
              value={transferTargetId || stockistsList[0]?._id || ''}
              onChange={(e) => setTransferTargetId(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {stockistsList.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name} ({s.id}) — {s.city}, {s.territory}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Quantity to Transfer *</label>
            <Input
              type="number"
              min="1"
              max="10000"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Transfer Memo / Note</label>
            <Input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="e.g. Consignment for Tier-1 expansion"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring}
              className="btn-action-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5"
            >
              {isTransferring && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm Dispatch</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 3: Reclaim Key ─── */}
      <Modal
        isOpen={Boolean(reclaimTarget)}
        onClose={() => setReclaimTarget(null)}
        title="Reclaim License Keys"
        description="Withdraw available keys back to the central Super Admin repository."
        size="sm"
      >
        <form onSubmit={handleReclaimSubmit} className="space-y-4 pt-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Quantity to Reclaim</label>
            <Input
              type="number"
              min="1"
              value={reclaimQuantity}
              onChange={(e) => setReclaimQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Reason / Audit Memo</label>
            <Input
              type="text"
              value={reclaimNote}
              onChange={(e) => setReclaimNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setReclaimTarget(null)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReclaiming}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              {isReclaiming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm Reclaim</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
