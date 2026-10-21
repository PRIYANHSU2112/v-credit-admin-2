import { useState, useMemo, type ReactNode, type SyntheticEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  id: string
  header: ReactNode
  accessorKey?: keyof T
  sortable?: boolean
  className?: string
  render?: (item: T, index: number) => ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  totalItems?: number
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onRowClick?: (item: T) => void
  emptyTitle?: string
  emptyDescription?: string
  selectedRows?: T[]
  onSelectionChange?: (selected: T[]) => void
  keyExtractor?: (item: T, index?: number) => string
  toolbarSlot?: ReactNode
  exportable?: boolean
  exportFilename?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  totalItems,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  emptyTitle = 'No records to display',
  emptyDescription = 'Try adjusting your search criteria or filters.',
  selectedRows = [],
  onSelectionChange,
  keyExtractor = (item: T, index?: number) => (item as Record<string, any>).id || `row_${index ?? 0}`,
  toolbarSlot,
  exportable = false,
  exportFilename = 'export.csv',
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(currentPage)
  const [internalPageSize] = useState(pageSize)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Handle client-side sorting if needed
  const sortedData = useMemo(() => {
    if (!sortField) return data
    return [...data].sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]
      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA)
      }
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1
    })
  }, [data, sortField, sortOrder])

  // Pagination calculations
  const total = totalItems !== undefined ? totalItems : sortedData.length
  const effectivePage = onPageChange ? currentPage : internalPage
  const effectivePageSize = onPageSizeChange ? pageSize : internalPageSize
  const totalPages = Math.ceil(total / effectivePageSize) || 1

  const paginatedData = useMemo(() => {
    if (totalItems !== undefined) return sortedData // Server-side paginated
    const start = (effectivePage - 1) * effectivePageSize
    return sortedData.slice(start, start + effectivePageSize)
  }, [sortedData, totalItems, effectivePage, effectivePageSize])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    if (onPageChange) {
      onPageChange(page)
    } else {
      setInternalPage(page)
    }
  }

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return
    if (sortField === columnId) {
      if (sortOrder === 'asc') setSortOrder('desc')
      else {
        setSortField(null)
        setSortOrder('asc')
      }
    } else {
      setSortField(columnId)
      setSortOrder('asc')
    }
  }

  // Row selection
  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) =>
      selectedRows.some((r) => keyExtractor(r) === keyExtractor(item))
    )

  const toggleSelectAll = () => {
    if (!onSelectionChange) return
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(paginatedData)
    }
  }

  const toggleSelectRow = (item: T, e?: SyntheticEvent) => {
    e?.stopPropagation()
    if (!onSelectionChange) return
    const key = keyExtractor(item)
    const exists = selectedRows.some((r) => keyExtractor(r) === key)
    if (exists) {
      onSelectionChange(selectedRows.filter((r) => keyExtractor(r) !== key))
    } else {
      onSelectionChange([...selectedRows, item])
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (!data.length) return
    const headers = columns.map((c) => `"${String(c.header).replace(/"/g, '""')}"`).join(',')
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const val = col.accessorKey ? item[col.accessorKey] : ''
          return `"${String(val ?? '').replace(/"/g, '""')}"`
        })
        .join(',')
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', exportFilename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-3">
      {/* Table Toolbar */}
      {(toolbarSlot || exportable) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">{toolbarSlot}</div>
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="h-4 w-4" />}
              className="text-sm font-semibold"
            >
              Export CSV
            </Button>
          )}
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/50 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                {onSelectionChange && (
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id, column.sortable)}
                    className={cn(
                      'px-4 py-3.5',
                      column.sortable &&
                        'cursor-pointer hover:text-foreground transition-colors',
                      column.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-muted-foreground">
                          {sortField === column.id ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-primary" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40 text-foreground">
              {isLoading ? (
                Array.from({ length: effectivePageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {onSelectionChange && (
                      <td className="px-4 py-3.5">
                        <Skeleton className="h-4 w-4 rounded" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                    className="p-8 text-center"
                  >
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const isSelected = selectedRows.some(
                    (r) => keyExtractor(r) === keyExtractor(item)
                  )
                  return (
                    <tr
                      key={keyExtractor(item, index)}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={cn(
                        'transition-colors hover:bg-muted/40',
                        onRowClick && 'cursor-pointer',
                        isSelected && 'bg-primary/5'
                      )}
                    >
                      {onSelectionChange && (
                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectRow(item, e)}
                            className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={cn('px-4 py-3.5 align-middle', column.className)}
                        >
                          {column.render
                            ? column.render(item, index)
                            : column.accessorKey
                            ? String(item[column.accessorKey] ?? '—')
                            : null}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 px-5 py-3.5 text-sm text-muted-foreground bg-card/60">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-foreground font-semibold">
                {total === 0 ? 0 : (effectivePage - 1) * effectivePageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-foreground font-semibold">
                {Math.min(effectivePage * effectivePageSize, total)}
              </strong>{' '}
              of <strong className="text-foreground font-semibold">{total}</strong> records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => handlePageChange(effectivePage - 1)}
              disabled={effectivePage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-2 font-medium text-foreground">
              Page {effectivePage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="iconSm"
              onClick={() => handlePageChange(effectivePage + 1)}
              disabled={effectivePage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
