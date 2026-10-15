import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar, TrendingUp, Users, Key } from 'lucide-react'

// Mock data for Super Analytics page
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026']

// Daily chart data generator
const generateDayData = (total: number) =>
  Array.from({ length: 31 }, (_, i) => ({
    day: String(i + 1).padStart(2, '0'),
    value: Math.random() < 0.3 ? 0 : Math.floor(Math.random() * (total / 10)) + 1,
  }))

export default function AnalyticsPage() {
  const [usersYear, setUsersYear] = useState('2026')
  const [usersMonth, setUsersMonth] = useState('October')
  const [salesYear, setSalesYear] = useState('2026')
  const [salesMonth, setSalesMonth] = useState('August')

  const [userData] = useState(generateDayData(46))
  const [salesData] = useState(generateDayData(500))

  const totalUsers = 46
  const totalSales = 500

  const maxUserValue = Math.max(...userData.map((d) => d.value), 5)
  const maxSalesValue = Math.max(...salesData.map((d) => d.value), 500)

  return (
    <div className="space-y-6 bg-card p-6 sm:p-8 rounded-3xl shadow-xs border border-border select-none">
      {/* Title */}
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight">
            Super Analytics & Insights
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time daily telemetry of borrower device activations and license inventory distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <TrendingUp className="h-4 w-4" />
            <span>Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* Two Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Users Activated Chart */}
        <div className="border border-border/80 rounded-2xl p-5 space-y-5 bg-card/60 backdrop-blur-xs shadow-xs">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Year</span>
                <select
                  value={usersYear}
                  onChange={(e) => setUsersYear(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">Month</span>
                <select
                  value={usersMonth}
                  onChange={(e) => setUsersMonth(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => toast.info(`Filtered user activations for ${usersMonth} ${usersYear}`)}
                className="btn-action-primary text-xs font-bold h-8 px-4"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              <Users className="h-3.5 w-3.5" />
              <span>Total Users: {totalUsers}</span>
            </div>
          </div>

          {/* Bar Chart Presentation */}
          <div className="relative pt-2">
            <div className="text-[11px] font-semibold text-muted-foreground text-center mb-3 flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-2 rounded bg-gradient-to-r from-emerald-500 to-lime-400" />
              <span>Daily Borrower Activations</span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-1.5 h-52 min-w-max px-3 pt-6 border-b border-border" style={{ minWidth: '480px' }}>
                {userData.map((d) => {
                  const barH = d.value === 0 ? 3 : Math.max(10, (d.value / maxUserValue) * 175)
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div
                        className="rounded-t-md transition-all duration-300 bg-gradient-to-t from-emerald-600 via-emerald-500 to-lime-400 group-hover:brightness-110 group-hover:scale-y-105 shadow-xs"
                        style={{
                          width: '11px',
                          height: `${barH}px`,
                        }}
                        title={`Day ${d.day}: ${d.value} activations`}
                      />
                      <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground">
                        {d.day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Y-axis indicator values */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 px-1">
              <span>0 (Min)</span>
              <span>{(maxUserValue / 2).toFixed(0)} (Mid)</span>
              <span>{maxUserValue} (Peak Daily)</span>
            </div>
          </div>
        </div>

        {/* Keys Sold Chart */}
        <div className="border border-border/80 rounded-2xl p-5 space-y-5 bg-card/60 backdrop-blur-xs shadow-xs">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Year</span>
                <select
                  value={salesYear}
                  onChange={(e) => setSalesYear(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">Month</span>
                <select
                  value={salesMonth}
                  onChange={(e) => setSalesMonth(e.target.value)}
                  className="h-8 rounded-lg border border-border px-2.5 bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => toast.info(`Filtered key transfers for ${salesMonth} ${salesYear}`)}
                className="btn-action-primary text-xs font-bold h-8 px-4"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
              <Key className="h-3.5 w-3.5" />
              <span>Total Keys: {totalSales}</span>
            </div>
          </div>

          {/* Bar Chart Presentation */}
          <div className="relative pt-2">
            <div className="text-[11px] font-semibold text-muted-foreground text-center mb-3 flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-2 rounded bg-gradient-to-r from-blue-500 to-cyan-400" />
              <span>Daily Keys Allocated & Distributed</span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-1.5 h-52 min-w-max px-3 pt-6 border-b border-border" style={{ minWidth: '480px' }}>
                {salesData.map((d) => {
                  const barH = d.value === 0 ? 3 : Math.max(10, (d.value / maxSalesValue) * 175)
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div
                        className="rounded-t-md transition-all duration-300 bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 group-hover:brightness-110 group-hover:scale-y-105 shadow-xs"
                        style={{
                          width: '11px',
                          height: `${barH}px`,
                        }}
                        title={`Day ${d.day}: ${d.value} keys transferred`}
                      />
                      <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground">
                        {d.day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Y-axis indicator values */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 px-1">
              <span>0 (Min)</span>
              <span>{Math.round(maxSalesValue / 2)} (Mid)</span>
              <span>{maxSalesValue} (Peak Daily)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
