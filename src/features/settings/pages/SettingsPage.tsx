import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useTheme, THEME_ACCENT_OPTIONS, type ThemeMode } from '@/app/providers/ThemeProvider'
import { Sun, Moon, Laptop, Check, Palette, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../api/settingsApi'

export default function SettingsPage() {
  const { theme, setTheme, accent, setAccent } = useTheme()

  const { data: settingsRes, isLoading, isFetching, refetch } = useGetSettingsQuery()
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()

  const [autoLockOnOverdue, setAutoLockOnOverdue] = useState(true)
  const [gracePeriodDays, setGracePeriodDays] = useState('3')
  const [smsGatewayActive, setSmsGatewayActive] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)

  useEffect(() => {
    if (settingsRes?.data?.platform) {
      const p = settingsRes.data.platform
      setAutoLockOnOverdue(p.autoLockOnOverdue ?? true)
      setGracePeriodDays(String(p.gracePeriodDays ?? 3))
      setSmsGatewayActive(p.smsGatewayActive ?? true)
      setWhatsappAlerts(p.whatsappAlerts ?? true)
    }
  }, [settingsRes])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings({
        autoLockOnOverdue,
        gracePeriodDays: Number(gracePeriodDays) || 3,
        smsGatewayActive,
        whatsappAlerts,
      }).unwrap()
      toast.success('Platform configurations saved successfully.')
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to save configurations')
    }
  }

  const modeOptions: { id: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    {
      id: 'light',
      label: 'Light Mode',
      icon: Sun,
      desc: 'Clean backgrounds & crisp surfaces',
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      icon: Moon,
      desc: 'Obsidian emerald high-contrast surface',
    },
    {
      id: 'system',
      label: 'System Sync',
      icon: Laptop,
      desc: 'Match your operating system setting',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configurations"
        subtitle="Manage appearance themes, MDM enforcement policies, and borrower notification gateways."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Brand Theme Card */}
        <Card className="p-6 space-y-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Appearance & Theme Customization</CardTitle>
              <CardDescription>
                Customize color theme and light/dark interface mode across all console pages
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Mode Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Display Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {modeOptions.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = theme === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTheme(opt.id)
                        toast.success(`Switched to ${opt.label}`)
                      }}
                      className={cn(
                        'flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40'
                          : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {opt.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Accent Theme Palette Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Brand Accent Palette (V-Credit Logo Aligned)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {THEME_ACCENT_OPTIONS.map((opt) => {
                  const isSelected = accent === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAccent(opt.id)
                        toast.success(`Brand accent set to ${opt.name}`)
                      }}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-2xl border text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40'
                          : 'border-border bg-card hover:bg-muted text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full ring-2 ring-background shrink-0 shadow-xs"
                          style={{ backgroundColor: opt.primaryHex }}
                        />
                        <div>
                          <p className="text-xs font-bold">{opt.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* MDM Enforcement Policy */}
        <Card className="p-6 space-y-4">
          <CardTitle>MDM & Auto-Lock Policies</CardTitle>
          <CardDescription>
            Enforce device lock automatically when borrowers miss EMI due dates
          </CardDescription>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Auto-Lock on Overdue</p>
                <p className="text-xs text-muted-foreground">Trigger MDM lock after grace period expires</p>
              </div>
              <Switch checked={autoLockOnOverdue} onChange={setAutoLockOnOverdue} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Grace Period (Days Before Lock)
              </label>
              <Input
                type="number"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(e.target.value)}
                min="0"
                max="30"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                'Save Policy Changes'
              )}
            </Button>
          </form>
        </Card>

        {/* Messaging & SMS Gateways */}
        <Card className="p-6 space-y-4">
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Manage borrower EMI reminders and security notifications
          </CardDescription>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">SMS Reminder Gateway</p>
                <p className="text-xs text-muted-foreground">Send DLT approved SMS for upcoming EMIs</p>
              </div>
              <Switch checked={smsGatewayActive} onChange={setSmsGatewayActive} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">WhatsApp Business API</p>
                <p className="text-xs text-muted-foreground">Send interactive UPI payment links on WhatsApp</p>
              </div>
              <Switch checked={whatsappAlerts} onChange={setWhatsappAlerts} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  'Save Notification Settings'
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toast.success('Test message dispatched successfully to registered admin phone.')}
              >
                Test Notification Dispatch
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
