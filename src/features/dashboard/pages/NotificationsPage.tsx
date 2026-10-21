import { Bell, AlertTriangle, Info, RefreshCw, AlertCircle } from 'lucide-react'
import { useGetNotificationsQuery } from '@/features/enterprise/api/enterpriseApi'
import type { NotificationItem } from '@/features/enterprise/types'

export default function NotificationsPage() {
  const { data: response, isLoading, isFetching, isError, error, refetch } = useGetNotificationsQuery()

  const notificationsList: NotificationItem[] = response?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Home</span>
            <span>&rsaquo;</span>
            <span>Operations</span>
            <span>&rsaquo;</span>
            <span className="text-foreground font-bold">Notifications</span>
          </div>
          <p className="text-[11px] font-bold tracking-widest text-primary uppercase mt-1">
            NETWORK TELEMETRY
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
            System & Quota Notifications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time partner inventory threshold alerts, key transfer dispatches, and security logs.
          </p>
        </div>

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

      {/* Error Resilience Alert */}
      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{(error as any)?.data?.message || 'Failed to fetch notifications from server'}</span>
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

      {/* Notifications List */}
      <div className="bg-card rounded-2xl border border-border shadow-xs divide-y divide-border overflow-hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-${i}`} className="p-4 sm:p-5 flex items-start gap-3.5 animate-pulse">
              <div className="h-9 w-9 rounded-xl bg-muted shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="h-3 w-80 bg-muted rounded"></div>
              </div>
            </div>
          ))
        ) : notificationsList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold">No New System Notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              All distribution partners and license vaults are operating within normal thresholds.
            </p>
          </div>
        ) : (
          notificationsList.map((n, idx) => (
            <div
              key={n.id || idx}
              className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-muted/40 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {n.type === 'alert' || n.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : n.type === 'info' ? (
                  <Info className="h-4 w-4 text-blue-500" />
                ) : (
                  <Bell className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-foreground truncate">{n.title}</h3>
                  <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                    {n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
