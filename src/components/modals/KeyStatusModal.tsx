import { Modal } from '@/components/ui/Modal'
import { KeyRound } from 'lucide-react'

export interface KeyStatusData {
  agencyName: string
  totalKeys: number
  usedKeys: number
  availableKeys: number
}

interface KeyStatusModalProps {
  isOpen: boolean
  onClose: () => void
  data: KeyStatusData | null
}

export function KeyStatusModal({ isOpen, onClose, data }: KeyStatusModalProps) {
  if (!data) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-primary font-bold">
          <KeyRound className="h-5 w-5" />
          <span>Key Status</span>
        </div>
      }
      size="sm"
      className="p-0 overflow-hidden"
    >
      <div className="p-6 pt-2">
        {/* Centered Agency Title */}
        <div className="text-center py-3 border-b border-border">
          <h3 className="text-base font-bold text-foreground">{data.agencyName}</h3>
        </div>

        {/* Key Metrics Table */}
        <div className="divide-y divide-border text-sm">
          <div className="flex items-center justify-between py-3.5 px-2">
            <span className="font-semibold text-muted-foreground">Total Keys</span>
            <span className="font-bold text-foreground font-mono text-base">
              {data.totalKeys.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5 px-2">
            <span className="font-semibold text-muted-foreground">Used Keys</span>
            <span className="font-bold text-foreground font-mono text-base">
              {data.usedKeys.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5 px-2">
            <span className="font-semibold text-muted-foreground">Available</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-base">
              {data.availableKeys.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-muted hover:bg-accent text-foreground text-sm font-semibold transition-colors border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
