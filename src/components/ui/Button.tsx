import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-indigo-500/25',
        gradient:
          'bg-gradient-to-r from-primary via-indigo-600 to-violet-600 text-white shadow-md hover:shadow-indigo-500/30 hover:opacity-95',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20',
        outline:
          'border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        subtle:
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-lg gap-1',
        sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
        md: 'h-9 px-4 py-2 gap-2',
        lg: 'h-11 px-6 text-base rounded-2xl gap-2.5',
        icon: 'h-9 w-9 p-0',
        iconSm: 'h-7 w-7 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
