import { FolderOpen, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria or filters right now.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border bg-card/40',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground shadow-inner mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
