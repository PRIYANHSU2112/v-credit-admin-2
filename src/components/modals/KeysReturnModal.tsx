import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

interface KeysReturnModalProps {
  isOpen: boolean
  onClose: () => void
  distributorName?: string
  onSuccess?: (returnedCount: number) => void
}

export function KeysReturnModal({
  isOpen,
  onClose,
  distributorName = 'Music Beats',
  onSuccess,
}: KeysReturnModalProps) {
  const [keyCount, setKeyCount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(keyCount, 10)
    if (isNaN(count) || count <= 0) {
      toast.error('Please enter a valid number of keys to return.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success(`Successfully returned ${count} keys from ${distributorName}!`)
      if (onSuccess) onSuccess(count)
      setKeyCount('')
      onClose()
    }, 600)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="keys Return"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Distributor Name</label>
          <input
            type="text"
            readOnly
            value={distributorName}
            className="w-full h-10 rounded-xl border border-border bg-muted/60 px-3.5 text-xs text-foreground font-medium cursor-not-allowed select-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Number of Keys</label>
          <input
            type="number"
            min={1}
            value={keyCount}
            onChange={(e) => setKeyCount(e.target.value)}
            placeholder="Enter Number of Keys for Return"
            required
            className="w-full h-10 rounded-xl border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-action-primary text-xs font-bold h-9 px-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Return'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
