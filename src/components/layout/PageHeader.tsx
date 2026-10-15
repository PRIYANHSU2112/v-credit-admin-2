import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60',
        className
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground pb-1">
            {breadcrumbs.map((b, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />}
                  {b.path && !isLast ? (
                    <Link
                      to={b.path}
                      className="hover:text-foreground transition-colors hover:underline"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className={cn(isLast && 'font-medium text-foreground')}>
                      {b.label}
                    </span>
                  )}
                </React.Fragment>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
