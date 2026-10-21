import { useState } from 'react'
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { useGetAuditLogsQuery } from '@/features/enterprise/api/enterpriseApi'
import type { AuditLogItem } from '@/features/enterprise/types'

export default function AuditPage() {
  const [currentPage] = useState(1)
  const pageSize = 50

  const { data: response, isLoading, isFetching, isError, error, refetch } = useGetAuditLogsQuery({
    page: currentPage,
    limit: pageSize,
  })

  const auditLogsList: AuditLogItem[] = response?.data || []

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      id: 'action',
      header: 'Security Event',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
          {item.action}
        </span>
      ),
    },
    {
      id: 'actor',
      header: 'Initiator',
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-foreground">{item.actor}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">{item.role}</p>
        </div>
      ),
    },
    {
      id: 'target',
      header: 'Impacted Target / Memo',
      render: (item) => (
        <span className="text-xs text-foreground font-medium">{item.target}</span>
      ),
    },
    {
      id: 'severity',
      header: 'Severity',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
            item.severity === 'high' || item.severity === 'critical'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : item.severity === 'warning'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
          }`}
        >
          {item.severity || 'info'}
        </span>
      ),
    },
    {
      id: 'time',
      header: 'Recorded Time',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Audit Trail & System Integrity"
          subtitle="Immutable security logs of sensitive administrative, MDM, key dispatch, and financial operations."
        />
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to load audit logs'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs">Loading immutable audit logs...</p>
        </div>
      ) : (
        <DataTable
          data={auditLogsList}
          columns={columns}
          exportable
          exportFilename="v-credit-audit-trail.csv"
        />
      )}
    </div>
  )
}
