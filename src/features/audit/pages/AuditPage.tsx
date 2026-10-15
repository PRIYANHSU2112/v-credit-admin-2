import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/common/DataTable/DataTable'
import { formatDate } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  actor: string
  role: string
  target: string
  ipAddress: string
  timestamp: string
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    action: 'MDM_DEVICE_LOCKED',
    actor: 'Rajesh Sharma',
    role: 'Super Admin',
    target: 'IMEI 864501041234567 (Galaxy A15)',
    ipAddress: '103.21.244.12',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'aud_2',
    action: 'KEY_BATCH_GENERATED',
    actor: 'Rajesh Sharma',
    role: 'Super Admin',
    target: '500 Keys (Batch 2026-004)',
    ipAddress: '103.21.244.12',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'aud_3',
    action: 'KEYS_TRANSFERRED',
    actor: 'Aman Verma',
    role: 'Stockist',
    target: '100 Keys to Delhi Hub Distribution',
    ipAddress: '115.99.120.45',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
]

export default function AuditPage() {
  const columns: ColumnDef<AuditLog>[] = [
    {
      id: 'action',
      header: 'Security Event',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded">
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
          <p className="text-[10px] text-muted-foreground">{item.role}</p>
        </div>
      ),
    },
    {
      id: 'target',
      header: 'Impacted Resource',
      render: (item) => (
        <span className="text-xs text-foreground font-medium">{item.target}</span>
      ),
    },
    {
      id: 'ip',
      header: 'IP Address',
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">{item.ipAddress}</span>
      ),
    },
    {
      id: 'time',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">{formatDate(item.timestamp, true)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail & System Integrity"
        subtitle="Immutable security logs of sensitive administrative, MDM, and financial operations."
      />

      <DataTable data={MOCK_AUDIT_LOGS} columns={columns} exportable exportFilename="v-credit-audit-trail.csv" />
    </div>
  )
}
