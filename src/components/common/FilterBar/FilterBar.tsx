import React from 'react'
import { RotateCcw } from 'lucide-react'
import { SearchInput } from '../SearchInput/SearchInput'
import { Button } from '@/components/ui/Button'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterSelectConfig {
  id: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

interface FilterBarProps {
  searchQuery?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  selectFilters?: FilterSelectConfig[]
  onReset?: () => void
  children?: React.ReactNode
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  selectFilters = [],
  onReset,
  children,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(
    (searchQuery && searchQuery.trim().length > 0) ||
      selectFilters.some((f) => f.value !== '' && f.value !== 'all')
  )

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {onSearchChange && (
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={onSearchChange}
            className="h-10 text-sm"
          />
        )}

        {selectFilters.map((filter) => (
          <select
            key={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background/80 px-3.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="all">All {filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="text-sm h-10 font-medium text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {children}
        </div>
      )}
    </div>
  )
}
