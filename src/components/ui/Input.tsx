import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-primary/80 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-destructive font-medium pl-1 animate-in fade-in-50 duration-200">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground pl-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
