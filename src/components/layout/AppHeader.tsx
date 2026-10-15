import { useState } from 'react'
import {
  Maximize,
  Minimize,
  User,
  LogOut,
  Shield,
  Check,
  Menu,
  Sun,
  Moon,
  Sparkles,
  Monitor,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { switchRoleDemo, logout } from '@/features/auth/slices/authSlice'
import { useTheme, THEME_ACCENT_OPTIONS } from '@/app/providers/ThemeProvider'
import type { UserRole } from '@/types/user'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ActiveSession {
  id: string
  os: string
  loginAt: string
  ip: string
  isCurrent: boolean
}

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess_1', os: 'Windows 11 (This Device)', loginAt: '15/10/2026 13:27:31', ip: '103.21.244.12', isCurrent: true },
  { id: 'sess_2', os: 'Windows 10 Workstation', loginAt: '15/10/2026 09:14:04', ip: '103.21.244.12', isCurrent: false },
  { id: 'sess_3', os: 'Windows (Edge Browser)', loginAt: '14/10/2026 21:18:47', ip: '115.99.120.45', isCurrent: false },
]

interface AppHeaderProps {
  title?: string
  subtitle?: string
  onOpenMobileSidebar: () => void
}

export function AppHeader({
  title = 'Dashboard',
  subtitle = 'HOMES',
  onOpenMobileSidebar,
}: AppHeaderProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { isDark, toggleTheme, accent, setAccent } = useTheme()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS)

  const handleTerminateSession = (id: string, os: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    toast.success(`Revoked remote login session for ${os}`)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false))
      }
    }
  }

  const handleRoleChange = (role: UserRole) => {
    dispatch(switchRoleDemo(role))
    setIsRoleDropdownOpen(false)
    toast.success(`Active Persona switched to ${role.replace('_', ' ').toUpperCase()}`, {
      description: 'Permissions and views adapted to this tier.',
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.info('Signed out of V-Credit Console')
  }

  return (
    <header className="flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-card/95 backdrop-blur-md border-b border-border transition-colors duration-200 z-30 select-none">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-display font-extrabold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Animated No Keys for Return Banner */}
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hidden md:inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          No Keys for Return
        </span>

        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsRoleDropdownOpen(!isRoleDropdownOpen)
              setIsProfileOpen(false)
              setIsThemeMenuOpen(false)
            }}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-foreground hover:bg-primary/20 transition-all shadow-xs"
          >
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize hidden sm:inline">
              {user?.role?.replace('_', ' ') || 'Stockist'}
            </span>
            <span className="text-[10px] text-primary">(Change)</span>
          </button>

          {isRoleDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-popover p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setIsRoleDropdownOpen(false)}
            >
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Switch Hierarchy Persona
              </div>
              {[
                { role: 'super_admin', label: 'Super Admin', desc: 'Central Platform Owner' },
                { role: 'stockist', label: 'Stockist', desc: 'Regional Territory Head' },
                { role: 'distributor', label: 'Distributor', desc: 'City / Hub Operations' },
                { role: 'dealer', label: 'Dealer', desc: 'Retail Shop & KYC Store' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleRoleChange(item.role as UserRole)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors text-left',
                    user?.role === item.role
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  {user?.role === item.role && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Mode Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme Mode"
        >
          {isDark ? (
            <Sun className="h-4.5 w-4.5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Quick Accent Palette Picker */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen)
              setIsRoleDropdownOpen(false)
              setIsProfileOpen(false)
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Choose Brand Color Palette"
          >
            <Sparkles className="h-4.5 w-4.5 text-primary" />
          </button>

          {isThemeMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl border border-border bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setIsThemeMenuOpen(false)}
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Accent Theme
              </div>
              <div className="space-y-1 mt-1">
                {THEME_ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setAccent(opt.id)
                      setIsThemeMenuOpen(false)
                      toast.success(`Theme palette changed to ${opt.name}`)
                    }}
                    className={cn(
                      'flex items-center justify-between w-full p-2 rounded-xl text-xs transition-colors text-left',
                      accent === opt.id
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full ring-2 ring-border shrink-0"
                        style={{ backgroundColor: opt.primaryHex }}
                      />
                      <span>{opt.name}</span>
                    </div>
                    {accent === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Icon */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted/80 transition-colors hidden sm:inline-flex"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="h-4.5 w-4.5" />
          ) : (
            <Maximize className="h-4.5 w-4.5" />
          )}
        </button>

        {/* Active Windows Sessions Monitor Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsSessionsOpen(!isSessionsOpen)
              setIsProfileOpen(false)
              setIsRoleDropdownOpen(false)
              setIsThemeMenuOpen(false)
            }}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Active Windows Login Sessions"
          >
            <Monitor className="h-4.5 w-4.5 text-foreground/80" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>

          {isSessionsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-popover p-0 shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden"
              onMouseLeave={() => setIsSessionsOpen(false)}
            >
              <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/40">
                <div>
                  <span className="text-xs font-bold text-foreground">Active Sessions ({sessions.length})</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Windows & Device Access Tokens</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  SSL SECURED
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-3 text-xs flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground text-xs">{sess.os}</span>
                        {sess.isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Login: <span className="font-mono text-foreground/80">{sess.loginAt}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">IP: {sess.ip}</p>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleTerminateSession(sess.id, sess.os)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Revoke session token"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen)
              setIsRoleDropdownOpen(false)
              setIsThemeMenuOpen(false)
            }}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-lime-500 text-white shadow-md hover:opacity-95 transition-transform active:scale-95 ring-2 ring-emerald-500/30"
          >
            <User className="h-4.5 w-4.5 text-white" />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-bold text-foreground">
                  {user?.name || 'Stockist Admin'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'admin@vcredit.in'}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/15 text-primary border border-primary/20">
                  {user?.role?.replace('_', ' ') || 'Stockist'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-500/10 font-bold transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
