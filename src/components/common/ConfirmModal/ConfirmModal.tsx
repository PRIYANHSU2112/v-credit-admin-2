import React from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ConfirmVariant = 'danger' | 'warning' | 'info'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const icons = {
    danger: <AlertCircle className="h-6 w-6 text-rose-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <Info className="h-6 w-6 text-primary" />,
  }

  const bgClasses = {
    danger: 'bg-rose-500/10 text-rose-500',
    warning: 'bg-amber-500/10 text-amber-500',
    info: 'bg-primary/10 text-primary',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
            bgClasses[variant]
          )}
        >
          {icons[variant]}
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </Modal>
  )
}
