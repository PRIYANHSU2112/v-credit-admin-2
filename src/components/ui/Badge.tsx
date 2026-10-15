import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        primary:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
        outline: 'text-foreground border border-border',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        warning:
          'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        purple:
          'border-transparent bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
        cyan:
          'border-transparent bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500 animate-pulse',
            variant === 'destructive' && 'bg-rose-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'purple' && 'bg-purple-500',
            (!variant || variant === 'default') && 'bg-primary-foreground'
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
