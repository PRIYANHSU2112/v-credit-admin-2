import React from 'react'
import {
  CalendarClock,
  ClockAlert,
  AlertOctagon,
  CheckCircle2,
  Wallet,
  Smartphone,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { EmiKpiMetrics } from '../types'

interface EmiKpiCardsProps {
  metrics: EmiKpiMetrics
  onFilterClick?: (status: 'all' | 'due' | 'upcoming' | 'overdue' | 'paid') => void
  activeFilter?: string
}

export const EmiKpiCards: React.FC<EmiKpiCardsProps> = ({
  metrics,
  onFilterClick,
  activeFilter = 'all',
}) => {
  const cards = [
    {
      id: 'due',
      title: 'Total EMI Due',
      value: formatCurrency(metrics.totalEmiDue),
      subtitle: `${metrics.dueSoonCount} contracts due â‰¤ 5 days`,
      icon: CalendarClock,
      gradient: 'from-amber-500/15 via-amber-400/5 to-transparent',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'Immediate',
      badgeColor: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25',
      accentBar: 'from-amber-400 to-amber-600',
      filterKey: 'due' as const,
    },
    {
      id: 'upcoming',
      title: 'Upcoming EMI',
      value: formatCurrency(metrics.upcomingEmi),
      subtitle: '30-day collection pipeline',
      icon: ClockAlert,
      gradient: 'from-blue-500/15 via-blue-400/5 to-transparent',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      badge: 'Scheduled',
      badgeColor: 'bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25',
      accentBar: 'from-blue-400 to-blue-600',
      filterKey: 'upcoming' as const,
    },
    {
      id: 'overdue',
      title: 'Overdue EMI',
      value: formatCurrency(metrics.overdueEmi),
      subtitle: `${metrics.overdueCount} high-risk accounts`,
      icon: AlertOctagon,
      gradient: 'from-rose-500/15 via-rose-400/5 to-transparent',
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      badge: 'Action Required',
      badgeColor: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25',
      accentBar: 'from-rose-400 to-rose-600',
      filterKey: 'overdue' as const,
    },
    {
      id: 'collected',
      title: 'Amount Collected',
      value: formatCurrency(metrics.collectedAmount),
      subtitle: 'Cash & UPI recovered',
      icon: CheckCircle2,
      gradient: 'from-emerald-500/15 via-emerald-400/5 to-transparent',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'Recovered',
      badgeColor: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      accentBar: 'from-emerald-400 to-emerald-600',
      filterKey: 'paid' as const,
    },
    {
      id: 'outstanding',
      title: 'Outstanding',
      value: formatCurrency(metrics.outstandingBalance),
      subtitle: 'Total principal pending',
      icon: Wallet,
      gradient: 'from-indigo-500/15 via-indigo-400/5 to-transparent',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      badge: 'Portfolio Risk',
      badgeColor: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
      accentBar: 'from-indigo-400 to-indigo-600',
      filterKey: 'all' as const,
    },
    {
      id: 'active',
      title: 'Active Plans',
      value: metrics.activeEmiPlans.toLocaleString('en-IN'),
      subtitle: 'Enrolled device contracts',
      icon: Smartphone,
      gradient: 'from-violet-500/15 via-violet-400/5 to-transparent',
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      badge: 'Live Enrolled',
      badgeColor: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25',
      accentBar: 'from-violet-400 to-violet-600',
      filterKey: 'all' as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon
        const isSelected = activeFilter === c.filterKey && c.filterKey !== 'all'
        const wrapperCls = [
          'group relative overflow-hidden rounded-2xl border bg-card cursor-pointer select-none',
          'transition-all duration-200 ease-out',
          isSelected
            ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10 -translate-y-0.5'
            : 'border-border/60 hover:border-primary/35 hover:shadow-lg hover:-translate-y-0.5 shadow-sm',
        ].join(' ')

        return (
          <div
            key={c.id}
            onClick={() => onFilterClick && onFilterClick(c.filterKey)}
            className={wrapperCls}
          >
            <div className={['absolute inset-0 bg-gradient-to-br pointer-events-none', c.gradient].join(' ')} />
            <div className={['absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b', c.accentBar].join(' ')} />

            <div className="relative p-4 pl-5">
              <div className="flex items-center justify-between mb-3">
                <div className={['p-2 rounded-xl border shadow-xs', c.iconBg, c.iconColor].join(' ')}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={['text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', c.badgeColor].join(' ')}>
                  {c.badge}
                </span>
              </div>

              <span className="text-[22px] font-black tracking-tight text-foreground font-mono leading-none block truncate">
                {c.value}
              </span>

              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mt-2 leading-tight">
                {c.title}
              </p>

              <p className="text-[10px] text-muted-foreground/65 font-medium mt-0.5 leading-tight line-clamp-1">
                {c.subtitle}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
