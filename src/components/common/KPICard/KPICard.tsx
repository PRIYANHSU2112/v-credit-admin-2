import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export type KPICardVariant = 'default' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  trendText?: string
  icon: LucideIcon
  variant?: KPICardVariant
  subtitle?: string
  loading?: boolean
  onClick?: () => void
}

const VARIANT_STYLES: Record<KPICardVariant, { iconBg: string; text: string; glow: string }> = {
  default: {
    iconBg: 'bg-primary/10 text-primary',
    text: 'text-foreground',
    glow: 'from-primary/5 via-transparent to-transparent',
  },
  indigo: {
    iconBg: 'bg-indigo-500/15 text-indigo-500',
    text: 'text-foreground',
    glow: 'from-indigo-500/10 via-transparent to-transparent',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15 text-emerald-500',
    text: 'text-foreground',
    glow: 'from-emerald-500/10 via-transparent to-transparent',
  },
  amber: {
    iconBg: 'bg-amber-500/15 text-amber-500',
    text: 'text-foreground',
    glow: 'from-amber-500/10 via-transparent to-transparent',
  },
  rose: {
    iconBg: 'bg-rose-500/15 text-rose-500',
    text: 'text-foreground',
    glow: 'from-rose-500/10 via-transparent to-transparent',
  },
  purple: {
    iconBg: 'bg-purple-500/15 text-purple-500',
    text: 'text-foreground',
    glow: 'from-purple-500/10 via-transparent to-transparent',
  },
}

export function KPICard({
  title,
  value,
  change,
  trendText = 'vs last month',
  icon: Icon,
  variant = 'default',
  subtitle,
  loading = false,
  onClick,
}: KPICardProps) {
  const styles = VARIANT_STYLES[variant]

  const isPositive = typeof change === 'number' && change > 0
  const isNegative = typeof change === 'number' && change < 0
  const isNeutral = typeof change === 'number' && change === 0

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/40 group border-border/70',
        onClick && 'cursor-pointer hover:scale-[1.01]'
      )}
      onClick={onClick}
    >
      {/* Background Accent Glow */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-50 blur-2xl transition-all group-hover:scale-125',
          styles.glow
        )}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground">
            {loading ? (
              <div className="h-8 w-24 rounded-lg bg-muted/60 animate-pulse" />
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 shadow-sm',
            styles.iconBg
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {typeof change === 'number' && (
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-border/40 text-xs sm:text-sm">
          <div
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold text-xs',
              isPositive && 'bg-emerald-500/10 text-emerald-500',
              isNegative && 'bg-rose-500/10 text-rose-500',
              isNeutral && 'bg-muted text-muted-foreground'
            )}
          >
            {isPositive && <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />}
            {isNegative && <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />}
            {isNeutral && <Minus className="h-3.5 w-3.5" />}
            <span>
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          </div>
          <span className="text-muted-foreground text-xs font-medium truncate">{trendText}</span>
        </div>
      )}
    </Card>
  )
}
