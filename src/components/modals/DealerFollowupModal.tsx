import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Plus } from 'lucide-react'
import type { DealerRecord, FollowupRemark } from '@/mocks/mockSeedData'
import { toast } from 'sonner'

interface DealerFollowupModalProps {
  isOpen: boolean
  onClose: () => void
  dealer: DealerRecord | null
}

export function DealerFollowupModal({ isOpen, onClose, dealer }: DealerFollowupModalProps) {
  if (!dealer) return null

  const initialFollowups: FollowupRemark[] = dealer.followups && dealer.followups.length > 0
    ? dealer.followups
    : [
        { id: '1', remarkNo: 1, remark: '--', createdDate: '--' },
        { id: '2', remarkNo: 2, remark: '--', createdDate: '--' },
        { id: '3', remarkNo: 3, remark: '--', createdDate: '--' },
      ]

  const [remarks, setRemarks] = useState<FollowupRemark[]>(initialFollowups)
  const [newRemark, setNewRemark] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRemark.trim()) return

    const now = new Date()
    const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    const item: FollowupRemark = {
      id: String(Date.now()),
      remarkNo: remarks.length + 1,
      remark: newRemark.trim(),
      createdDate: dateStr,
    }

    setRemarks([item, ...remarks])
    setNewRemark('')
    setIsAdding(false)
    toast.success(`Added followup remark for ${dealer.dealerShop}!`)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Followup"
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Shop Name Header */}
        <div className="text-center py-1 border-b border-border">
          <h3 className="text-base font-bold text-foreground">{dealer.dealerShop}</h3>
        </div>

        {/* Remarks Table */}
        <div className="overflow-x-auto border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border">
              <tr>
                <th className="py-2.5 px-4 font-bold text-muted-foreground w-24">Remark No.</th>
                <th className="py-2.5 px-4 font-bold text-muted-foreground">Remark</th>
                <th className="py-2.5 px-4 font-bold text-muted-foreground w-36">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {remarks.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-foreground">{r.remarkNo || i + 1}</td>
                  <td className="py-2.5 px-4 text-foreground/90">{r.remark}</td>
                  <td className="py-2.5 px-4 text-muted-foreground font-mono text-[11px]">{r.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Remark Interactive Action */}
        {!isAdding ? (
          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="btn-action-primary text-xs font-bold gap-1.5 py-1.5 px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Remark</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddRemark} className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground">New Followup Note:</label>
            <textarea
              rows={2}
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Enter dealer followup remarks or repayment discussion notes..."
              required
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-action-primary text-xs font-bold py-1.5 px-4"
              >
                Save Remark
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
