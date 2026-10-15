import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  KeyRound,
  Smartphone,
  CreditCard,
  PlusCircle,
  Send,
  Lock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { KPICard } from '@/components/common/KPICard/KPICard'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useAppSelector } from '@/app/store/hooks'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import { MOCK_KPIS, MOCK_REVENUE_TREND, MOCK_KEY_DISTRIBUTION } from '../api/dashboardApi'
import { ROUTE_PATHS } from '@/app/routes/routePaths'
import { toast } from 'sonner'

export default function OverviewPage() {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d')

  const kpis = MOCK_KPIS

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Welcome, ${user?.name || 'Administrator'}`}
        subtitle={`Role: ${user?.role?.replace('_', ' ').toUpperCase()} · Monitoring live device finances, keys & remote MDM security.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Dashboard metrics refreshed')}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={() => navigate(ROUTE_PATHS.KEYS)}
            >
              Generate Keys
            </Button>
          </div>
        }
      />

      {/* 4 Primary Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Keys in Orbit"
          value={formatNumber(kpis.totalKeysInOrbit)}
          change={kpis.keysChange}
          trendText="vs previous batch"
          icon={KeyRound}
          variant="indigo"
          subtitle="Active license keys"
          onClick={() => navigate(ROUTE_PATHS.KEYS)}
        />
        <KPICard
          title="Financed Devices"
          value={formatNumber(kpis.activeDevices)}
          change={kpis.devicesChange}
          trendText="live activations"
          icon={Smartphone}
          variant="emerald"
          subtitle="MDM Managed Units"
          onClick={() => navigate(ROUTE_PATHS.DEVICES)}
        />
        <KPICard
          title="Total Collections"
          value={formatCurrency(kpis.totalCollectedAmount)}
          change={12.4}
          trendText="94.2% collection rate"
          icon={CreditCard}
          variant="amber"
          subtitle="EMI Receipts YTD"
          onClick={() => navigate(ROUTE_PATHS.LOANS)}
        />
        <KPICard
          title="Locked Devices"
          value={formatNumber(kpis.lockedDevices)}
          change={-4.1}
          trendText="due to overdue EMI"
          icon={Lock}
          variant="rose"
          subtitle="Remote MDM Locked"
          onClick={() => navigate(ROUTE_PATHS.DEVICES)}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue & Collection Area Chart */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Disbursement & Collection Velocity</CardTitle>
              <CardDescription>
                Monthly loan disbursements vs EMI recoveries (₹ INR)
              </CardDescription>
            </div>
            <div className="flex items-center rounded-xl border border-border p-1 bg-muted/30 text-xs">
              {(['30d', '90d', '1y'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    timeRange === r
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r === '30d' ? '30 Days' : r === '90d' ? 'Quarter' : 'Annual'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_TREND}>
                <defs>
                  <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  name="Financed Disbursed"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#disbursedGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="EMI Recovered"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#collectedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right 1 Col: Key Distribution Breakdown */}
        <Card className="p-6 space-y-4">
          <div>
            <CardTitle>Key Distribution Hierarchy</CardTitle>
            <CardDescription>
              Inventory allocation by distribution tier
            </CardDescription>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_KEY_DISTRIBUTION} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="tier" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="active" name="Activated Keys" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="available" name="Unused Keys" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Shortcuts */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-base">Operations Launchpad</CardTitle>
          <CardDescription>Direct workflow shortcuts</CardDescription>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              className="h-auto p-3.5 flex flex-col items-start gap-1 rounded-2xl text-left border-border/80 hover:border-primary/50 group"
              onClick={() => navigate(ROUTE_PATHS.KEYS)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <KeyRound className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-foreground mt-1">Batch Key Gen</span>
              <span className="text-[11px] text-muted-foreground">Mint 100-5000 keys</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3.5 flex flex-col items-start gap-1 rounded-2xl text-left border-border/80 hover:border-indigo-500/50 group"
              onClick={() => navigate(ROUTE_PATHS.PARTNERS)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                <Send className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-foreground mt-1">Transfer Keys</span>
              <span className="text-[11px] text-muted-foreground">Move to Stockist/Dealer</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3.5 flex flex-col items-start gap-1 rounded-2xl text-left border-border/80 hover:border-rose-500/50 group"
              onClick={() => navigate(ROUTE_PATHS.DEVICES)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                <Lock className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-foreground mt-1">Device Lock</span>
              <span className="text-[11px] text-muted-foreground">Trigger MDM lock</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-3.5 flex flex-col items-start gap-1 rounded-2xl text-left border-border/80 hover:border-emerald-500/50 group"
              onClick={() => navigate(ROUTE_PATHS.LOANS)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-foreground mt-1">Record EMI</span>
              <span className="text-[11px] text-muted-foreground">Cash/UPI collection</span>
            </Button>
          </div>
        </Card>

        {/* Live Security & MDM Activity Log */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Live Heartbeat & Operations Feed</CardTitle>
              <CardDescription>Real-time device commands and key allocations</CardDescription>
            </div>
            <Badge variant="cyan" dot>Realtime</Badge>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            {[
              {
                title: 'Device Lock Command Dispatched',
                desc: 'IMEI 864501041239841 · Loan #VC-9042 overdue by 14 days',
                time: '4 mins ago',
                status: 'locked',
              },
              {
                title: 'Key Batch #KB-8820 Transferred',
                desc: '250 keys moved from Super Admin to Punjab Regional Stockist',
                time: '18 mins ago',
                status: 'allocated',
              },
              {
                title: 'Customer Loan Activated',
                desc: 'Samsung Galaxy A15 financed by Metro Mobiles · Key assigned',
                time: '32 mins ago',
                status: 'active',
              },
              {
                title: 'EMI Settlement Confirmed',
                desc: '₹2,450 received via UPI for Loan #VC-8192 · Device auto-unlocked',
                time: '1 hour ago',
                status: 'unlocked',
              },
            ].map((feed, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">{feed.title}</p>
                  <p className="text-muted-foreground">{feed.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={feed.status} />
                  <span className="text-[11px] text-muted-foreground">{feed.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
