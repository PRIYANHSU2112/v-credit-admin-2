import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageLoaderProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function PageLoader({
  message = 'Loading workspace data...',
  fullScreen = false,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground',
        fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <Loader2 className="absolute h-5 w-5 text-primary animate-pulse" />
      </div>
      <p className="text-xs font-medium tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  )
}
